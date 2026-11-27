"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CabecaRobo from "@/components/CabecaRobo";
import { rodadas } from "@/lib/confira";
import { registrarConferencia } from "@/lib/historico";
import styles from "./confira.module.css";

// Cada rodada tem o seu endereço (/confira?r=2, e /confira?r=fim para o resultado), então
// o "Voltar" do site, do navegador e do celular andam uma rodada de cada vez.
// Atalhos: teclas 1 a 4 escolhem a frase; ← e → trocam de rodada.
export default function Confira() {
  const router = useRouter();
  const params = useSearchParams();
  const [escolhas, setEscolhas] = useState({}); // rodadaId → índice da frase escolhida

  const r = params.get("r");
  const terminou = r === "fim";
  const indice = terminou ? rodadas.length : Math.min(Math.max(Number(r) || 1, 1), rodadas.length) - 1;
  const rodada = rodadas[indice];
  const escolha = rodada ? escolhas[rodada.id] : undefined;
  const respondeu = escolha !== undefined;
  const acertou = (rd) => escolhas[rd.id] === rd.erro;
  const acertos = rodadas.filter((rd) => escolhas[rd.id] !== undefined && acertou(rd)).length;
  const respondidas = rodadas.filter((rd) => escolhas[rd.id] !== undefined).length;

  function ir(destino) {
    router.push(`/confira?r=${destino}`, { scroll: false });
  }

  function escolher(i) {
    if (!rodada || respondeu) return;
    setEscolhas((e) => ({ ...e, [rodada.id]: i }));
    registrarConferencia({ rodadaId: rodada.id, materia: rodada.materia, acertou: i === rodada.erro });
  }

  function proxima() {
    ir(indice + 1 >= rodadas.length ? "fim" : indice + 2);
  }

  function anterior() {
    if (indice > 0) ir(indice);
  }

  function recomecar() {
    setEscolhas({});
    ir(1);
  }

  // atalhos de teclado
  useEffect(() => {
    function tecla(e) {
      if (e.target.closest?.("input, textarea") || e.altKey || e.ctrlKey || e.metaKey) return;
      if (!terminou && /^[1-4]$/.test(e.key)) escolher(Number(e.key) - 1);
      else if (e.key === "ArrowRight" && !terminou) proxima();
      else if (e.key === "ArrowLeft" && indice > 0) anterior();
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  return (
    <section className={styles.tela}>
      <header className={styles.cabeca}>
        <h1 className={styles.titulo}>Confira a IA</h1>
        <p className={styles.sub}>
          IAs erram com a mesma confiança com que acertam. Cada resposta abaixo tem uma frase errada. Ache
          qual é.
        </p>
      </header>

      {/* placar: cada rodada é um botão; dá para ir e voltar à vontade */}
      <ol className={styles.placar} aria-label="Rodadas">
        {rodadas.map((rd, i) => {
          const feita = escolhas[rd.id] !== undefined;
          const estado = feita ? (acertou(rd) ? styles.achou : styles.passou) : "";
          return (
            <li key={rd.id}>
              <button
                type="button"
                className={`${estado} ${!terminou && i === indice ? styles.atual : ""}`}
                aria-current={!terminou && i === indice ? "step" : undefined}
                onClick={() => ir(i + 1)}
                data-tip={
                  feita
                    ? acertou(rd)
                      ? "Você achou o erro. Clique para rever."
                      : "O erro passou. Clique para rever."
                    : `Ir para a rodada ${i + 1}`
                }
                data-tip-alinha={i === 0 ? "esquerda" : undefined}
              >
                {i + 1}. {rd.materia}
                {feita && (
                  <span className="sr-only">{acertou(rd) ? ": achou o erro" : ": o erro passou"}</span>
                )}
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            className={terminou ? styles.atual : ""}
            onClick={() => ir("fim")}
            disabled={respondidas === 0}
            data-tip={respondidas === 0 ? "Responda pelo menos uma rodada primeiro." : "Ver o placar final."}
            data-tip-alinha="direita"
          >
            Resultado
          </button>
        </li>
      </ol>

      {!terminou ? (
        <div className={styles.rodada}>
          <div className={styles.perguntaAluno}>
            <span className={styles.quem}>Pergunta de um aluno</span>
            <p>{rodada.pergunta}</p>
          </div>

          <div className={styles.respostaIA}>
            <CabecaRobo tamanho={40} className={styles.avatar} />
            <div className={styles.balao}>
              <span className={styles.quem}>Resposta da IA</span>
              <p className={styles.instrucao}>
                {respondeu ? "Veja onde estava o erro:" : "Toque na frase que está errada."}
                {!respondeu && <span className={styles.soTeclado}> Ou use as teclas 1 a 4.</span>}
              </p>
              <ol className={styles.frases}>
                {rodada.frases.map((frase, i) => {
                  const ehErro = i === rodada.erro;
                  const classe = !respondeu
                    ? ""
                    : ehErro
                      ? styles.errada
                      : i === escolha
                        ? styles.escolhida
                        : styles.apagada;
                  return (
                    <li key={i}>
                      <button
                        className={`${styles.frase} ${classe}`}
                        onClick={() => escolher(i)}
                        disabled={respondeu}
                        aria-pressed={i === escolha}
                      >
                        <span className={styles.numero} aria-hidden="true">
                          {i + 1}
                        </span>
                        <span>{frase}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {respondeu && (
            <div
              className={`${styles.veredito} ${escolha === rodada.erro ? styles.certo : ""}`}
              role="status"
            >
              <h2>{escolha === rodada.erro ? "Achou o erro." : "Não era essa frase."}</h2>
              <p>{rodada.explicacao}</p>
            </div>
          )}

          {/* navegação sempre visível */}
          <div className={styles.navegacao}>
            <button
              className="botao discreto"
              onClick={anterior}
              disabled={indice === 0}
              data-tip="Rodada anterior (tecla ←)"
            >
              ← Anterior
            </button>
            <button
              className={respondeu ? "botao" : "botao secundario"}
              onClick={proxima}
              data-tip={
                respondeu ? "Próxima rodada (tecla →)" : "Passa para a próxima sem responder (tecla →)"
              }
              data-tip-alinha="direita"
            >
              {indice === rodadas.length - 1 ? "Ver resultado" : respondeu ? "Próxima resposta →" : "Pular →"}
            </button>
          </div>
          <p className={`${styles.atalhos} ${styles.soTeclado}`}>
            Atalhos: 1 a 4 escolhem a frase, ← e → trocam de rodada.
          </p>
        </div>
      ) : (
        <div className={styles.final}>
          <p className={styles.placarFinal}>
            {acertos}
            <span> de {rodadas.length}</span>
          </p>
          <h2>
            {acertos === rodadas.length
              ? "Nenhum erro passou por você."
              : `${acertos === 1 ? "erro encontrado" : "erros encontrados"}.`}
          </h2>
          {respondidas < rodadas.length && (
            <p>
              Faltam {rodadas.length - respondidas}{" "}
              {rodadas.length - respondidas === 1 ? "rodada" : "rodadas"}: toque nelas no placar acima para
              responder.
            </p>
          )}
          <ul className={styles.revisao}>
            {rodadas.map((rd, i) => (
              <li key={rd.id}>
                <button type="button" onClick={() => ir(i + 1)}>
                  <span aria-hidden="true">
                    {escolhas[rd.id] === undefined ? "○" : acertou(rd) ? "✓" : "✗"}
                  </span>
                  {rd.materia}
                  <span className={styles.revisaoAcao}>
                    {escolhas[rd.id] === undefined ? "Responder" : "Rever"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p>
            Na pesquisa, uma das nossas suposições era que muitos estudantes aceitam a resposta da IA sem
            conferir. Conferir é um hábito: quanto mais você faz, mais rápido fica.
          </p>
          <div className="acoes">
            <button className="botao" onClick={recomecar}>
              Jogar de novo
            </button>
            <Link href="/painel" className="botao secundario">
              Ver meu painel
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
