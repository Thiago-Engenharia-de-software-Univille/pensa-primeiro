import { buscarPergunta } from "@/lib/perguntas";
import { conferirComGemini, iaConfigurada } from "@/lib/gemini";
import { areaDe } from "@/lib/perguntas";
import { filtrar, LIMITES } from "@/lib/filtro";

// POST /api/conferir  { perguntaId, enunciado?, tentativa }
// Para as perguntas de exemplo, o enunciado e a resposta de referência vêm do servidor
// (não confiamos no que o navegador manda). Para a pergunta livre, usamos o enunciado enviado.
export async function POST(request) {
  if (!iaConfigurada()) return Response.json({ erro: "sem-chave" }, { status: 503 });

  // Só aceita pedidos feitos pelas páginas do próprio site: impede que outros sites
  // (ou scripts) usem esta rota para gastar a cota da chave.
  if (!mesmaOrigem(request)) return Response.json({ erro: "origem" }, { status: 403 });

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return Response.json({ erro: "pedido-invalido" }, { status: 400 });
  }

  const tentativa = String(corpo.tentativa ?? "")
    .trim()
    .slice(0, LIMITES.tentativa + 1);
  if (tentativa.length < 1) return Response.json({ erro: "pedido-invalido" }, { status: 400 });

  let chave, enunciado, referencia;
  if (corpo.perguntaId === "livre") {
    enunciado = String(corpo.enunciado ?? "")
      .trim()
      .slice(0, LIMITES.pergunta + 1);
    if (enunciado.length < 5) return Response.json({ erro: "pedido-invalido" }, { status: 400 });
    chave = `livre|${enunciado.toLowerCase()}`;
    referencia = null;
  } else {
    const pergunta = buscarPergunta(String(corpo.perguntaId ?? ""));
    if (!pergunta) return Response.json({ erro: "pedido-invalido" }, { status: 400 });
    chave = pergunta.id;
    enunciado = pergunta.codigo ? `${pergunta.enunciado}\nCódigo:\n${pergunta.codigo}` : pergunta.enunciado;
    referencia = pergunta.resposta;
  }

  // filtro antes de gastar a IA (não conta no limite): texto sem sentido, manipulação, palavrões
  const programacao =
    corpo.perguntaId !== "livre" && areaDe(buscarPergunta(String(corpo.perguntaId)) ?? {}) === "programacao";
  const barrado =
    (corpo.perguntaId === "livre" && filtrar(enunciado, "pergunta")) ||
    filtrar(tentativa, "tentativa", { codigo: programacao });
  if (barrado) return Response.json({ erro: "filtro", mensagem: barrado.mensagem }, { status: 422 });

  const ip = (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const nivel = ["facil", "medio", "dificil"].includes(corpo.nivel) ? corpo.nivel : "medio";

  try {
    const resultado = await conferirComGemini({ chave, enunciado, referencia, tentativa, nivel, ip });
    return Response.json(resultado);
  } catch (erro) {
    const limite = erro.codigo === "limite";
    return Response.json({ erro: limite ? "limite" : "falha" }, { status: limite ? 429 : 502 });
  }
}

function mesmaOrigem(request) {
  const origem = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origem || !host) return false;
  try {
    return new URL(origem).host === host;
  } catch {
    return false;
  }
}
