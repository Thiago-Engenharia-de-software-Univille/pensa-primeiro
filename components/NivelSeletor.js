"use client";

import { NIVEIS, mudarNivel, useNivel } from "@/lib/nivel";

// Seletor do nível de ajuda: três botões lado a lado (Fácil · Médio · Difícil).
export default function NivelSeletor({ compacto = false }) {
  const nivel = useNivel();
  return (
    <div className={`nivel ${compacto ? "nivel-compacto" : ""}`}>
      <span className="nivel-rotulo" id="nivel-rotulo">
        Nível de ajuda
      </span>
      <div className="nivel-opcoes" role="radiogroup" aria-labelledby="nivel-rotulo">
        {Object.entries(NIVEIS).map(([id, n]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={nivel === id}
            className={nivel === id ? "ativo" : ""}
            onClick={() => mudarNivel(id)}
            data-tip={n.descricao}
            data-tip-lado="baixo"
          >
            {n.nome}
          </button>
        ))}
      </div>
      {!compacto && <span className="nivel-descricao">{NIVEIS[nivel].descricao}</span>}
    </div>
  );
}
