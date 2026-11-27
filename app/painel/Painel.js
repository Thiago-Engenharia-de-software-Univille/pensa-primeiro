"use client";

import Link from "next/link";
import Medidor from "@/components/Medidor";
import Robo from "@/components/Robo";
import { useHistorico, useConferencias, limpar, RESULTADOS } from "@/lib/historico";
import styles from "./painel.module.css";

const ORDEM = ["sozinho", "dicas", "resposta", "travei"];

const formatarData = (iso) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });

export default function Painel() {
  const historico = useHistorico();
  const conferencias = useConferencias();
  const total = historico.length;

  if (total === 0 && conferencias.length === 0) {
    return (
      <section className={styles.vazio}>
        <div className={styles.vazioTexto}>
          <h1 className={styles.titulo}>Seu painel ainda está vazio.</h1>
          <p className={styles.sub}>
            Resolva a primeira pergunta e aqui aparece quanto você conseguiu fazer sem abrir a resposta.
          </p>
          <div className="acoes">
            <Link href="/estudar" className="botao">
              Começar a estudar
            </Link>
            <Link href="/confira" className="botao secundario">
              Confira a IA
            </Link>
          </div>
        </div>
        <Robo className={styles.roboVazio} />
      </section>
    );
  }

  return (
    <section className={styles.tela}>
      <h1 className={styles.titulo}>Seu painel</h1>

      {total > 0 ? <Estudo historico={historico} /> : <SemEstudo />}

      {conferencias.length > 0 && <SensoCritico conferencias={conferencias} />}

      <div className="acoes">
        <Link href="/estudar" className="botao">
          Estudar outra pergunta
        </Link>
        {conferencias.length === 0 && (
          <Link href="/confira" className="botao secundario">
            Confira a IA
          </Link>
        )}
        <button className="botao discreto" onClick={limpar}>
          Apagar histórico
        </button>
      </div>
    </section>
  );
}

function Estudo({ historico }) {
  const total = historico.length;
  const contagem = Object.fromEntries(ORDEM.map((t) => [t, historico.filter((s) => s.resultado === t).length]));
  // "Autonomia" = resolveu sem ver a resposta (sozinho ou só com dicas)
  const autonomia = Math.round(((contagem.sozinho + contagem.dicas) / total) * 100);
  const mediaDicas = (historico.reduce((soma, s) => soma + s.dicas, 0) / total).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  // "travei" só aparece na legenda se já aconteceu (é exclusivo da pergunta livre)
  const visiveis = ORDEM.filter((t) => t !== "travei" || contagem.travei > 0);

  return (
    <>
      <div className={styles.destaque}>
        <Medidor valor={autonomia} className={styles.medidor} />
        <div>
          <strong className={styles.numero}>{autonomia}%</strong>
          <p className={styles.legendaNumero}>das perguntas você resolveu sem abrir a resposta</p>
        </div>
      </div>

      <div className={styles.divisao}>
        <h2 className={styles.subtitulo}>Como você resolveu</h2>
        <div
          className={styles.barra}
          role="img"
          aria-label={visiveis.map((t) => `${RESULTADOS[t]}: ${contagem[t]}`).join(", ")}
        >
          {visiveis.map((t) =>
            contagem[t] > 0 ? <span key={t} className={styles[t]} style={{ flexGrow: contagem[t] }} /> : null,
          )}
        </div>
        <ul className={styles.legenda}>
          {visiveis.map((t) => (
            <li key={t}>
              <span className={`${styles.cor} ${styles[t]}`} />
              {RESULTADOS[t]}
              <strong>{contagem[t]}</strong>
            </li>
          ))}
        </ul>
        <p className={styles.nota}>
          {total} {total === 1 ? "pergunta" : "perguntas"} no total, com {mediaDicas}{" "}
          {mediaDicas === "1" ? "dica" : "dicas"} por pergunta em média.
        </p>
      </div>

      <div className={styles.divisao}>
        <h2 className={styles.subtitulo}>Últimas perguntas</h2>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Matéria</th>
              <th>Resultado</th>
              <th>Dicas</th>
              <th>Dia</th>
            </tr>
          </thead>
          <tbody>
            {historico.slice(0, 8).map((s) => (
              <tr key={s.data}>
                <td>{s.materia}</td>
                <td>
                  <span className={`${styles.cor} ${styles[s.resultado]}`} />
                  {RESULTADOS[s.resultado]}
                </td>
                <td>{s.dicas}</td>
                <td>{formatarData(s.data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SemEstudo() {
  return (
    <p className={styles.sub}>
      Você ainda não estudou nenhuma pergunta. Quando estudar, aqui aparece quanto resolveu sem abrir a resposta.
    </p>
  );
}

function SensoCritico({ conferencias }) {
  const achados = conferencias.filter((c) => c.acertou).length;
  // últimas 12 rodadas, da mais antiga para a mais nova
  const recentes = conferencias.slice(0, 12).reverse();

  return (
    <div className={styles.divisao}>
      <h2 className={styles.subtitulo}>Senso crítico</h2>
      <p className={styles.critico}>
        <strong>{achados}</strong> de {conferencias.length} erros da IA encontrados no Confira a IA.
      </p>
      <ol className={styles.sequencia} aria-label="Últimas rodadas, da mais antiga para a mais nova">
        {recentes.map((c) => (
          <li
            key={c.data}
            className={c.acertou ? styles.achou : styles.passou}
            title={`${c.materia}: ${c.acertou ? "achou o erro" : "o erro passou"}`}
          >
            <span className="sr-only">{c.acertou ? "achou" : "passou"}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
