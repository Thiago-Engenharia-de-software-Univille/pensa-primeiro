"use client";

import Link from "next/link";
import { useHistorico, limpar, RESULTADOS } from "@/lib/historico";
import styles from "./painel.module.css";

const ORDEM = ["sozinho", "dicas", "resposta"];

export default function Painel() {
  const historico = useHistorico();
  const total = historico.length;

  if (total === 0) {
    return (
      <section className="pilha">
        <p className="rotulo">Painel de autonomia</p>
        <h1>Nada por aqui ainda.</h1>
        <p>Resolva uma pergunta e o seu progresso aparece neste painel.</p>
        <div className="acoes">
          <Link href="/estudar" className="botao">
            Começar a estudar
          </Link>
        </div>
      </section>
    );
  }

  const contagem = Object.fromEntries(ORDEM.map((t) => [t, historico.filter((s) => s.resultado === t).length]));
  // "Autonomia" = resolveu sem ver a resposta (sozinho ou só com dicas)
  const autonomia = Math.round(((contagem.sozinho + contagem.dicas) / total) * 100);
  const mediaDicas = (historico.reduce((soma, s) => soma + s.dicas, 0) / total).toFixed(1);

  return (
    <section className="pilha">
      <p className="rotulo">Painel de autonomia</p>
      <h1>Quanto você resolveu por conta própria</h1>

      <div className={styles.topo}>
        <div className={`cartao ${styles.medidor}`}>
          <div
            className={styles.anel}
            style={{ "--valor": autonomia }}
            role="img"
            aria-label={`${autonomia}% resolvido sem ver a resposta`}
          >
            <span>{autonomia}%</span>
          </div>
          <p>resolvido sem ver a resposta</p>
        </div>

        <div className="cartao pilha">
          {ORDEM.map((tipo) => (
            <div key={tipo} className={styles.barra}>
              <div className={styles.legenda}>
                <span>{RESULTADOS[tipo]}</span>
                <strong>{contagem[tipo]}</strong>
              </div>
              <div className={styles.trilho}>
                <div
                  className={`${styles.preenchido} ${styles[tipo]}`}
                  style={{ width: `${(contagem[tipo] / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className={styles.nota}>
            {total} {total === 1 ? "pergunta" : "perguntas"} · média de {mediaDicas} dicas por pergunta
          </p>
        </div>
      </div>

      <div className="cartao">
        <h2 className={styles.subtitulo}>Últimas perguntas</h2>
        <ul className={styles.lista}>
          {historico.slice(0, 8).map((s) => (
            <li key={s.data}>
              <span>{s.materia}</span>
              <span className={styles.nota}>
                {RESULTADOS[s.resultado]} · {s.dicas} {s.dicas === 1 ? "dica" : "dicas"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="acoes">
        <Link href="/estudar" className="botao">
          Estudar mais
        </Link>
        <button className="botao discreto" onClick={limpar}>
          Apagar histórico
        </button>
      </div>
    </section>
  );
}
