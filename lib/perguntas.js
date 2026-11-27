// Perguntas de exemplo com dicas escritas à mão (simulam a IA no protótipo).
// Para ligar uma IA de verdade depois, basta gerar estes mesmos campos numa
// rota em app/api/ (a chave da API fica no servidor, nunca aqui).

export const perguntas = [
  {
    id: "porcentagem",
    materia: "Matemática",
    enunciado:
      "Uma camiseta custava R$\u00a080 e entrou em promoção com 25% de desconto. Quanto ela custa agora?",
    dicas: [
      "Desconto em porcentagem é uma parte do preço original. Que parte de 100 é 25?",
      "25% é o mesmo que 1/4. Descubra quanto é 1/4 de R$\u00a080 e pense no que fazer com esse valor.",
      "1/4 de 80 é 20, então o desconto é de R$\u00a020. O preço novo é o original menos o desconto: 80 − 20.",
    ],
    resposta: "R$\u00a060.",
  },
  {
    id: "fotossintese",
    materia: "Biologia",
    enunciado: "Por que uma planta deixada num quarto escuro por muitos dias começa a morrer?",
    dicas: [
      "Pense em como a planta produz o próprio alimento. Do que esse processo precisa?",
      "A fotossíntese transforma água e gás carbônico em glicose, mas precisa de uma fonte de energia. Qual falta no quarto escuro?",
      "Sem luz não há fotossíntese, então a planta não produz glicose. Ela gasta as reservas na respiração até que acabem.",
    ],
    resposta:
      "Porque sem luz ela não faz fotossíntese, não produz alimento (glicose) e consome as reservas até morrer.",
  },
  {
    id: "crase",
    materia: "Português",
    enunciado: 'Qual está certa: "Vou à escola" ou "Vou a escola"? Por quê?',
    dicas: [
      "A crase aparece quando duas coisas se juntam. Quais duas palavras \"a\" podem estar se encontrando aí?",
      'Quem vai, vai A algum lugar (preposição). Agora teste: "escola" aceita o artigo "a"? Troque por uma palavra masculina, como "colégio", e veja o que acontece.',
      'Com palavra masculina fica "vou AO colégio": preposição "a" + artigo "o". Com "escola", que é feminina, fica preposição "a" + artigo "a", e isso vira "à".',
    ],
    resposta: '"Vou à escola", porque há a preposição "a" (ir a) + o artigo "a" (a escola).',
  },
  {
    id: "velocidade",
    materia: "Física",
    enunciado: "Um ônibus percorre 150 km em 2 horas. Qual foi a velocidade média dele?",
    dicas: [
      "Velocidade média relaciona duas grandezas que aparecem no enunciado. Quais são elas?",
      "Velocidade média é a distância dividida pelo tempo. Monte a conta com os valores que você tem.",
      "150 km ÷ 2 h: em cada hora o ônibus anda, em média, a metade da distância total.",
    ],
    resposta: "75 km/h.",
  },
  {
    id: "gelo",
    materia: "Química",
    enunciado: "Por que o gelo boia na água, se os dois são feitos da mesma substância?",
    dicas: [
      "Algo boia quando é menos denso que o líquido em que está. O que isso diz sobre o gelo?",
      "Mesma massa, volume diferente: ao congelar, a água ocupa mais ou menos espaço? Pense na garrafa que estoura no congelador.",
      "No gelo, as moléculas se organizam num cristal com espaços vazios, presas por ligações de hidrogênio. Isso aumenta o volume e diminui a densidade.",
    ],
    resposta:
      "Porque o gelo é menos denso que a água líquida: ao congelar, as moléculas formam uma estrutura com espaços vazios e ocupam mais volume.",
  },
  {
    id: "familia-real",
    materia: "História",
    enunciado: "Por que a chegada da família real portuguesa, em 1808, foi importante para o Brasil?",
    dicas: [
      "Pense no que muda quando a sede de um império passa a ficar dentro da colônia.",
      "Logo na chegada vieram medidas econômicas e novas instituições. Lembre do comércio com outros países e do que foi criado no Rio de Janeiro.",
      "A abertura dos portos acabou com a exclusividade de Portugal no comércio, e surgiram o Banco do Brasil, a Imprensa Régia e escolas. Em 1815 o Brasil virou Reino Unido a Portugal.",
    ],
    resposta:
      "Porque o Brasil deixou de ser só colônia: os portos foram abertos, surgiram instituições (Banco do Brasil, Imprensa Régia) e o país foi elevado a Reino Unido, um passo para a independência em 1822.",
  },
];

// Dicas de método para quando o aluno traz a própria pergunta.
// Sem uma IA de verdade, o protótipo não sabe a resposta, então ensina o caminho.
export const DICAS_GERAIS = [
  "Reescreva a pergunta com as suas palavras. O que exatamente ela pede: um número, uma explicação ou uma escolha?",
  "Liste o que o enunciado já te dá e o que você já sabe sobre o assunto. Qual conceito da matéria tem a ver com isso?",
  "Tente um caso mais simples ou um exemplo parecido que você já viu em aula. Depois volte e compare com a sua tentativa.",
];

export function perguntaLivre(enunciado) {
  return { id: "livre", materia: "Pergunta livre", enunciado, dicas: DICAS_GERAIS, resposta: null };
}

export function buscarPergunta(id) {
  return perguntas.find((p) => p.id === id);
}
