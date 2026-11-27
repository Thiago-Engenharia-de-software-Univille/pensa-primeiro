// Filtro antes de gastar a IA: barra texto sem sentido, tentativas de manipular a IA e
// palavrões. Roda no navegador (para responder na hora) e de novo no servidor (que é
// quem manda de verdade). As mensagens são sempre gentis: nada de acusar ninguém.

// pergunta livre sem limite visível; o teto alto só existe para ninguém colar um livro
// inteiro e gastar a cota da IA de uma vez
export const LIMITES = { tentativa: 600, pergunta: 2000 };

const normalizar = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// pedidos para a IA sair do papel ou entregar a resposta
const MANIPULACAO =
  /ignor(e|a|ar|em)\b.{0,20}(instruc|regra|ordem|comando)|ignore (all|previous|the above)|system prompt|prompt do sistema|(voce|vc) (agora )?(e|eh|sera) (um|uma|o|a) |you are now|act as|aja como|finja (que|ser)|jailbreak|developer mode|modo (desenvolvedor|dev)\b|(me )?(de|da|diz|diga|passa|mostra|fala)( pra mim| para mim)? a resposta|qual (e|eh) a resposta|responda (so|somente|apenas) (com )?a resposta|repita (o|as) (texto|instruc)/;

const PALAVROES = [
  "porra",
  "caralho",
  "merda",
  "puta",
  "puto",
  "foda",
  "fodase",
  "fdp",
  "vsf",
  "vtnc",
  "pqp",
  "buceta",
  "arrombado",
  "otario",
  "cuzao",
  "viado",
  "bosta",
  "desgracado",
];
const REGEX_PALAVRAO = new RegExp(`(^|[^a-z])(${PALAVROES.join("|")})s?([^a-z]|$)`);

function semSentido(texto) {
  const letras = normalizar(texto).replace(/[^a-z]/g, "");
  if (/(.)\1{5,}/.test(normalizar(texto))) return true; // "aaaaaaa", "kkkkkkkk"
  if (letras.length >= 8) {
    const vogais = (letras.match(/[aeiou]/g) ?? []).length;
    if (vogais / letras.length < 0.18) return true; // "sdfghjkl"
  }
  // uma "palavra" gigante sem espaço (teclado amassado); código fica de fora
  return (texto.match(/[A-Za-zÀ-ÿ]{26,}/g) ?? []).length > 0;
}

/**
 * Confere um texto antes de mandar para a IA.
 * tipo: "tentativa" (resposta do aluno) ou "pergunta" (pergunta livre).
 * Devolve null se estiver tudo bem, ou { motivo, mensagem } para mostrar com gentileza.
 */
export function filtrar(texto, tipo = "tentativa", { codigo = false } = {}) {
  const t = (texto ?? "").trim();
  const n = normalizar(t);

  if (t.length > LIMITES[tipo])
    return { motivo: "tamanho", mensagem: `Tente resumir em até ${LIMITES[tipo]} caracteres.` };

  if (REGEX_PALAVRAO.test(n))
    return {
      motivo: "palavrao",
      mensagem: "Vamos manter a conversa no clima de estudo. Pode reescrever com outras palavras?",
    };

  if (MANIPULACAO.test(n))
    return tipo === "tentativa"
      ? {
          motivo: "manipulacao",
          mensagem:
            "A conferência não entrega a resposta, mas as dicas podem ajudar. Escreva o que você acha e eu confiro.",
        }
      : {
          motivo: "manipulacao",
          mensagem: "Escreva uma dúvida de alguma matéria, do jeito que você perguntaria na aula.",
        };

  if (!codigo && semSentido(t))
    return {
      motivo: "sem-sentido",
      mensagem:
        tipo === "pergunta"
          ? "Não consegui entender a pergunta. Pode escrever de outro jeito?"
          : "Não consegui entender a tentativa. Pode escrever com outras palavras?",
    };

  if (tipo === "pergunta" && t.split(/\s+/).filter(Boolean).length < 3)
    return {
      motivo: "curta",
      mensagem: "Escreva a pergunta com um pouco mais de detalhe, com pelo menos três palavras.",
    };

  return null;
}
