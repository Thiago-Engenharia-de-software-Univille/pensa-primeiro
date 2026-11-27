"use client";

import Link from "next/link";
import { useState } from "react";
import CabecaRobo from "@/components/CabecaRobo";
import Etapas from "@/components/Etapas";
import { perguntas, buscarPergunta, perguntaLivre } from "@/lib/perguntas";
import { registrar, RESULTADOS } from "@/lib/historico";
import { podeVerificar, verificar } from "@/lib/verificador";
import { conferirComIA } from "@/lib/conferirIA";
import styles from "./estudo.module.css";

const NOMES_DICA = ["Dica 1", "Dica 2", "Explicação"];
const NOMES_DICA_LIVRE = ["Dica 1", "Dica 2", "Dica 3"];
const MINIMO_TENTATIVA = 15; // caracteres para liberar a primeira dica

const MENSAGEM_FIM = {
  sozinho: "Nenhuma dica usada. Foi tudo seu.",
  dicas: (usadas, total) => `Você usou ${usadas} de ${total} dicas e chegou lá por conta própria.`,
  resposta: "Tudo bem precisar da resposta. Tente outra pergunta e veja se consegue abrir menos dicas.",
  travei:
    "Faz parte. Anote a dúvida e leve para a aula ou para o material da matéria: chegar com a pergunta certa já é meio caminho.",
};

// Etapas: escolher → tentar → dicas → fim
export default function Estudo() {
  const [etapa, setEtapa] = useState("escolher");
  const [perguntaId, setPerguntaId] = useState(null);
  const [tentativa, setTentativa] = useState("");
  const [dicasAbertas, setDicasAbertas] = useState(0);
  const [respostaVista, setRespostaVista] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [escrevendoLivre, setEscrevendoLivre] = useState(false);
  const [textoLivre, setTextoLivre] = useState("");
  const [retorno, setRetorno] = useState(null); // resultado do verificador
  const [conferindo, setConferindo] = useState(false);

  const pergunta =
    perguntaId === "livre"
      ? perguntaLivre(textoLivre.trim())
      : perguntaId
        ? buscarPergunta(perguntaId)
        : null;
  const indiceEtapa = { escolher: 0, tentar: 1, dicas: 2, fim: 3 }[etapa];

  function escolher(id) {
    setPerguntaId(id);
    setTentativa("");
    setDicasAbertas(0);
    setRespostaVista(false);
    setResultado(null);
    setEscrevendoLivre(false);
    setRetorno(null);
    setEtapa("tentar");
  }

  function estudarOutra() {
    setTextoLivre("");
    setEtapa("escolher");
  }

  function mudarTentativa(texto) {
    setTentativa(texto);
    setRetorno(null); // a conferência anterior não vale mais para o texto novo
  }

  // Primeiro o verificador local (grátis e instantâneo). Só se ele não confirmar,
  // ou se for pergunta livre, pedimos para a IA conferir: assim a cota gratuita rende.
  async function conferir() {
    const local = podeVerificar(pergunta.id) ? verificar(pergunta.id, tentativa) : null;
    if (local?.status === "certo") {
      setRetorno(local);
      terminar(dicasAbertas === 0 ? "sozinho" : "dicas");
      return;
    }
    setConferindo(true);
    const ia = await conferirComIA(pergunta, tentativa);
    setConferindo(false);
    // sem IA disponível, vale o verificador local (se houver) com o aviso de indisponibilidade
    const r = ia.status === "indisponivel" && local ? { ...local, aviso: ia.mensagem } : ia;
    setRetorno(r);
    if (r.status === "certo") terminar(dicasAbertas === 0 ? "sozinho" : "dicas");
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
      <section className={styles.tela}>
        <Etapas atual={0} />
        <h1 className={styles.titulo}>O que você quer estudar?</h1>
        <p className={styles.nota}>Neste protótipo, as dicas foram escritas pelo grupo para simular a IA.</p>
        <ul className={styles.opcoes}>
          {perguntas.map((p) => (
            <li key={p.id}>
              <button className={`opcao ${styles.opcao}`} onClick={() => escolher(p.id)}>
                <span className={styles.materia}>{p.materia}</span>
                <span className={styles.enunciadoOpcao}>{p.enunciado}</span>
              </button>
            </li>
          ))}
          <li className={styles.livre}>
            {!escrevendoLivre ? (
              <button className={`opcao ${styles.opcao}`} onClick={() => setEscrevendoLivre(true)}>
                <span className={styles.materia}>Sua pergunta</span>
                <span className={styles.enunciadoOpcao}>Tenho uma dúvida que não está aqui</span>
              </button>
            ) : (
              <form
                className={styles.formLivre}
                onSubmit={(e) => {
                  e.preventDefault();
                  escolher("livre");
                }}
              >
                <label htmlFor="livre" className={styles.rotuloFolha}>
                  Qual é a sua pergunta?
                  <span className={styles.nota}>
                    Sem uma IA de verdade neste protótipo, as dicas para perguntas livres são de método: elas
                    ensinam o caminho, não o conteúdo.
                  </span>
                </label>
                <textarea
                  id="livre"
                  className={styles.campoLivre}
                  value={textoLivre}
                  onChange={(e) => setTextoLivre(e.target.value)}
                  placeholder="Ex.: Como calcular a área de um triângulo?"
                  autoFocus
                />
                <div className="acoes">
                  <button className="botao" disabled={textoLivre.trim().length < 10}>
                    Continuar
                  </button>
                  <button type="button" className="botao discreto" onClick={() => setEscrevendoLivre(false)}>
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

  const tentativaValida = tentativa.trim().length >= MINIMO_TENTATIVA;
  const todasAbertas = dicasAbertas === pergunta.dicas.length;

  return (
    <section className={styles.tela}>
      <div className={styles.barraTopo}>
        <Etapas atual={indiceEtapa} />
        {etapa !== "fim" && (
          <button className="botao discreto" onClick={estudarOutra}>
            Trocar de pergunta
          </button>
        )}
      </div>

      <div className={styles.pergunta}>
        <span className={styles.materia}>{pergunta.materia}</span>
        <h1 className={styles.enunciado}>{pergunta.enunciado}</h1>
      </div>

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
            placeholder="Eu acho que…"
            autoFocus
          />
          <Retorno retorno={retorno} />
          <div className="acoes">
            <button className="botao" disabled={!tentativaValida || conferindo} onClick={conferir}>
              {conferindo ? "Conferindo…" : "Conferir minha resposta"}
            </button>
            <button
              className="botao secundario"
              disabled={!tentativaValida || conferindo}
              onClick={() => setEtapa("dicas")}
            >
              Pedir a primeira dica
            </button>
            <button
              className="botao discreto"
              onClick={() => {
                setTentativa("Não sei por onde começar.");
                setEtapa("dicas");
              }}
            >
              Não sei por onde começar
            </button>
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
          {!tentativaValida && tentativa.length > 0 && (
            <p className={styles.nota}>Escreva um pouco mais para liberar a dica.</p>
          )}
        </div>
      )}

      {etapa !== "tentar" && (
        <div className={styles.mesa}>
          <div className={styles.colunaTentativa}>
            <label htmlFor="tentativa" className={styles.rotuloFolha}>
              Sua tentativa
              {etapa === "dicas" && (
                <span className={styles.nota}>Dá para ir corrigindo enquanto lê as dicas.</span>
              )}
            </label>
            <textarea
              id="tentativa"
              className={styles.folha}
              value={tentativa}
              onChange={(e) => mudarTentativa(e.target.value)}
              readOnly={etapa === "fim"}
            />
            {etapa === "dicas" && <Retorno retorno={retorno} />}
          </div>

          <div className={styles.conversa}>
            <ol className={styles.dicas}>
              {pergunta.dicas.map((texto, i) =>
                i < dicasAbertas ? (
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
              <div className={`${styles.resposta} ${respostaVista ? styles.aberta : ""}`}>
                <span className={styles.nomeDica}>Resposta</span>
                <p aria-hidden={!respostaVista}>
                  {respostaVista ? pergunta.resposta : "A resposta fica aqui até o final."}
                </p>
                {!respostaVista && (
                  <button
                    className={styles.lacre}
                    disabled={!todasAbertas || etapa === "fim"}
                    onClick={() => setRespostaVista(true)}
                    title={todasAbertas ? undefined : "Abra as dicas antes"}
                  >
                    {todasAbertas ? "Abrir resposta" : "Lacrada"}
                  </button>
                )}
              </div>
            )}

            {etapa === "dicas" && (
              <div className={styles.controles}>
                <p>
                  {dicasAbertas === 0
                    ? "Quer a primeira dica ou já resolveu?"
                    : "Corrigiu a tentativa? Confira de novo ou abra a próxima dica."}
                </p>
                <div className="acoes">
                  {!todasAbertas && (
                    <button className="botao" onClick={() => setDicasAbertas((n) => n + 1)}>
                      Abrir {nomes[dicasAbertas].toLowerCase()}
                    </button>
                  )}
                  {!respostaVista ? (
                    <>
                      <button className="botao secundario" disabled={conferindo} onClick={conferir}>
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
              </div>
            )}

            {etapa === "fim" && (
              <div className={styles.fim}>
                <h2>{RESULTADOS[resultado]}</h2>
                {retorno?.status === "certo" && (
                  <p className={styles.confirmado}>
                    {retorno.mensagem}
                    {retorno.fonte === "ia" && (
                      <span className={styles.fonteRetorno}> Conferido pela IA.</span>
                    )}
                  </p>
                )}
                <p>
                  {resultado === "dicas"
                    ? MENSAGEM_FIM.dicas(dicasAbertas, pergunta.dicas.length)
                    : MENSAGEM_FIM[resultado]}
                </p>
                <div className="acoes">
                  <button className="botao" onClick={estudarOutra}>
                    Estudar outra pergunta
                  </button>
                  <Link href="/painel" className="botao secundario">
                    Ver meu painel
                  </Link>
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
const TITULOS = { quase: "Quase lá.", errado: "Ainda não bate.", indisponivel: "Sem conferência agora." };

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
