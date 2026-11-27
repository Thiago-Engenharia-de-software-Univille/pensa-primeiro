"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Botão "Voltar" das páginas internas.
// Guarda no sessionStorage o caminho percorrido dentro do site (incluindo as etapas do
// Estudar, que mudam só o "?p=…&e=…" do endereço): se há um passo anterior aqui dentro,
// volta para ele; se a pessoa entrou direto (link, favorito), vai para o início.
const CHAVE = "pensa-primeiro:caminho";

function lerCaminho() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE)) ?? [];
  } catch {
    return [];
  }
}

function gravarCaminho(caminho) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(caminho.slice(-30)));
  } catch {}
}

// para quem entrou direto num endereço: o passo "de cima" dele
function paiDe(pathname, busca) {
  if (pathname === "/estudar" && busca) {
    const p = new URLSearchParams(busca);
    return p.get("e") ? `/estudar?p=${encodeURIComponent(p.get("p") ?? "")}` : "/estudar";
  }
  return "/";
}

export default function Voltar() {
  const pathname = usePathname();
  const busca = useSearchParams().toString();
  const router = useRouter();
  const endereco = busca ? `${pathname}?${busca}` : pathname;

  useEffect(() => {
    const caminho = lerCaminho();
    if (caminho.at(-1) === endereco) return; // recarregou a mesma página
    if (caminho.at(-2) === endereco) caminho.pop(); // voltou um passo
    else caminho.push(endereco);
    gravarCaminho(caminho);
  }, [endereco]);

  if (pathname === "/") return null;

  function voltar() {
    if (lerCaminho().length > 1) router.back();
    else router.push(paiDe(pathname, busca));
  }

  return (
    <button type="button" className="voltar" onClick={voltar}>
      <span aria-hidden="true">←</span> Voltar
    </button>
  );
}
