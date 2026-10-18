import { CSSProperties } from "react";
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE } from "../kit";
import { HERING } from "../themes/hering";
import { VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "../themes/voom";

// Motions da publi Hering. Sem painel de fundo: cada recurso é pequeno,
// flutua sobre o vídeo do Marcos e carrega a própria sombra leve. Tudo fica
// dentro da área segura (topo 250, esquerda 60, direita 140).

const CENTER_X = SAFE.left + (1080 - SAFE.left - SAFE.right) / 2;
const SHADOW = "0 10px 26px rgba(10, 20, 40, 0.38)";

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 170 },
  });
};

const Column: React.FC<{ children: React.ReactNode; top?: number }> = ({
  children,
  top = SAFE.top + 40,
}) => (
  <div
    style={{
      position: "absolute",
      left: CENTER_X - 440,
      width: 880,
      top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 22,
    }}
  >
    {children}
  </div>
);

// Pílula pequena: `strong` usa o azul de destaque, as demais o azul-marinho.
const Pill: React.FC<{
  text: string;
  delay: number;
  strong?: boolean;
  size?: number;
}> = ({ text, delay, strong, size = 58 }) => {
  const pop = useIn(delay);
  return (
    <div
      style={{
        opacity: Math.min(1, pop * 2),
        transform: `translateY(${(1 - pop) * 40}px) scale(${0.85 + 0.15 * pop}) rotate(${(1 - pop) * -3}deg)`,
        padding: "8px 30px 12px",
        borderRadius: 999,
        backgroundColor: strong ? HERING.blue : "rgba(47, 77, 120, 0.92)",
        color: HERING.white,
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        boxShadow: SHADOW,
      }}
    >
      {text}
    </div>
  );
};

const Note: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const pop = useIn(delay);
  return (
    <div
      style={{
        opacity: pop,
        color: HERING.white,
        fontFamily: VOOM_TEXT_FONT,
        fontWeight: 800,
        fontSize: 30,
        textShadow: "0 3px 12px rgba(10, 20, 40, 0.7)",
      }}
    >
      {text}
    </div>
  );
};

// 1 · espelho: "incrível como o tempo só me valoriza"
export const MantemACor: React.FC = () => (
  <Column>
    <Pill text="MANTÉM A COR" delay={4} strong />
    <Pill text="NÃO FORMA BOLINHA*" delay={14} />
    <Note text="*segundo a Hering" delay={22} />
  </Column>
);

// 2 · guarda-roupa: seta de desenho apontando a gola/costura. `target` é onde
// a ponta da seta chega (ajustar por take, depois de ver o vídeo).
export const GolaSeta: React.FC<{ target?: { x: number; y: number } }> = ({
  target = { x: 470, y: 760 },
}) => {
  const frame = useCurrentFrame();
  const start = { x: CENTER_X + 40, y: SAFE.top + 150 };
  const draw = interpolate(frame, [10, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mx = (start.x + target.x) / 2 + 110;
  const my = (start.y + target.y) / 2 - 30;
  const path = `M${start.x},${start.y} Q${mx},${my} ${target.x},${target.y}`;
  const head = `M${target.x - 34},${target.y - 26} L${target.x},${target.y} L${target.x + 30},${target.y - 34}`;

  return (
    <>
      <Column>
        <Pill text="GOLA QUE NÃO DEFORMA" delay={4} strong size={52} />
      </Column>
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          filter: "drop-shadow(0 6px 10px rgba(10, 20, 40, 0.45))",
        }}
      >
        <path
          d={path}
          fill="none"
          stroke={HERING.white}
          strokeWidth={9}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d={head}
          fill="none"
          stroke={HERING.white}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={draw > 0.95 ? 1 : 0}
        />
      </svg>
    </>
  );
};

// 3 · espelho: algodão e não fica transparente
export const AlgodaoOpaca: React.FC = () => (
  <Column>
    <Pill text="100% ALGODÃO" delay={4} />
    <Pill text="NÃO FICA TRANSPARENTE" delay={16} strong size={52} />
  </Column>
);

// Fecho: o preço, único elemento em coral.
export const Preco: React.FC = () => {
  const pop = useIn(4);
  const sub = useIn(16);
  const style: CSSProperties = {
    textShadow: "0 10px 30px rgba(10, 20, 40, 0.55)",
  };
  return (
    <Column top={SAFE.top + 60}>
      <div
        style={{
          ...style,
          transform: `scale(${0.6 + 0.4 * pop}) rotate(${-4 + (1 - pop) * -8}deg)`,
          opacity: Math.min(1, pop * 2),
          color: HERING.coral,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 210,
          lineHeight: 1,
        }}
      >
        R$ 49,99
      </div>
      <div style={{ opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
        <Pill text="custo-benefício" delay={16} size={46} />
      </div>
    </Column>
  );
};

// CTA: espaço livre em cima do rosto do Marcos.
export const SeloCta: React.FC = () => {
  const pop = useIn(4);
  return (
    <Column top={SAFE.top + 20}>
      <div
        style={{
          transform: `translateY(${(1 - pop) * -50}px)`,
          opacity: pop,
          color: HERING.white,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1,
          textAlign: "center",
          textShadow: "0 8px 26px rgba(10, 20, 40, 0.6)",
        }}
      >
        CAMISETA BRASIL
      </div>
      <Pill text="site e lojas participantes" delay={14} strong size={46} />
    </Column>
  );
};

// Cartela da abertura: "Episódio 1 · A síndrome de protagonista".
export const CartelaEpisodio: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const kicker = useIn(2);
  const title = useIn(8);
  const out = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <div
      style={{
        position: "absolute",
        left: CENTER_X - 440,
        width: 880,
        top: 640,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        opacity: out,
      }}
    >
      <div
        style={{
          transform: `scale(${kicker})`,
          padding: "8px 34px 12px",
          borderRadius: 999,
          backgroundColor: HERING.blue,
          color: HERING.white,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: 4,
          boxShadow: SHADOW,
        }}
      >
        EPISÓDIO 1
      </div>
      <div
        style={{
          transform: `translateY(${(1 - title) * 60}px) scale(${0.9 + 0.1 * title})`,
          opacity: Math.min(1, title * 2),
          color: HERING.white,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 132,
          lineHeight: 1.02,
          textAlign: "center",
          textShadow: "0 10px 34px rgba(10, 20, 40, 0.7)",
        }}
      >
        A síndrome de protagonista
      </div>
    </div>
  );
};
