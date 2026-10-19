import { CSSProperties, ReactNode, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { VOOM, VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "../themes/voom";

// Motions do vídeo do Kimi. Cada um é desenhado numa área de 880 x 550 (a área
// segura de cima), com (0, 0) no canto de cima à esquerda. Aparecem dentro de
// <Sequence>, então o tempo (useCurrentFrame) começa no zero em cada um. Os
// parâmetros em segundos (`at`, `*At`) são relativos ao começo do motion.
// Painel transparente: cada recurso carrega a sua própria sombra leve.

const clampOpts = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const spr = (
  frame: number,
  fps: number,
  delay: number,
  damping = 12,
  stiffness = 150,
) => spring({ frame: frame - delay, fps, config: { damping, stiffness } });

const Abs: React.FC<{ style: CSSProperties; children?: ReactNode }> = ({
  style,
  children,
}) => <div style={{ position: "absolute", ...style }}>{children}</div>;

// Contorno escuro nos textos, para ler em cima de qualquer fundo.
const STROKE: CSSProperties = {
  WebkitTextStroke: "9px #101010",
  paintOrder: "stroke fill",
};
const SOFT_SHADOW = "drop-shadow(0 12px 16px rgba(0,0,0,0.45))";

// --- Imagens (public/kimi) -------------------------------------------------------
// Se o arquivo ainda não existe, mostra um quadro de reserva com o nome dele.

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(160deg, #3a3a38, #1c1c1b)",
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontFamily: VOOM_TEXT_FONT,
      fontWeight: 800,
      fontSize: 24,
      letterSpacing: 1.5,
      color: VOOM.gray,
      padding: 16,
      boxSizing: "border-box",
    }}
  >
    <div>
      <div style={{ fontSize: 64, color: VOOM.lime, lineHeight: 1 }}>＋</div>
      {label}
    </div>
  </AbsoluteFill>
);

// Aceita .png, .jpg, .jpeg e .webp com o mesmo nome: tenta uma de cada vez.
const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

const SafeImage: React.FC<{
  file: string;
  fallback?: ReactNode;
  position?: string;
}> = ({ file, fallback, position = "center bottom" }) => {
  const base = file.replace(/\.[a-z]+$/i, "");
  const [handle] = useState(() => delayRender(`Imagem ${file}`));
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const finish = (next: "ok" | "missing") => {
    setState(next);
    continueRender(handle);
  };
  const failed = () => {
    if (attempt + 1 < EXTENSIONS.length) {
      setAttempt(attempt + 1);
    } else {
      finish("missing");
    }
  };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* <img> de propósito: com <Img> um arquivo que falta derruba o render; aqui o quadro de reserva aparece */}
      {/* eslint-disable-next-line @remotion/warn-native-media-tag */}
      <img
        key={attempt}
        src={staticFile(`kimi/${base}.${EXTENSIONS[attempt]}`)}
        onLoad={() => finish("ok")}
        onError={failed}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: position,
          display: state === "ok" ? "block" : "none",
        }}
      />
      {state === "missing" ? (fallback ?? <Placeholder label={file} />) : null}
    </div>
  );
};

// --- Peças básicas -----------------------------------------------------------------

// Recorte com borda branca de adesivo, sombra leve, balanço e plaquinha de nome.
const OUTLINE = [
  "drop-shadow(5px 0 0 #fff)",
  "drop-shadow(-5px 0 0 #fff)",
  "drop-shadow(0 5px 0 #fff)",
  "drop-shadow(0 -5px 0 #fff)",
  "drop-shadow(0 14px 16px rgba(0,0,0,0.5))",
].join(" ");

const NamePlate: React.FC<{ text: string; size?: number }> = ({
  text,
  size = 34,
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      bottom: -20,
      transform: "translateX(-50%) rotate(-2deg)",
      background: VOOM.lime,
      color: VOOM.black,
      fontFamily: VOOM_TITLE_FONT,
      fontWeight: 700,
      fontSize: size,
      padding: "4px 20px",
      borderRadius: 16,
      whiteSpace: "nowrap",
      boxShadow: "0 8px 16px rgba(0,0,0,0.4)",
    }}
  >
    {text}
  </div>
);

const Cutout: React.FC<{
  file: string;
  name?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  delay?: number;
  tilt?: number;
  from?: "bottom" | "left" | "right";
  instant?: boolean;
}> = ({
  file,
  name,
  x,
  y,
  w,
  h,
  delay = 0,
  tilt = 0,
  from = "bottom",
  instant = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = instant ? 1 : spr(frame, fps, delay, 11, 140);
  const slide = (1 - p) * 140;
  const dx = from === "left" ? -slide : from === "right" ? slide : 0;
  const dy = from === "bottom" ? slide : 0;
  const float = Math.sin((frame + delay) / 14) * 5;
  return (
    <Abs
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: instant ? 1 : Math.min(1, p * 2),
        transform: `translate(${dx}px, ${dy + float}px) rotate(${tilt}deg) scale(${0.88 + 0.12 * p})`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, filter: OUTLINE }}>
        <SafeImage file={file} />
      </div>
      {name ? <NamePlate text={name} /> : null}
    </Abs>
  );
};

// Contador que sobe de 0 até `target` entre `startAt` e `startAt + dur` (s).
const useCount = (target: number, startAt: number, dur: number): number => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.round(
    interpolate(frame, [startAt * fps, (startAt + dur) * fps], [0, target], {
      ...clampOpts,
      easing: Easing.out(Easing.cubic),
    }),
  );
};

const BigText: React.FC<{
  text: string;
  size: number;
  color?: string;
  style?: CSSProperties;
}> = ({ text, size, color = VOOM.lime, style }) => (
  <div
    style={{
      fontFamily: VOOM_TITLE_FONT,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1,
      color,
      filter: SOFT_SHADOW,
      ...STROKE,
      ...style,
    }}
  >
    {text}
  </div>
);

const Cup: React.FC<{ size?: number; color?: string }> = ({
  size = 80,
  color = VOOM.lime,
}) => (
  <svg viewBox="0 0 150 190" width={size} height={(size * 190) / 150}>
    <path d="M30 30 H120 V80 A45 45 0 0 1 30 80 Z" fill={color} />
    <path
      d="M30 42 H8 C8 90 30 98 48 100"
      fill="none"
      stroke={color}
      strokeWidth="9"
    />
    <path
      d="M120 42 H142 C142 90 120 98 102 100"
      fill="none"
      stroke={color}
      strokeWidth="9"
    />
    <rect x="68" y="124" width="14" height="30" fill={color} />
    <rect x="42" y="152" width="66" height="22" rx="6" fill={color} />
  </svg>
);

// --- Palavras-chave (no lugar da legenda da fala) ---------------------------------------
// Uma por vez, na faixa de baixo do painel (y 455 a 545), sempre sobre o motion.

export const Keyword: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = spr(frame, fps, 0, 10, 220);
  const out = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    clampOpts,
  );
  return (
    <Abs
      style={{
        left: 0,
        top: 452,
        width: 880,
        display: "flex",
        justifyContent: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          background: VOOM.lime,
          color: VOOM.black,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1,
          padding: "10px 32px",
          borderRadius: 22,
          whiteSpace: "nowrap",
          transform: `scale(${0.5 + 0.5 * p}) rotate(-3deg)`,
          boxShadow: "0 14px 24px rgba(0,0,0,0.45)",
        }}
      >
        {text}
      </div>
    </Abs>
  );
};

// --- 1 · Gancho ---------------------------------------------------------------------------

// Capa: a frase já está inteira no primeiro frame (sem animação de entrada).
export const CoverText: React.FC = () => (
  <>
    <Abs style={{ left: 0, top: 22, width: 700 }}>
      <BigText
        text="VOCÊ JÁ OUVIU FALAR DE"
        size={44}
        color={VOOM.offWhite}
        style={{ fontFamily: VOOM_TEXT_FONT, fontWeight: 900 }}
      />
      <BigText text="KIMI" size={210} style={{ marginTop: 6 }} />
      <BigText text="ANTONELLI?" size={118} style={{ marginTop: 4 }} />
    </Abs>
  </>
);

export const KimiCover: React.FC = () => (
  <Cutout
    file="kimi.png"
    name="KIMI ANTONELLI"
    x={520}
    y={0}
    w={360}
    h={500}
    tilt={2}
    instant
  />
);

export const Twenty: React.FC<{ countAt?: number }> = ({ countAt = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = useCount(20, countAt, 0.6);
  const p = spr(frame, fps, countAt * fps, 9, 200);
  return (
    <Abs
      style={{
        left: 20,
        top: 40,
        transform: `scale(${0.6 + 0.4 * p})`,
        transformOrigin: "left center",
      }}
    >
      <BigText text={String(n)} size={300} />
      <BigText
        text="ANOS"
        size={96}
        color={VOOM.offWhite}
        style={{ marginTop: 6 }}
      />
    </Abs>
  );
};

// --- 2 · Suprema ----------------------------------------------------------------------------

export const Suprema: React.FC<{ stampAt: number; barsAt: number }> = ({
  stampAt,
  barsAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spr(frame, fps, stampAt * fps, 8, 180);
  const rise = interpolate(
    frame,
    [barsAt * fps, (barsAt + 1.6) * fps],
    [0, 1],
    { ...clampOpts, easing: Easing.inOut(Easing.cubic) },
  );
  const barH = 300;
  return (
    <>
      <Cutout
        file="ahs-coven.png"
        name="AHS · COVEN"
        x={0}
        y={20}
        w={470}
        h={420}
        tilt={-3}
        from="left"
      />
      <Abs
        style={{
          left: 500,
          top: 10,
          opacity: Math.min(1, stamp * 2),
          transform: `scale(${2.4 - 1.4 * stamp}) rotate(${6 - 2 * stamp}deg)`,
          transformOrigin: "center",
        }}
      >
        <div
          style={{
            background: VOOM.lime,
            color: VOOM.black,
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1,
            padding: "10px 26px",
            borderRadius: 20,
            boxShadow: "0 16px 28px rgba(0,0,0,0.5)",
          }}
        >
          SUPREMA
        </div>
      </Abs>
      {/* barras de poder: a anterior cai, a nova sobe */}
      {[
        { label: "ANTERIOR", x: 540, from: 1, to: 0.12, color: VOOM.gray },
        { label: "NOVA", x: 710, from: 0.12, to: 1, color: VOOM.lime },
      ].map((bar) => {
        const level = bar.from + (bar.to - bar.from) * rise;
        return (
          <Abs key={bar.label} style={{ left: bar.x, top: 150, width: 140 }}>
            <div
              style={{
                height: barH,
                display: "flex",
                alignItems: "flex-end",
                filter: SOFT_SHADOW,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: barH * level,
                  background: bar.color,
                  borderRadius: 16,
                  border: "5px solid #101010",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                fontFamily: VOOM_TEXT_FONT,
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: 2,
                color: VOOM.offWhite,
                ...STROKE,
                WebkitTextStroke: "6px #101010",
              }}
            >
              {bar.label}
            </div>
          </Abs>
        );
      })}
    </>
  );
};

// --- 3 · Mercedes, Hamilton, Ferrari, Schumacher -----------------------------------

export const MercedesKimi: React.FC = () => (
  <>
    <Cutout
      file="kimi.png"
      name="KIMI"
      x={20}
      y={20}
      w={330}
      h={430}
      tilt={-2}
      from="right"
    />
    <Abs style={{ left: 400, top: 120 }}>
      <BigText text="MERCEDES" size={104} color={VOOM.offWhite} />
      <div
        style={{
          marginTop: 22,
          display: "inline-block",
          background: VOOM.lime,
          color: VOOM.black,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 62,
          padding: "6px 24px",
          borderRadius: 18,
          transform: "rotate(-3deg)",
          boxShadow: "0 12px 22px rgba(0,0,0,0.45)",
        }}
      >
        18 ANOS
      </div>
    </Abs>
  </>
);

export const HamiltonTitles: React.FC<{ titlesAt: number }> = ({
  titlesAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = useCount(7, titlesAt, 0.8);
  const big = spr(frame, fps, titlesAt * fps, 9, 200);
  return (
    <>
      <Cutout
        file="hamilton.png"
        name="LEWIS HAMILTON"
        x={20}
        y={20}
        w={330}
        h={430}
        tilt={-2}
        from="left"
      />
      <Abs
        style={{
          left: 420,
          top: 20,
          transform: `scale(${0.6 + 0.4 * big})`,
          transformOrigin: "left center",
          opacity: Math.min(1, big * 2),
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
          <BigText text={String(n)} size={230} />
          <BigText
            text="TÍTULOS"
            size={70}
            color={VOOM.offWhite}
            style={{ marginBottom: 22 }}
          />
        </div>
      </Abs>
      <Abs style={{ left: 410, top: 290, display: "flex", gap: 6 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const c = spr(frame, fps, (titlesAt + 0.12 * i) * fps, 9, 220);
          return (
            <div
              key={i}
              style={{
                transform: `scale(${c}) translateY(${(1 - c) * 30}px)`,
                filter: SOFT_SHADOW,
              }}
            >
              <Cup size={64} />
            </div>
          );
        })}
      </Abs>
    </>
  );
};

export const FerrariArrow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [4, 4 + 0.5 * fps], [0, 1], {
    ...clampOpts,
    easing: Easing.out(Easing.cubic),
  });
  const word = spr(frame, fps, 0.45 * fps, 9, 190);
  return (
    <>
      <Cutout
        file="hamilton.png"
        x={10}
        y={80}
        w={250}
        h={340}
        tilt={-2}
        instant
      />
      <Abs style={{ left: 270, top: 190 }}>
        <svg width="190" height="80" viewBox="0 0 190 80">
          <path
            d="M6 40 H168"
            stroke={VOOM.lime}
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="170"
            strokeDashoffset={170 * (1 - draw)}
          />
          <path
            d="M138 8 L180 40 L138 72"
            stroke={VOOM.lime}
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={draw > 0.85 ? 1 : 0}
          />
        </svg>
      </Abs>
      <Abs
        style={{
          left: 450,
          top: 190,
          opacity: Math.min(1, word * 2),
          transform: `scale(${0.6 + 0.4 * word})`,
          transformOrigin: "left center",
        }}
      >
        <BigText text="FERRARI" size={100} color={VOOM.offWhite} />
      </Abs>
    </>
  );
};

export const Schumacher: React.FC<{ dotsAt: number; fiveAt: number }> = ({
  dotsAt,
  fiveAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Cutout
        file="schumacher.png"
        name="MICHAEL SCHUMACHER"
        x={20}
        y={20}
        w={330}
        h={430}
        tilt={-2}
        from="left"
        delay={0}
      />
      <Abs style={{ left: 410, top: 150, display: "flex", gap: 12 }}>
        {Array.from({ length: 7 }, (_, i) => {
          const appear = spr(frame, fps, (dotsAt + 0.05 * i) * fps, 10, 220);
          const lit = i < 5;
          const on = lit
            ? spr(frame, fps, (fiveAt + 0.18 * i) * fps, 9, 240)
            : 0;
          return (
            <div
              key={i}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                boxSizing: "border-box",
                border: "5px solid #101010",
                background: lit && on > 0.5 ? VOOM.lime : VOOM.gray,
                transform: `scale(${appear * (1 + 0.25 * Math.max(0, on - 0.5) * (1 - on))})`,
                boxShadow: "0 8px 14px rgba(0,0,0,0.45)",
              }}
            />
          );
        })}
      </Abs>
      <Abs style={{ left: 410, top: 225 }}>
        <div
          style={{
            width: 5 * 64 - 12,
            textAlign: "center",
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 900,
            fontSize: 30,
            letterSpacing: 2,
            color: VOOM.lime,
            opacity: interpolate(
              frame,
              [fiveAt * fps, (fiveAt + 0.3) * fps],
              [0, 1],
              clampOpts,
            ),
            ...STROKE,
            WebkitTextStroke: "6px #101010",
          }}
        >
          FERRARI
        </div>
      </Abs>
      <Abs style={{ left: 410 + 5 * 64, top: 225 }}>
        <div
          style={{
            width: 2 * 64 - 12,
            textAlign: "center",
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: 1,
            color: VOOM.offWhite,
            opacity: interpolate(
              frame,
              [(fiveAt + 1) * fps, (fiveAt + 1.3) * fps],
              [0, 1],
              clampOpts,
            ),
            ...STROKE,
            WebkitTextStroke: "5px #101010",
          }}
        >
          BENETTON
        </div>
      </Abs>
    </>
  );
};

// --- 5 · As corridas e o título italiano ----------------------------------------------

export const PlusHundred: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = useCount(100, 0, 0.7);
  const p = spr(frame, fps, 0, 9, 200);
  return (
    <Abs
      style={{
        left: 0,
        top: 70,
        width: 880,
        textAlign: "center",
        transform: `scale(${0.6 + 0.4 * p})`,
        opacity: Math.min(1, p * 2),
      }}
    >
      <BigText text={`+${n}`} size={270} />
      <BigText
        text="PONTOS DE VANTAGEM"
        size={66}
        color={VOOM.offWhite}
        style={{ marginTop: 10 }}
      />
    </Abs>
  );
};

export const RaceChips: React.FC<{ mexicoAt: number; pauloAt: number }> = ({
  mexicoAt,
  pauloAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [
    { label: "AUSTIN", seal: "IMPROVÁVEL, MAS POSSÍVEL", at: 0, hot: false },
    { label: "CIDADE DO MÉXICO", seal: "APOSTA", at: mexicoAt, hot: true },
    { label: "SÃO PAULO", seal: "ATÉ MESMO", at: pauloAt, hot: false },
  ];
  return (
    <>
      {rows.map((row, i) => {
        const p = spr(frame, fps, row.at * fps, 10, 190);
        return (
          <Abs
            key={row.label}
            style={{
              left: 40,
              top: 14 + i * 160,
              width: 800,
              height: 130,
              borderRadius: 30,
              boxSizing: "border-box",
              background: row.hot ? VOOM.lime : VOOM.black,
              border: row.hot ? "6px solid #101010" : "6px solid #F4F4EE",
              boxShadow: "0 14px 26px rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 30px",
              opacity: Math.min(1, p * 2),
              transform: `translateX(${(1 - p) * 140}px) scale(${0.9 + 0.1 * p})`,
            }}
          >
            <div
              style={{
                fontFamily: VOOM_TITLE_FONT,
                fontWeight: 700,
                fontSize: row.label.length > 10 ? 58 : 76,
                color: row.hot ? VOOM.black : VOOM.offWhite,
                whiteSpace: "nowrap",
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                fontFamily: VOOM_TEXT_FONT,
                fontWeight: 900,
                fontSize: 26,
                letterSpacing: 1,
                textAlign: "right",
                lineHeight: 1.1,
                maxWidth: 230,
                color: row.hot ? VOOM.black : VOOM.lime,
              }}
            >
              {row.seal}
            </div>
          </Abs>
        );
      })}
    </>
  );
};

export const Ascari: React.FC<{
  yearsAt: number;
  countAt: number;
  countDur: number;
}> = ({ yearsAt, countAt, countDur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const years = spr(frame, fps, yearsAt * fps, 10, 190);
  const line = interpolate(
    frame,
    [(yearsAt + 0.2) * fps, (yearsAt + 0.9) * fps],
    [0, 1],
    { ...clampOpts, easing: Easing.out(Easing.cubic) },
  );
  const n = useCount(73, countAt, countDur);
  const nShow = interpolate(
    frame,
    [countAt * fps, (countAt + 0.2) * fps],
    [0, 1],
    clampOpts,
  );
  return (
    <>
      <Cutout
        file="ascari.png"
        name="ALBERTO ASCARI"
        x={10}
        y={20}
        w={320}
        h={420}
        tilt={-2}
        from="left"
      />
      <Abs
        style={{
          left: 360,
          top: 40,
          width: 520,
          opacity: Math.min(1, years * 2),
          transform: `translateY(${(1 - years) * 40}px)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <BigText text="1953" size={104} />
          <BigText text="2026" size={104} color={VOOM.offWhite} />
        </div>
        <div
          style={{
            marginTop: 18,
            height: 14,
            borderRadius: 7,
            background: VOOM.lime,
            border: "3px solid #101010",
            width: `${line * 100}%`,
            boxShadow: "0 8px 14px rgba(0,0,0,0.4)",
          }}
        />
      </Abs>
      <Abs
        style={{
          left: 360,
          top: 220,
          width: 520,
          textAlign: "center",
          opacity: nShow,
        }}
      >
        <BigText text={String(n)} size={190} />
        <BigText
          text="ANOS"
          size={66}
          color={VOOM.offWhite}
          style={{ marginTop: 6 }}
        />
      </Abs>
    </>
  );
};

// --- 6 · CTA ------------------------------------------------------------------------------

const RIVALS = [
  { file: "russell.png", name: "RUSSELL" },
  { file: "hamilton.png", name: "HAMILTON" },
  { file: "verstappen.png", name: "VERSTAPPEN" },
];

export const VersusHeads: React.FC<{ cycleAt: number }> = ({ cycleAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vs = spr(frame, fps, 0.2 * fps, 7, 230);
  const PERIOD = 28;
  const start = cycleAt * fps;
  const k = Math.max(0, Math.floor((frame - start) / PERIOD));
  const rival = RIVALS[k % RIVALS.length];
  const enter = spr(frame - start - k * PERIOD, fps, 0, 10, 230);
  return (
    <>
      <Cutout
        file="kimi.png"
        name="KIMI"
        x={10}
        y={20}
        w={290}
        h={420}
        tilt={-2}
        from="left"
      />
      <Abs
        style={{
          left: 305,
          top: 170,
          transform: `scale(${vs}) rotate(-6deg)`,
          background: VOOM.lime,
          color: VOOM.black,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 100,
          lineHeight: 1,
          padding: "10px 24px",
          borderRadius: 24,
          border: "6px solid #101010",
          boxShadow: "0 14px 24px rgba(0,0,0,0.5)",
          zIndex: 3,
        }}
      >
        VS
      </Abs>
      {frame >= start ? (
        <Abs
          style={{
            left: 560,
            top: 20,
            width: 300,
            height: 420,
            opacity: Math.min(1, enter * 2),
            transform: `translateY(${(1 - enter) * 60}px) scale(${0.85 + 0.15 * enter}) rotate(${2 + Math.sin(frame / 10) * 1.5}deg)`,
          }}
        >
          <div
            key={rival.file}
            style={{ position: "absolute", inset: 0, filter: OUTLINE }}
          >
            <SafeImage file={rival.file} />
          </div>
          <NamePlate text={rival.name} />
        </Abs>
      ) : null}
    </>
  );
};
