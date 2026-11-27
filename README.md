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
| `/estudar` | Escolhe a pergunta (ou escreve a sua) → escreve a tentativa → abre dicas uma por vez → resultado |
| `/confira` | Confira a IA: achar a frase errada em respostas que parecem certas |
| `/painel` | % resolvido sem ver a resposta, contagem por resultado, últimas perguntas e senso crítico |
| `/sobre` | A pesquisa por trás do site: problema, dados, matriz CSD, grupo e referências |

Documentação completa: [`docs/pensa-primeiro.md`](docs/pensa-primeiro.md).

## Conferência com IA (opcional)

O botão "Conferir minha resposta" usa primeiro um verificador local (`lib/verificador.js`), que é grátis
e instantâneo. Só quando ele não confirma a resposta, ou na pergunta livre, o site pede para o
**Gemini** conferir (`app/api/conferir/route.js` → `lib/gemini.js`).

1. Crie uma chave gratuita no [Google AI Studio](https://aistudio.google.com/apikey).
2. Copie `.env.example` para `.env.local` e cole a chave em `GEMINI_API_KEY`.
3. Reinicie o `npm run dev`. Na Vercel, cadastre a mesma variável em *Settings → Environment Variables*.

Para caber no plano gratuito: respostas repetidas vêm do cache, há limite por pessoa (6/min) e
no site todo (10/min e 300/dia, ajustáveis no `.env.local`), o prompt e a resposta são curtos e,
sem chave ou se a cota acabar, o site volta para o verificador local sem quebrar.
