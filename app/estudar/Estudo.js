"use client";

import Link from "next/link";
import { useState } from "react";
import { perguntas, buscarPergunta } from "@/lib/perguntas";
import { registrar, RESULTADOS } from "@/lib/historico";
import styles from "./estudo.module.css";

const NOMES_DICA = ["Dica 1", "Dica 2", "Explicação"];
const MINIMO_TENTATIVA = 15; // caracteres para liberar a primeira dica

// Etapas: escolher → tentar → dicas → fim
export default function Estudo() {
  const [etapa, setEtapa] = useState("escolher");
  const [perguntaId, setPerguntaId] = useState(null);
  const [tentativa, setTentativa] = useState("");
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [respostaVista, setRespostaVista] = useState(false);
  const [resultado, setResultado] = useState(null);

  const pergunta = perguntaId ? buscarPergunta(perguntaId) : null;

  function escolher(id) {
    setPerguntaId(id);
    setTentativa("");
    setDicasAbertas(0);
    setRespostaVista(false);
    setResultado(null);
    setEtapa("tentar");
  }

  function terminar(tipo) {
    setResultado(tipo);
    registrar({
      perguntaId: pergunta.id,
      materia: pergunta.materia,
      dicas: dicasAbertas,
      resultado: tipo,
    });
    setEtapa("fim");
  }

  if (etapa === "escolher") {
    return (
      <section className="pilha">
        <p className="rotulo">Passo 1 de 3</p>
        <h1>O que você quer estudar?</h1>
        <p className={styles.nota}>
          Protótipo: as dicas destas perguntas foram escritas pelo grupo para simular a IA.
        </p>
        <div className={styles.grade}>
          {perguntas.map((p) => (
            <button key={p.id} className={`cartao opcao ${styles.opcao}`} onClick={() => escolher(p.id)}>
              <span className="rotulo">{p.materia}</span>
              <span>{p.enunciado}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const tentativaValida = tentativa.trim().length >= MINIMO_TENTATIVA;

  return (
    <section className="pilha">
      <p className="rotulo">
        {etapa === "tentar" ? "Passo 2 de 3" : etapa === "dicas" ? "Passo 3 de 3" : "Pronto"} ·{" "}
        {pergunta.materia}
      </p>
      <h1 className={styles.enunciado}>{pergunta.enunciado}</h1>

      {etapa === "tentar" && (
        <div className="cartao pilha">
          <label htmlFor="tentativa">
            <strong>Qual a sua tentativa?</strong>
            <br />
            <span className={styles.nota}>
              Escreva o que você acha, mesmo que não tenha certeza. Errar aqui faz parte.
            </span>
          </label>
          <textarea
            id="tentativa"
            value={tentativa}
            onChange={(e) => setTentativa(e.target.value)}
            placeholder="Eu acho que…"
          />
          <div className="acoes">
            <button className="botao" disabled={!tentativaValida} onClick={() => setEtapa("dicas")}>
              Pedir dica
            </button>
            <button
              className="botao discreto"
              onClick={() => {
                setTentativa("Não sei por onde começar.");
                setEtapa("dicas");
              }}
            >
              Não faço ideia por onde começar
            </button>
          </div>
          {!tentativaValida && tentativa.length > 0 && (
            <p className={styles.nota}>Escreva um pouco mais para liberar a dica.</p>
          )}
        </div>
      )}

      {etapa !== "tentar" && (
        <>
          <div className={`cartao ${styles.tentativa}`}>
            <span className="rotulo">Sua tentativa</span>
            {etapa === "dicas" ? (
              <textarea value={tentativa} onChange={(e) => setTentativa(e.target.value)} />
            ) : (
              <p>{tentativa}</p>
            )}
          </div>

          <ol className={styles.dicas}>
            {pergunta.dicas.map((texto, i) => {
              const aberta = i < dicasAbertas;
              return (
                <li key={i} className={`cartao ${aberta ? styles.aberta : styles.fechada}`}>
                  <span className="rotulo">{NOMES_DICA[i]}</span>
                  {aberta ? <p>{texto}</p> : <p className={styles.nota}>Ainda bloqueada.</p>}
                </li>
              );
            })}
          </ol>

          {respostaVista && (
            <div className={`cartao ${styles.resposta}`}>
              <span className="rotulo">Resposta</span>
              <p>{pergunta.resposta}</p>
            </div>
          )}
        </>
      )}

      {etapa === "dicas" && (
        <div className="cartao pilha">
          <p>
            <strong>
              {dicasAbertas === 0 ? "Quer a primeira dica ou já resolveu?" : "Conseguiu resolver?"}
            </strong>{" "}
            <span className={styles.nota}>Você pode atualizar sua tentativa acima a qualquer momento.</span>
          </p>
          <div className="acoes">
            {dicasAbertas < pergunta.dicas.length && (
              <button className="botao" onClick={() => setDicasAbertas((n) => n + 1)}>
                Abrir {NOMES_DICA[dicasAbertas]}
              </button>
            )}
            {!respostaVista && (
              <button className="botao secundario" onClick={() => terminar(dicasAbertas === 0 ? "sozinho" : "dicas")}>
                Resolvi!
              </button>
            )}
            {dicasAbertas === pergunta.dicas.length && !respostaVista && (
              <button className="botao discreto" onClick={() => setRespostaVista(true)}>
                Ver resposta
              </button>
            )}
            {respostaVista && (
              <button className="botao secundario" onClick={() => terminar("resposta")}>
                Entendi, terminar
              </button>
            )}
          </div>
        </div>
      )}

      {etapa === "fim" && (
        <div className={`cartao pilha ${styles.fim}`}>
          <h2>{RESULTADOS[resultado]}</h2>
          <p>
            {resultado === "sozinho" && "Mandou bem: nenhuma dica usada."}
            {resultado === "dicas" &&
              `Você usou ${dicasAbertas} de ${pergunta.dicas.length} dicas e chegou lá por conta própria.`}
            {resultado === "resposta" &&
              "Tudo bem precisar da resposta. Que tal tentar outra pergunta parecida sem ela?"}
          </p>
          <div className="acoes">
            <button className="botao" onClick={() => setEtapa("escolher")}>
              Estudar outra
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
