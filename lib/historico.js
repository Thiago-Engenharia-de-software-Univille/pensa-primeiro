"use client";

import { useMemo, useSyncExternalStore } from "react";

// Histórico das sessões de estudo, guardado só no navegador (localStorage).
const CHAVE = "pensa-primeiro:historico";
const EVENTO = "pensa-primeiro:mudou";

export const RESULTADOS = {
  sozinho: "Resolvi sozinho",
  dicas: "Resolvi com dicas",
  resposta: "Precisei da resposta",
};

function lerBruto() {
  try {
    return localStorage.getItem(CHAVE) ?? "[]";
  } catch {
    return "[]";
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

function interpretar(bruto) {
  try {
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

export function useHistorico() {
  // No servidor ainda não há histórico; o navegador preenche depois.
  const bruto = useSyncExternalStore(assinar, lerBruto, () => "[]");
  return useMemo(() => interpretar(bruto), [bruto]);
}

export function registrar(sessao) {
  const lista = [{ ...sessao, data: new Date().toISOString() }, ...interpretar(lerBruto())];
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, 50)));
  } catch {
    // Sem armazenamento (aba anônima etc.): o painel só não guarda.
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function limpar() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}
