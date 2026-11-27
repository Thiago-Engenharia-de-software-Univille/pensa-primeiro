// "Confira a IA": respostas que parecem certas, mas têm uma frase errada.
// O aluno precisa achar qual é. Os erros são do tipo que IAs cometem de verdade:
// conta errada, dado inventado, regra trocada.

export const rodadas = [
  {
    id: "juros",
    materia: "Matemática",
    pergunta: "Quanto rende R$ 1.000 aplicados a 10% ao mês, com juros compostos, em 2 meses?",
    frases: [
      "Com juros compostos, os juros de cada mês entram na conta do mês seguinte.",
      "No primeiro mês, 10% de R$ 1.000 dão R$ 100, e o valor vai para R$ 1.100.",
      "No segundo mês, os juros são de novo R$ 100, então o total fica R$ 1.200.",
      "É por isso que se diz que, nos juros compostos, o dinheiro rende sobre o que já rendeu.",
    ],
    erro: 2,
    explicacao:
      "No segundo mês os juros são 10% de R$ 1.100, ou seja, R$ 110. O total é R$ 1.210. A resposta explicou certo o que são juros compostos e, na hora da conta, usou juros simples sem perceber.",
  },
  {
    id: "dom-casmurro",
    materia: "Literatura",
    pergunta: "Quem escreveu Dom Casmurro e qual é a dúvida central do livro?",
    frases: [
      "Dom Casmurro foi escrito por Machado de Assis e publicado em 1899.",
      "O narrador, Bento Santiago, conta a própria história já mais velho.",
      "A grande dúvida é se Capitu traiu Bento com Escobar, seu melhor amigo.",
      "No último capítulo, Capitu confessa a traição, o que encerra a dúvida.",
    ],
    erro: 3,
    explicacao:
      "Capitu nunca confessa. O livro é narrado só pelo ponto de vista de Bento, e a dúvida fica sem resposta de propósito. Esse é o tipo de detalhe inventado com confiança que as IAs costumam produzir.",
  },
  {
    id: "fotossintese-gas",
    materia: "Biologia",
    pergunta: "O que as plantas absorvem e liberam na fotossíntese?",
    frases: [
      "A fotossíntese acontece principalmente nas folhas, dentro dos cloroplastos.",
      "A planta absorve oxigênio do ar e água pelas raízes.",
      "Usando a energia da luz, ela produz glicose para se alimentar.",
      "Como resultado, libera oxigênio para a atmosfera.",
    ],
    erro: 1,
    explicacao:
      "Na fotossíntese a planta absorve gás carbônico (CO₂), não oxigênio. Repare que a própria resposta diz, no fim, que ela libera oxigênio: uma contradição dessas é um bom sinal de que algo está errado.",
  },
  {
    id: "virgula",
    materia: "Português",
    pergunta: 'A frase "Os alunos, estudaram para a prova." está correta?',
    frases: [
      "A frase tem um problema de pontuação.",
      "Não se separa o sujeito do verbo com vírgula.",
      'Aqui, "Os alunos" é o sujeito e "estudaram" é o verbo.',
      "Por isso a vírgula é opcional e pode ficar, se a pessoa quiser dar uma pausa.",
    ],
    erro: 3,
    explicacao:
      'A vírgula entre sujeito e verbo não é opcional: é erro. A forma correta é "Os alunos estudaram para a prova." A resposta começou certa e se contradisse no final.',
  },
];
