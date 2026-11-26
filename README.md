# Pensa Primeiro

Protótipo do trabalho de IHC (IA × IHC, Engenharia de Software, Univille 2026): uma IA de estudos que pede a
tentativa do aluno antes de ajudar e libera dicas aos poucos. Nasceu da pesquisa da apresentação
**Desinteligência Humana**.

As dicas são simuladas (escritas pelo grupo em `lib/perguntas.js`) e o histórico fica no `localStorage`.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Telas

| Rota | O que faz |
|---|---|
| `/` | Início: proposta e como funciona |
| `/estudar` | Escolhe a pergunta → escreve a tentativa → abre dicas uma por vez → resultado |
| `/painel` | % resolvido sem ver a resposta, contagem por resultado, últimas perguntas |

Documentação completa: [`docs/pensa-primeiro.md`](docs/pensa-primeiro.md).
