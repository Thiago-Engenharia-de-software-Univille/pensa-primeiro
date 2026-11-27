// Trilha de progresso do estudo, no mesmo desenho da página inicial.
const NOMES = ["Escolher", "Tentar", "Dicas"];

export default function Etapas({ atual }) {
  return (
    <ol className="etapas" aria-label="Progresso">
      {NOMES.map((nome, i) => {
        const estado = i < atual ? "feita" : i === atual ? "atual" : "proxima";
        return (
          <li key={nome} className={estado} aria-current={estado === "atual" ? "step" : undefined}>
            <span className="etapa-marco">{estado === "feita" ? "✓" : i + 1}</span>
            {nome}
          </li>
        );
      })}
    </ol>
  );
}
