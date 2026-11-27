import { buscarPergunta } from "@/lib/perguntas";
import { conferirComGemini, iaConfigurada } from "@/lib/gemini";

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
    .slice(0, 800);
  if (tentativa.length < 3) return Response.json({ erro: "pedido-invalido" }, { status: 400 });

  let chave, enunciado, referencia;
  if (corpo.perguntaId === "livre") {
    enunciado = String(corpo.enunciado ?? "")
      .trim()
      .slice(0, 300);
    if (enunciado.length < 5) return Response.json({ erro: "pedido-invalido" }, { status: 400 });
    chave = `livre|${enunciado.toLowerCase()}`;
    referencia = null;
  } else {
    const pergunta = buscarPergunta(String(corpo.perguntaId ?? ""));
    if (!pergunta) return Response.json({ erro: "pedido-invalido" }, { status: 400 });
    chave = pergunta.id;
    enunciado = pergunta.enunciado;
    referencia = pergunta.resposta;
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();

  try {
    const resultado = await conferirComGemini({ chave, enunciado, referencia, tentativa, ip });
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
