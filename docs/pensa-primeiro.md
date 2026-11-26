# Pensa Primeiro — documentação do sistema

> Uma IA de estudos que ajuda o aluno a pensar, em vez de entregar a resposta pronta.

Este documento descreve o site/sistema que o grupo vai desenvolver a partir da pesquisa apresentada em
**Desinteligência Humana** (IA × IHC — Engenharia de Software, Univille 2026).

> **Escopo atual: protótipo simples.** Não é um sistema completo. Estão implementadas 3 telas (Início, Estudar
> e Painel), com perguntas de exemplo e dicas escritas pelo grupo simulando a IA. O modo "Confira a IA" e a
> integração com uma IA de verdade ficam como ideias futuras.

---

## 1. Por que este sistema

A pesquisa mostrou que o problema não é **usar** IA nos estudos, e sim usá-la no lugar do próprio raciocínio:

- 70% dos alunos do ensino médio usam IA generativa em pesquisas escolares, mas só 32% receberam orientação
  sobre como usá-la (TIC Educação 2024, Cetic.br).
- Gerlich (2025) encontrou relação entre o uso frequente de IA e notas mais baixas em pensamento crítico,
  pior na faixa de 17 a 25 anos.
- Nas nossas suposições (matriz CSD): alunos dependem da ferramenta e aceitam respostas sem verificar.

O **Pensa Primeiro** responde a uma das dúvidas da nossa matriz CSD:

> *"Como a IA poderia ajudar os estudantes a pensar por conta própria?"*

A ideia central: **a IA continua ajudando, mas o aluno sempre tenta primeiro** e recebe ajuda em degraus.

## 2. Público-alvo

Estudantes do ensino médio e da graduação (15 a 25 anos), que estudam pelo celular ou computador e já usam
ou usaram IA para tarefas, pesquisas e trabalhos.

## 3. Princípios de design (IHC)

| Princípio | Como aparece no sistema |
|---|---|
| **Fricção intencional** | A resposta nunca vem de primeira: o aluno precisa escrever uma tentativa. |
| **Ajuda progressiva** | Dicas em níveis, liberadas uma por vez. |
| **Feedback visível** | Painel mostra quanto o aluno resolveu sozinho e como isso evolui. |
| **Senso crítico** | Modo "Confira a IA" treina o aluno a desconfiar e verificar respostas. |
| **Sem culpa** | Usar dicas não é punido; o painel mostra progresso, não "nota ruim". |
| **Simplicidade** | Poucas telas, um objetivo por tela, linguagem direta. |

## 4. Telas

### 4.1 Início
- Título **Pensa Primeiro** e a frase *"A IA que te ajuda a pensar, não a copiar."*
- Botão **Começar a estudar** → Nova pergunta.
- Atalhos para o Painel e para o modo Confira a IA.

### 4.2 Nova pergunta
- Campo para colar a questão ou exercício.
- Campo **obrigatório** "Qual a sua tentativa?" (mínimo de algumas palavras para liberar o botão).
- Opção "Não faço ideia por onde começar". Ela conta como tentativa e libera só a Dica 1.
- Botão **Pedir dica**.

### 4.3 Dicas
- No topo: a pergunta e a tentativa do aluno.
- Três cartões, liberados em sequência:
  1. **Dica 1:** um empurrão (qual conceito usar, por onde começar).
  2. **Dica 2:** um passo concreto do caminho, sem resolver.
  3. **Explicação:** o raciocínio completo, comentando a tentativa do aluno.
- Entre uma dica e outra, o aluno pode **atualizar a tentativa**.
- Botão **Ver resposta**, discreto, só depois da Explicação.
- Ao final: "Resolvi sozinho", "Resolvi com dicas" ou "Precisei da resposta" (alimenta o painel).

### 4.4 Painel de autonomia
- Medidor principal: **% de questões resolvidas sem ver a resposta**.
- Gráfico simples da semana (resolvidas sozinho × com dicas × com resposta).
- Média de dicas usadas por questão.
- Lista das últimas perguntas, com o nível de ajuda usado em cada uma.

### 4.5 Confira a IA
- O sistema mostra uma pergunta e uma resposta "da IA" com **um erro escondido**.
- O aluno marca o trecho errado e explica o porquê.
- Feedback: acertou ou não e qual era o erro.
- Conta pontos de "senso crítico" no painel.

## 5. Fluxo principal

```
Início → Nova pergunta → (escreve tentativa) → Dica 1 → Dica 2 → Explicação → [Ver resposta]
                                                    ↘ resolveu? → registra no Painel
```

## 6. Identidade visual

Segue a mesma identidade da apresentação, para o trabalho ficar coeso:

| Token | Valor | Uso |
|---|---|---|
| Fundo | `#EBEBEB` | fundo das telas |
| Papel | `#FBFBFA` | cartões |
| Tinta | `#1E1E1E` | texto |
| Vermelho | `#FF4A4A` | destaque, botões principais, medidores (usar pouco) |
| Serifada | Marcellus | títulos |
| Grotesca | Inter Tight | textos e interface |

Ilustrações em traço fino no estilo da apresentação (engrenagens, medidores, robozinho), sem fotos.

## 7. Tecnologia

- **Next.js (App Router) + React**, em JavaScript.
- CSS puro com CSS Modules e variáveis globais (`app/globals.css`), com as mesmas cores e fontes da apresentação
  (carregadas com `next/font`).
- Perguntas e dicas de exemplo em `lib/perguntas.js`.
- Histórico do painel salvo no `localStorage` (`lib/historico.js`). Não tem login nem banco de dados.

### Se um dia ligar uma IA de verdade

Basta criar uma rota em `app/api/dica/route.js` que recebe a pergunta e a tentativa e devolve os mesmos campos
de `lib/perguntas.js` (dicas e resposta). A chave da API fica numa variável de ambiente no servidor, **nunca no
front-end**.

### Estrutura

```
app/
├── layout.js            # cabeçalho e fontes
├── globals.css          # cores, botões, cartões
├── page.js              # Início
├── estudar/Estudo.js    # escolher pergunta → tentativa → dicas → resultado
└── painel/Painel.js     # medidor de autonomia e últimas perguntas
lib/
├── perguntas.js         # perguntas de exemplo e dicas
└── historico.js         # leitura e gravação no localStorage
```

## 8. Etapas

1. **Protótipo no Figma:** telas da seção 4 (prompt abaixo).
2. **Protótipo navegável (feito):** Início, Estudar e Painel com dicas simuladas.
3. **Teste com usuários:** os mesmos perfis da entrevista, para validar se o fluxo incentiva a pensar.
4. **Publicação:** Vercel.
5. *Futuro (opcional):* IA de verdade e modo "Confira a IA".

## 9. Prompt para o protótipo no Figma

Para colar no Figma Make ou no First Draft:

```
Crie um protótipo simples (wireframe de baixa/média fidelidade) de um site
chamado "Pensa Primeiro": uma IA de estudos que ajuda o aluno a pensar antes
de dar a resposta. Público: estudantes de 15 a 25 anos. Tudo em português.

Estilo: fundo #EBEBEB, cartões brancos, texto #1E1E1E, destaque vermelho
#FF4A4A. Títulos em Marcellus, textos em Inter Tight. Visual limpo, bastante
espaço em branco, ícones de traço fino (engrenagens, um robozinho simples).

Telas (desktop 1440 px):
1. Início: título "Pensa Primeiro", frase "A IA que te ajuda a pensar, não a
   copiar", botão "Começar a estudar".
2. Nova pergunta: campo para colar a questão + campo obrigatório
   "Qual a sua tentativa?" + botão "Pedir dica".
3. Dicas: a pergunta no topo, a tentativa do aluno, e três cartões de dica
   que liberam um por vez (Dica 1, Dica 2, Explicação). Botão
   "Ver resposta" pequeno, só no final.
4. Painel de autonomia: medidor de "% resolvido sozinho", gráfico simples
   da semana, lista das últimas perguntas.
5. Confira a IA: uma resposta da IA com um erro escondido, e o aluno marca
   onde está o erro.

Use textos de exemplo curtos e componentes reutilizáveis (botão, cartão,
campo de texto, medidor).
```
