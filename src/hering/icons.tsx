import { CSSProperties } from "react";
import { HERING } from "../themes/hering";

// Ícones de traço fino (viewBox 100×100), todos no mesmo estilo: contorno
// branco de 3,4 px, pontas arredondadas, sem preenchimento. A linguagem é a
// das ilustrações limpas da Hering: leve, geométrica, sem enfeite.

type IconProps = { size?: number; style?: CSSProperties; color?: string };

const SHADOW = "drop-shadow(0 4px 10px rgba(10, 20, 40, 0.45))";

const Svg: React.FC<{
  size: number;
  style?: CSSProperties;
  children: React.ReactNode;
}> = ({ size, style, children }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    style={{ overflow: "visible", filter: SHADOW, ...style }}
  >
    {children}
  </svg>
);

const stroke = (color = "#FFFFFF", width = 3.4) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

export const ShirtIcon: React.FC<IconProps> = ({
  size = 120,
  style,
  color,
}) => (
  <Svg size={size} style={style}>
    <path
      d="M30 12 L42 7 Q50 19 58 7 L70 12 L90 32 L79 44 L70 36 L70 90 L30 90 L30 36 L21 44 L10 32 Z"
      {...stroke(color)}
    />
  </Svg>
);

export const PantsIcon: React.FC<IconProps> = ({
  size = 120,
  style,
  color,
}) => (
  <Svg size={size} style={style}>
    <path d="M30 6 H70 L76 94 H56 L50 38 L44 94 H24 Z" {...stroke(color)} />
    <path d="M30 18 H70 M26 84 H44 M56 84 H74" {...stroke(color)} />
  </Svg>
);

export const ShortsIcon: React.FC<IconProps> = ({
  size = 120,
  style,
  color,
}) => (
  <Svg size={size} style={style}>
    <path d="M26 16 H74 L84 68 H56 L50 42 L44 68 H16 Z" {...stroke(color)} />
    <path d="M26 28 H74" {...stroke(color)} />
  </Svg>
);

export const SneakerIcon: React.FC<IconProps> = ({
  size = 120,
  style,
  color,
}) => (
  <Svg size={size} style={style}>
    <path
      d="M8 62 C28 62 34 38 54 44 C62 60 80 58 94 68 L94 78 H8 Z"
      {...stroke(color)}
    />
    <path
      d="M8 78 V86 H94 V78 M42 52 L50 60 M52 48 L60 56"
      {...stroke(color)}
    />
  </Svg>
);

export const CottonIcon: React.FC<IconProps> = ({
  size = 120,
  style,
  color,
}) => (
  <Svg size={size} style={style}>
    <path
      d="M50 64 V94 M50 84 Q32 80 28 62 M50 84 Q68 80 72 62"
      {...stroke(color)}
    />
    <circle cx={33} cy={40} r={16} {...stroke(color)} />
    <circle cx={67} cy={40} r={16} {...stroke(color)} />
    <circle cx={50} cy={24} r={15} {...stroke(color)} />
    <circle cx={50} cy={50} r={16} {...stroke(color)} />
  </Svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({
  size = 120,
  style,
  color,
}) => (
  <Svg size={size} style={style}>
    <path d="M6 50 Q50 12 94 50 Q50 88 6 50 Z" {...stroke(color)} />
    <circle cx={50} cy={50} r={13} {...stroke(color)} />
    <path d="M16 88 L84 12" {...stroke(HERING.blue, 5)} />
  </Svg>
);

// Gola: o decote em U com os ombros. `stretch` (1 = repouso) estica o decote.
export const CollarIcon: React.FC<IconProps & { stretch?: number }> = ({
  size = 120,
  style,
  color,
  stretch = 1,
}) => (
  <Svg size={size} style={style}>
    <path d="M4 24 L20 28 M96 24 L80 28" {...stroke(color)} />
    <g transform={`translate(50 28) scale(${stretch} 1) translate(-50 -28)`}>
      <path d="M20 28 Q50 88 80 28" {...stroke(color)} />
    </g>
    <path d="M30 94 H70" {...stroke(HERING.blue, 4)} />
  </Svg>
);

// Claquete de cinema: a tampa de cima abre e fecha (`open` em graus).
export const ClapperIcon: React.FC<IconProps & { open?: number }> = ({
  size = 120,
  style,
  color,
  open = 0,
}) => (
  <Svg size={size} style={style}>
    <rect x={10} y={40} width={80} height={48} rx={4} {...stroke(color)} />
    <path
      d="M10 54 H90 M30 40 L22 54 M52 40 L44 54 M74 40 L66 54"
      {...stroke(color)}
    />
    <g transform={`rotate(${-open} 10 40)`}>
      <rect x={10} y={24} width={80} height={16} rx={3} {...stroke(color)} />
      <path d="M26 24 L20 40 M48 24 L42 40 M70 24 L64 40" {...stroke(color)} />
    </g>
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 60, style }) => (
  <Svg size={size} style={{ filter: "none", ...style }}>
    <circle cx={42} cy={42} r={27} {...stroke(HERING.navy, 8)} />
    <path d="M63 63 L90 90" {...stroke(HERING.navy, 9)} />
  </Svg>
);
