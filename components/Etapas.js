// Trilha de progresso do estudo, no mesmo desenho da página inicial.
// Com "aoClicar", as etapas já liberadas viram botões para ir direto até elas.
const NOMES = ["Escolher", "Tentar", "Dicas"];

export default function Etapas({ atual, aoClicar, liberadas = 0 }) {
  return (
    <ol className="etapas" aria-label="Progresso">
      {NOMES.map((nome, i) => {
        const estado = i < atual ? "feita" : i === atual ? "atual" : "proxima";
        const conteudo = (
          <>
            <span className="etapa-marco">{estado === "feita" ? "✓" : i + 1}</span>
            {nome}
          </>
        );
        const clicavel = aoClicar && i !== atual && i < liberadas;
        return (
          <li key={nome} className={estado} aria-current={estado === "atual" ? "step" : undefined}>
            {clicavel ? (
              <button
                type="button"
                className="etapa-botao"
                onClick={() => aoClicar(i)}
                data-tip={`Ir para: ${nome}`}
                data-tip-lado="baixo"
                data-tip-alinha="esquerda"
              >
                {conteudo}
              </button>
            ) : (
              conteudo
            )}
          </li>
        );
      })}
    </ol>
  );
}
