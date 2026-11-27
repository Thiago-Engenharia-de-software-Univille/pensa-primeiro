"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Botão "Voltar" das páginas internas.
// Guarda no sessionStorage o caminho percorrido dentro do site: se a pessoa veio de outra
// página daqui, volta para ela; se entrou direto (link, favorito), vai para o início.
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

export default function Voltar() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const caminho = lerCaminho();
    if (caminho.at(-1) === pathname) return; // recarregou a mesma página
    if (caminho.at(-2) === pathname) caminho.pop(); // voltou uma página
    else caminho.push(pathname);
    gravarCaminho(caminho);
  }, [pathname]);

  if (pathname === "/") return null;

  function voltar() {
    if (lerCaminho().length > 1) router.back();
    else router.push("/");
  }

  return (
    <button type="button" className="voltar" onClick={voltar}>
      <span aria-hidden="true">←</span> Voltar
    </button>
  );
}
