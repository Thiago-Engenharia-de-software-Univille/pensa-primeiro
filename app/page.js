import Link from "next/link";
import styles from "./inicio.module.css";

const passos = [
  ["01", "Você tenta", "Escreva o que você acha, mesmo que esteja errado."],
  ["02", "A IA dá dicas", "Uma de cada vez, só o suficiente para destravar."],
  ["03", "Você resolve", "A resposta completa fica guardada para o final."],
];

export default function Inicio() {
  return (
    <div className={styles.inicio}>
      <section className={styles.chamada}>
        <p className="rotulo">IA × IHC · Univille 2026</p>
        <h1>A IA que te ajuda a pensar, não a copiar.</h1>
        <p className={styles.sub}>
          Em vez de entregar a resposta pronta, o Pensa Primeiro pede a sua tentativa e
          libera dicas aos poucos. No fim, você vê quanto resolveu sozinho.
        </p>
        <div className="acoes">
          <Link href="/estudar" className="botao">
            Começar a estudar
          </Link>
          <Link href="/painel" className="botao secundario">
            Ver meu painel
          </Link>
        </div>
      </section>

      <ol className={styles.passos}>
        {passos.map(([numero, titulo, texto]) => (
          <li key={numero} className="cartao">
            <span className={styles.numero}>{numero}</span>
            <h3>{titulo}</h3>
            <p>{texto}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
