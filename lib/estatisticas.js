// Contas do painel, a partir do histórico guardado no navegador.
// Funções puras: recebem as listas e devolvem números prontos para mostrar.
import { perguntas, areaDe } from "@/lib/perguntas";

export const ORDEM = ["sozinho", "dicas", "resposta", "travei"];
const RESOLVEU = new Set(["sozinho", "dicas"]);

// "2026-11-27" no fuso de quem está usando
const diaLocal = (data) => {
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function contarResultados(historico) {
  return Object.fromEntries(ORDEM.map((t) => [t, historico.filter((s) => s.resultado === t).length]));
}

export function autonomia(historico) {
  if (!historico.length) return 0;
  return Math.round((historico.filter((s) => RESOLVEU.has(s.resultado)).length / historico.length) * 100);
}

/** Dias seguidos com pelo menos uma pergunta estudada, contando até hoje (ou ontem). */
export function sequenciaDeDias(historico, hoje = new Date()) {
  const dias = new Set(historico.map((s) => diaLocal(s.data)));
  const cursor = new Date(hoje);
  if (!dias.has(diaLocal(cursor))) cursor.setDate(cursor.getDate() - 1); // ainda não estudou hoje
  let total = 0;
  while (dias.has(diaLocal(cursor))) {
    total += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return total;
}

/** Os últimos 7 dias (do mais antigo para hoje), com a contagem por resultado. */
export function ultimosDias(historico, quantos = 7, hoje = new Date()) {
  const dias = [];
  for (let i = quantos - 1; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const chave = diaLocal(d);
    const doDia = historico.filter((s) => diaLocal(s.data) === chave);
    dias.push({
      chave,
      rotulo: i === 0 ? "hoje" : d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      data: d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
      total: doDia.length,
      ...contarResultados(doDia),
    });
  }
  return dias;
}

/** Autonomia por matéria, separada em escola e programação. */
export function porMateria(historico) {
  const grupos = new Map();
  for (const s of historico) {
    const p = perguntas.find((q) => q.id === s.perguntaId);
    const area = p ? areaDe(p) : "outra";
    const chave = s.materia;
    const g = grupos.get(chave) ?? { materia: chave, area, total: 0, resolveu: 0 };
    g.total += 1;
    if (RESOLVEU.has(s.resultado)) g.resolveu += 1;
    grupos.set(chave, g);
  }
  return [...grupos.values()]
    .map((g) => ({ ...g, pct: Math.round((g.resolveu / g.total) * 100) }))
    .sort((a, b) => b.total - a.total || a.materia.localeCompare(b.materia));
}

export function porNivel(historico) {
  const c = { facil: 0, medio: 0, dificil: 0 };
  for (const s of historico) if (s.nivel in c) c[s.nivel] += 1;
  return c;
}

/** Sugestão do que estudar agora: primeiro o que nunca tentou, depois o que precisou da resposta. */
export function proximoPasso(historico) {
  const tentadas = new Set(historico.map((s) => s.perguntaId));
  const nunca = perguntas.filter((p) => !tentadas.has(p.id));
  if (nunca.length) {
    const escola = nunca.find((p) => areaDe(p) === "escola");
    const p = escola ?? nunca[0];
    return { pergunta: p, motivo: `Você ainda não tentou ${p.materia}.`, faltam: nunca.length };
  }
  const precisou = historico.find((s) => s.resultado === "resposta");
  if (precisou) {
    const p = perguntas.find((q) => q.id === precisou.perguntaId);
    if (p)
      return {
        pergunta: p,
        motivo: `Em ${p.materia} você precisou da resposta. Que tal tentar de novo?`,
        faltam: 0,
      };
  }
  return null;
}

/** Conquistas: marcos simples, só para incentivar. */
export function conquistas(historico, conferencias) {
  const contagem = contarResultados(historico);
  const materias = new Set(historico.map((s) => s.materia));
  const prog = historico.filter((s) => {
    const p = perguntas.find((q) => q.id === s.perguntaId);
    return p && areaDe(p) === "programacao" && RESOLVEU.has(s.resultado);
  }).length;
  const achados = conferencias.filter((c) => c.acertou).length;
  const dificil = historico.filter((s) => s.nivel === "dificil" && RESOLVEU.has(s.resultado)).length;
  return [
    { nome: "Primeira tentativa", descricao: "Terminou a primeira pergunta.", feita: historico.length >= 1 },
    {
      nome: "Por conta própria",
      descricao: "Resolveu uma pergunta sem abrir dica.",
      feita: contagem.sozinho >= 1,
    },
    {
      nome: "Três seguidas",
      descricao: "Estudou três dias seguidos.",
      feita: sequenciaDeDias(historico) >= 3,
    },
    { nome: "Curioso", descricao: "Estudou cinco matérias diferentes.", feita: materias.size >= 5 },
    { nome: "Programador", descricao: "Resolveu três perguntas de programação.", feita: prog >= 3 },
    { nome: "Modo difícil", descricao: "Resolveu uma pergunta no nível difícil.", feita: dificil >= 1 },
    { nome: "Olho de revisor", descricao: "Achou quatro erros no Confira a IA.", feita: achados >= 4 },
  ];
}
