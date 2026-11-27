"use client";

import Link from "next/link";
import { useState } from "react";
import Medidor from "@/components/Medidor";
import Robo from "@/components/Robo";
import { useHistorico, useConferencias, limpar, RESULTADOS } from "@/lib/historico";
import { NIVEIS } from "@/lib/nivel";
import {
  ORDEM,
  autonomia as calcularAutonomia,
  contarResultados,
  conquistas as calcularConquistas,
  porMateria,
  porNivel,
  proximoPasso as calcularProximoPasso,
  sequenciaDeDias,
  ultimosDias,
} from "@/lib/estatisticas";
import styles from "./painel.module.css";

const formatarData = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

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

  const achados = conferencias.filter((c) => c.acertou).length;
  const mediaDicas = total
    ? (historico.reduce((soma, s) => soma + s.dicas, 0) / total).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })
    : "0";
  const sequencia = sequenciaDeDias(historico);
  const proximo = calcularProximoPasso(historico);

  return (
    <section className={styles.tela}>
      <h1 className={styles.titulo}>Seu painel</h1>

      {/* resumo em números */}
      <ul className={styles.resumo}>
        <li data-tip="Perguntas que você terminou neste navegador." data-tip-alinha="esquerda">
          <strong>{total}</strong>
          <span>{total === 1 ? "pergunta estudada" : "perguntas estudadas"}</span>
        </li>
        <li data-tip="Dias seguidos com pelo menos uma pergunta, contando até hoje.">
          <strong>{sequencia}</strong>
          <span>{sequencia === 1 ? "dia seguido estudando" : "dias seguidos estudando"}</span>
        </li>
        <li data-tip="Quantas dicas você abriu, em média, em cada pergunta. Menos dicas = mais autonomia.">
          <strong>{mediaDicas}</strong>
          <span>dicas por pergunta, em média</span>
        </li>
        <li
          data-tip="Rodadas do Confira a IA em que você achou a frase errada, de quantas jogou."
          data-tip-alinha="direita"
        >
          <strong>
            {achados}
            <small>/{conferencias.length}</small>
          </strong>
          <span>erros da IA encontrados</span>
        </li>
      </ul>

      {proximo && (
        <div className={styles.proximo}>
          <div>
            <p className={styles.proximoRotulo}>Próximo passo</p>
            <p>{proximo.motivo}</p>
            {proximo.faltam > 1 && (
              <p className={styles.nota}>
                {plural(proximo.faltam, "pergunta ainda não tentada", "perguntas ainda não tentadas")}.
              </p>
            )}
          </div>
          <Link href={`/estudar?p=${proximo.pergunta.id}`} className="botao">
            Estudar {proximo.pergunta.materia}
          </Link>
        </div>
      )}

      {total > 0 ? <Estudo historico={historico} /> : <SemEstudo />}

      {conferencias.length > 0 && <SensoCritico conferencias={conferencias} />}

      <Conquistas historico={historico} conferencias={conferencias} />

      <div className="acoes">
        <Link href="/estudar" className="botao">
          Estudar outra pergunta
        </Link>
        {conferencias.length === 0 && (
          <Link href="/confira" className="botao secundario">
            Confira a IA
          </Link>
        )}
        <button
          className="botao discreto"
          onClick={limpar}
          data-tip="Apaga tudo o que foi salvo neste navegador: perguntas, rodadas e conquistas."
        >
          Apagar histórico
        </button>
      </div>
    </section>
  );
}

function Estudo({ historico }) {
  const total = historico.length;
  const contagem = contarResultados(historico);
  const autonomia = calcularAutonomia(historico);
  // "travei" só aparece se já aconteceu (é exclusivo da pergunta livre)
  const visiveis = ORDEM.filter((t) => t !== "travei" || contagem.travei > 0);
  const materias = porMateria(historico);
  const niveis = porNivel(historico);
  const totalComNivel = Object.values(niveis).reduce((a, b) => a + b, 0);

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
        <Legenda visiveis={visiveis} contagem={contagem} />
      </div>

      <UltimosDias historico={historico} visiveis={visiveis} />

      <div className={styles.divisao}>
        <h2 className={styles.subtitulo}>Por matéria</h2>
        <p className={styles.nota}>Quanto de cada matéria você resolveu sem abrir a resposta.</p>
        {["escola", "programacao"].map((area) => {
          const lista = materias.filter((m) =>
            area === "escola" ? m.area !== "programacao" : m.area === area,
          );
          if (!lista.length) return null;
          return (
            <div key={area} className={styles.grupoMateria}>
              <h3>{area === "escola" ? "Escola" : "Programação"}</h3>
              <ul className={styles.materias}>
                {lista.map((m) => (
                  <li key={m.materia}>
                    <span className={styles.nomeMateria}>{m.materia}</span>
                    <span className={styles.trilhoMateria} aria-hidden="true">
                      <span style={{ width: `${Math.max(m.pct, 2)}%` }} />
                    </span>
                    <span className={styles.valorMateria}>
                      {m.pct}%<small> · {plural(m.total, "pergunta", "perguntas")}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {totalComNivel > 0 && (
        <div className={styles.divisao}>
          <h2 className={styles.subtitulo}>Nível de ajuda que você usou</h2>
          <ul className={styles.niveis}>
            {Object.entries(NIVEIS).map(([id, n]) => (
              <li key={id}>
                <strong>{niveis[id]}</strong>
                <span>{n.nome}</span>
              </li>
            ))}
          </ul>
          {niveis.dificil === 0 && (
            <p className={styles.nota}>Quando se sentir seguro, tente uma pergunta no difícil.</p>
          )}
        </div>
      )}

      <div className={styles.divisao}>
        <h2 className={styles.subtitulo}>Últimas perguntas</h2>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Matéria</th>
              <th>Resultado</th>
              <th>Dicas</th>
              <th>Nível</th>
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
                <td>{NIVEIS[s.nivel]?.nome ?? "—"}</td>
                <td>{formatarData(s.data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Legenda({ visiveis, contagem }) {
  return (
    <ul className={styles.legenda}>
      {visiveis.map((t) => (
        <li key={t}>
          <span className={`${styles.cor} ${styles[t]}`} />
          {RESULTADOS[t]}
          {contagem && <strong>{contagem[t]}</strong>}
        </li>
      ))}
    </ul>
  );
}

// Colunas empilhadas dos últimos 7 dias. Cada dia é um alvo de foco/hover com o detalhe;
// a mesma informação também está na tabela logo abaixo (o tooltip nunca é o único caminho).
function UltimosDias({ historico, visiveis }) {
  const dias = ultimosDias(historico);
  const [ativo, setAtivo] = useState(null);
  const maximo = Math.max(1, ...dias.map((d) => d.total));
  const ALTURA = 140;

  return (
    <div className={styles.divisao}>
      <h2 className={styles.subtitulo}>Últimos 7 dias</h2>
      <Legenda visiveis={visiveis} />
      <div className={styles.grafico} onPointerLeave={() => setAtivo(null)}>
        <div className={styles.linhaBase} aria-hidden="true" />
        {dias.map((d, i) => (
          <button
            key={d.chave}
            type="button"
            className={`${styles.coluna} ${ativo === i ? styles.colunaAtiva : ""}`}
            onPointerEnter={() => setAtivo(i)}
            onFocus={() => setAtivo(i)}
            onBlur={() => setAtivo(null)}
            aria-label={`${d.data}: ${plural(d.total, "pergunta", "perguntas")}`}
          >
            <span className={styles.pilha} style={{ height: (d.total / maximo) * ALTURA }}>
              {visiveis.map((t) =>
                d[t] > 0 ? <span key={t} className={styles[t]} style={{ flexGrow: d[t] }} /> : null,
              )}
            </span>
            {d.total > 0 && <span className={styles.valorColuna}>{d.total}</span>}
            <span className={styles.rotuloDia}>{d.rotulo}</span>
            {ativo === i && (
              <span className={styles.dica} role="tooltip">
                <span className={styles.dicaTitulo}>{d.data}</span>
                {d.total === 0 ? (
                  <span>Nenhuma pergunta</span>
                ) : (
                  visiveis.map((t) => (
                    <span key={t} className={styles.dicaLinha}>
                      <span className={`${styles.traco} ${styles[t]}`} />
                      <strong>{d[t]}</strong> {RESULTADOS[t]}
                    </span>
                  ))
                )}
              </span>
            )}
          </button>
        ))}
      </div>
      <details className={styles.tabelaDias}>
        <summary>Ver em tabela</summary>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Dia</th>
              {visiveis.map((t) => (
                <th key={t}>{RESULTADOS[t]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dias.map((d) => (
              <tr key={d.chave}>
                <td>{d.data}</td>
                {visiveis.map((t) => (
                  <td key={t}>{d[t]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

function SemEstudo() {
  return (
    <p className={styles.sub}>
      Você ainda não estudou nenhuma pergunta. Quando estudar, aqui aparece quanto resolveu sem abrir a
      resposta.
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
        <strong>{achados}</strong> de {plural(conferencias.length, "erro", "erros")} da IA
        {achados === 1 ? " encontrado" : " encontrados"} no Confira a IA.
      </p>
      <ol className={styles.sequencia} aria-label="Últimas rodadas, da mais antiga para a mais nova">
        {recentes.map((c) => (
          <li
            key={c.data}
            className={c.acertou ? styles.achou : styles.passou}
            data-tip={`${c.materia}: ${c.acertou ? "achou o erro" : "o erro passou"}`}
          >
            <span className="sr-only">{c.acertou ? "achou" : "passou"}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Conquistas({ historico, conferencias }) {
  const lista = calcularConquistas(historico, conferencias);
  const feitas = lista.filter((c) => c.feita).length;
  return (
    <div className={styles.divisao}>
      <h2 className={styles.subtitulo}>
        Conquistas{" "}
        <small className={styles.contagemConquistas}>
          {feitas} de {lista.length}
        </small>
      </h2>
      <ul className={styles.conquistas}>
        {lista.map((c) => (
          <li key={c.nome} className={c.feita ? styles.conquistaFeita : ""}>
            <span className={styles.selo} aria-hidden="true">
              {c.feita ? "✓" : ""}
            </span>
            <span>
              <strong>{c.nome}</strong>
              <span>{c.descricao}</span>
            </span>
            <span className="sr-only">{c.feita ? "(conquistada)" : "(ainda não)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
