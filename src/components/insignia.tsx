type SvgProps = React.SVGProps<SVGSVGElement>;

/**
 * Brasão do dossiê — águia de asas abertas sobre escudo, coroa de louros.
 * Monocromático: herda `currentColor`.
 */
export function EagleCrest(props: SvgProps) {
  return (
    <svg viewBox="0 0 200 186" fill="currentColor" aria-hidden {...props}>
      {/* estrela superior */}
      <path d="M100 1 104.3 12.1 116.2 12.8 106.9 20.3 110 31.8 100 25.3 90 31.8 93.1 20.3 83.8 12.8 95.7 12.1Z" />

      {/* asas — leque de penas; o contorno na cor do papel separa cada pena */}
      <g stroke={CUT} strokeWidth="2.4" strokeLinejoin="round">
        <g transform="translate(100 70)">
          {WING_FEATHERS.map(([angle, len]) => (
            <path key={angle} d={FEATHER} transform={`rotate(${angle}) scale(${len} 1)`} />
          ))}
        </g>
        <g transform="translate(100 70) scale(-1 1)">
          {WING_FEATHERS.map(([angle, len]) => (
            <path key={angle} d={FEATHER} transform={`rotate(${angle}) scale(${len} 1)`} />
          ))}
        </g>
      </g>

      {/* cabeça e pescoço, por cima das asas */}
      <path
        d="M100 30c7.2 0 13 5.7 13 12.7 0 4.7-2.5 8.8-6.4 11L110.2 78H89.8l3.6-24.3A13 13 0 0187 42.7C87 35.7 92.8 30 100 30Z"
        stroke={CUT}
        strokeWidth="2.4"
      />

      {/* escudo */}
      <path
        d="M74 76h52v31c0 18.4-11.9 32.4-26 39.6C85.9 139.4 74 125.4 74 107V76Z"
        stroke={CUT}
        strokeWidth="2.4"
      />
      <g fill={CUT}>
        <rect x="81" y="82" width="5.4" height="41" />
        <rect x="91.4" y="82" width="5.4" height="46" />
        <rect x="103.2" y="82" width="5.4" height="46" />
        <rect x="113.6" y="82" width="5.4" height="41" />
      </g>

      {/* coroa de louros */}
      <LaurelBranch />
      <g transform="translate(200 0) scale(-1 1)">
        <LaurelBranch />
      </g>
    </svg>
  );
}

/** Cor de "recorte": o papel por baixo, usada para separar formas sobrepostas. */
const CUT = "var(--crest-shield, #c6b189)";

/** Pena única apontando para +x, afinando na ponta. */
const FEATHER = "M0 -8C30 -13 63 -11 94 0C63 11 30 12 0 8Z";

/** [ângulo em graus, fator de comprimento] — de cima para baixo. */
const WING_FEATHERS: Array<[number, number]> = [
  [-34, 0.9],
  [-22, 1],
  [-11, 0.92],
  [-1, 0.72],
];

/** Ramo esquerdo do louro: haste + folhas voltadas para fora. */
function LaurelBranch() {
  const leaves: Array<[number, number, number]> = [
    [85.6, 168.9, -170],
    [71.8, 157.7, -157],
    [60.4, 143.2, -144],
    [51.4, 125.3, -134],
    [44.9, 104.1, -125],
  ];
  return (
    <g>
      <path
        d="M100 174C81 168 63 156 55 140 47 124 43 106 43 88"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <g stroke={CUT} strokeWidth="2.2" strokeLinejoin="round">
        {leaves.map(([x, y, rot]) => (
          <path
            key={`${x}-${y}`}
            d="M0 0C9 -7.5 23 -7.5 31 0C23 7.5 9 7.5 0 0Z"
            transform={`translate(${x} ${y}) rotate(${rot})`}
          />
        ))}
      </g>
    </g>
  );
}

/** Estrela alada — selo discreto do rodapé do terminal. */
export function WingedStar(props: SvgProps) {
  return (
    <svg viewBox="0 0 120 40" fill="currentColor" aria-hidden {...props}>
      <path d="M60 6 64 17.5 76 17.5 66.3 24.5 70 36 60 29 50 36 53.7 24.5 44 17.5 56 17.5Z" />
      <path d="M46 18c-13-4-27-5-42-2 14 5 28 7 42 7Z" />
      <path d="M46 26c-11-2-23-1-35 3 13 2 25 1 35-1Z" opacity="0.6" />
      <path d="M74 18c13-4 27-5 42-2-14 5-28 7-42 7Z" />
      <path d="M74 26c11-2 23-1 35 3-13 2-25 1-35-1Z" opacity="0.6" />
    </svg>
  );
}

/** Clipe de papel do canto superior do dossiê. */
export function Paperclip(props: SvgProps) {
  return (
    <svg viewBox="0 0 60 150" fill="none" aria-hidden {...props}>
      <path
        d="M42 128V32c0-14-9-24-21-24S0 18 0 32v104"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M30 128V36c0-7-4-12-9-12s-9 5-9 12v92c0 11 8 18 18 18s18-7 18-18V26"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
