"use client";

// Lado do navegador da conferência com IA (a chamada de verdade acontece em app/api/conferir).
// Guarda as respostas já conferidas nesta aba e, se o site estiver sem chave configurada,
// para de tentar até a página ser recarregada.

const jaConferidas = new Map();
let semChave = false;

const MENSAGENS = {
  "sem-chave": "A conferência com IA não está ligada neste site.",
  limite:
    "Muitas conferências em pouco tempo. Respire um pouco, revise a tentativa e tente de novo daqui a um minuto.",
  falha: "Não foi possível falar com a IA agora.",
};

/** Devolve { status, mensagem, fonte: "ia" } ou { status: "indisponivel", mensagem }. */
export async function conferirComIA(pergunta, tentativa, nivel = "medio") {
  if (semChave) return { status: "indisponivel", mensagem: MENSAGENS["sem-chave"] };

  const chave = `${pergunta.id}|${nivel}|${pergunta.enunciado}|${tentativa.toLowerCase().replace(/\s+/g, " ").trim()}`;
  if (jaConferidas.has(chave)) return jaConferidas.get(chave);

  try {
    const resposta = await fetch("/api/conferir", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ perguntaId: pergunta.id, enunciado: pergunta.enunciado, tentativa, nivel }),
    });
    const dados = await resposta.json().catch(() => ({}));
    if (resposta.ok) {
      const resultado = {
        status: dados.status,
        mensagem: dados.mensagem,
        escrita: dados.escrita ?? [],
        fonte: "ia",
      };
      jaConferidas.set(chave, resultado);
      return resultado;
    }
    if (dados.erro === "filtro") return { status: "foco", mensagem: dados.mensagem };
    if (dados.erro === "sem-chave") semChave = true;
    return { status: "indisponivel", mensagem: MENSAGENS[dados.erro] ?? MENSAGENS.falha };
  } catch {
    return { status: "indisponivel", mensagem: MENSAGENS.falha };
  }
}
