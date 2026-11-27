"use client";

import { useMemo, useSyncExternalStore } from "react";

// Tudo fica só no navegador (localStorage). Não há login nem servidor.
const EVENTO = "pensa-primeiro:mudou";

export const RESULTADOS = {
  sozinho: "Resolvi sozinho",
  dicas: "Resolvi com dicas",
  resposta: "Precisei da resposta",
  travei: "Ainda não consegui",
};

function lerBruto(chave) {
  try {
    return localStorage.getItem(chave) ?? "[]";
  } catch {
    return "[]";
  }
}

function interpretar(bruto) {
  try {
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
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

// Cria um "armazém" de registros com uma chave própria no localStorage.
function criarArmazem(chave) {
  function useLista() {
    // No servidor ainda não há histórico; o navegador preenche depois.
    const bruto = useSyncExternalStore(assinar, () => lerBruto(chave), () => "[]");
    return useMemo(() => interpretar(bruto), [bruto]);
  }

  function registrar(item) {
    const lista = [{ ...item, data: new Date().toISOString() }, ...interpretar(lerBruto(chave))];
    try {
      localStorage.setItem(chave, JSON.stringify(lista.slice(0, 100)));
    } catch {
      // Sem armazenamento (aba anônima etc.): o painel só não guarda.
    }
    window.dispatchEvent(new Event(EVENTO));
  }

  function limpar() {
    try {
      localStorage.removeItem(chave);
    } catch {}
    window.dispatchEvent(new Event(EVENTO));
  }

  return { useLista, registrar, limpar };
}

// Sessões de estudo (tentativa + dicas)
const estudo = criarArmazem("pensa-primeiro:historico");
export const useHistorico = estudo.useLista;
export const registrar = estudo.registrar;

// Rodadas do "Confira a IA"
const confira = criarArmazem("pensa-primeiro:confira");
export const useConferencias = confira.useLista;
export const registrarConferencia = confira.registrar;

export function limpar() {
  estudo.limpar();
  confira.limpar();
}
