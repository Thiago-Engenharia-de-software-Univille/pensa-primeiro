"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import CabecaRobo from "@/components/CabecaRobo";
import Etapas from "@/components/Etapas";
import { perguntas, buscarPergunta, perguntaLivre, areaDe } from "@/lib/perguntas";
import { NIVEIS, useNivel, suavizarRetorno } from "@/lib/nivel";
import NivelSeletor from "@/components/NivelSeletor";
import { registrar, RESULTADOS } from "@/lib/historico";
import { podeVerificar, verificar } from "@/lib/verificador";
import { conferirComIA } from "@/lib/conferirIA";
import { filtrar, LIMITES } from "@/lib/filtro";
import { sugestoesDeEscrita, juntarSugestoes, aplicarSugestoes } from "@/lib/escrita";
import styles from "./estudo.module.css";

const NOMES_DICA = ["Dica 1", "Dica 2", "Explicação"];
const NOMES_DICA_LIVRE = ["Dica 1", "Dica 2", "Dica 3"];
// caracteres para liberar a conferência e a primeira dica
// (em programação a resposta pode ser só "53" ou "3", então basta escrever algo)
const MINIMO_TENTATIVA = 15;
const minimoPara = (pergunta) => (pergunta && areaDe(pergunta) === "programacao" ? 1 : MINIMO_TENTATIVA);

const MENSAGEM_FIM = {
  sozinho: "Nenhuma dica usada. Foi tudo seu.",
  dicas: (usadas, total) => `Você usou ${usadas} de ${total} dicas e chegou lá por conta própria.`,
  resposta: "Tudo bem precisar da resposta. Tente outra pergunta e veja se consegue abrir menos dicas.",
  travei:
    "Faz parte. Anote a dúvida e leve para a aula ou para o material da matéria: chegar com a pergunta certa já é meio caminho.",
};

const SESSAO_NOVA = {
  tentativa: "",
  dicas: 0,
  respostaVista: false,
  retorno: null,
  resultado: null,
  escrita: [],
};

// Cada etapa tem o seu endereço, para o "Voltar" (do site, do navegador ou do celular)
// voltar uma etapa de cada vez:
//   /estudar                 → escolher a pergunta
//   /estudar?p=gelo          → escrever a tentativa
//   /estudar?p=gelo&e=dicas  → dicas e resposta
// O que a pessoa já fez em cada pergunta fica guardado em "sessoes": sair e voltar para
// a mesma pergunta continua de onde parou.
export default function Estudo() {
  const router = useRouter();
  const params = useSearchParams();
  const [sessoes, setSessoes] = useState({});
  const [escrevendoLivre, setEscrevendoLivre] = useState(false);
  const [textoLivre, setTextoLivre] = useState("");
  const [avisoLivre, setAvisoLivre] = useState(null);
  const [conferindo, setConferindo] = useState(false);
  // a explicação das dicas aparece só na primeira vez (guardado no navegador)
  const [explicou, setExplicou] = useState(() => {
    try {
      return localStorage.getItem("pensa-primeiro:explicou-dicas") === "1";
    } catch {
      return false;
    }
  });
  function marcarExplicado() {
    setExplicou(true);
    try {
      localStorage.setItem("pensa-primeiro:explicou-dicas", "1");
    } catch {}
  }
  const nivel = useNivel();
  const ajuda = NIVEIS[nivel];

  const perguntaId = params.get("p");
  const pergunta =
    perguntaId === "livre"
      ? textoLivre.trim().length >= 10
        ? perguntaLivre(textoLivre.trim())
        : null // recarregou a página: o texto da pergunta livre não fica no endereço
      : perguntaId
        ? (buscarPergunta(perguntaId) ?? null)
        : null;

  const sessao = (pergunta && sessoes[pergunta.id]) || SESSAO_NOVA;
  const {
    tentativa,
    dicas: dicasAbertas,
    respostaVista,
    retorno,
    resultado,
    escrita = [],
    ocultas = false,
  } = sessao;
  const etapa = !pergunta ? "escolher" : resultado ? "fim" : params.get("e") === "dicas" ? "dicas" : "tentar";
  const indiceEtapa = { escolher: 0, tentar: 1, dicas: 2, fim: 3 }[etapa];

  function atualizar(mudancas) {
    setSessoes((s) => ({ ...s, [pergunta.id]: { ...(s[pergunta.id] ?? SESSAO_NOVA), ...mudancas } }));
  }

  function ir(id, e) {
    const busca = new URLSearchParams();
    if (id) busca.set("p", id);
    if (e) busca.set("e", e);
    router.push(busca.size ? `/estudar?${busca}` : "/estudar");
  }

  function escolher(id) {
    // pergunta já terminada começa de novo; pergunta pela metade continua de onde parou
    if (sessoes[id]?.resultado || id === "livre") setSessoes((s) => ({ ...s, [id]: SESSAO_NOVA }));
    setEscrevendoLivre(false);
    ir(id, sessoes[id]?.dicas && !sessoes[id]?.resultado ? "dicas" : null);
  }

  function refazer() {
    setSessoes((s) => ({ ...s, [pergunta.id]: SESSAO_NOVA }));
    ir(pergunta.id, null);
  }

  function estudarOutra() {
    setTextoLivre("");
    ir(null, null);
  }

  function irParaDicas(mudancas = {}) {
    atualizar(mudancas);
    ir(pergunta.id, "dicas");
  }

  function aplicarEscrita() {
    atualizar({ tentativa: aplicarSugestoes(tentativa, escrita), escrita: [] });
  }

  function mudarTentativa(texto) {
    atualizar({ tentativa: texto, retorno: null }); // a conferência anterior não vale mais
  }

  // Ctrl+Enter (ou Cmd+Enter) dentro da folha também confere
  function atalho(e) {
    if (
      e.key === "Enter" &&
      (e.ctrlKey || e.metaKey) &&
      tentativa.trim().length >= minimoPara(pergunta) &&
      !conferindo
    ) {
      e.preventDefault();
      conferir();
    }
  }

  // Primeiro o verificador local (grátis e instantâneo). Só se ele não confirmar,
  // ou se for pergunta livre, pedimos para a IA conferir: assim a cota gratuita rende.
  async function conferir() {
    const local = podeVerificar(pergunta.id)
      ? suavizarRetorno(verificar(pergunta.id, tentativa), nivel)
      : null;
    const escritaLocal = sugestoesDeEscrita(tentativa);
    if (local?.status === "certo") {
      atualizar({ escrita: escritaLocal });
      terminar(dicasAbertas === 0 ? "sozinho" : "dicas", { ...local, fonte: "site" });
      return;
    }
    // filtro local: responde na hora e nem chega a gastar a IA
    const barrado = filtrar(tentativa, "tentativa", { codigo: areaDe(pergunta) === "programacao" });
    if (barrado) {
      atualizar({ retorno: { status: "foco", mensagem: barrado.mensagem } });
      return;
    }
    setConferindo(true);
    const ia = await conferirComIA(pergunta, tentativa, nivel);
    // pausa curta antes de poder conferir de novo: evita cliques em sequência gastando a cota
    setTimeout(() => setConferindo(false), 1500);
    // sem IA disponível, vale o verificador local (se houver) com o aviso de indisponibilidade
    const r = ia.status === "indisponivel" && local ? { ...local, aviso: ia.mensagem } : ia;
    atualizar({ escrita: juntarSugestoes(escritaLocal, ia.escrita ?? []) });
    if (r.status === "certo") terminar(dicasAbertas === 0 ? "sozinho" : "dicas", r);
    else {
      atualizar({ retorno: r });
      // errou na primeira etapa: já mostra o painel de dicas ao lado (todas ainda fechadas;
      // a pessoa abre só se quiser)
      if (etapa === "tentar") ir(pergunta.id, "dicas");
    }
  }

  function terminar(tipo, confirmacao = retorno) {
    atualizar({ resultado: tipo, retorno: confirmacao });
    registrar({
      perguntaId: pergunta.id,
      materia: pergunta.materia,
      dicas: dicasAbertas,
      resultado: tipo,
      nivel,
    });
  }

  if (etapa === "escolher") {
    return (
      <section className={styles.tela}>
        <Etapas atual={0} />
        <h1 className={styles.titulo}>O que você quer estudar?</h1>
        <p className={styles.nota}>
          As dicas foram escritas pelo grupo para simular a IA. A conferência das respostas usa a IA de
          verdade.
        </p>
        <NivelSeletor />
        <ul className={styles.opcoes}>
          {perguntas.map((p, i) => {
            const s = sessoes[p.id];
            const andamento = s?.resultado
              ? "Feita · refazer"
              : s?.tentativa
                ? "Continuar de onde parou"
                : null;
            const novaArea = i === 0 || areaDe(perguntas[i - 1]) !== areaDe(p);
            return (
              <li key={p.id}>
                {novaArea && (
                  <h2 className={styles.grupo}>
                    {areaDe(p) === "programacao" ? "Programação" : "Matérias da escola"}
                  </h2>
                )}
                <button className={`opcao ${styles.opcao}`} onClick={() => escolher(p.id)}>
                  <span className={styles.materia}>
                    {p.materia}
                    {andamento && <span className={styles.andamento}>{andamento}</span>}
                  </span>
                  <span className={styles.enunciadoOpcao}>
                    {p.enunciado}
                    {p.codigo && <code className={styles.codigoMini}>{p.codigo.split("\n")[0]}</code>}
                  </span>
                </button>
              </li>
            );
          })}
          <li className={styles.livre}>
            <h2 className={styles.grupo}>Outra dúvida</h2>
            {!(escrevendoLivre || perguntaId === "livre") ? (
              <button className={`opcao ${styles.opcao}`} onClick={() => setEscrevendoLivre(true)}>
                <span className={styles.materia}>Sua pergunta</span>
                <span className={styles.enunciadoOpcao}>Tenho uma dúvida que não está aqui</span>
              </button>
            ) : (
              <form
                className={styles.formLivre}
                onSubmit={(e) => {
                  e.preventDefault();
                  const barrado = filtrar(textoLivre, "pergunta");
                  setAvisoLivre(barrado?.mensagem ?? null);
                  if (!barrado) escolher("livre");
                }}
              >
                <label htmlFor="livre" className={styles.rotuloFolha}>
                  Qual é a sua pergunta?
                  <span className={styles.nota}>
                    As dicas para perguntas livres são de método: ensinam o caminho, não o conteúdo. A IA
                    confere a sua resposta.
                  </span>
                </label>
                <textarea
                  id="livre"
                  className={styles.campoLivre}
                  value={textoLivre}
                  onChange={(e) => setTextoLivre(e.target.value)}
                  placeholder="Ex.: Como calcular a área de um triângulo?"
                  maxLength={LIMITES.pergunta}
                  autoFocus
                />
                <p className={styles.contador}>
                  {textoLivre.length}/{LIMITES.pergunta}
                </p>
                {avisoLivre && (
                  <p className={`${styles.retorno} ${styles.foco}`} role="status">
                    {avisoLivre}
                  </p>
                )}
                <div className="acoes">
                  <button className="botao" disabled={textoLivre.trim().length < 10}>
                    Continuar
                  </button>
                  <button
                    type="button"
                    className="botao discreto"
                    onClick={() => (perguntaId === "livre" ? ir(null, null) : setEscrevendoLivre(false))}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </li>
        </ul>
      </section>
    );
  }

  const semResposta = pergunta.resposta === null;
  const nomes = semResposta ? NOMES_DICA_LIVRE : NOMES_DICA;

  const tentativaValida = tentativa.trim().length >= minimoPara(pergunta);
  // o nível de ajuda decide quantas dicas existem e quando a resposta pode ser aberta
  const dicas = semResposta ? pergunta.dicas : pergunta.dicas.slice(0, ajuda.dicasMaximas);
  const todasAbertas = dicasAbertas >= dicas.length;
  const respostaLiberada = dicasAbertas >= Math.min(ajuda.respostaDepoisDe, dicas.length);
  const terminou = etapa === "fim";
  const dicasVisiveis = terminou ? dicas.length : dicasAbertas; // no fim, dá para rever tudo
  const respostaAberta = respostaVista || terminou;

  return (
    <section className={styles.tela}>
      <div className={styles.barraTopo}>
        <Etapas
          atual={indiceEtapa}
          aoClicar={(i) =>
            i === 0 ? estudarOutra() : i === 1 ? ir(pergunta.id, null) : ir(pergunta.id, "dicas")
          }
          liberadas={etapa === "fim" ? 1 : dicasAbertas > 0 || etapa === "dicas" ? 3 : 2}
        />
        <div className={styles.topoDireita}>
          {etapa !== "fim" && <NivelSeletor compacto />}
          {etapa !== "fim" && (
            <button className="botao discreto" onClick={estudarOutra}>
              Trocar de pergunta
            </button>
          )}
        </div>
      </div>

      <div className={styles.pergunta}>
        <span className={styles.materia}>{pergunta.materia}</span>
        <h1 className={styles.enunciado}>{pergunta.enunciado}</h1>
        {pergunta.codigo && (
          <pre className={styles.codigo}>
            <code>{pergunta.codigo}</code>
          </pre>
        )}
      </div>

      {terminou && (
        <Veredito
          escrita={escrita}
          resultado={resultado}
          retorno={retorno}
          mensagemFim={
            resultado === "dicas" ? MENSAGEM_FIM.dicas(dicasAbertas, dicas.length) : MENSAGEM_FIM[resultado]
          }
          acoes={
            <div className="acoes">
              <button className="botao" onClick={estudarOutra}>
                Estudar outra pergunta
              </button>
              <button className="botao secundario" onClick={refazer}>
                Refazer esta
              </button>
              <Link href="/painel" className="botao secundario">
                Ver meu painel
              </Link>
            </div>
          }
        />
      )}

      {etapa === "tentar" && (
        <div className={styles.blocoTentativa}>
          <label htmlFor="tentativa" className={styles.rotuloFolha}>
            Qual a sua tentativa?
            <span className={styles.nota}>
              Escreva o que você acha, mesmo sem certeza. Errar aqui faz parte.
            </span>
          </label>
          <textarea
            id="tentativa"
            className={styles.folha}
            value={tentativa}
            onChange={(e) => mudarTentativa(e.target.value)}
            onKeyDown={atalho}
            maxLength={LIMITES.tentativa}
            placeholder="Eu acho que…"
            autoFocus
          />
          <div className="acoes">
            <button className="botao" disabled={!tentativaValida || conferindo} onClick={conferir}>
              {conferindo ? "Conferindo…" : "Conferir minha resposta"}
            </button>
            <button
              className="botao secundario"
              disabled={(!tentativaValida && dicasAbertas === 0) || conferindo}
              onClick={() => irParaDicas()}
            >
              {dicasAbertas > 0 ? "Voltar às dicas" : "Pedir a primeira dica"}
            </button>
            {dicasAbertas === 0 && (
              <button
                className="botao discreto"
                onClick={() => irParaDicas({ tentativa: tentativa.trim() || "Não sei por onde começar." })}
              >
                Não sei por onde começar
              </button>
            )}
            {retorno && retorno.status !== "certo" && (
              <button
                className="botao discreto"
                onClick={() => terminar("sozinho")}
                title="A conferência automática pode se enganar"
              >
                Acho que acertei
              </button>
            )}
          </div>
          {!tentativaValida && tentativa.length > 0 ? (
            <p className={styles.nota}>Escreva um pouco mais para liberar a conferência e a dica.</p>
          ) : (
            <p className={`${styles.nota} ${styles.soTeclado}`}>Dica: Ctrl+Enter também confere.</p>
          )}
          <Retorno retorno={retorno} />
          <Escrita
            sugestoes={escrita}
            aoAplicar={aplicarEscrita}
            aoDispensar={() => atualizar({ escrita: [] })}
          />
        </div>
      )}

      {etapa !== "tentar" && (
        <div className={styles.mesa}>
          <div className={styles.colunaTentativa}>
            <label htmlFor="tentativa" className={styles.rotuloFolha}>
              {terminou ? "O que você escreveu" : "Sua tentativa"}
              {etapa === "dicas" && (
                <span className={styles.nota}>Dá para ir corrigindo enquanto lê as dicas.</span>
              )}
            </label>
            <textarea
              id="tentativa"
              className={styles.folha}
              value={tentativa}
              onChange={(e) => mudarTentativa(e.target.value)}
              onKeyDown={atalho}
              maxLength={LIMITES.tentativa}
              readOnly={etapa === "fim"}
            />
            {etapa === "dicas" && (
              <div className="acoes">
                {!respostaVista ? (
                  <>
                    <button className="botao" disabled={conferindo} onClick={conferir}>
                      {conferindo ? "Conferindo…" : "Conferir minha resposta"}
                    </button>
                    {retorno && retorno.status !== "certo" && (
                      <button
                        className="botao discreto"
                        onClick={() => terminar(dicasAbertas === 0 ? "sozinho" : "dicas")}
                        title="A conferência automática pode se enganar"
                      >
                        Acho que acertei
                      </button>
                    )}
                    {semResposta && todasAbertas && (
                      <button className="botao discreto" onClick={() => terminar("travei")}>
                        Ainda não consegui
                      </button>
                    )}
                  </>
                ) : (
                  <button className="botao" onClick={() => terminar("resposta")}>
                    Entendi, terminar
                  </button>
                )}
              </div>
            )}
            {etapa === "dicas" && <Retorno retorno={retorno} />}
            {etapa === "dicas" && (
              <Escrita
                sugestoes={escrita}
                aoAplicar={aplicarEscrita}
                aoDispensar={() => atualizar({ escrita: [] })}
              />
            )}
          </div>

          <div className={styles.conversa}>
            {etapa === "dicas" && !explicou && (
              <div className={styles.explicacao} role="note">
                <p>
                  <strong>
                    {retorno && retorno.status !== "certo"
                      ? "Ainda não foi dessa vez, e tudo bem."
                      : "Aqui ficam as dicas."}
                  </strong>{" "}
                  {retorno && retorno.status !== "certo" && "Por isso as dicas apareceram aqui do lado. "}
                  Elas começam fechadas e só abrem quando você pedir, uma de cada vez. A resposta fica lacrada
                  até o fim. Dá para ocultar as dicas de novo quando quiser, e o seu painel mostra quantas
                  você usou.
                </p>
                <button type="button" className={styles.escritaBotao} onClick={marcarExplicado}>
                  Entendi
                </button>
              </div>
            )}
            <ol className={styles.dicas}>
              {dicas.map((texto, i) =>
                i < dicasVisiveis && ocultas && !terminou ? (
                  <li key={i}>
                    <button
                      type="button"
                      className={`${styles.dicaFechada} ${styles.dicaOculta}`}
                      onClick={() => atualizar({ ocultas: false })}
                    >
                      {nomes[i]} oculta · mostrar
                    </button>
                  </li>
                ) : i < dicasVisiveis ? (
                  <li key={i} className={styles.dica}>
                    <CabecaRobo tamanho={36} className={styles.avatar} />
                    <div className={styles.balao}>
                      <span className={styles.nomeDica}>{nomes[i]}</span>
                      <p>{texto}</p>
                    </div>
                  </li>
                ) : (
                  <li key={i} className={styles.dicaFechada}>
                    {nomes[i]} ainda fechada
                  </li>
                ),
              )}
            </ol>

            {semResposta ? (
              <p className={styles.dicaFechada}>
                Pergunta livre não tem resposta pronta neste protótipo. Confira o que você chegou com o
                material da aula ou com o professor.
              </p>
            ) : (
              <div className={`${styles.resposta} ${respostaAberta ? styles.aberta : ""}`}>
                <span className={styles.nomeDica}>Resposta</span>
                <p aria-hidden={!respostaAberta}>
                  {respostaAberta ? pergunta.resposta : "A resposta fica aqui até o final."}
                </p>
                {!respostaAberta && (
                  <button
                    className={styles.lacre}
                    disabled={!respostaLiberada || etapa === "fim"}
                    onClick={() => atualizar({ respostaVista: true })}
                    title={respostaLiberada ? undefined : "Abra as dicas antes"}
                  >
                    {respostaLiberada ? "Abrir resposta" : "Lacrada"}
                  </button>
                )}
              </div>
            )}

            {etapa === "dicas" && (
              <div className={styles.controles}>
                <p>
                  {retorno && retorno.status !== "certo"
                    ? dicasAbertas < dicas.length
                      ? "Corrija a tentativa e confira de novo. Se quiser uma ajuda, abra uma dica."
                      : "Corrija a tentativa e confira de novo."
                    : dicasAbertas === 0
                      ? "Quer uma dica? Ela abre só quando você pedir."
                      : "Leu a dica? Corrija a tentativa e confira."}
                </p>
                <div className="acoes">
                  {!todasAbertas && (
                    <button
                      className="botao secundario"
                      onClick={() => atualizar({ dicas: dicasAbertas + 1, ocultas: false })}
                    >
                      Abrir {nomes[dicasAbertas].toLowerCase()}
                    </button>
                  )}
                  {dicasAbertas > 0 && (
                    <button className="botao discreto" onClick={() => atualizar({ ocultas: !ocultas })}>
                      {ocultas ? "Mostrar dicas" : "Ocultar dicas"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Caixa com o resultado da conferência, logo abaixo da tentativa.
const TITULOS = {
  quase: "Quase lá.",
  errado: "Ainda não bate.",
  indisponivel: "Sem conferência agora.",
  foco: "Só um detalhe.",
};

function Retorno({ retorno }) {
  if (!retorno || retorno.status === "certo") return null;
  return (
    <div className={`${styles.retorno} ${styles[retorno.status]}`} role="status">
      <p>
        <strong>{TITULOS[retorno.status]}</strong> {retorno.mensagem}
      </p>
      {retorno.fonte === "ia" && <p className={styles.fonteRetorno}>Conferido pela IA (Gemini)</p>}
      {retorno.aviso && (
        <p className={styles.fonteRetorno}>{retorno.aviso} Conferido pelo verificador do site.</p>
      )}
      {retorno.status === "indisponivel" && (
        <p className={styles.fonteRetorno}>
          Use as dicas e, se achar que acertou, marque “Acho que acertei”.
        </p>
      )}
    </div>
  );
}

// Resultado da pergunta: o que aconteceu e QUEM conferiu, sem deixar dúvida.
function Veredito({ resultado, retorno, mensagemFim, acoes, escrita }) {
  const confirmado = retorno?.status === "certo";
  let selo;
  if (confirmado && retorno.fonte === "ia") selo = "Resposta conferida pela IA (Gemini): está certa.";
  else if (confirmado) selo = "Resposta conferida pelo verificador do site: está certa.";
  else if (resultado === "resposta") selo = "Você abriu a resposta. Compare com o que escreveu, logo abaixo.";
  else if (resultado === "travei")
    selo = "Pergunta livre sem resposta pronta: confira com o material da aula.";
  else selo = "Você marcou como resolvida, mas a conferência não confirmou. Compare com a resposta abaixo.";

  return (
    <div className={`${styles.veredito} ${confirmado ? styles.vereditoCerto : ""}`} role="status">
      <p className={styles.selo}>
        <span aria-hidden="true">{confirmado ? "✓" : "•"}</span> {selo}
      </p>
      <h2>{RESULTADOS[resultado]}</h2>
      {confirmado && <p className={styles.porque}>{retorno.mensagem}</p>}
      <Escrita sugestoes={escrita} />
      <p>{mensagemFim}</p>
      {acoes}
    </div>
  );
}

// Dicas de escrita: discretas, gentis e opcionais. Aparecem só depois de conferir.
function Escrita({ sugestoes, aoAplicar, aoDispensar }) {
  if (!sugestoes?.length) return null;
  return (
    <div className={styles.escrita}>
      <p>
        <span aria-hidden="true">✎ </span>
        {sugestoes.length === 1 ? "Uma dica de escrita, se quiser: " : "Umas dicas de escrita, se quiser: "}
        {sugestoes.map((s, i) => (
          <span key={s.de}>
            {i > 0 && ", "}
            <span className={styles.de}>{s.de}</span> → <strong>{s.para}</strong>
          </span>
        ))}
        .
      </p>
      {aoAplicar && (
        <div className={styles.escritaAcoes}>
          <button type="button" className={styles.escritaBotao} onClick={aoAplicar}>
            Corrigir para mim
          </button>
          <button type="button" className={styles.escritaBotao} onClick={aoDispensar}>
            Deixar assim
          </button>
        </div>
      )}
    </div>
  );
}
