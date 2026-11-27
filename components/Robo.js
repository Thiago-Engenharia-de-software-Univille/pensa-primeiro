"use client";

import { useEffect, useId, useRef, useState } from "react";

// Robô no traço da apresentação "Desinteligência Humana".
// - Olhos e cabeça seguem o mouse.
// - O cartão da resposta foge do mouse: o braço (com cotovelo e movimento de mola) leva o
//   cartão para o ponto mais longe do cursor e, se não houver saída, esconde atrás do corpo.
// - Clicar no robô faz ele pular e falar.

// Medidas do desenho (em unidades do viewBox)
const OMBRO = { x: 230, y: 226 };
const SUPERIOR = 60; // ombro → cotovelo
const ANTEBRACO = 60; // cotovelo → mão
const ALCANCE = 100; // distância ombro → mão em repouso
const ANGULO_REPOUSO = -46; // mão erguida, à direita da cabeça
const CENTRO_CARTAO = { x: 32, y: -68 }; // centro do cartão em relação à mão
const PERIGO = 330; // mouse mais perto que isso do cartão em repouso: hora de fugir
const CABECA = { x: 182, y: 125 };

// ângulos possíveis do braço, de -170° (por cima da cabeça, do outro lado) até 160°
// (por baixo, atrás do corpo). Assim o cartão tem dois caminhos para fugir: por cima da
// cabeça ou por trás do corpo, onde fica escondido durante toda a passagem.
const ANGULOS = Array.from({ length: 67 }, (_, i) => -170 + i * 5);

const FRASES = [
  "Ei! Primeiro tenta.",
  "A resposta tá guardada.",
  "Errar faz parte!",
  "Já escreveu sua tentativa?",
  "Pensa comigo…",
  "Uma dica de cada vez.",
  "Cócegas não valem!",
];
const FRASE_INSISTENTE = "Tá bom, tá bom… mas tenta antes!";

const rad = (g) => (g * Math.PI) / 180;
const maoEm = (angulo, alcance = ALCANCE) => ({
  x: OMBRO.x + alcance * Math.cos(rad(angulo)),
  y: OMBRO.y + alcance * Math.sin(rad(angulo)),
});
const MAO_REPOUSO = maoEm(ANGULO_REPOUSO);
const centroCartao = (angulo) => {
  const m = maoEm(angulo);
  return { x: m.x + CENTRO_CARTAO.x, y: m.y + CENTRO_CARTAO.y };
};
const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// por cima da cabeça o braço estica (para o cartão não bater nela);
// por baixo, atrás do corpo, ele encolhe para o cartão ficar escondido
function alcanceEm(angulo) {
  if (angulo < -75) return 114;
  if (angulo > 60) return 88;
  return ALCANCE;
}

// braço com cotovelo (cinemática inversa de dois segmentos).
// O cotovelo sempre dobra para o mesmo lado, então o braço nunca "vira do avesso".
function caminhoBraco(mao) {
  const dx = mao.x - OMBRO.x;
  const dy = mao.y - OMBRO.y;
  const d = Math.min(Math.hypot(dx, dy) || 1, SUPERIOR + ANTEBRACO - 0.5);
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  const a = (SUPERIOR ** 2 - ANTEBRACO ** 2 + d ** 2) / (2 * d);
  const h = Math.sqrt(Math.max(SUPERIOR ** 2 - a ** 2, 0));
  const cotovelo = { x: OMBRO.x + ux * a - uy * h, y: OMBRO.y + uy * a + ux * h };
  // curva que passa pelo cotovelo: o braço fica redondo, sem quina
  const cx = 2 * cotovelo.x - (OMBRO.x + mao.x) / 2;
  const cy = 2 * cotovelo.y - (OMBRO.y + mao.y) / 2;
  return `M${OMBRO.x} ${OMBRO.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${mao.x.toFixed(1)} ${mao.y.toFixed(1)}`;
}

export default function Robo({ className }) {
  const svgRef = useRef(null);
  const contornoRef = useRef(null);
  const mioloRef = useRef(null);
  const maoRef = useRef(null);
  const [fala, setFala] = useState(null);
  const [pulando, setPulando] = useState(false);
  const cliques = useRef(0);
  // easter egg: depois de muitos cliques o robô quebra e um robozinho vem consertar
  // etapas: null → "quebrado" → "conserto" → "consertado" → null
  const [quebra, setQuebra] = useState(null);
  const quebradoRef = useRef(false);
  const timersQuebra = useRef([]);
  // dança do código Konami: false → "dancando" → "saindo" (robozinhos vão embora) → false
  const [dancando, setDancando] = useState(false);
  const timerFala = useRef(0);
  const expressarRef = useRef(() => {});
  const id = useId().replace(/:/g, "");

  // ---------- mouse: olhos, cabeça e o cartão fugindo ----------
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let mouse = null; // posição do mouse no sistema de coordenadas do desenho
    let quadro = 0;
    let ultimo = 0;
    let fugindo = false;
    let fugindoDesde = 0;

    // ---------- expressões ----------
    // Prioridade: a temporária (clique, susto) > brava/preocupada (fugindo) >
    // desconfiada (mouse parado perto) > sonolenta (mouse parado há muito tempo) > neutra.
    let temporaria = null; // { nome, ate }
    let ultimoMovimento = performance.now();
    let ultimaPosicao = null;

    // tontura: soma quanto o mouse girou em volta da cabeça nos últimos segundos
    const VOLTAS_PARA_TONTEAR = 2.5;
    const JANELA_GIRO = 5000; // ms
    let giros = []; // [{ t, delta }] em radianos
    let ultimoAngulo = null;
    let tontoAte = 0;
    let expressaoAtual = "";

    function mostrar(nome, ms) {
      temporaria = { nome, ate: performance.now() + ms };
      atualizarExpressao();
    }
    expressarRef.current = mostrar;

    function atualizarExpressao() {
      const agora = performance.now();
      let nome = "neutro";
      if (temporaria && agora < temporaria.ate) nome = temporaria.nome;
      else if (fugindo) nome = agora - fugindoDesde > 1800 ? "bravo" : "preocupado";
      else if (agora - ultimoMovimento > 8000) nome = "sonolento";
      else if (mouse && agora - ultimoMovimento > 1200 && distancia(mouse, CABECA) < 230)
        nome = "desconfiado";
      if (nome !== expressaoAtual) {
        expressaoAtual = nome;
        svg.dataset.expressao = nome;
      }
    }
    const relogio = setInterval(() => {
      atualizarExpressao();
      agendar(); // deixa a cabeça voltar ao centro quando o mouse para
    }, 200);

    // Estado do braço. O alvo é um ângulo; o "guia" anda até ele pelo arco (não em linha
    // reta, para não atravessar a cabeça); a mão segue o guia como se presa por uma mola.
    let alvo = ANGULO_REPOUSO;
    let guia = ANGULO_REPOUSO;
    let alcance = ALCANCE;
    let mao = { ...MAO_REPOUSO };
    let vel = { x: 0, y: 0 };
    let giro = 0; // inclinação do cartão
    let velGiro = 0;
    // cabeça: acompanha o mouse só de leve e volta a ficar reta quando ele para
    let cabeca = 0;
    let velCabeca = 0;

    function desenharBraco() {
      const d = caminhoBraco(mao);
      contornoRef.current?.setAttribute("d", d);
      mioloRef.current?.setAttribute("d", d);
      const tx = (mao.x - MAO_REPOUSO.x).toFixed(1);
      const ty = (mao.y - MAO_REPOUSO.y).toFixed(1);
      maoRef.current?.setAttribute(
        "transform",
        `translate(${tx} ${ty}) rotate(${giro.toFixed(1)} ${MAO_REPOUSO.x} ${MAO_REPOUSO.y})`,
      );
    }

    const nota = (a) => distancia(mouse, centroCartao(a)) - Math.abs(a - guia) * 0.12;

    function escolherAlvo() {
      if (!mouse || distancia(mouse, centroCartao(ANGULO_REPOUSO)) > PERIGO) {
        alvo = ANGULO_REPOUSO;
        return;
      }
      // o ângulo em que o cartão fica mais longe do mouse
      let melhor = alvo;
      for (const a of ANGULOS) if (nota(a) > nota(melhor)) melhor = a;
      // só troca de ideia se a nova posição for bem melhor: evita tremedeira
      if (alvo === ANGULO_REPOUSO || nota(melhor) > nota(alvo) + 6) alvo = melhor;
    }

    function passo(agora) {
      quadro = 0;
      // passo de tempo normalizado para 60 quadros por segundo
      const k = ultimo ? Math.min((agora - ultimo) / 16.7, 3) : 1;
      ultimo = agora;

      escolherAlvo();

      // quanto mais perto o mouse está do cartão, mais rápido o robô reage
      // (longe: movimento calmo; perto: reflexo rápido, para nunca deixar pegar)
      const centroAtual = { x: mao.x + CENTRO_CARTAO.x, y: mao.y + CENTRO_CARTAO.y };
      const perigo = mouse ? Math.max(0, 1 - distancia(mouse, centroAtual) / 300) : 0;
      const rapidez = 1 - Math.pow(1 - (0.12 + 0.55 * perigo), k);
      guia += (alvo - guia) * rapidez;
      alcance += (alcanceEm(guia) - alcance) * rapidez;
      const meta = maoEm(guia, alcance);

      // mola amortecida: acelera, desacelera e passa um pouquinho do ponto
      const rigidez = 0.15 + 0.2 * perigo;
      const amortecer = Math.pow(0.74 - 0.08 * perigo, k);
      vel.x = vel.x * amortecer + (meta.x - mao.x) * rigidez * k;
      vel.y = vel.y * amortecer + (meta.y - mao.y) * rigidez * k;
      mao = { x: mao.x + vel.x * k, y: mao.y + vel.y * k };
      // perto do mouse a mola dá lugar ao reflexo: a mão vai direto para onde precisa estar
      if (perigo > 0) {
        mao = { x: mao.x + (meta.x - mao.x) * perigo, y: mao.y + (meta.y - mao.y) * perigo };
        vel = { x: vel.x * (1 - perigo), y: vel.y * (1 - perigo) };
      }

      // o cartão balança atrasado em relação à mão (inércia)
      const giroAlvo = (guia - ANGULO_REPOUSO) * 0.25 - vel.x * 1.4;
      velGiro = velGiro * Math.pow(0.78, k) + (giroAlvo - giro) * 0.12 * k;
      giro += velGiro * k;

      desenharBraco();

      const agoraFugindo = alvo !== ANGULO_REPOUSO;
      if (agoraFugindo !== fugindo) {
        fugindo = agoraFugindo;
        fugindoDesde = performance.now();
        svg.classList.toggle("fugindo", fugindo);
        atualizarExpressao();
      }

      if (mouse) {
        // olhos e cabeça
        const dx = mouse.x - CABECA.x;
        const dy = mouse.y - CABECA.y;
        const dist = Math.hypot(dx, dy) || 1;
        const forca = Math.min(dist / 180, 1);
        svg.style.setProperty("--olho-x", `${((dx / dist) * 9 * forca).toFixed(2)}px`);
        svg.style.setProperty("--olho-y", `${((dy / dist) * 6 * forca).toFixed(2)}px`);
        // o corpo inteiro se inclina para longe do mouse quando ele chega perto
        const perto = Math.max(0, 1 - dist / 320);
        svg.style.setProperty("--inclina", `${(-Math.tanh(dx / 80) * perto * 6).toFixed(2)}deg`);
      }

      // cabeça: no máximo ~3,5°, crescendo devagar com a distância (tanh), e só enquanto o mouse
      // se mexe; parado há mais de 1,5 s, ela volta ao centro. Anda com mola, sem tranco.
      const mexendo = mouse && performance.now() - ultimoMovimento < 1500;
      const cabecaAlvo = mexendo ? 3.5 * Math.tanh((mouse.x - CABECA.x) / 420) : 0;
      velCabeca = velCabeca * Math.pow(0.8, k) + (cabecaAlvo - cabeca) * 0.06 * k;
      cabeca += velCabeca * k;
      svg.style.setProperty("--cabeca", `${cabeca.toFixed(2)}deg`);
      svg.style.setProperty("--cabeca-x", `${(cabeca * 0.8).toFixed(2)}px`);

      const parou =
        Math.abs(alvo - guia) < 0.05 &&
        Math.hypot(meta.x - mao.x, meta.y - mao.y) < 0.05 &&
        Math.hypot(vel.x, vel.y) < 0.02 &&
        Math.abs(velGiro) < 0.02 &&
        Math.abs(giroAlvo - giro) < 0.05 &&
        Math.abs(cabecaAlvo - cabeca) < 0.02 &&
        Math.abs(velCabeca) < 0.01;
      if (parou) ultimo = 0;
      else quadro = requestAnimationFrame(passo);
    }

    function agendar() {
      if (!quadro) quadro = requestAnimationFrame(passo);
    }

    function paraDesenho(x, y) {
      const matriz = svg.getScreenCTM();
      if (!matriz) return null;
      const p = new DOMPoint(x, y).matrixTransform(matriz.inverse());
      return { x: p.x, y: p.y };
    }

    function mover(e) {
      if (e.pointerType !== "mouse") return;
      if (quebradoRef.current) {
        // quebrado não foge de nada: o braço volta para o lugar e fica parado
        if (mouse) {
          mouse = null;
          agendar();
        }
        return;
      }
      mouse = paraDesenho(e.clientX, e.clientY);
      const agora = performance.now();
      // susto: mouse chegando rápido perto da cabeça
      if (mouse && ultimaPosicao && distancia(mouse, CABECA) < 260) {
        const velocidade = distancia(mouse, ultimaPosicao.p) / Math.max(agora - ultimaPosicao.t, 1);
        if (velocidade > 3 && !(temporaria && agora < temporaria.ate)) mostrar("surpreso", 700);
      }
      ultimaPosicao = mouse && { p: mouse, t: agora };
      medirGiro(agora);
      ultimoMovimento = agora;
      agendar();
    }

    function medirGiro(agora) {
      if (!mouse) return;
      const dist = distancia(mouse, CABECA);
      // só conta giro "em volta" do robô: nem colado na cabeça, nem longe demais
      if (dist < 50 || dist > 520) {
        ultimoAngulo = null;
        return;
      }
      const angulo = Math.atan2(mouse.y - CABECA.y, mouse.x - CABECA.x);
      if (ultimoAngulo !== null) {
        let delta = angulo - ultimoAngulo;
        if (delta > Math.PI) delta -= 2 * Math.PI; // passou de 180°: ajusta para o menor caminho
        if (delta < -Math.PI) delta += 2 * Math.PI;
        giros.push({ t: agora, delta });
      }
      ultimoAngulo = angulo;
      giros = giros.filter((g) => agora - g.t < JANELA_GIRO);
      const voltas = Math.abs(giros.reduce((s, g) => s + g.delta, 0)) / (2 * Math.PI);
      if (voltas >= VOLTAS_PARA_TONTEAR && agora > tontoAte) {
        tontoAte = agora + 6000; // descansa um pouco antes de poder tontear de novo
        giros = [];
        mostrar("girando", 2800);
        // setFala é estável, então dá para usar aqui dentro do efeito
        setFala({ texto: "Uooou… tá tudo girando…", n: Date.now() });
        clearTimeout(timerFala.current);
        timerFala.current = setTimeout(() => setFala(null), 2600);
      }
    }

    function sair() {
      mouse = null;
      svg.style.setProperty("--inclina", "0deg");
      agendar();
    }

    // no celular: tocar perto do cartão também faz ele fugir por um instante
    let timerToque = 0;
    function tocar(e) {
      if (e.pointerType === "mouse") return;
      mouse = paraDesenho(e.clientX, e.clientY);
      agendar();
      clearTimeout(timerToque);
      timerToque = setTimeout(sair, 1400);
    }

    desenharBraco();
    atualizarExpressao();
    if (parado) return () => clearInterval(relogio);
    window.addEventListener("pointermove", mover, { passive: true });
    window.addEventListener("pointerdown", tocar, { passive: true });
    document.documentElement.addEventListener("pointerleave", sair);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerdown", tocar);
      document.documentElement.removeEventListener("pointerleave", sair);
      cancelAnimationFrame(quadro);
      clearTimeout(timerToque);
      clearInterval(relogio);
    };
  }, []);

  // ---------- easter egg: código Konami (↑ ↑ ↓ ↓ ← → ← → B A) ----------
  // O robô dança com notinhas musicais… e avisa que a resposta continua lacrada.
  useEffect(() => {
    const CODIGO = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let posicao = 0;
    let timer = 0;
    let timerSaida = 0;
    function tecla(e) {
      if (e.target.closest?.("input, textarea, [contenteditable]")) return;
      // B e A também pela posição da tecla (e.code), para funcionar em qualquer layout de teclado
      const k =
        e.code === "KeyB" ? "b" : e.code === "KeyA" ? "a" : e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === CODIGO[posicao]) posicao += 1;
      else if (k === "ArrowUp")
        posicao = posicao === 2 ? 2 : 1; // "↑ ↑ ↑ ↓…" ainda vale
      else posicao = 0;
      if (posicao < CODIGO.length) return;
      posicao = 0;
      if (quebradoRef.current) return;
      // se o robô estiver fora da tela, rola até ele para ver a dança
      const caixa = svgRef.current?.getBoundingClientRect();
      if (caixa && (caixa.bottom < 0 || caixa.top > innerHeight)) {
        svgRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setDancando("dancando");
      expressarRef.current("feliz", 6200);
      setFala({ texto: "Código aceito! A resposta segue lacrada.", n: Date.now() });
      clearTimeout(timerFala.current);
      timerFala.current = setTimeout(() => setFala(null), 3400);
      clearTimeout(timer);
      clearTimeout(timerSaida);
      timerSaida = setTimeout(() => setDancando("saindo"), 5200); // os dois robozinhos se despedem
      timer = setTimeout(() => setDancando(false), 6400);
    }
    window.addEventListener("keydown", tecla);
    return () => {
      window.removeEventListener("keydown", tecla);
      clearTimeout(timer);
      clearTimeout(timerSaida);
    };
  }, []);

  useEffect(
    () => () => {
      clearTimeout(timerFala.current);
      timersQuebra.current.forEach(clearTimeout);
    },
    [],
  );

  function falar(texto, ms = 2200) {
    setFala({ texto, n: Date.now() });
    clearTimeout(timerFala.current);
    timerFala.current = setTimeout(() => setFala(null), ms);
  }

  // ---------- easter egg: quebra e conserto ----------
  const CLIQUES_PARA_QUEBRAR = 12;

  function quebrar() {
    quebradoRef.current = true;
    const parado = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const passo = (ms, fn) => timersQuebra.current.push(setTimeout(fn, parado ? ms / 3 : ms));
    setQuebra("quebrado");
    expressarRef.current("tonto", 6000);
    falar("Bzzzt… e-e-erro…", 2000);
    passo(2200, () => setQuebra("conserto")); // o robozinho entra e conserta
    passo(5600, () => {
      setQuebra("consertado");
      expressarRef.current("feliz", 2200);
      falar("Valeu! Novinho em folha.", 2400);
    });
    passo(7000, () => {
      setQuebra(null);
      quebradoRef.current = false;
      cliques.current = 0;
    });
  }

  // ---------- clique: pula e fala ----------
  function clicar() {
    if (quebradoRef.current) return; // quebrado: espera o conserto
    cliques.current += 1;
    if (cliques.current >= CLIQUES_PARA_QUEBRAR) {
      quebrar();
      return;
    }
    const texto =
      cliques.current % 6 === 0 ? FRASE_INSISTENTE : FRASES[(cliques.current - 1) % FRASES.length];
    setFala({ texto, n: cliques.current });
    expressarRef.current(cliques.current % 6 === 0 ? "tonto" : "feliz", 1500);
    setPulando(false);
    requestAnimationFrame(() => setPulando(true));
    clearTimeout(timerFala.current);
    timerFala.current = setTimeout(() => setFala(null), 2200);
  }

  const larguraFala = fala ? Math.round(fala.texto.length * 9.6 + 34) : 0;

  return (
    <svg
      ref={svgRef}
      className={`robo ${quebra ? `quebra-${quebra}` : ""} ${dancando ? "dancando" : ""} ${dancando === "saindo" ? "danca-saindo" : ""} ${className ?? ""}`}
      data-expressao="neutro"
      viewBox="40 0 390 450"
      role="img"
      aria-label="Robô segurando o cartão da resposta"
    >
      <defs>
        <pattern
          id={`pontos-${id}`}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="7" height="7" fill="#e6e6e6" />
          <circle cx="3.5" cy="3.5" r="1.6" fill="#8d8d8d" />
        </pattern>
        <filter id={`borrado-${id}`} x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* sombra no chão */}
      <ellipse className="sombra" cx="182" cy="436" rx="86" ry="8" />

      <g
        className={`pulo ${pulando ? "pulando" : ""}`}
        onAnimationEnd={() => setPulando(false)}
        onClick={clicar}
      >
        <g className="inclina">
          {/* pernas (agrupadas só para poderem dançar; o desenho é o mesmo) */}
          <g className="perna-esq">
            <path className="contorno" d="M158 320 V404" />
            <path className="miolo cinza" d="M158 320 V404" />
            <path className="peca" d="M132 402 H174 a14 14 0 0 1 14 14 V430 H132 Z" />
          </g>
          <g className="perna-dir">
            <path className="contorno" d="M206 320 V404" />
            <path className="miolo" d="M206 320 V404" />
            <path className="peca" d="M190 402 H232 a14 14 0 0 1 14 14 V430 H190 Z" />
          </g>

          {/* braço com o cartão: desenhado antes do corpo, para poder se esconder atrás dele */}
          <path ref={contornoRef} className="contorno" />
          <path ref={mioloRef} className="miolo" />
          <g ref={maoRef} className="cartao-mao">
            <rect className="peca" x="284" y="136" width="28" height="36" rx="10" />
            <g transform="rotate(8 330 92)">
              <rect className="peca" x="262" y="40" width="136" height="92" rx="12" />
              <g filter={`url(#borrado-${id})`}>
                <path className="traco fino" d="M280 68 h82 M280 86 h100 M280 104 h60" />
              </g>
              <rect className="lacre" x="316" y="114" width="76" height="30" rx="15" />
              <text className="lacre-texto" x="354" y="134" textAnchor="middle">
                resposta
              </text>
            </g>
          </g>

          {/* braço de trás, solto ao lado do corpo */}
          <g className="braco-tras">
            <path className="contorno" d="M132 226 Q100 262 106 312" />
            <path className="miolo cinza" d="M132 226 Q100 262 106 312" />
            <g className="mao-tras">
              <rect className="peca" x="92" y="306" width="28" height="34" rx="10" />
            </g>
          </g>

          {/* corpo */}
          <rect
            className="peca"
            x="124"
            y="196"
            width="116"
            height="130"
            rx="28"
            fill={`url(#pontos-${id})`}
          />
          <rect className="peca" x="148" y="220" width="68" height="48" rx="10" />
          <circle className="luz" cx="167" cy="244" r="8" />
          <path className="traco" d="M186 234 h18 M186 244 h18 M186 254 h18" />

          {/* pescoço e cabeça */}
          <rect className="peca" x="168" y="178" width="28" height="22" />
          <g className="cabeca">
            <line className="traco" x1="182" y1="74" x2="182" y2="42" />
            <circle className="luz antena" cx="182" cy="36" r="10" />
            <rect className="peca" x="98" y="108" width="16" height="34" rx="6" />
            <rect className="peca" x="250" y="108" width="16" height="34" rx="6" />
            <rect className="peca" x="110" y="72" width="144" height="110" rx="32" />
            <rect x="128" y="90" width="108" height="70" rx="18" fill="#1e1e1e" />
            {/* olhos: seguem o mouse; cada expressão tem o seu par (ver EXPRESSOES) */}
            <g className="olhos">
              <g className="piscar">
                <g className="exp neutro preocupado">
                  <rect className="olho" x="154" y="112" width="14" height="20" rx="7" />
                  <rect className="olho" x="196" y="112" width="14" height="20" rx="7" />
                </g>
                <g className="exp desconfiado bravo">
                  <rect className="olho" x="154" y="118" width="14" height="9" rx="4.5" />
                  <rect className="olho" x="196" y="118" width="14" height="9" rx="4.5" />
                </g>
                <g className="exp surpreso">
                  <circle className="olho" cx="161" cy="121" r="11" />
                  <circle className="olho" cx="203" cy="121" r="11" />
                  <circle cx="161" cy="121" r="4" fill="#1e1e1e" />
                  <circle cx="203" cy="121" r="4" fill="#1e1e1e" />
                </g>
                <path className="exp feliz traco-rosto" d="M153 126 q8 -12 16 0 M195 126 q8 -12 16 0" />
                <path className="exp sonolento traco-rosto" d="M153 124 q8 5 16 0 M195 124 q8 5 16 0" />
                <path
                  className="exp tonto traco-rosto"
                  d="M154 114 l14 14 M168 114 l-14 14 M196 114 l14 14 M210 114 l-14 14"
                />
                <g className="exp girando">
                  <path
                    className="traco-rosto espiral"
                    d="M161 121 a2 2 0 1 1 3 -2 a5 5 0 1 1 -8 5 a8 8 0 1 1 13 -8"
                  />
                  <path
                    className="traco-rosto espiral"
                    d="M203 121 a2 2 0 1 1 3 -2 a5 5 0 1 1 -8 5 a8 8 0 1 1 13 -8"
                  />
                </g>
              </g>
            </g>
            {/* sobrancelhas */}
            <path className="exp bravo traco-rosto" d="M150 103 l20 7 M214 103 l-20 7" />
            <path className="exp preocupado traco-rosto" d="M152 108 l18 -5 M212 108 l-18 -5" />
            <path className="exp desconfiado traco-rosto" d="M150 108 h20 M194 104 l20 3" />
            {/* bocas */}
            <path className="exp neutro traco-rosto" d="M172 146 q10 6 20 0" />
            <path className="exp preocupado traco-rosto" d="M174 149 q8 -6 16 0" />
            <path className="exp bravo traco-rosto" d="M172 150 q10 -7 20 0" />
            <path className="exp desconfiado sonolento traco-rosto" d="M174 148 h16" />
            <circle className="exp surpreso traco-rosto" cx="182" cy="148" r="5" />
            <path className="exp feliz boca-aberta" d="M168 141 h28 q0 13 -14 13 q-14 0 -14 -13 Z" />
            <path className="exp tonto girando traco-rosto" d="M168 148 q3.5 -5 7 0 t7 0 t7 0 t7 0" />
          </g>
        </g>
      </g>

      {/* notinhas da dança (código Konami) */}
      {dancando && (
        <g className="notas" aria-hidden="true">
          {[
            [70, 130, "♪"],
            [290, 200, "♫"],
            [60, 240, "♫"],
            [300, 300, "♪"],
            [110, 60, "♬"],
            [250, 40, "♪"],
            [40, 330, "♪"],
            [330, 120, "♬"],
          ].map(([x, y, n], i) => (
            <text key={i} x={x} y={y} style={{ "--atraso": `${i * 0.18}s` }}>
              {n}
            </text>
          ))}
        </g>
      )}

      {/* sono: depois de um tempo sem mexer o mouse */}
      <g className="exp sonolento zz">
        <text x="262" y="78">
          z
        </text>
        <text x="280" y="58">
          z
        </text>
        <text x="300" y="34">
          Z
        </text>
      </g>

      {/* easter egg: fumaça e faíscas saindo da cabeça */}
      {quebra && quebra !== "consertado" && (
        <g className="avaria" aria-hidden="true">
          <g className="fumaca">
            <circle cx="140" cy="70" r="14" />
            <circle cx="124" cy="62" r="11" />
            <circle cx="150" cy="58" r="9" />
            <circle cx="132" cy="74" r="12" />
          </g>
          <g className="faiscas">
            <path d="M254 112 l14 -10 M258 124 l18 2 M252 134 l12 12" />
            <path d="M108 150 l-14 8 M112 162 l-16 -4" />
            <path d="M196 182 l8 12 M168 184 l-8 12" />
          </g>
        </g>
      )}

      {/* o robozinho do conserto entra pela direita, conserta e vai embora */}
      {(quebra === "conserto" || quebra === "consertado") && (
        <MiniRobo fala={quebra === "conserto" ? "Deixa comigo!" : null} />
      )}

      {/* código Konami: dois robozinhos de manutenção dançam junto, um de cada lado */}
      {dancando && (
        <>
          <MiniRobo className="dancarino" />
          <MiniRobo className="dancarino dancarino-esq" espelhado />
        </>
      )}

      {/* balão de fala do clique */}
      {fala && (
        <g className="fala" key={fala.n}>
          <rect className="peca" x={168 - larguraFala} y="4" width={larguraFala} height="46" rx="16" />
          <path className="peca" d="M146 48 L166 72 L162 48" />
          <rect x="149" y="46" width="12" height="7" fill="#fff" />
          <text className="fala-texto" x={168 - larguraFala / 2} y="33" textAnchor="middle">
            {fala.texto}
          </text>
        </g>
      )}
    </svg>
  );
}

// Robozinho de manutenção (o mesmo do conserto). "espelhado" vira para o outro lado:
// usado no lado esquerdo do robô na dança.
function MiniRobo({ fala = null, className = "", espelhado = false }) {
  const robozinho = (
    <g className={`mini ${className}`} aria-hidden="true">
      <g className="mini-corpo">
        <circle className="peca" cx="318" cy="424" r="9" />
        <circle className="peca" cx="352" cy="424" r="9" />
        <rect className="peca" x="304" y="380" width="62" height="40" rx="10" />
        <rect x="318" y="390" width="34" height="18" rx="5" fill="#1e1e1e" />
        <circle className="olho" cx="335" cy="399" r="4" />
        <line className="traco" x1="335" y1="380" x2="335" y2="366" />
        <circle className="luz" cx="335" cy="362" r="6" />
        {/* braço com a chave inglesa */}
        <g className="chave">
          <path className="traco" d="M304 398 L276 386" />
          <path
            className="peca"
            d="M262 376 a9 9 0 1 0 12 12 l6 -6 a9 9 0 1 0 -12 -12 Z"
            transform="rotate(-20 270 382)"
          />
        </g>
      </g>
      {fala && (
        <g className="mini-fala">
          <rect className="peca" x="300" y="318" width="118" height="34" rx="12" />
          <text className="fala-texto mini-texto" x="359" y="340" textAnchor="middle">
            {fala}
          </text>
        </g>
      )}
    </g>
  );
  // espelha em volta do centro do robô principal: o robozinho da direita aparece à esquerda
  return espelhado ? <g transform="translate(378 0) scale(-1 1)">{robozinho}</g> : robozinho;
}
