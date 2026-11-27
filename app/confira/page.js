import { Suspense } from "react";
import Confira from "./Confira";

export const metadata = { title: "Confira a IA · Pensa Primeiro" };

// Confira lê a rodada do endereço (?r=…); o Suspense deixa o resto da página pronto antes.
export default function PaginaConfira() {
  return (
    <Suspense fallback={null}>
      <Confira />
    </Suspense>
  );
}
