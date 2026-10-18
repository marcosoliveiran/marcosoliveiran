import { CSSProperties } from "react";
import { HERING } from "../themes/hering";

// Ícones desenhados em SVG (viewBox 100×100) para os motions da publi Hering.
// Traço azul-marinho escuro e preenchimentos claros, para ler sobre qualquer
// cena. Sem verde nem amarelo (briefing: nada que lembre a bandeira).

type IconProps = { size?: number; style?: CSSProperties };

const INK = HERING.navyDark;
const SHADOW = "drop-shadow(0 8px 14px rgba(10, 20, 40, 0.4))";

const Svg: React.FC<{
  size: number;
  style?: CSSProperties;
  children: React.ReactNode;
}> = ({ size, style, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ overflow: "visible", filter: SHADOW, ...style }}
  >
    {children}
  </svg>
);

const line = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const };

export const PersonIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <circle cx={50} cy={27} r={15} fill="#FFFFFF" {...line} />
    <path d="M20 88 C20 54 80 54 80 88 Z" fill="#FFFFFF" {...line} />
  </Svg>
);

export const ShirtIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <path
      d="M30 12 L42 7 Q50 19 58 7 L70 12 L90 32 L79 44 L70 36 L70 90 L30 90 L30 36 L21 44 L10 32 Z"
      fill="#FFFFFF"
      {...line}
    />
  </Svg>
);

export const PantsIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <path
      d="M30 6 H70 L76 94 H56 L50 38 L44 94 H24 Z"
      fill="#2F4D78"
      stroke="#FFFFFF"
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path d="M30 18 H70" stroke="#FFFFFF" strokeWidth={4} />
  </Svg>
);

export const ShortsIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <path
      d="M26 16 H74 L84 68 H56 L50 42 L44 68 H16 Z"
      fill="#16263F"
      stroke="#FFFFFF"
      strokeWidth={4}
      strokeLinejoin="round"
    />
    <path d="M26 28 H74" stroke="#FFFFFF" strokeWidth={4} />
  </Svg>
);

export const SneakerIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <path
      d="M8 62 C28 62 34 38 54 44 C62 60 80 58 94 68 L94 78 H8 Z"
      fill="#FFFFFF"
      {...line}
    />
    <rect
      x={8}
      y={78}
      width={86}
      height={9}
      rx={4}
      fill={HERING.blue}
      {...line}
    />
  </Svg>
);

export const CottonIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <path
      d="M50 62 V94"
      stroke="#8FB0E6"
      strokeWidth={6}
      strokeLinecap="round"
    />
    <path
      d="M50 82 Q30 78 26 60 M50 82 Q70 78 74 60"
      stroke="#8FB0E6"
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />
    <circle cx={34} cy={38} r={17} fill="#FFFFFF" {...line} />
    <circle cx={66} cy={38} r={17} fill="#FFFFFF" {...line} />
    <circle cx={50} cy={22} r={16} fill="#FFFFFF" {...line} />
    <circle cx={50} cy={48} r={17} fill="#FFFFFF" {...line} />
  </Svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ size = 120, style }) => (
  <Svg size={size} style={style}>
    <path d="M6 50 Q50 12 94 50 Q50 88 6 50 Z" fill="#FFFFFF" {...line} />
    <circle cx={50} cy={50} r={14} fill={INK} />
    <path
      d="M14 90 L86 10"
      stroke={HERING.coral}
      strokeWidth={9}
      strokeLinecap="round"
    />
  </Svg>
);

// Gola: o decote em U com ombros. `stretch` (1 = repouso) estica o decote, para
// mostrar a gola que estica e volta ao lugar.
export const CollarIcon: React.FC<IconProps & { stretch?: number }> = ({
  size = 120,
  style,
  stretch = 1,
}) => (
  <Svg size={size} style={style}>
    <path
      d="M4 24 L20 28 M96 24 L80 28"
      stroke="#FFFFFF"
      strokeWidth={8}
      strokeLinecap="round"
    />
    <g transform={`translate(50 28) scale(${stretch} 1) translate(-50 -28)`}>
      <path
        d="M20 28 Q50 88 80 28"
        stroke="#FFFFFF"
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
    </g>
    <path
      d="M18 92 H82"
      stroke="#8FB0E6"
      strokeWidth={5}
      strokeLinecap="round"
    />
  </Svg>
);

export const StarIcon: React.FC<IconProps & { color?: string }> = ({
  size = 120,
  style,
  color = "#FFFFFF",
}) => (
  <Svg size={size} style={style}>
    <path
      d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z"
      fill={color}
      {...line}
    />
  </Svg>
);

export const SparkleIcon: React.FC<IconProps> = ({ size = 60, style }) => (
  <Svg size={size} style={{ filter: "none", ...style }}>
    <path
      d="M50 4 Q54 46 96 50 Q54 54 50 96 Q46 54 4 50 Q46 46 50 4 Z"
      fill="#FFFFFF"
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 60, style }) => (
  <Svg size={size} style={{ filter: "none", ...style }}>
    <circle
      cx={42}
      cy={42}
      r={27}
      fill="none"
      stroke={HERING.navy}
      strokeWidth={10}
    />
    <path
      d="M63 63 L90 90"
      stroke={HERING.navy}
      strokeWidth={11}
      strokeLinecap="round"
    />
  </Svg>
);
