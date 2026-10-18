import { CSSProperties, ReactNode, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { usePop } from "../kit";
import { VOOM, VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "../themes/voom";

// Motions da metade de cima do vídeo "Creep". Cada um é desenhado numa área de
// 880 x 550 (a área segura de cima), com (0, 0) no canto de cima à esquerda.
// Eles aparecem dentro de <Sequence>, então o tempo (useCurrentFrame) começa
// no zero em cada um.

export const RED = "#FF4D3D"; // só para o que é negativo: carimbo ODEIAM, X, riscos
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

// --- Peças básicas ------------------------------------------------------------

const Abs: React.FC<{ style: CSSProperties; children?: ReactNode }> = ({
  style,
  children,
}) => <div style={{ position: "absolute", ...style }}>{children}</div>;

// Imagem da pasta public/creep. Se o arquivo ainda não existe, mostra um quadro
// de reserva com o nome dele, para a montagem funcionar antes das imagens.
const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(135deg, #2a2a2a, #181818)",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      fontFamily: VOOM_TEXT_FONT,
      fontWeight: 800,
      fontSize: 26,
      letterSpacing: 2,
      color: VOOM.gray,
      padding: 20,
      boxSizing: "border-box",
    }}
  >
    <div>
      <div style={{ fontSize: 60, color: VOOM.lime, marginBottom: 10 }}>＋</div>
      {label}
    </div>
  </AbsoluteFill>
);

export const SafeImage: React.FC<{
  file: string;
  fit?: "cover" | "contain";
}> = ({ file, fit = "cover" }) => {
  const [handle] = useState(() => delayRender(`Imagem ${file}`));
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");
  const finish = (next: "ok" | "missing") => {
    setState(next);
    continueRender(handle);
  };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* <img> de propósito: com <Img> um arquivo que falta derruba o render; aqui o quadro de reserva aparece */}
      {/* eslint-disable-next-line @remotion/warn-native-media-tag */}
      <img
        src={staticFile(`creep/${file}`)}
        onLoad={() => finish("ok")}
        onError={() => finish("missing")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          display: state === "ok" ? "block" : "none",
        }}
      />
      {state === "missing" ? <Placeholder label={file} /> : null}
    </div>
  );
};

type Rect = { x: number; y: number; w: number; h: number };
const PHOTO: Rect = { x: 150, y: 10, w: 580, h: 420 };
const SQUARE_LEFT: Rect = { x: 40, y: 20, w: 380, h: 380 };

// Foto com borda lima e zoom lento (Ken Burns), como pede o roteiro.
const Photo: React.FC<{
  file: string;
  rect?: Rect;
  zoom?: number;
  fit?: "cover" | "contain";
  children?: ReactNode;
}> = ({ file, rect = PHOTO, zoom = 0.08, fit = "cover", children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pop = usePop(0);
  const scale = 1 + (zoom * frame) / Math.max(1, durationInFrames);
  return (
    <Abs
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: 30,
        border: `6px solid ${VOOM.lime}`,
        overflow: "hidden",
        opacity: Math.min(1, pop * 2),
        transform: `scale(${0.88 + 0.12 * pop})`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        backgroundColor: VOOM.black,
      }}
    >
      <div
        style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}
      >
        <SafeImage file={file} fit={fit} />
      </div>
      {children}
    </Abs>
  );
};

const Pill: React.FC<{
  text: string;
  x: number;
  y: number;
  delay?: number;
  size?: number;
}> = ({ text, x, y, delay = 8, size = 52 }) => {
  const p = usePop(delay);
  return (
    <Abs
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${p}) rotate(-3deg)`,
        background: VOOM.lime,
        color: VOOM.black,
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: size,
        padding: "6px 28px 12px",
        borderRadius: 22,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </Abs>
  );
};

export const LowerThird: React.FC<{
  name: string;
  role: string;
  x?: number;
  y?: number;
}> = ({ name, role, x = 150, y = 448 }) => {
  const p = usePop(10);
  return (
    <Abs
      style={{
        left: x,
        top: y,
        display: "flex",
        gap: 18,
        alignItems: "center",
        opacity: p,
        transform: `translateX(${(1 - p) * -90}px)`,
      }}
    >
      <div
        style={{ width: 8, height: 76, borderRadius: 4, background: VOOM.lime }}
      />
      <div>
        <div
          style={{
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 48,
            color: VOOM.offWhite,
            lineHeight: 1,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: VOOM.gray,
            marginTop: 6,
          }}
        >
          {role}
        </div>
      </div>
    </Abs>
  );
};

const Stamp: React.FC<{
  text: string;
  color: string;
  size: number;
  x: number;
  y: number;
  rotate?: number;
  delay?: number;
}> = ({ text, color, size, x, y, rotate = -10, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spr(frame, fps, delay, 7, 230);
  return (
    <Abs
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${2.4 - 1.4 * p})`,
        opacity: Math.min(1, p * 3),
        border: `10px solid ${color}`,
        color,
        borderRadius: 20,
        padding: "4px 30px 10px",
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 4,
        background: "rgba(16,16,16,0.62)",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </Abs>
  );
};

// --- 01 Gancho ------------------------------------------------------------------

export const Vinyl: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  return (
    <Abs
      style={{
        left: 240,
        top: 75,
        width: 400,
        height: 400,
        transform: `scale(${p}) rotate(${frame * 7}deg)`,
      }}
    >
      <svg viewBox="0 0 400 400" width="400" height="400">
        <circle
          cx="200"
          cy="200"
          r="196"
          fill="#0a0a0a"
          stroke={VOOM.gray}
          strokeOpacity={0.4}
          strokeWidth="3"
        />
        {[172, 150, 128, 106].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            fill="none"
            stroke="white"
            strokeOpacity={0.09}
            strokeWidth="2"
          />
        ))}
        <path
          d="M200 200 L330 70 A185 185 0 0 1 382 150 Z"
          fill="white"
          fillOpacity={0.06}
        />
        <circle cx="200" cy="200" r="88" fill={VOOM.lime} />
        <text
          x="200"
          y="217"
          textAnchor="middle"
          fontFamily={VOOM_TITLE_FONT}
          fontWeight="700"
          fontSize="46"
          fill={VOOM.black}
        >
          CREEP
        </text>
        <circle cx="200" cy="200" r="9" fill={VOOM.black} />
      </svg>
    </Abs>
  );
};

export const StampOdeiam: React.FC = () => (
  <Stamp text="ODEIAM" color={RED} size={118} x={440} y={275} rotate={-12} />
);

// --- 02 Origem --------------------------------------------------------------------

export const ThomPhoto: React.FC = () => (
  <>
    <Photo file="thom-jovem.jpg" />
    <LowerThird name="Thom Yorke" role="vocalista" />
  </>
);

export const FimAnos80: React.FC = () => {
  const p = usePop(0);
  return (
    <Abs
      style={{
        right: 0,
        top: 440,
        textAlign: "right",
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: 60,
        lineHeight: 1,
        color: VOOM.lime,
        opacity: p,
        transform: `translateY(${(1 - p) * 60}px)`,
      }}
    >
      FIM DOS
      <br />
      ANOS 80
    </Abs>
  );
};

export const BrokenHeart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dark = interpolate(frame, [0, 14], [0, 0.62], clampOpts);
  const pop = spr(frame, fps, 6, 9);
  const split = spr(frame, fps, 22, 10);
  const path =
    "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.5 4.5c2 0 3.7 1.1 4.5 2.7h2c.8-1.6 2.5-2.7 4.5-2.7 3.8 0 5.6 3.9 4.1 7.3C19.5 16.4 12 21 12 21z";
  return (
    <>
      <Abs
        style={{
          left: PHOTO.x,
          top: PHOTO.y,
          width: PHOTO.w,
          height: PHOTO.h,
          borderRadius: 30,
          background: `rgba(0,0,0,${dark})`,
        }}
      />
      <Abs
        style={{
          left: 440 - 120,
          top: PHOTO.y + 210 - 120,
          width: 240,
          height: 240,
          transform: `scale(${pop})`,
        }}
      >
        <svg viewBox="0 0 24 24" width="240" height="240">
          <defs>
            <clipPath id="hl">
              <rect x="0" y="0" width="12.5" height="24" />
            </clipPath>
            <clipPath id="hr">
              <rect x="11.5" y="0" width="13" height="24" />
            </clipPath>
          </defs>
          <g
            clipPath="url(#hl)"
            transform={`translate(${-0.9 * split} ${0.4 * split}) rotate(${-6 * split} 12 12)`}
          >
            <path d={path} fill={RED} />
          </g>
          <g
            clipPath="url(#hr)"
            transform={`translate(${0.9 * split} ${0.4 * split}) rotate(${6 * split} 12 12)`}
          >
            <path d={path} fill={RED} />
          </g>
        </svg>
      </Abs>
    </>
  );
};

// --- 03 Gravação -------------------------------------------------------------------

export const BandPhoto: React.FC = () => (
  <Photo file="banda-1993.jpg" zoom={0.16} />
);

export const StampOriginal: React.FC = () => (
  <Stamp
    text="ORIGINAL"
    color={VOOM.lime}
    size={74}
    x={300}
    y={140}
    rotate={-9}
  />
);

export const RecTake: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const blink = 0.55 + 0.45 * Math.sin(frame * 0.45);
  const take = usePop(10);
  return (
    <>
      <Abs
        style={{
          left: 560,
          top: 40,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: p,
          background: "rgba(16,16,16,0.72)",
          padding: "10px 22px",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            background: RED,
            opacity: blink,
          }}
        />
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 900,
            fontSize: 34,
            color: VOOM.offWhite,
            letterSpacing: 3,
          }}
        >
          REC
        </div>
      </Abs>
      <Abs
        style={{
          left: 440,
          top: 340,
          transform: `translate(-50%, -50%) scale(${take})`,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 130,
          lineHeight: 1,
          color: VOOM.lime,
          background: "rgba(16,16,16,0.7)",
          padding: "0 34px 14px",
          borderRadius: 26,
          whiteSpace: "nowrap",
        }}
      >
        1 TAKE
      </Abs>
    </>
  );
};

// --- 04 Sabotagem -------------------------------------------------------------------

export const JonnyPhoto: React.FC = () => (
  <>
    <Photo file="jonny.jpg" />
    <LowerThird name="Jonny Greenwood" role="guitarrista" />
  </>
);

export const Bomb: React.FC<{ x?: number; y?: number }> = ({
  x = 600,
  y = 250,
}) => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const flicker = 0.7 + 0.3 * Math.sin(frame * 1.3);
  return (
    <Abs
      style={{
        left: x,
        top: y,
        width: 150,
        height: 190,
        transform: `scale(${p})`,
      }}
    >
      <svg viewBox="0 0 150 190" width="150" height="190">
        <circle
          cx="70"
          cy="120"
          r="60"
          fill="#1c1c1c"
          stroke={VOOM.offWhite}
          strokeWidth="5"
        />
        <path
          d="M32 100a40 40 0 0 1 26-28"
          stroke="white"
          strokeOpacity={0.35}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        <rect x="56" y="48" width="28" height="22" rx="5" fill={VOOM.gray} />
        <path
          d="M70 48c0-22 24-14 36-34"
          stroke={VOOM.offWhite}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <g transform={`translate(106 14) scale(${flicker})`}>
          <path
            d="M0 -20 L5 -5 L20 0 L5 5 L0 20 L-5 5 L-20 0 L-5 -5 Z"
            fill={VOOM.lime}
          />
          <circle r="6" fill={RED} />
        </g>
      </svg>
    </Abs>
  );
};

export const SoundWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = interpolate(frame, [0, 22], [0, 1], clampOpts);
  const fade = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    clampOpts,
  );
  const points: string[] = [];
  for (let i = 0; i <= 88; i++) {
    const x = i * (1000 / 88);
    const amp = 120 * Math.sin((i / 88) * Math.PI) ** 0.7;
    const y =
      275 +
      (i % 2 === 0 ? -1 : 1) *
        amp *
        (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + frame * 0.9)));
    points.push(`${x},${y.toFixed(1)}`);
  }
  return (
    <Abs style={{ left: -60, top: 0, width: 1000, height: 550, opacity: fade }}>
      <svg
        viewBox="0 0 1000 550"
        width="1000"
        height="550"
        style={{ overflow: "visible" }}
      >
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={VOOM.lime}
          strokeWidth="9"
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
        />
      </svg>
    </Abs>
  );
};

export const Trophy: React.FC<{ x?: number; y?: number }> = ({
  x = 600,
  y = 250,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spr(frame, fps, 0, 8);
  const shine = interpolate(frame % 50, [0, 50], [-60, 220]);
  return (
    <Abs
      style={{
        left: x,
        top: y,
        width: 150,
        height: 190,
        transform: `scale(${p}) rotate(${(1 - p) * 20}deg)`,
      }}
    >
      <svg viewBox="0 0 150 190" width="150" height="190">
        <path d="M30 30 H120 V80 A45 45 0 0 1 30 80 Z" fill={VOOM.lime} />
        <path
          d="M30 42 H8 C8 90 30 98 48 100"
          fill="none"
          stroke={VOOM.lime}
          strokeWidth="9"
        />
        <path
          d="M120 42 H142 C142 90 120 98 102 100"
          fill="none"
          stroke={VOOM.lime}
          strokeWidth="9"
        />
        <rect x="68" y="124" width="14" height="30" fill={VOOM.lime} />
        <rect x="42" y="152" width="66" height="22" rx="6" fill={VOOM.lime} />
        <rect
          x={shine}
          y="20"
          width="16"
          height="120"
          fill="white"
          fillOpacity={0.35}
          transform="skewX(-20)"
        />
        <path
          d="M75 48 l6 14 15 1 -12 10 4 15 -13 -8 -13 8 4 -15 -12 -10 15 -1z"
          fill={VOOM.black}
        />
      </svg>
    </Abs>
  );
};

// --- 05 Lançamento -------------------------------------------------------------------

export const SingleCover: React.FC = () => (
  <>
    <Photo file="capa-single-creep.jpg" rect={SQUARE_LEFT} />
    <Pill text="1992" x={230} y={420} />
  </>
);

export const BbcLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const x1 = interpolate(frame, [10, 18], [0, 1], clampOpts);
  const x2 = interpolate(frame, [16, 24], [0, 1], clampOpts);
  return (
    <Abs
      style={{
        left: 480,
        top: 120,
        width: 360,
        height: 220,
        transform: `scale(${p})`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: VOOM.offWhite,
          borderRadius: 26,
          padding: 36,
          boxSizing: "border-box",
        }}
      >
        <SafeImage file="logo-bbc.png" fit="contain" />
      </div>
      <svg
        viewBox="0 0 360 220"
        width="360"
        height="220"
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1="40"
          y1="20"
          x2="320"
          y2="200"
          stroke={RED}
          strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray={1}
          pathLength={1}
          strokeDashoffset={1 - x1}
        />
        <line
          x1="320"
          y1="20"
          x2="40"
          y2="200"
          stroke={RED}
          strokeWidth="22"
          strokeLinecap="round"
          strokeDasharray={1}
          pathLength={1}
          strokeDashoffset={1 - x2}
        />
      </svg>
    </Abs>
  );
};

export const FallingChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [0, 28], [0, 1], clampOpts);
  const big = spr(frame, fps, 26, 9);
  const pts = "10,30 70,60 120,45 180,110 235,95 290,190 345,175 400,290";
  return (
    <>
      <Abs style={{ left: 440, top: 20, width: 420, height: 330 }}>
        <svg viewBox="0 0 420 330" width="420" height="330">
          <line
            x1="0"
            y1="320"
            x2="420"
            y2="320"
            stroke={VOOM.gray}
            strokeOpacity={0.5}
            strokeWidth="3"
          />
          <polyline
            points={pts}
            fill="none"
            stroke={RED}
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - draw}
          />
          <circle
            cx="400"
            cy="290"
            r="12"
            fill={RED}
            opacity={draw > 0.95 ? 1 : 0}
          />
        </svg>
      </Abs>
      <Abs
        style={{
          left: 640,
          top: 440,
          transform: `translate(-50%, -50%) scale(${big})`,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 150,
          lineHeight: 1,
          color: VOOM.lime,
          whiteSpace: "nowrap",
        }}
      >
        #78 UK
      </Abs>
    </>
  );
};

// --- 06 A virada ------------------------------------------------------------------------

export const PabloHoney: React.FC = () => (
  <Photo file="capa-pablo-honey.jpg" rect={SQUARE_LEFT} />
);

export const Seals: React.FC<{ times: [number, number, number] }> = ({
  times,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seals = [
    { text: "#2 ALTERNATIVA", y: 30, rotate: -3, logo: true },
    { text: "#34 HOT 100", y: 170, rotate: 2, logo: false },
    { text: "#7 UK", y: 310, rotate: -2, logo: false },
  ];
  return (
    <>
      {seals.map((seal, i) => {
        const p = spr(frame, fps, times[i], 7, 220);
        return (
          <Abs
            key={seal.text}
            style={{
              left: 440,
              top: seal.y,
              width: 430,
              height: 118,
              transform: `rotate(${seal.rotate}deg) scale(${2.2 - 1.2 * p})`,
              opacity: Math.min(1, p * 3),
              background: VOOM.lime,
              borderRadius: 26,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
            }}
          >
            {seal.logo ? (
              <div
                style={{
                  width: 90,
                  height: 70,
                  background: VOOM.offWhite,
                  borderRadius: 12,
                  padding: 8,
                  boxSizing: "border-box",
                }}
              >
                <SafeImage file="logo-billboard.png" fit="contain" />
              </div>
            ) : null}
            <div
              style={{
                fontFamily: VOOM_TITLE_FONT,
                fontWeight: 700,
                fontSize: seal.logo ? 38 : 62,
                color: VOOM.black,
                whiteSpace: "nowrap",
                paddingBottom: 6,
              }}
            >
              {seal.text}
            </div>
          </Abs>
        );
      })}
    </>
  );
};

// --- 07 Plágio ----------------------------------------------------------------------------

export const Gavel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hit = spr(frame, fps, 4, 14, 260);
  const angle = -55 + 55 * Math.min(1, hit);
  const ring = interpolate(frame, [9, 24], [0, 1], clampOpts);
  return (
    <Abs style={{ left: 440 - 190, top: 275 - 190, width: 380, height: 380 }}>
      <svg
        viewBox="0 0 380 380"
        width="380"
        height="380"
        style={{ overflow: "visible" }}
      >
        <rect x="90" y="285" width="200" height="40" rx="10" fill={VOOM.gray} />
        <rect x="70" y="320" width="240" height="22" rx="8" fill="#4a4a4a" />
        <circle
          cx="190"
          cy="285"
          r={20 + 150 * ring}
          fill="none"
          stroke={VOOM.lime}
          strokeWidth="6"
          opacity={Math.max(0, 1 - ring) * (frame > 8 ? 1 : 0)}
        />
        <g transform={`rotate(${angle} 190 285)`}>
          <rect
            x="178"
            y="95"
            width="24"
            height="190"
            rx="10"
            fill="#8a5a33"
            transform="translate(0 -10)"
          />
          <rect
            x="105"
            y="45"
            width="170"
            height="70"
            rx="16"
            fill={VOOM.lime}
            transform="rotate(0 190 80)"
          />
          <rect
            x="105"
            y="45"
            width="26"
            height="70"
            rx="10"
            fill={VOOM.black}
            fillOpacity={0.35}
          />
          <rect
            x="249"
            y="45"
            width="26"
            height="70"
            rx="10"
            fill={VOOM.black}
            fillOpacity={0.35}
          />
        </g>
      </svg>
    </Abs>
  );
};

export const CoversEquals: React.FC = () => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0.25;
  const eq = usePop(14);
  return (
    <>
      <Photo
        file="capa-air-that-i-breathe.jpg"
        rect={{ x: 30, y: 60, w: 330, h: 330 }}
      />
      <Photo
        file="capa-single-creep.jpg"
        rect={{ x: 520, y: 60, w: 330, h: 330 }}
      />
      <Abs
        style={{
          left: 440,
          top: 225,
          transform: `translate(-50%, -50%) scale(${eq})`,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 150,
          color: VOOM.lime,
          opacity: blink,
          lineHeight: 1,
        }}
      >
        =
      </Abs>
      <Abs
        style={{
          left: 30,
          top: 410,
          width: 330,
          textAlign: "center",
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 4,
          color: VOOM.gray,
        }}
      >
        THE HOLLIES
      </Abs>
      <Abs
        style={{
          left: 520,
          top: 410,
          width: 330,
          textAlign: "center",
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 4,
          color: VOOM.gray,
        }}
      >
        RADIOHEAD
      </Abs>
    </>
  );
};

export const Credits: React.FC = () => {
  const p = usePop(0);
  const l1 = usePop(10);
  const l2 = usePop(34);
  const l3 = usePop(46);
  const line = (
    visible: number,
    text: string,
    color: string,
    size: number,
  ): ReactNode => (
    <div
      style={{
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: size,
        color,
        opacity: visible,
        transform: `translateX(${(1 - visible) * 60}px)`,
        lineHeight: 1.15,
      }}
    >
      {text}
    </div>
  );
  return (
    <Abs
      style={{
        left: 100,
        top: 30,
        width: 680,
        height: 440,
        background: "#1a1a1a",
        border: `4px solid ${VOOM.lime}`,
        borderRadius: 34,
        padding: "34px 44px",
        boxSizing: "border-box",
        transform: `scale(${0.9 + 0.1 * p})`,
        opacity: p,
      }}
    >
      <div
        style={{
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 800,
          fontSize: 28,
          letterSpacing: 8,
          color: VOOM.gray,
          marginBottom: 26,
        }}
      >
        CRÉDITOS
      </div>
      {line(l1, "Thom Yorke & Radiohead", VOOM.offWhite, 54)}
      <div style={{ height: 22 }} />
      {line(l2, "+ Albert Hammond", VOOM.lime, 62)}
      {line(l3, "+ Mike Hazlewood", VOOM.lime, 62)}
    </Abs>
  );
};

// --- 08 Maldição ---------------------------------------------------------------------------

const RollingNumber: React.FC<{ digits: number }> = ({ digits }) => {
  const frame = useCurrentFrame();
  let value = "";
  for (let i = 0; i < digits; i++) {
    value += String(
      Math.floor(Math.abs(Math.sin(frame * 3.7 + i * 12.9)) * 10) % 10,
    );
  }
  return <>{value}</>;
};

export const Crowd: React.FC = () => {
  const p = usePop(8);
  return (
    <>
      <Photo file="plateia.jpg" zoom={0.14} />
      <Abs
        style={{
          left: 520,
          top: 30,
          background: "rgba(16,16,16,0.8)",
          borderRadius: 22,
          padding: "10px 26px 14px",
          opacity: p,
          transform: `scale(${p})`,
        }}
      >
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 6,
            color: VOOM.gray,
          }}
        >
          SHOWS
        </div>
        <div
          style={{
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1,
            color: VOOM.lime,
            minWidth: 190,
          }}
        >
          <RollingNumber digits={3} />
        </div>
      </Abs>
    </>
  );
};

export const Silhouettes: React.FC = () => {
  const frame = useCurrentFrame();
  const door = usePop(0);
  const people = [0, 1, 2, 3, 4, 5];
  return (
    <>
      <Abs
        style={{
          left: 740,
          top: 90,
          width: 120,
          height: 330,
          border: `6px solid ${VOOM.lime}`,
          borderRadius: "16px 16px 0 0",
          background:
            "linear-gradient(180deg, rgba(198,255,26,0.3), rgba(198,255,26,0.05))",
          opacity: door,
        }}
      />
      {people.map((i) => {
        const start = 8 + i * 9;
        const t = interpolate(frame, [start, start + 46], [0, 1], clampOpts);
        const x = 40 + i * 70 + t * (760 - 40 - i * 70);
        const opacity =
          (frame >= start - 6 ? 1 : 0) * (1 - Math.max(0, (t - 0.82) / 0.18));
        return (
          <Abs
            key={i}
            style={{
              left: x,
              top: 250 + (i % 2) * 24,
              width: 80,
              height: 170,
              opacity,
              transform: `translateY(${Math.sin(frame * 0.5 + i) * 4}px)`,
            }}
          >
            <svg viewBox="0 0 80 170" width="80" height="170">
              <circle
                cx="40"
                cy="26"
                r="22"
                fill={VOOM.offWhite}
                fillOpacity={0.75}
              />
              <path
                d="M6 170 C6 100 20 64 40 64 C60 64 74 100 74 170 Z"
                fill={VOOM.offWhite}
                fillOpacity={0.75}
              />
            </svg>
          </Abs>
        );
      })}
    </>
  );
};

export const ThomCrap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bubble = spr(frame, fps, 12, 9);
  const strike = interpolate(frame, [30, 40], [0, 1], clampOpts);
  return (
    <>
      <Photo file="thom-jovem.jpg" rect={{ x: 30, y: 20, w: 400, h: 410 }} />
      <Abs
        style={{
          left: 470,
          top: 80,
          width: 390,
          height: 250,
          transform: `scale(${bubble})`,
          transformOrigin: "left bottom",
        }}
      >
        <svg
          viewBox="0 0 390 250"
          width="390"
          height="250"
          style={{ overflow: "visible" }}
        >
          <path
            d="M20 10 H370 a20 20 0 0 1 20 20 V190 a20 20 0 0 1 -20 20 H110 L40 250 L58 210 H20 a20 20 0 0 1 -20 -20 V30 a20 20 0 0 1 20 -20 Z"
            fill={VOOM.offWhite}
          />
          <text
            x="195"
            y="150"
            textAnchor="middle"
            fontFamily={VOOM_TITLE_FONT}
            fontWeight="700"
            fontSize="124"
            fill={VOOM.black}
          >
            CRAP
          </text>
          <line
            x1="40"
            y1="108"
            x2="350"
            y2="96"
            stroke={RED}
            strokeWidth="14"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - strike}
          />
        </svg>
      </Abs>
    </>
  );
};

export const PalmTree: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fall = spr(frame, fps, 0, 8, 90);
  const treeY = (1 - fall) * -520;
  const t = Math.max(0, frame - 18);
  const bounce = Math.abs(Math.cos(t * 0.17)) * 130 * Math.exp(-t * 0.045);
  const coconutX = 560 + Math.min(t * 5, 150);
  return (
    <>
      <Abs style={{ left: 330, top: 40 + treeY, width: 280, height: 460 }}>
        <svg viewBox="0 0 280 460" width="280" height="460">
          <path
            d="M140 450 C150 330 120 220 150 120"
            fill="none"
            stroke={VOOM.gray}
            strokeWidth="26"
            strokeLinecap="round"
          />
          {[
            "M150 120 C70 70 40 90 10 150",
            "M150 120 C100 40 60 40 30 60",
            "M150 120 C150 40 190 10 230 20",
            "M150 120 C210 70 250 90 270 150",
            "M150 120 C160 70 130 40 100 10",
          ].map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={VOOM.lime}
              strokeWidth="22"
              strokeLinecap="round"
            />
          ))}
          <circle cx="132" cy="140" r="14" fill="#6b4a2f" />
          <circle cx="160" cy="146" r="14" fill="#6b4a2f" />
        </svg>
      </Abs>
      <Abs
        style={{
          left: coconutX,
          top: 430 - bounce,
          width: 46,
          height: 46,
          borderRadius: 23,
          background: "#6b4a2f",
          border: `3px solid ${VOOM.offWhite}`,
          opacity: frame > 14 ? 1 : 0,
          transform: `rotate(${t * 14}deg)`,
        }}
      />
      <Abs
        style={{
          left: 280,
          top: 482,
          width: 520,
          height: 8,
          borderRadius: 4,
          background: VOOM.gray,
          opacity: 0.5,
        }}
      />
    </>
  );
};

// --- 09 Fora do setlist -----------------------------------------------------------------------

export const OkComputer: React.FC = () => (
  <>
    <Photo file="capa-ok-computer.jpg" rect={SQUARE_LEFT} />
    <Pill text="1998" x={230} y={420} />
  </>
);

export const SetlistSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const strike = interpolate(frame, [26, 38], [0, 1], clampOpts);
  const songs = [
    "Airbag",
    "Paranoid Android",
    "Karma Police",
    "Creep",
    "No Surprises",
    "Lucky",
  ];
  return (
    <Abs
      style={{
        left: 470,
        top: 10,
        width: 380,
        height: 500,
        background: VOOM.offWhite,
        borderRadius: 14,
        padding: "26px 30px",
        boxSizing: "border-box",
        transform: `rotate(${3 * p}deg) scale(${p})`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        fontFamily: VOOM_TEXT_FONT,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 36,
          letterSpacing: 8,
          color: VOOM.black,
          borderBottom: `4px solid ${VOOM.black}`,
          paddingBottom: 8,
          marginBottom: 14,
        }}
      >
        SETLIST
      </div>
      {songs.map((song) => (
        <div
          key={song}
          style={{
            position: "relative",
            fontWeight: 800,
            fontSize: 44,
            color: "#2b2b2b",
            lineHeight: 1.55,
          }}
        >
          {song}
          {song === "Creep" ? (
            <div
              style={{
                position: "absolute",
                left: -8,
                top: "52%",
                height: 9,
                width: `${strike * 108}%`,
                background: RED,
                borderRadius: 5,
                transform: "rotate(-2deg)",
              }}
            />
          ) : null}
        </div>
      ))}
    </Abs>
  );
};

export const JonnyQuote: React.FC = () => {
  const p = usePop(0);
  const q = usePop(12);
  return (
    <>
      <Abs
        style={{
          left: 30,
          top: 110,
          width: 240,
          height: 240,
          borderRadius: 120,
          border: `6px solid ${VOOM.lime}`,
          overflow: "hidden",
          opacity: p,
          transform: `scale(${p})`,
        }}
      >
        <SafeImage file="jonny.jpg" />
      </Abs>
      <Abs
        style={{
          left: 310,
          top: 90,
          width: 550,
          opacity: q,
          transform: `translateX(${(1 - q) * 50}px)`,
        }}
      >
        <div
          style={{
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 110,
            lineHeight: 0.7,
            color: VOOM.lime,
          }}
        >
          “
        </div>
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontStyle: "italic",
            fontSize: 50,
            lineHeight: 1.2,
            color: VOOM.offWhite,
          }}
        >
          ele não está mais naquele lugar emocional
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 5,
            color: VOOM.gray,
          }}
        >
          JONNY GREENWOOD
        </div>
      </Abs>
    </>
  );
};

// --- 10 Hoje no palco ----------------------------------------------------------------------------

const MONTHS = ["JAN", "FEV", "MAR", "ABR"];

export const Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const step = Math.min(MONTHS.length - 1, Math.floor(frame / 7));
  const local = frame - step * 7;
  const flip =
    step === MONTHS.length - 1
      ? 1
      : interpolate(local, [0, 5], [0.2, 1], clampOpts);
  const city = usePop(MONTHS.length * 7 + 2);
  return (
    <Abs
      style={{
        left: 190,
        top: 20,
        width: 500,
        height: 480,
        borderRadius: 34,
        background: VOOM.offWhite,
        overflow: "hidden",
        transform: `scale(${p})`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          height: 110,
          background: VOOM.lime,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 80,
          color: VOOM.black,
        }}
      >
        2018
      </div>
      <div
        style={{
          height: 230,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 170,
          color: VOOM.black,
          transform: `scaleY(${flip})`,
        }}
      >
        {MONTHS[step]}
      </div>
      <div
        style={{
          textAlign: "center",
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 900,
          fontSize: 56,
          letterSpacing: 6,
          color: VOOM.black,
          opacity: city,
          transform: `translateY(${(1 - city) * 20}px)`,
        }}
      >
        BOGOTÁ
      </div>
    </Abs>
  );
};

export const Setlist2025: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const songs = [
    "Let Down",
    "Lucky",
    "Nude",
    "Idioteque",
    "Weird Fishes",
    "Pyramid Song",
    "Bodysnatchers",
    "Reckoner",
    "Jigsaw Falling",
    "Exit Music",
    "Optimistic",
    "The National Anthem",
  ];
  const scroll = interpolate(frame, [4, 60], [0, 360], clampOpts);
  const lens = interpolate(frame, [6, 66], [0, 1], clampOpts);
  return (
    <>
      <Abs
        style={{
          left: 250,
          top: 10,
          width: 380,
          height: 500,
          background: VOOM.offWhite,
          borderRadius: 14,
          overflow: "hidden",
          transform: `scale(${p})`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          fontFamily: VOOM_TEXT_FONT,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 78,
            bottom: 0,
            overflow: "hidden",
            padding: "0 28px",
          }}
        >
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            {songs.map((song) => (
              <div
                key={song}
                style={{
                  fontWeight: 800,
                  fontSize: 38,
                  color: "#2b2b2b",
                  lineHeight: 1.6,
                  whiteSpace: "nowrap",
                }}
              >
                {song}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 78,
            background: VOOM.offWhite,
            borderBottom: `4px solid ${VOOM.black}`,
            padding: "20px 28px 0",
            boxSizing: "border-box",
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: 5,
            whiteSpace: "nowrap",
            color: VOOM.black,
          }}
        >
          SETLIST 2025
        </div>
      </Abs>
      <Abs
        style={{
          left: 520 + lens * 40,
          top: 80 + lens * 330,
          width: 150,
          height: 150,
          transform: `scale(${p})`,
        }}
      >
        <svg viewBox="0 0 150 150" width="150" height="150">
          <circle
            cx="62"
            cy="62"
            r="46"
            fill="rgba(198,255,26,0.18)"
            stroke={VOOM.lime}
            strokeWidth="12"
          />
          <line
            x1="96"
            y1="96"
            x2="140"
            y2="140"
            stroke={VOOM.lime}
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>
      </Abs>
    </>
  );
};

// --- 11 Os números ----------------------------------------------------------------------------------

export const NumbersLeft: React.FC = () => {
  const p = usePop(0);
  return (
    <Abs
      style={{
        left: 20,
        top: 110,
        width: 380,
        opacity: 0.55 * p + 0.0,
        transform: `translateX(${(1 - p) * -60}px)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 6,
          color: VOOM.gray,
        }}
      >
        1993
      </div>
      <div
        style={{
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 110,
          lineHeight: 1,
          color: VOOM.gray,
        }}
      >
        #34
      </div>
    </Abs>
  );
};

export const NumbersRight: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const value = interpolate(frame, [6, 44], [0, 3], {
    ...clampOpts,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  return (
    <Abs
      style={{
        left: 420,
        top: 20,
        width: 460,
        transform: `scale(${p})`,
        textAlign: "center",
      }}
    >
      <div style={{ width: 280, height: 90, margin: "0 auto 4px" }}>
        <SafeImage file="logo-spotify.png" fit="contain" />
      </div>
      <div
        style={{
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 210,
          lineHeight: 1,
          color: VOOM.lime,
        }}
      >
        ~{value.toFixed(value >= 3 ? 0 : 1)}{" "}
        <span style={{ fontSize: 120 }}>BI</span>
      </div>
      <div
        style={{
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 5,
          color: VOOM.offWhite,
        }}
      >
        REPRODUÇÕES HOJE
      </div>
    </Abs>
  );
};

// --- 12 CTA ---------------------------------------------------------------------------------------------

export const HeartPulse: React.FC<{ size?: number }> = ({ size = 300 }) => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const beat = 1 + 0.12 * Math.max(0, Math.sin(frame * 0.42)) ** 2;
  return (
    <div style={{ width: size, height: size, transform: `scale(${p * beat})` }}>
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path
          d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.5 4.5c2 0 3.7 1.1 4.5 2.7h2c.8-1.6 2.5-2.7 4.5-2.7 3.8 0 5.6 3.9 4.1 7.3C19.5 16.4 12 21 12 21z"
          fill={VOOM.lime}
        />
      </svg>
    </div>
  );
};

export const CommentBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0);
  const dots = [0, 1, 2].map(
    (i) => 0.35 + 0.65 * Math.max(0, Math.sin(frame * 0.35 - i * 0.8)),
  );
  return (
    <Abs
      style={{
        left: 190,
        top: 40,
        width: 500,
        height: 330,
        transform: `scale(${p}) rotate(-2deg)`,
        transformOrigin: "bottom left",
      }}
    >
      <svg viewBox="0 0 500 330" width="500" height="330">
        <path
          d="M30 0 H470 a30 30 0 0 1 30 30 V240 a30 30 0 0 1 -30 30 H150 L60 330 L80 270 H30 a30 30 0 0 1 -30 -30 V30 A30 30 0 0 1 30 0 Z"
          fill={VOOM.lime}
        />
        <rect
          x="50"
          y="50"
          width="330"
          height="26"
          rx="13"
          fill={VOOM.black}
          fillOpacity={0.8}
        />
        <rect
          x="50"
          y="100"
          width="400"
          height="26"
          rx="13"
          fill={VOOM.black}
          fillOpacity={0.5}
        />
        {dots.map((o, i) => (
          <circle
            key={i}
            cx={80 + i * 52}
            cy="200"
            r="16"
            fill={VOOM.black}
            fillOpacity={o}
          />
        ))}
      </svg>
    </Abs>
  );
};

export const FollowButton: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spr(frame, fps, 0, 10);
  const tapT = frame - 24;
  const press = tapT > 0 && tapT < 8 ? 0.94 : 1;
  const ripple = interpolate(tapT, [0, 20], [0, 1], clampOpts);
  return (
    <Abs
      style={{
        left: 440,
        top: 440,
        transform: `translate(-50%, -50%) scale(${p * press})`,
      }}
    >
      <div
        style={{
          background: VOOM.lime,
          color: VOOM.black,
          borderRadius: 70,
          padding: "22px 56px 30px",
          textAlign: "center",
          boxShadow: "0 22px 50px rgba(198,255,26,0.25)",
        }}
      >
        <div
          style={{
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 74,
            lineHeight: 1,
          }}
        >
          Seguir
        </div>
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 900,
            fontSize: 38,
            marginTop: 4,
          }}
        >
          @marcosoliveiran
        </div>
      </div>
      {tapT > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 360,
              top: 60,
              width: 80,
              height: 80,
              borderRadius: 40,
              border: `5px solid ${VOOM.offWhite}`,
              transform: `translate(-50%, -50%) scale(${0.6 + ripple * 1.4})`,
              opacity: 1 - ripple,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 360,
              top: 60,
              width: 46,
              height: 46,
              borderRadius: 23,
              background: VOOM.offWhite,
              transform: `translate(-50%, -50%) scale(${press === 1 ? 1 : 0.8})`,
              opacity: 0.92,
            }}
          />
        </>
      ) : null}
    </Abs>
  );
};
