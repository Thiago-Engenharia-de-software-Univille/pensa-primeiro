import Link from "next/link";
import Medidor from "@/components/Medidor";
import { APRESENTACAO, PDF_DO_TRABALHO } from "@/lib/links";
import styles from "./sobre.module.css";

export const metadata = { title: "Sobre · Pensa Primeiro" };

const dados = [
  {
    valor: 70,
    texto: "dos alunos do ensino médio que usam internet recorrem à IA generativa em pesquisas escolares",
    fonte: "TIC Educação 2024 (Cetic.br, 2025)",
  },
  {
    valor: 32,
    texto: "dos alunos receberam alguma orientação da escola sobre como usar essas ferramentas",
    fonte: "TIC Educação 2024 (Cetic.br, 2025)",
  },
  {
    valor: 48,
    texto: "dos estudantes brasileiros de 15 anos usam IA toda semana para aprender",
    fonte: "PISA 2025 (OCDE, 2026)",
  },
];

const csd = [
  {
    titulo: "Certezas",
    itens: [
      "A IA pode ser usada como ferramenta de apoio aos estudos.",
      "É importante verificar as informações que a IA fornece.",
    ],
  },
  {
    titulo: "Suposições",
    itens: [
      "O uso excessivo pode aumentar a dependência da ferramenta.",
      "Alguns estudantes aceitam respostas da IA sem verificar se estão corretas.",
    ],
  },
  {
    titulo: "Dúvidas",
    itens: [
      "Os estudantes conseguem fazer as atividades sem IA?",
      "Como a IA poderia ajudar os estudantes a pensar por conta própria?",
    ],
  },
];

// Como cada parte do site responde à pesquisa
const respostas = [
  ["Tentativa obrigatória", "Quem estuda pensa antes de receber qualquer ajuda.", "/estudar"],
  ["Dicas em níveis", "A IA ajuda aos poucos, sem entregar o raciocínio pronto.", "/estudar"],
  ["Confira a IA", "Treina o hábito de verificar, em vez de aceitar a resposta.", "/confira"],
  ["Painel de autonomia", "Mostra o quanto a pessoa está resolvendo sozinha.", "/painel"],
];

const grupo = ["Arthur", "Henrique Leal", "Henrique Miguel", "Nicolas", "Thiago W."];

const referencias = [
  "CETIC.BR. Pesquisa TIC Educação 2024. São Paulo: Comitê Gestor da Internet no Brasil, 2025.",
  "GERLICH, Michael. AI tools in society: impacts on cognitive offloading and the future of critical thinking. Societies, v. 15, n. 1, p. 6, 2025.",
  "KOSMYNA, Nataliya et al. Your brain on ChatGPT: accumulation of cognitive debt when using an AI assistant for essay writing task. arXiv, 2025.",
  "LEE, Hao-Ping et al. The impact of generative AI on critical thinking. In: CHI Conference on Human Factors in Computing Systems, 2025. New York: ACM, 2025.",
  "RISKO, Evan F.; GILBERT, Sam J. Cognitive offloading. Trends in Cognitive Sciences, v. 20, n. 9, p. 676-688, 2016.",
  "SPARROW, Betsy; LIU, Jenny; WEGNER, Daniel M. Google effects on memory. Science, v. 333, n. 6043, p. 776-778, 2011.",
  "UNESCO. Guidance for generative AI in education and research. Paris: UNESCO, 2023.",
];

export default function Sobre() {
  return (
    <article className={styles.sobre}>
      <header className={styles.abertura}>
        <h1 className={styles.titulo}>Por que este site existe</h1>
        <p className={styles.lead}>
          O Pensa Primeiro nasceu do trabalho <em>Desinteligência Humana</em>, da disciplina de Interação
          Humano-Computador. Pesquisamos como o uso exagerado da IA nos estudos pode diminuir a capacidade de
          raciocinar, criar e lembrar.
        </p>
        <div className="acoes">
          <a href={APRESENTACAO} className="botao" target="_blank" rel="noopener">
            Ver a apresentação ↗
          </a>
          <a href={PDF_DO_TRABALHO} className="botao secundario" target="_blank" rel="noopener">
            Baixar o trabalho em PDF ↗
          </a>
        </div>
      </header>

      <section className={styles.secao}>
        <h2>O problema</h2>
        <p className={styles.texto}>
          A IA vira um problema quando deixa de ser apoio e passa a pensar no lugar de quem estuda. É o que a
          literatura chama de <strong>descarregamento cognitivo</strong> (<em>cognitive offloading</em>).
          Gerlich (2025) ouviu 666 pessoas e encontrou relação entre o uso frequente de IA e notas mais baixas
          em pensamento crítico, com resultado pior justamente entre 17 e 25 anos.
        </p>
        <ul className={styles.dados}>
          {dados.map((d) => (
            <li key={d.texto}>
              <div className={styles.medida}>
                <Medidor valor={d.valor} className={styles.medidor} />
                <strong>{d.valor}%</strong>
              </div>
              <p>{d.texto}</p>
              <cite>{d.fonte}</cite>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.secao}>
        <h2>O que sabíamos, supúnhamos e queríamos descobrir</h2>
        <div className={styles.csd}>
          {csd.map((col) => (
            <div key={col.titulo}>
              <h3>{col.titulo}</h3>
              <ul>
                {col.itens.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.secao}>
        <h2>Como o site responde a isso</h2>
        <p className={styles.texto}>
          Nosso público são estudantes do ensino médio e da graduação, de 15 a 25 anos, que já usam IA para
          estudar. A ideia não é proibir a ferramenta, e sim mudar a ordem: primeiro a pessoa pensa, depois a
          IA ajuda.
        </p>
        <dl className={styles.respostas}>
          {respostas.map(([nome, texto, href]) => (
            <div key={nome}>
              <dt>
                <Link href={href}>{nome}</Link>
              </dt>
              <dd>{texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${styles.secao} ${styles.creditos}`}>
        <div>
          <h2>Grupo</h2>
          <p className={styles.texto}>{grupo.join(", ")}</p>
          <p className={styles.nota}>Engenharia de Software, Univille, 2026.</p>
        </div>
        <div>
          <h2>Referências</h2>
          <ol className={styles.refs}>
            {referencias.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  );
}
