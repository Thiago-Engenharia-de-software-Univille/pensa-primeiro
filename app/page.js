import Link from "next/link";
import Robo from "@/components/Robo";
import { APRESENTACAO } from "@/lib/links";
import styles from "./inicio.module.css";

const passos = [
  ["Você tenta", "Antes de qualquer ajuda, escreva o que você acha. Errar aqui faz parte."],
  ["A IA dá dicas", "Uma de cada vez, só o suficiente para destravar o próximo passo."],
  ["Você resolve", "A resposta completa fica lacrada até o final. Na maioria das vezes, nem precisa abrir."],
];

const ferramentas = [
  {
    nome: "Estudar",
    href: "/estudar",
    acao: "Escolher uma pergunta",
    texto:
      "Seis perguntas de matérias diferentes. Você escreve a sua tentativa numa folha de caderno, confere na hora se está certa e abre as dicas só se precisar.",
  },
  {
    nome: "Pergunta livre",
    href: "/estudar",
    acao: "Escrever a minha",
    texto:
      "Tem uma dúvida que não está na lista? Escreva a sua e receba dicas de método: como reler o enunciado, o que listar, por onde começar.",
  },
  {
    nome: "Confira a IA",
    href: "/confira",
    acao: "Testar meu olhar",
    texto:
      "Respostas que parecem certas, mas têm uma frase errada. Seu trabalho é achar qual, como um revisor desconfiado.",
  },
  {
    nome: "Painel",
    href: "/painel",
    acao: "Ver meu painel",
    texto:
      "Mostra quanto você resolveu sem abrir a resposta e quantos erros da IA encontrou. Fica salvo só no seu navegador.",
  },
];

const etapasTrabalho = [
  [
    "Escolha do problema",
    "Entre cinco problemas do dia a dia, a dependência da IA nos estudos foi o que mais apareceu na nossa rotina.",
  ],
  ["Matriz CSD", "Separamos o que tínhamos de certeza, o que supúnhamos e o que ainda queríamos descobrir."],
  [
    "Entrevistas",
    "Roteiro de oito perguntas abertas com estudantes de 15 a 25 anos que usam IA para estudar.",
  ],
  [
    "Protótipo",
    "Este site, desenhado para responder à pergunta que ficou: como a IA pode ajudar a pensar, em vez de pensar por nós?",
  ],
];

const grupo = ["Arthur", "Henrique Leal", "Henrique Miguel", "Nicolas", "Thiago W."];

export default function Inicio() {
  return (
    <>
      {/* ---------- o que é ---------- */}
      <section className={styles.hero}>
        <div className={styles.texto}>
          <h1 className={styles.titulo}>
            Pensa
            <br />
            primeiro.
          </h1>
          <p className={styles.sub}>
            Uma IA de estudos que pede a sua tentativa antes de ajudar e libera as dicas aos poucos. A
            resposta vem depois.
          </p>
          <div className="acoes">
            <Link href="/estudar" className="botao">
              Começar a estudar
            </Link>
            <a href="#trabalho" className="botao secundario">
              Conhecer o trabalho
            </a>
          </div>
        </div>
        <Robo className={styles.robo} />
      </section>

      {/* ---------- o problema ---------- */}
      <section className={`${styles.bloco} ${styles.porque}`} aria-labelledby="problema">
        <h2 id="problema" className={styles.citacao}>
          Sete em cada dez alunos do ensino médio já usam IA nas pesquisas da escola. Só três em cada dez
          aprenderam a usar.
        </h2>
        <div className={styles.explica}>
          <p>
            Quando a IA entrega a resposta pronta, quem estuda pula a parte em que o aprendizado acontece. Os
            pesquisadores chamam isso de descarregamento cognitivo: a ferramenta de apoio vira substituta do
            pensamento.
          </p>
          <p>O Pensa Primeiro não proíbe a IA. Ele só muda a ordem.</p>
          <p className={styles.fonte}>Fonte: TIC Educação 2024, Cetic.br (2025).</p>
        </div>
      </section>

      {/* ---------- como funciona ---------- */}
      <section className={styles.bloco} aria-labelledby="como-funciona">
        <h2 id="como-funciona">Como funciona</h2>
        <ol className={styles.trilha}>
          {passos.map(([titulo, texto], i) => (
            <li key={titulo}>
              <span className={styles.marco}>{i + 1}</span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- o que dá pra fazer ---------- */}
      <section className={styles.bloco} aria-labelledby="ferramentas">
        <div className={styles.cabecalho}>
          <h2 id="ferramentas">O que dá para fazer aqui?</h2>
          <p className={styles.nota}>
            É um protótipo: as dicas foram escritas pelo grupo para simular como a IA responderia.
          </p>
        </div>
        <ul className={styles.ferramentas}>
          {ferramentas.map((f) => (
            <li key={f.nome}>
              <h3>{f.nome}</h3>
              <p>{f.texto}</p>
              <Link href={f.href} className={styles.link}>
                {f.acao}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.confira}>
          <p className={styles.confiraLegenda}>Um exemplo do Confira a IA. A frase riscada é a errada:</p>
          <ol className={styles.exemplo} aria-label="Exemplo de resposta com erro">
            <li>No primeiro mês, 10% de R$&nbsp;1.000 dão R$&nbsp;100.</li>
            <li className={styles.exemploErro}>No segundo mês, os juros são de novo R$&nbsp;100.</li>
            <li>Então o total fica R$&nbsp;1.200.</li>
          </ol>
        </div>
      </section>

      {/* ---------- o trabalho ---------- */}
      <section id="trabalho" className={styles.bloco} aria-labelledby="sobre-trabalho">
        <div className={styles.cabecalho}>
          <h2 id="sobre-trabalho">De onde veio este site?</h2>
          <p className={styles.textoTrabalho}>
            O Pensa Primeiro é o protótipo do trabalho <em>Desinteligência Humana</em>, da disciplina de
            Interação Humano-Computador do curso de Engenharia de Software da Univille. A pergunta que guiou
            tudo foi: o uso exagerado da IA está diminuindo a nossa capacidade de raciocinar, criar e lembrar?
          </p>
        </div>

        <ol className={styles.percurso}>
          {etapasTrabalho.map(([titulo, texto]) => (
            <li key={titulo}>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>

        <div className={styles.rodapeTrabalho}>
          <p>
            <strong>Grupo:</strong> {grupo.join(", ")}
          </p>
          <div className="acoes">
            <Link href="/sobre" className="botao secundario">
              Ver a pesquisa completa
            </Link>
            <a href={APRESENTACAO} className="botao" target="_blank" rel="noopener">
              Ver a apresentação ↗
            </a>
          </div>
        </div>
      </section>

      {/* ---------- fechamento ---------- */}
      <section className={styles.fechamento}>
        <h2>Antes de perguntar para a IA, tente uma vez.</h2>
        <Link href="/estudar" className="botao">
          Começar a estudar
        </Link>
      </section>
    </>
  );
}
