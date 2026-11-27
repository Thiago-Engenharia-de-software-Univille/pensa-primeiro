// Cabeça do robô: logo do site e "avatar" de quem dá as dicas.
export default function CabecaRobo({ className, tamanho = 30 }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 40 40" aria-hidden="true">
      <line x1="17" y1="9" x2="14" y2="3" stroke="#1e1e1e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="13.5" cy="3.5" r="3" fill="#ff4a4a" stroke="#1e1e1e" strokeWidth="2" />
      <rect x="4" y="9" width="32" height="26" rx="8" fill="#fff" stroke="#1e1e1e" strokeWidth="2.5" />
      <rect x="15" y="14" width="17" height="13" rx="3.5" fill="#1e1e1e" />
      <rect x="24" y="19" width="5" height="2.5" rx="1.2" fill="#fff" />
    </svg>
  );
}
