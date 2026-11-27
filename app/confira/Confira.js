"use client";

import Link from "next/link";
import { useState } from "react";
import CabecaRobo from "@/components/CabecaRobo";
import { rodadas } from "@/lib/confira";
import { registrarConferencia } from "@/lib/historico";
import styles from "./confira.module.css";

export default function Confira() {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState(null);
  const [resultados, setResultados] = useState([]); // true = achou o erro
  const acertos = resultados.filter(Boolean).length;

  const terminou = indice >= rodadas.length;
  const rodada = rodadas[indice];
  const respondeu = escolha !== null;

  function escolher(i) {
    if (respondeu) return;
    const acertou = i === rodada.erro;
    setEscolha(i);
    setResultados((r) => [...r, acertou]);
    registrarConferencia({ rodadaId: rodada.id, materia: rodada.materia, acertou });
  }

  function proxima() {
    setEscolha(null);
    setIndice((n) => n + 1);
  }

  function recomecar() {
    setEscolha(null);
    setResultados([]);
    setIndice(0);
  }

  return (
    <section className={styles.tela}>
      <header className={styles.cabeca}>
        <h1 className={styles.titulo}>Confira a IA</h1>
        <p className={styles.sub}>
          IAs erram com a mesma confiança com que acertam. Cada resposta abaixo tem uma frase errada. Ache qual é.
        </p>
      </header>

      <ol className={styles.placar} aria-label="Rodadas">
        {rodadas.map((r, i) => (
          <li
            key={r.id}
            className={
              resultados[i] === true
                ? styles.achou
                : resultados[i] === false
                  ? styles.passou
                  : i === indice && !terminou
                    ? styles.atual
                    : ""
            }
          >
            {r.materia}
            {resultados[i] !== undefined && (
              <span className="sr-only">{resultados[i] ? ": achou o erro" : ": o erro passou"}</span>
            )}
          </li>
        ))}
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
                        {frase}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {respondeu && (
            <div className={`${styles.veredito} ${escolha === rodada.erro ? styles.certo : ""}`}>
              <h2>{escolha === rodada.erro ? "Achou o erro." : "Não era essa frase."}</h2>
              <p>{rodada.explicacao}</p>
              <div className="acoes">
                <button className="botao" onClick={proxima} autoFocus>
                  {indice === rodadas.length - 1 ? "Ver resultado" : "Próxima resposta"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.final}>
          <p className={styles.placarFinal}>
            {acertos}
            <span> de {rodadas.length}</span>
          </p>
          <h2>{acertos === rodadas.length ? "Nenhum erro passou por você." : "erros encontrados."}</h2>
          <p>
            Na pesquisa, uma das nossas suposições era que muitos estudantes aceitam a resposta da IA sem conferir.
            Conferir é um hábito: quanto mais você faz, mais rápido fica.
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
