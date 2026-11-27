"use client";

import { useSyncExternalStore } from "react";

// Nível de ajuda escolhido pela pessoa (guardado no navegador).
// Ele muda quanta ajuda o site dá: o tom das pistas da conferência, quantas dicas
// existem e quando a resposta pode ser aberta.
export const NIVEIS = {
  facil: {
    nome: "Fácil",
    descricao: "Pistas mais diretas. A resposta abre depois da primeira dica.",
    dicasMaximas: 3,
    respostaDepoisDe: 1,
  },
  medio: {
    nome: "Médio",
    descricao: "Pistas curtas. A resposta abre depois de todas as dicas.",
    dicasMaximas: 3,
    respostaDepoisDe: 3,
  },
  dificil: {
    nome: "Difícil",
    descricao: "Sem pistas de conteúdo, só duas dicas e nada de explicação pronta.",
    dicasMaximas: 2,
    respostaDepoisDe: 2,
  },
};

const CHAVE = "pensa-primeiro:nivel";
const EVENTO = "pensa-primeiro:nivel-mudou";

function ler() {
  try {
    const v = localStorage.getItem(CHAVE);
    return v in NIVEIS ? v : "medio";
  } catch {
    return "medio";
  }
}

function assinar(avisar) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

export function useNivel() {
  return useSyncExternalStore(assinar, ler, () => "medio");
}

export function mudarNivel(nivel) {
  try {
    localStorage.setItem(CHAVE, nivel);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

// Mensagens do verificador local no modo difícil: dizem só se está perto ou longe,
// sem pista de conteúdo.
export function suavizarRetorno(retorno, nivel) {
  if (nivel !== "dificil" || !retorno || retorno.status === "certo" || retorno.status === "indisponivel")
    return retorno;
  const mensagem =
    retorno.status === "quase"
      ? "Tem algo certo aí, mas ainda falta uma parte. Releia a pergunta com calma."
      : "Releia o enunciado com calma e tente outro caminho.";
  return { ...retorno, mensagem };
}
