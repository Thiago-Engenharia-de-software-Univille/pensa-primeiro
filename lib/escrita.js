// Sugestões de escrita (português), de propósito leves e gentis:
// - só roda quando a pessoa clica em "Conferir", nunca enquanto digita;
// - só aponta palavras sem acento que NÃO têm outra leitura correta
//   ("nao" está sempre errado; "esta" pode ser certo, então fica de fora);
// - mostra no máximo 3 sugestões, e a pessoa pode aplicar ou dispensar.
// Quando a IA confere a resposta, ela também pode sugerir correções (ver lib/gemini.js).

const CORRECOES = {
  nao: "não",
  voce: "você",
  voces: "vocês",
  tambem: "também",
  entao: "então",
  ate: "até",
  ja: "já",
  so: "só",
  porem: "porém",
  alem: "além",
  ninguem: "ninguém",
  alguem: "alguém",
  facil: "fácil",
  dificil: "difícil",
  possivel: "possível",
  impossivel: "impossível",
  rapido: "rápido",
  agua: "água",
  fotossintese: "fotossíntese",
  oxigenio: "oxigênio",
  gas: "gás",
  carbonico: "carbônico",
  solido: "sólido",
  liquido: "líquido",
  acucar: "açúcar",
  preco: "preço",
  numero: "número",
  area: "área",
  triangulo: "triângulo",
  historia: "história",
  independencia: "independência",
  comercio: "comércio",
  portugues: "português",
  materia: "matéria",
  ciencia: "ciência",
  fisica: "física",
  quimica: "química",
  matematica: "matemática",
  preposicao: "preposição",
  explicacao: "explicação",
  informacao: "informação",
  funcao: "função",
  razao: "razão",
  porque: null, // "porque/por que" depende da frase: não mexemos
};

const MAXIMO = 3;

// mantém maiúscula inicial quando a palavra original começa com maiúscula
function mesmoFormato(original, correta) {
  return original[0] === original[0].toUpperCase() ? correta[0].toUpperCase() + correta.slice(1) : correta;
}

/** Lista de sugestões { de, para } encontradas no texto (sem repetir). */
export function sugestoesDeEscrita(texto) {
  const vistas = new Map();
  for (const palavra of texto.match(/[A-Za-zÀ-ÿ]+/g) ?? []) {
    const certa = CORRECOES[palavra.toLowerCase()];
    if (certa && !vistas.has(palavra.toLowerCase())) {
      vistas.set(palavra.toLowerCase(), { de: palavra, para: mesmoFormato(palavra, certa) });
    }
  }
  return [...vistas.values()].slice(0, MAXIMO);
}

/** Junta as sugestões locais com as da IA, sem repetir, até o máximo. */
export function juntarSugestoes(...listas) {
  const vistas = new Map();
  for (const s of listas.flat()) {
    if (s?.de && s?.para && s.de !== s.para && !vistas.has(s.de.toLowerCase()))
      vistas.set(s.de.toLowerCase(), s);
  }
  return [...vistas.values()].slice(0, MAXIMO);
}

/** Aplica as sugestões no texto, trocando só palavras inteiras ("nao" e "Nao", mantendo a maiúscula). */
export function aplicarSugestoes(texto, sugestoes) {
  return sugestoes.reduce((t, { de, para }) => {
    const escapada = de.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const busca = new RegExp(`(?<![A-Za-zÀ-ÿ])${escapada}(?![A-Za-zÀ-ÿ])`, "gi");
    return t.replace(busca, (achada) => mesmoFormato(achada, para));
  }, texto);
}
