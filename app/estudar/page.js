import { Suspense } from "react";
import Estudo from "./Estudo";

export const metadata = { title: "Estudar · Pensa Primeiro" };

// Estudo lê a etapa do endereço (?p=…&e=…); o Suspense deixa o resto da página pronto antes.
export default function PaginaEstudar() {
  return (
    <Suspense fallback={null}>
      <Estudo />
    </Suspense>
  );
}
