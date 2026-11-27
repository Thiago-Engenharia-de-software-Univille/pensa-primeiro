// Perguntas de exemplo com dicas escritas à mão (simulam a IA no protótipo).
// Para ligar uma IA de verdade depois, basta gerar estes mesmos campos numa
// rota em app/api/ (a chave da API fica no servidor, nunca aqui).

// area: "escola" (padrão) ou "programacao". codigo: trecho mostrado num bloco de código.
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
      'A crase aparece quando duas coisas se juntam. Quais duas palavras "a" podem estar se encontrando aí?',
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
  // ---------- Programação ----------
  {
    id: "html-link",
    area: "programacao",
    materia: "HTML",
    enunciado: "Qual tag cria um link para outra página, e qual atributo guarda o endereço do link?",
    dicas: [
      "Links aparecem em quase todo site. Pense na tag que existe desde os primeiros sites e tem uma letra só.",
      "A tag vem de “anchor” (âncora). O endereço vai num atributo cujo nome é a sigla de “hypertext reference”.",
      'O link fica assim: <a href="pagina.html">Ir</a>. A tag é a e o atributo é href.',
    ],
    resposta: 'A tag <a>, com o atributo href. Exemplo: <a href="pagina.html">Ir</a>.',
  },
  {
    id: "css-espacos",
    area: "programacao",
    materia: "CSS",
    enunciado: "Qual a diferença entre margin e padding no CSS?",
    dicas: [
      "Imagine uma caixa com borda. Um dos espaços fica do lado de dentro da borda e o outro, do lado de fora.",
      "Teste: coloque uma cor de fundo no elemento. Qual dos dois espaços fica pintado junto com o fundo?",
      "O padding fica dentro da borda (e recebe o fundo). A margin fica fora da borda, afastando os outros elementos.",
    ],
    resposta:
      "O padding é o espaço interno, entre o conteúdo e a borda. A margin é o espaço externo, entre a borda e os outros elementos.",
  },
  {
    id: "python-range",
    area: "programacao",
    materia: "Python",
    enunciado: "O que este código Python imprime?",
    codigo: "for i in range(3):\n    print(i)",
    dicas: [
      "O for repete o print uma vez para cada número que o range gera.",
      "O range(3) gera 3 números. Em que número ele começa a contar?",
      "range(3) gera 0, 1 e 2: começa no 0 e para antes do 3.",
    ],
    resposta: "0, 1 e 2, um por linha. O range(3) começa no 0 e para antes do 3.",
  },
  {
    id: "js-soma",
    area: "programacao",
    materia: "JavaScript",
    enunciado: "O que este código JavaScript mostra no console?",
    codigo: 'console.log("5" + 3);',
    dicas: [
      "Olhe com atenção os dois valores: um deles está entre aspas.",
      "Em JavaScript, quando um dos lados do + é texto (string), o + não soma: ele junta.",
      '"5" + 3 vira "5" + "3", que dá o texto "53".',
    ],
    resposta: '"53". Como o 5 está entre aspas, ele é texto, e o + junta os dois em vez de somar.',
  },
  {
    id: "ts-tipo",
    area: "programacao",
    materia: "TypeScript",
    enunciado: "O que acontece quando o TypeScript verifica este código?",
    codigo: 'let idade: number = 20;\nidade = "vinte";',
    dicas: [
      "Leia a primeira linha: o que o “: number” diz sobre a variável?",
      'O TypeScript confere se cada valor combina com o tipo declarado. "vinte" está entre aspas: é de que tipo?',
      'idade foi declarada como number, e "vinte" é uma string. O TypeScript aponta um erro de tipo antes mesmo de rodar.',
    ],
    resposta: 'Dá erro de tipo: idade foi declarada como number e não pode receber a string "vinte".',
  },
  {
    id: "c-divisao",
    area: "programacao",
    materia: "C",
    enunciado: "O que este código em C imprime?",
    codigo: 'int a = 7, b = 2;\nprintf("%d", a / b);',
    dicas: [
      "Repare no tipo de a e b. O que o tipo int consegue guardar?",
      "Em C, dividir um int por outro int dá um int: a parte depois da vírgula é jogada fora.",
      "7 / 2 seria 3,5, mas como é divisão inteira, sobra só o 3.",
    ],
    resposta: "3. Como a e b são int, a divisão é inteira e a parte decimal é descartada.",
  },
  {
    id: "cpp-resto",
    area: "programacao",
    materia: "C++",
    enunciado: "O que este código C++ imprime?",
    codigo: "std::cout << 17 % 5;",
    dicas: [
      "O % não é a divisão comum. Ele devolve outra coisa da divisão.",
      "Faça a conta armada: 17 dividido por 5. O % quer saber o que sobra.",
      "17 = 5 × 3 + 2. O % devolve o resto, que é 2.",
    ],
    resposta: "2, que é o resto da divisão de 17 por 5 (17 = 5 × 3 + 2).",
  },
  {
    id: "csharp-x",
    area: "programacao",
    materia: "C#",
    enunciado: "Qual o valor de x no final deste código C#?",
    codigo: "int x = 10;\nx += 5;\nx *= 2;",
    dicas: [
      "As linhas rodam de cima para baixo, e cada uma usa o valor que x tem naquele momento.",
      "x += 5 é o mesmo que x = x + 5. E x *= 2 é o mesmo que x = x * 2.",
      "x começa em 10, vira 15 na segunda linha e 30 na terceira.",
    ],
    resposta: "30: x começa em 10, vira 15 (10 + 5) e depois 30 (15 × 2).",
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

export const areaDe = (p) => p.area ?? "escola";

export function buscarPergunta(id) {
  return perguntas.find((p) => p.id === id);
}
