// Perguntas de exemplo com dicas escritas à mão (simulam a IA no protótipo).
// Para ligar uma IA de verdade depois, basta gerar estes mesmos campos numa
// rota em app/api/ (a chave da API fica no servidor, nunca aqui).

export const perguntas = [
  {
    id: "porcentagem",
    materia: "Matemática",
    enunciado:
      "Uma camiseta custava R$ 80 e entrou em promoção com 25% de desconto. Quanto ela custa agora?",
    dicas: [
      "Desconto em porcentagem é uma parte do preço original. Que parte de 100 é 25?",
      "25% é o mesmo que 1/4. Descubra quanto é 1/4 de R$ 80 e pense no que fazer com esse valor.",
      "1/4 de 80 é 20, então o desconto é de R$ 20. O preço novo é o original menos o desconto: 80 − 20.",
    ],
    resposta: "R$ 60.",
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
];

export function buscarPergunta(id) {
  return perguntas.find((p) => p.id === id);
}
