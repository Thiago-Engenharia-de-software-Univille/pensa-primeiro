import { Inter_Tight, Marcellus } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import CabecaRobo from "@/components/CabecaRobo";
import Voltar from "@/components/Voltar";
import { APRESENTACAO } from "@/lib/links";
import "./globals.css";

const serifa = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--serifa",
});

const grotesca = Inter_Tight({
  subsets: ["latin"],
  variable: "--grotesca",
});

export const metadata = {
  title: "Pensa Primeiro",
  description: "A IA que te ajuda a pensar, não a copiar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${serifa.variable} ${grotesca.variable}`}>
      <body>
        <header className="topo">
          <Link href="/" className="marca" aria-label="Pensa Primeiro, início">
            <CabecaRobo />
            Pensa Primeiro
          </Link>
          <nav className="menu">
            <Link href="/estudar">Estudar</Link>
            <Link href="/confira">Confira a IA</Link>
            <Link href="/painel">Painel</Link>
            <Link href="/sobre">Sobre</Link>
          </nav>
        </header>
        <main>
          <Suspense fallback={null}>
            <Voltar />
          </Suspense>
          {children}
        </main>
        <footer className="rodape">
          Trabalho de Interação Humano-Computador, Engenharia de Software, Univille, 2026.{" "}
          <a href={APRESENTACAO} target="_blank" rel="noopener">
            Ver a apresentação ↗
          </a>
        </footer>
      </body>
    </html>
  );
}
