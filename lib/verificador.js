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
      return errado("Parece que você multiplicou. Pense assim: em uma hora, quantos quilômetros ele anda?");
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
      return quase(
        "Está no caminho: o gelo ocupa mais espaço. O que muda quando a mesma quantidade de matéria ocupa mais espaço?",
      );
    if (/leve/.test(n))
      return quase(
        "Mais leve em que sentido? Um quilo de gelo pesa o mesmo que um quilo de água. Então o que é diferente entre eles?",
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

  // ---------- Programação ----------

  "html-link"(t) {
    const n = t.toLowerCase();
    const tagA = /<a[\s>]|\btag\s*["'“]?a["'”]?(?![a-z])|["'“]a["'”]/.test(n) || /^\s*a\s*(,|e\b)/.test(n);
    const href = /href/.test(n);
    if (/<link|tag\s*link/.test(n) && !tagA)
      return errado("A tag <link> liga arquivos (como o CSS) à página, mas não cria um link clicável.");
    if (tagA && href) return certo('<a href="…">: a tag <a> cria o link e o href guarda o endereço.');
    if (href) return quase("O atributo está certo. E qual é a tag?");
    if (tagA) return quase("A tag está certa. Falta dizer qual atributo guarda o endereço.");
    return errado("Ainda não. Pense na tag mais curta do HTML.");
  },

  "css-espacos"(t) {
    const dentro = /dentro|intern|entre o conteudo e a borda/;
    const fora = /fora|extern|entre (os )?elementos|vizinh|outros elementos/;
    // olha cada trecho da frase separado por pontuação ou "e"/"já"
    // (corta antes de tirar os acentos, senão o "é" vira "e" e a frase quebra no lugar errado)
    const trechos = t.toLowerCase().split(/[.;,]| e | já | ja /).map(normalizar);
    const sobre = (palavra) => trechos.filter((s) => s.includes(palavra)).join(" ");
    const pad = sobre("padding");
    const mar = sobre("margin");
    if (dentro.test(pad) && fora.test(mar))
      return certo("Isso: padding é o espaço de dentro da borda, margin é o de fora.");
    if (fora.test(pad) && dentro.test(mar))
      return errado("Está trocado. Coloque um fundo colorido e veja qual espaço fica pintado.");
    if (dentro.test(pad) || fora.test(mar))
      return quase("Uma das partes está certa. Falta explicar a outra.");
    return errado(
      "Ainda não. Pense numa caixa com borda: um espaço fica de um lado da borda, o outro, do outro lado.",
    );
  },

  "python-range"(t) {
    const zero = tem(t, 0);
    const um = tem(t, 1);
    const dois = tem(t, 2);
    const tres = tem(t, 3);
    if (zero && um && dois && !tres) return certo("0, 1 e 2: o range(3) começa no 0 e para antes do 3.");
    if (zero && um && dois && tres) return quase("Quase! Confira se o último número entra ou não.");
    if (um && dois && tres) return errado("Confira em que número o range começa a contar.");
    return errado("Ainda não. Quantas vezes o print roda, e com quais valores?");
  },

  "js-soma"(t) {
    if (tem(t, 53)) return certo('"53": com texto no meio, o + junta em vez de somar.');
    if (tem(t, 8)) return errado("Repare nas aspas em volta do 5: ele é um número ou um texto?");
    return errado("Ainda não. Olhe com atenção os dois valores que estão sendo somados.");
  },

  "ts-tipo"(t) {
    const n = normalizar(t);
    const erro = /erro|nao (compila|pode|aceita|deixa|funciona|permite)|invalid|falha|reclama/.test(n);
    const motivo = /tipo|string|texto|number|numero|declarad/.test(n);
    if (erro && motivo) return certo('Isso: idade é number, então não aceita a string "vinte".');
    if (erro) return quase("Isso, dá erro. Consegue dizer por quê?");
    if (/funciona|vira vinte|passa a valer|aceita|normal/.test(n))
      return errado("Repare no que vem depois dos dois-pontos na primeira linha.");
    return errado("Ainda não. O que o TypeScript confere antes de rodar o código?");
  },

  "c-divisao"(t) {
    if (tem(t, 3.5)) return quase("Quase! Repare no tipo das variáveis: um int guarda casas decimais?");
    if (tem(t, 3)) return certo("3: divisão entre ints descarta a parte decimal.");
    return errado("Ainda não. Faça a conta 7 / 2 e depois pense no tipo das variáveis.");
  },

  "cpp-resto"(t) {
    if (tem(t, 2)) return certo("2: o % devolve o resto da divisão (17 = 5 × 3 + 2).");
    if (tem(t, 3) || tem(t, 3.4))
      return errado(
        "O % não devolve o resultado da divisão. Pense em outra coisa que a conta armada mostra.",
      );
    return errado("Ainda não. Faça a conta armada de 17 dividido por 5.");
  },

  "csharp-x"(t) {
    if (tem(t, 30)) return certo("30: x vira 15 e depois 30.");
    if (tem(t, 15)) return quase("Você fez a segunda linha. Falta a última.");
    if (tem(t, 20)) return errado("Cada linha usa o valor que x já tem. Faça uma linha de cada vez.");
    return errado("Ainda não. Siga as linhas de cima para baixo, anotando o valor de x.");
  },
};

export function podeVerificar(perguntaId) {
  return perguntaId in regras;
}

export function verificar(perguntaId, tentativa) {
  return regras[perguntaId](tentativa);
}
