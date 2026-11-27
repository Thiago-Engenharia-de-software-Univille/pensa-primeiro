// Verificador das respostas das perguntas de exemplo.
// Não é uma IA: procura na tentativa os pontos principais da resposta (números,
// palavras-chave) e devolve "certo", "quase" (com o que falta) ou "errado".
// Por ser simples, pode se enganar; por isso a tela também oferece "Acho que acertei".

// minúsculas e sem acentos, para comparar palavras
const normalizar = (texto) => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// todos os números citados no texto ("R$ 60,00" → 60)
function numeros(texto) {
  return (texto.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => Number(n.replace(",", ".")));
}

const tem = (texto, n) => numeros(texto).includes(n);

const certo = (mensagem) => ({ status: "certo", mensagem });
const quase = (mensagem) => ({ status: "quase", mensagem });
const errado = (mensagem) => ({ status: "errado", mensagem });

const regras = {
  porcentagem(t) {
    if (tem(t, 60)) return certo("R$ 60. A conta fecha: 80 menos o desconto de 20.");
    if (tem(t, 20))
      return quase("Você achou o valor do desconto (R$ 20). Falta tirar ele do preço original.");
    if (tem(t, 55) || tem(t, 25))
      return errado("Cuidado: 25% não é o mesmo que R$ 25. Descubra quanto é 25% de 80 antes de subtrair.");
    return errado("Ainda não bate. Calcule quanto vale o desconto e depois o preço que sobra.");
  },

  velocidade(t) {
    if (tem(t, 75)) return certo("75 km/h: 150 km divididos por 2 horas.");
    if (tem(t, 300))
      return errado("Parece que você multiplicou. Velocidade média é distância dividida pelo tempo.");
    return errado("Ainda não bate. Que conta junta a distância e o tempo?");
  },

  fotossintese(t) {
    const n = normalizar(t);
    const luz = /\b(luz|claridade|sol)\b/.test(n);
    const processo = /fotossintese|alimento|glicose|energia|acucar|comida/.test(n);
    if (luz && processo)
      return certo("Sem luz não há fotossíntese, e sem ela a planta não produz o próprio alimento.");
    if (luz) return quase("Isso, a falta de luz é a causa. Agora explique o que a luz faz pela planta.");
    if (processo)
      return quase("Você lembrou da fotossíntese. O que falta no quarto escuro para ela acontecer?");
    if (/agua|regar|rega/.test(n))
      return errado("A água não é o problema aqui: o quarto escuro tira outra coisa da planta.");
    return errado("Ainda não chegou lá. Pense no que muda para a planta quando fica no escuro.");
  },

  crase(t) {
    const comCrase = /(^|[\s"'])à(?=[\s"'.,]|$)/i.test(t);
    const n = normalizar(t);
    const motivo = /preposi|artigo|ao colegio|masculin|a \+ a|a mais a|feminin|fusao|juncao/.test(n);
    if (comCrase && motivo)
      return certo('"Vou à escola": a preposição "a" (ir a) se junta ao artigo "a" (a escola).');
    if (comCrase) return quase('Certo, é com crase. Agora explique o porquê: o que se junta naquele "a"?');
    if (/vou a escola/.test(n) && !/errad|incorret/.test(n))
      return errado('Teste com uma palavra masculina: "vou ao colégio". O que isso mostra sobre "escola"?');
    return errado("Ainda não. Escolha uma das duas frases e explique por quê.");
  },

  gelo(t) {
    const n = normalizar(t);
    if (/(menos|menor) dens|densidade (e |eh )?menor|densidade mais baixa/.test(n))
      return certo("O gelo é menos denso que a água líquida, por isso boia.");
    if (/mais dens|densidade (e |eh )?maior/.test(n))
      return errado("É o contrário: se o gelo fosse mais denso, afundaria.");
    if (/dens/.test(n)) return quase("Densidade é o caminho. O gelo é mais ou menos denso que a água?");
    if (/volume|espaco|expande|dilata|cristal|hidrogenio/.test(n))
      return quase("Está no caminho: o gelo ocupa mais espaço. O que isso faz com a densidade dele?");
    if (/leve/.test(n))
      return quase(
        "Mais leve em que sentido? Um quilo de gelo pesa o mesmo que um quilo de água. Pense em densidade.",
      );
    return errado("Ainda não. Pense no que faz uma coisa boiar e outra afundar.");
  },

  "familia-real"(t) {
    const n = normalizar(t);
    const pontos = [
      /porto|comercio/,
      /banco/,
      /imprensa|jornal/,
      /reino unido|virou reino|elevado a reino/,
      /independencia/,
      /instituic|escola|faculdade|biblioteca|jardim botanico|academia/,
      /capital|sede do (imperio|reino|governo)/,
    ].filter((r) => r.test(n)).length;
    if (pontos >= 2)
      return certo("Você citou mudanças importantes. Foi isso que tirou o Brasil da condição de só colônia.");
    if (pontos === 1)
      return quase(
        "Bom começo. Cite mais uma mudança: no comércio, nas instituições ou no status do Brasil.",
      );
    return errado("Ainda não. O que mudou quando a sede do império passou a ficar no Brasil?");
  },
};

export function podeVerificar(perguntaId) {
  return perguntaId in regras;
}

export function verificar(perguntaId, tentativa) {
  return regras[perguntaId](tentativa);
}
