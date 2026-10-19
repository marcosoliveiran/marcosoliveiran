import { ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { VOOM, VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "../themes/voom";
import { CapaConteudo, CapaProps, Paper } from "./Capa";

// Fundos para a folha do cartaz "Por Onde Anda?" colada na parede. Os rabiscos
// ficam nas bordas (zonas que o app cobre); a folha fica na área segura.

export type Fundo = "lima" | "halftone" | "tv";

const useFloat = (seed: number, amp = 10) => {
  const frame = useCurrentFrame();
  return Math.sin((frame + seed * 17) / 16) * amp;
};

const INK = VOOM.black;
const STROKE = {
  stroke: INK,
  strokeWidth: 9,
  strokeLinejoin: "round",
} as const;

// --- Rabiscos dos anos 2000 (traço preto grosso, preenchimento off-white) ---------
const Cd: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <circle cx="60" cy="60" r="52" fill={VOOM.offWhite} {...STROKE} />
    <circle cx="60" cy="60" r="16" fill={VOOM.lime} {...STROKE} />
    <path
      d="M26 40 A40 40 0 0 1 52 22"
      fill="none"
      {...STROKE}
      strokeWidth={6}
    />
  </svg>
);
const Cassette: React.FC = () => (
  <svg viewBox="0 0 160 110" width="100%" height="100%">
    <rect
      x="8"
      y="8"
      width="144"
      height="94"
      rx="12"
      fill={VOOM.offWhite}
      {...STROKE}
    />
    <rect
      x="28"
      y="22"
      width="104"
      height="34"
      rx="6"
      fill={VOOM.lime}
      {...STROKE}
      strokeWidth={6}
    />
    <circle cx="56" cy="39" r="9" fill={INK} />
    <circle cx="104" cy="39" r="9" fill={INK} />
    <path
      d="M44 88 L62 70 H98 L116 88"
      fill="none"
      {...STROKE}
      strokeWidth={6}
    />
  </svg>
);
const Note: React.FC = () => (
  <svg viewBox="0 0 100 130" width="100%" height="100%">
    <path d="M38 14 V92" fill="none" {...STROKE} />
    <path d="M38 14 L86 30 V50 L38 34" fill={VOOM.lime} {...STROKE} />
    <ellipse cx="26" cy="98" rx="22" ry="17" fill={INK} />
    <path d="M86 30 V80" fill="none" {...STROKE} />
    <ellipse cx="74" cy="86" rx="22" ry="17" fill={INK} />
  </svg>
);
const Star: React.FC = () => (
  <svg viewBox="0 0 120 120" width="100%" height="100%">
    <path
      d="M60 8 L74 44 L112 46 L82 70 L92 108 L60 87 L28 108 L38 70 L8 46 L46 44 Z"
      fill={VOOM.offWhite}
      {...STROKE}
    />
  </svg>
);
const Phones: React.FC = () => (
  <svg viewBox="0 0 140 140" width="100%" height="100%">
    <path
      d="M24 84 V64 A46 46 0 0 1 116 64 V84"
      fill="none"
      {...STROKE}
      strokeWidth={12}
    />
    <rect
      x="10"
      y="78"
      width="34"
      height="52"
      rx="14"
      fill={VOOM.lime}
      {...STROKE}
    />
    <rect
      x="96"
      y="78"
      width="34"
      height="52"
      rx="14"
      fill={VOOM.lime}
      {...STROKE}
    />
  </svg>
);
const Flip: React.FC = () => (
  <svg viewBox="0 0 110 150" width="100%" height="100%">
    <rect
      x="22"
      y="6"
      width="66"
      height="60"
      rx="10"
      fill={VOOM.offWhite}
      {...STROKE}
    />
    <rect
      x="34"
      y="18"
      width="42"
      height="26"
      rx="4"
      fill={VOOM.lime}
      {...STROKE}
      strokeWidth={5}
    />
    <rect
      x="22"
      y="76"
      width="66"
      height="68"
      rx="10"
      fill={VOOM.offWhite}
      {...STROKE}
    />
    {[0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => (
        <circle
          key={`${r}${c}`}
          cx={40 + c * 15}
          cy={96 + r * 16}
          r="4.5"
          fill={INK}
        />
      )),
    )}
  </svg>
);

const DOODLES: Array<{
  node: ReactNode;
  x: number;
  y: number;
  size: number;
  rot: number;
}> = [
  { node: <Cd />, x: -40, y: 40, size: 230, rot: -12 },
  { node: <Note />, x: 880, y: 70, size: 170, rot: 14 },
  { node: <Star />, x: 760, y: 190, size: 100, rot: 10 },
  { node: <Cassette />, x: -70, y: 560, size: 270, rot: -16 },
  { node: <Phones />, x: 930, y: 640, size: 220, rot: 12 },
  { node: <Flip />, x: -30, y: 1010, size: 210, rot: 10 },
  { node: <Star />, x: 24, y: 440, size: 90, rot: -8 },
  { node: <Note />, x: 940, y: 1030, size: 160, rot: -10 },
  { node: <Cd />, x: 870, y: 1330, size: 210, rot: 18 },
  { node: <Star />, x: 20, y: 1360, size: 110, rot: 14 },
  { node: <Cassette />, x: 40, y: 1500, size: 240, rot: -8 },
  { node: <Note />, x: 400, y: 1560, size: 150, rot: 6 },
];

const Doodles: React.FC<{ neon?: boolean }> = ({ neon = false }) => (
  <>
    {DOODLES.map((d, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: d.x,
          top: d.y + 0,
          width: d.size,
          height: d.size,
          transform: `translateY(${0}px) rotate(${d.rot}deg)`,
          filter: neon
            ? "drop-shadow(0 0 14px rgba(198,255,26,0.55)) drop-shadow(0 8px 10px rgba(0,0,0,0.5))"
            : "drop-shadow(0 8px 10px rgba(0,0,0,0.25))",
        }}
      >
        <FloatBox seed={i}>{d.node}</FloatBox>
      </div>
    ))}
  </>
);

const FloatBox: React.FC<{ seed: number; children: ReactNode }> = ({
  seed,
  children,
}) => {
  const dy = useFloat(seed, 9);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `translateY(${dy}px)`,
      }}
    >
      {children}
    </div>
  );
};

// --- Fundos -------------------------------------------------------------------------
const FundoLima: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: VOOM.lime }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.22), rgba(16,16,16,0.16) 100%)",
      }}
    />
    <Doodles />
  </AbsoluteFill>
);

const FundoHalftone: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: VOOM.black }}>
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(circle, ${VOOM.lime} 34%, transparent 36%)`,
        backgroundSize: "44px 44px",
        // os pontos crescem do centro para as bordas e somem no meio
        WebkitMaskImage:
          "radial-gradient(circle at 50% 46%, transparent 18%, black 78%)",
        maskImage:
          "radial-gradient(circle at 50% 46%, transparent 18%, black 78%)",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(circle, ${VOOM.lime} 20%, transparent 22%)`,
        backgroundSize: "22px 22px",
        backgroundPosition: "11px 11px",
        opacity: 0.55,
        WebkitMaskImage:
          "radial-gradient(circle at 50% 46%, transparent 40%, black 95%)",
        maskImage:
          "radial-gradient(circle at 50% 46%, transparent 40%, black 95%)",
      }}
    />
  </AbsoluteFill>
);

const FundoTv: React.FC = () => {
  const frame = useCurrentFrame();
  const roll = (frame * 6) % 1920;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0c0c0b" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 46%, rgba(198,255,26,0.16), rgba(0,0,0,0) 62%)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, rgba(0,0,0,0) 2px 6px)",
        }}
      />
      <Doodles neon />
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 2px, rgba(0,0,0,0) 2px 6px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: roll - 220,
          width: 1080,
          height: 200,
          background:
            "linear-gradient(to bottom, rgba(198,255,26,0), rgba(198,255,26,0.10), rgba(198,255,26,0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 1640,
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 900,
          fontSize: 44,
          letterSpacing: 4,
          color: VOOM.lime,
        }}
      >
        ● REC
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 1700,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: 3,
          color: VOOM.offWhite,
          opacity: 0.8,
        }}
      >
        ▶ PLAY 2006
      </div>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

// --- Folha colada na parede ---------------------------------------------------------
const FOLHA = { x: 80, y: 270, w: 840, h: 1140 };
const ESCALA = 0.8;

export const Folha: React.FC<CapaProps> = (props) => (
  <div
    style={{
      position: "absolute",
      left: FOLHA.x,
      top: FOLHA.y,
      width: FOLHA.w,
      height: FOLHA.h,
      transform: "rotate(-2.5deg)",
      boxShadow: "0 30px 50px rgba(0,0,0,0.45)",
      overflow: "hidden",
      backgroundColor: VOOM.offWhite,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: "0 0",
        transform: `translate(${FOLHA.w / 2 - 500 * ESCALA}px, ${FOLHA.h / 2 - 837 * ESCALA}px) scale(${ESCALA})`,
      }}
    >
      <Paper />
      <CapaConteudo {...props} />
    </div>
  </div>
);

export type ParedeProps = CapaProps & { fundo?: Fundo };

export const CapaParede: React.FC<ParedeProps> = ({
  fundo = "tv",
  ...props
}) => (
  <AbsoluteFill style={{ backgroundColor: VOOM.black }}>
    {fundo === "lima" ? <FundoLima /> : null}
    {fundo === "halftone" ? <FundoHalftone /> : null}
    {fundo === "tv" ? <FundoTv /> : null}
    {/* Na TV não há papel branco: o título, a foto e a faixa ficam direto no fundo escuro */}
    {fundo === "tv" ? <CapaConteudo escuro {...props} /> : <Folha {...props} />}
  </AbsoluteFill>
);
