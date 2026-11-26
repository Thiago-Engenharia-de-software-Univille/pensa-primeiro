import { Inter_Tight, Marcellus } from "next/font/google";
import Link from "next/link";
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
          <Link href="/" className="marca">
            Pensa <span>Primeiro</span>
          </Link>
          <nav className="menu">
            <Link href="/estudar">Estudar</Link>
            <Link href="/painel">Painel</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
