// Medidor semicircular igual ao da apresentação. valor: 0–100.
const CX = 110;
const CY = 112;
const R = 88;

const arred = (v) => Math.round(v * 10) / 10;
const ponto = (p, raio) => [
  arred(CX - raio * Math.cos((Math.PI * p) / 100)),
  arred(CY - raio * Math.sin((Math.PI * p) / 100)),
];

export default function Medidor({ valor, className }) {
  const arco = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const riscos = Array.from({ length: 11 }, (_, k) => {
    const [x1, y1] = ponto(k * 10, k % 5 ? 64 : 58);
    const [x2, y2] = ponto(k * 10, 72);
    return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} className={k % 5 ? "risco" : "risco maior"} />;
  });

  return (
    <svg className={`medidor ${className ?? ""}`} viewBox="0 0 220 128" aria-hidden="true">
      <path d={arco} className="trilho" />
      <path d={arco} className="valor" pathLength="100" style={{ "--v": valor }} />
      {riscos}
      <line
        x1={CX}
        y1={CY}
        x2={CX - 70}
        y2={CY}
        className="ponteiro"
        style={{ "--ang": `${valor * 1.8}deg` }}
      />
      <circle cx={CX} cy={CY} r="13" className="eixo" />
      <circle cx={CX} cy={CY} r="4.5" className="eixo-miolo" />
    </svg>
  );
}
