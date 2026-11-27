// Cabeça do robô: logo do site (o mesmo desenho do ícone da aba, app/icon.svg)
// e "avatar" de quem dá as dicas.
export default function CabecaRobo({ className, tamanho = 30 }) {
  return (
    <svg className={className} width={tamanho} height={tamanho} viewBox="0 0 40 40" aria-hidden="true">
      <line x1="20" y1="9" x2="20" y2="3.5" stroke="#1e1e1e" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="3.6" r="3.2" fill="#ff4a4a" stroke="#1e1e1e" strokeWidth="2" />
      <rect x="2.5" y="9" width="35" height="28.5" rx="9" fill="#fff" stroke="#1e1e1e" strokeWidth="2.6" />
      <rect x="8" y="14" width="24" height="17.5" rx="5" fill="#1e1e1e" />
      <rect x="13" y="18.5" width="4" height="6" rx="2" fill="#fff" />
      <rect x="23" y="18.5" width="4" height="6" rx="2" fill="#fff" />
      <path d="M17.5 27.5 q2.5 1.8 5 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
