import {
  AbsoluteFill,
  Html5Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Area,
  Center,
  FPS,
  HEIGHT,
  SAFE,
  SceneConfig,
  SplitVideo,
  Theme,
  WIDTH,
  sceneRange,
} from "./kit";

// Innova Internet — reels of ~15s, voice-over only (no presenter).
// Narration: "Innova Internet. Planos de até 1000 Mega com Wi-Fi. A melhor
// avaliação da região. Assine já e fale agora com nosso time de vendas."
//
// Facts on screen come from innovafibra.com.br. Brand colors, font and logo
// are the site's own (--font-heading is Inter, logo is public/innova-logo.png).

export type InnovaVideoProps = {
  // File in public/ with the recorded narration, e.g. "narracao.mp3".
  narration?: string;
};

export const INNOVA_VIDEO_DURATION_IN_FRAMES = 15 * FPS;
export const INNOVA_VIDEO_FPS = FPS;
export const INNOVA_VIDEO_SIZE = { width: WIDTH, height: HEIGHT };

const MUTED = "#9689b8";
const ORANGE = "#ff6b00";
const AMBER = "#f5a300";
const PURPLE_DARK = "#1a0a3c";

const FONT = "'Inter', 'Segoe UI', Arial, sans-serif";

const THEME: Theme = {
  ink: "white",
  accent: ORANGE,
  paper: PURPLE_DARK,
  panel: "transparent",
  panelInk: "white",
  panelOutline: PURPLE_DARK,
  font: FONT,
  serif: "'Georgia', 'Times New Roman', serif",
  shadow: "26, 10, 60",
};

// With no presenter, scenes use almost the whole safe area (above the caption).
const SCENE_AREA: Area = { top: SAFE.top, height: 930 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Spring helper that can be called inside a loop (hooks cannot).
const popAt = (frame: number, fps: number, delay: number, damping = 12) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 140 } });

// --- Background -----------------------------------------------------------
// Deep brand purple with drifting glows, a dotted grid and fiber-optic lines
// carrying pulses of light.

const FIBER_PATHS = [
  "M -120 360 C 280 620, 700 120, 1200 520",
  "M -120 760 C 320 460, 760 980, 1200 700",
  "M -120 1180 C 300 1380, 760 900, 1200 1240",
  "M -120 1560 C 360 1320, 720 1800, 1200 1500",
  "M -120 1800 C 300 1700, 800 1980, 1200 1760",
];

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = Math.sin(frame * 0.02) * 60;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(165deg, ${PURPLE_DARK} 0%, #230d52 52%, ${PURPLE_DARK} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${82 + drift / 20}% 88%, rgba(255,107,0,0.32), transparent 46%), radial-gradient(circle at ${14 - drift / 20}% 12%, rgba(120,80,220,0.34), transparent 50%)`,
        }}
      />
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern
            id="dots"
            width="54"
            height="54"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="3" cy="3" r="2.2" fill="white" fillOpacity="0.07" />
          </pattern>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#dots)" />
        {FIBER_PATHS.map((d, i) => {
          const offset = -((frame * (6 + i) + i * 230) % 1000);
          return (
            <g key={d}>
              <path
                d={d}
                fill="none"
                stroke="white"
                strokeOpacity={0.09}
                strokeWidth={3}
              />
              <path
                d={d}
                fill="none"
                stroke={ORANGE}
                strokeWidth={12}
                strokeLinecap="round"
                pathLength={1000}
                strokeDasharray="60 940"
                strokeDashoffset={offset}
                filter="url(#glow)"
              />
              <path
                d={d}
                fill="none"
                stroke={AMBER}
                strokeWidth={5}
                strokeLinecap="round"
                pathLength={1000}
                strokeDasharray="60 940"
                strokeDashoffset={offset}
              />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

// --- Transitions ------------------------------------------------------------
// An orange band sweeps across the screen at every scene change.

const SWIPE_FRAMES = 20;

const Swipe: React.FC<{ boundaries: number[] }> = ({ boundaries }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {boundaries.map((boundary) => {
        const t = interpolate(
          frame,
          [boundary - SWIPE_FRAMES / 2 + 1, boundary + SWIPE_FRAMES / 2 + 1],
          [0, 1],
          clamp,
        );
        if (t <= 0 || t >= 1) {
          return null;
        }
        return (
          <div
            key={boundary}
            style={{
              position: "absolute",
              top: -200,
              bottom: -200,
              width: "62%",
              left: `${-70 + t * 190}%`,
              transform: "skewX(-14deg)",
              background: `linear-gradient(90deg, transparent, ${ORANGE} 30%, ${AMBER} 70%, transparent)`,
              opacity: 0.95,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// --- Scene 1: brand reveal --------------------------------------------------

const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = popAt(frame, fps, 4, 9);
  const tagline = popAt(frame, fps, 26);
  const line = interpolate(frame, [18, 44], [0, 1], clamp);

  return (
    <Center area={SCENE_AREA} designHeight={800}>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {[0, 1, 2].map((i) => {
          const t = ((((frame - 6 - i * 12) % 60) + 60) % 60) / 60;
          const active = frame >= 6 + i * 12;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 520 + t * 520,
                height: 300 + t * 300,
                borderRadius: 120,
                border: `5px solid ${ORANGE}`,
                opacity: active ? (1 - t) * 0.55 : 0,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
        <div
          style={{
            position: "relative",
            padding: "64px 110px",
            borderRadius: 76,
            backgroundColor: "white",
            transform: `scale(${card})`,
            boxShadow: "0 40px 120px rgba(255, 107, 0, 0.45)",
          }}
        >
          <Img
            src={staticFile("innova-logo.png")}
            style={{ height: 270, display: "block" }}
          />
        </div>
      </div>
      <div
        style={{
          width: 620 * line,
          height: 10,
          borderRadius: 5,
          background: `linear-gradient(90deg, ${ORANGE}, ${AMBER})`,
          marginTop: 76,
        }}
      />
      <div
        style={{
          marginTop: 44,
          fontSize: 54,
          fontWeight: 700,
          color: "white",
          opacity: tagline,
          transform: `translateY(${(1 - tagline) * 30}px)`,
        }}
      >
        Fibra óptica em Jaú e região
      </div>
    </Center>
  );
};

// --- Scene 2: speed gauge ---------------------------------------------------

const GAUGE_R = 330;
const GAUGE_PATH = `M ${380 - GAUGE_R} 380 A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${380 + GAUGE_R} 380`;

const WifiWaves: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  // Three arcs light up in sequence, over and over.
  const wave = (i: number) => {
    const phase = (((frame * 0.12 - i * 0.7) % 3) + 3) % 3;
    return 0.25 + 0.75 * Math.max(0, Math.sin(Math.min(Math.PI, phase * 1.2)));
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M2 9a15 15 0 0 1 20 0"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={wave(2)}
      />
      <path
        d="M5.5 12.5a10 10 0 0 1 13 0"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={wave(1)}
      />
      <path
        d="M9 16a5 5 0 0 1 6 0"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity={wave(0)}
      />
      <circle cx="12" cy="19.2" r="1.6" fill="white" />
    </svg>
  );
};

const SpeedScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [8, 54], [0, 1], {
    ...clamp,
    easing: easeOut,
  });
  const label = popAt(frame, fps, 2);
  const chip = popAt(frame, fps, 62, 10);
  const done = popAt(frame, fps, 56, 8);

  return (
    <Center area={SCENE_AREA} designHeight={860}>
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: MUTED,
          opacity: label,
          marginBottom: 10,
        }}
      >
        Planos de até
      </div>
      <div style={{ position: "relative", width: 760, height: 560 }}>
        <svg
          width="760"
          height="430"
          viewBox="0 0 760 430"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={AMBER} />
              <stop offset="100%" stopColor={ORANGE} />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <path
            d={GAUGE_PATH}
            fill="none"
            stroke="white"
            strokeOpacity={0.12}
            strokeWidth={46}
            strokeLinecap="round"
          />
          <path
            d={GAUGE_PATH}
            fill="none"
            stroke={ORANGE}
            strokeWidth={46}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
            opacity={0.6}
            filter="url(#gaugeGlow)"
          />
          <path
            d={GAUGE_PATH}
            fill="none"
            stroke="url(#gauge)"
            strokeWidth={46}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - progress}
          />
          {Array.from({ length: 11 }, (_, i) => {
            const angle = Math.PI - (i / 10) * Math.PI;
            const r1 = GAUGE_R + 44;
            const r2 = GAUGE_R + (i % 5 === 0 ? 70 : 58);
            return (
              <line
                key={i}
                x1={380 + Math.cos(angle) * r1}
                y1={380 - Math.sin(angle) * r1}
                x2={380 + Math.cos(angle) * r2}
                y2={380 - Math.sin(angle) * r2}
                stroke="white"
                strokeOpacity={0.35}
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 215,
            textAlign: "center",
            lineHeight: 1,
            transform: `scale(${1 + 0.06 * (1 - done)})`,
          }}
        >
          <div style={{ fontSize: 205, fontWeight: 900, letterSpacing: -7 }}>
            {Math.round(progress * 1000)}
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: ORANGE,
              marginTop: -4,
            }}
          >
            MEGA
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "24px 56px",
          borderRadius: 70,
          background: `linear-gradient(135deg, ${ORANGE}, ${AMBER})`,
          fontSize: 62,
          fontWeight: 800,
          transform: `scale(${chip})`,
          boxShadow: "0 24px 60px rgba(255, 107, 0, 0.4)",
        }}
      >
        <WifiWaves size={72} />
        Wi-Fi 6 incluso
      </div>
    </Center>
  );
};

// --- Scene 3: rating ----------------------------------------------------------

const RATING = 4.7;
const STAR_PATH =
  "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z";

const StarFill: React.FC<{ index: number; fill: number; size: number }> = ({
  index,
  fill,
  size,
}) => {
  const clipId = `star-clip-${index}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill="white" fillOpacity={0.14} />
      <path d={STAR_PATH} fill={AMBER} clipPath={`url(#${clipId})`} />
    </svg>
  );
};

const QUOTES = [
  "Atendimento sempre nota 10",
  "Tenho há 9 anos e nunca tive problemas",
];

const RatingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const score = interpolate(frame, [4, 36], [0, RATING], {
    ...clamp,
    easing: easeOut,
  });
  const note = popAt(frame, fps, 40);
  const cards = [popAt(frame, fps, 50), popAt(frame, fps, 62)];
  const settle = popAt(frame, fps, 36, 7);

  return (
    <Center area={SCENE_AREA} designHeight={900}>
      <div
        style={{
          fontSize: 300,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -10,
          backgroundImage: `linear-gradient(135deg, ${AMBER}, ${ORANGE})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
          transform: `scale(${1 + 0.05 * (1 - settle)})`,
        }}
      >
        {score.toFixed(1).replace(".", ",")}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <StarFill
            key={i}
            index={i}
            size={116}
            fill={Math.max(0, Math.min(1, score - i))}
          />
        ))}
      </div>
      <div
        style={{ marginTop: 26, fontSize: 52, fontWeight: 800, opacity: note }}
      >
        101 avaliações no Google
      </div>
      <div
        style={{ fontSize: 28, color: MUTED, fontWeight: 600, opacity: note }}
      >
        Innova Ibitinga
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          marginTop: 36,
        }}
      >
        {QUOTES.map((quote, i) => (
          <div
            key={quote}
            style={{
              width: 860,
              padding: "26px 40px",
              boxSizing: "border-box",
              borderRadius: 36,
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: cards[i],
              transform: `translateX(${(1 - cards[i]) * (i === 0 ? -160 : 160)}px)`,
            }}
          >
            <div style={{ color: AMBER, fontSize: 40, letterSpacing: 2 }}>
              ★★★★★
            </div>
            <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.15 }}>
              “{quote}”
            </div>
          </div>
        ))}
      </div>
    </Center>
  );
};

// --- Scene 4: call to action ----------------------------------------------------

const ChatBubbleIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
      fill="white"
    />
    <circle cx="8" cy="11" r="1.3" fill={ORANGE} />
    <circle cx="12" cy="11" r="1.3" fill={ORANGE} />
    <circle cx="16" cy="11" r="1.3" fill={ORANGE} />
  </svg>
);

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = popAt(frame, fps, 4, 9);
  const title = popAt(frame, fps, 16);
  const button = popAt(frame, fps, 30, 9);
  const site = popAt(frame, fps, 46);
  const pulse = 1 + 0.03 * Math.sin(frame * 0.3);

  return (
    <Center area={SCENE_AREA} designHeight={860}>
      <div
        style={{
          padding: "40px 76px",
          borderRadius: 60,
          backgroundColor: "white",
          transform: `scale(${logo})`,
          boxShadow: "0 30px 90px rgba(255, 107, 0, 0.35)",
        }}
      >
        <Img
          src={staticFile("innova-logo.png")}
          style={{ height: 160, display: "block" }}
        />
      </div>
      <div
        style={{
          fontSize: 190,
          fontWeight: 900,
          marginTop: 56,
          lineHeight: 1,
          letterSpacing: -5,
          opacity: title,
          transform: `translateY(${(1 - title) * 50}px)`,
        }}
      >
        Assine <span style={{ color: ORANGE }}>já</span>
      </div>
      <div style={{ position: "relative", marginTop: 60 }}>
        {[0, 1].map((i) => {
          const t = ((((frame - 34 - i * 20) % 60) + 60) % 60) / 60;
          return frame >= 34 + i * 20 ? (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 90,
                border: `5px solid ${ORANGE}`,
                opacity: (1 - t) * 0.7,
                transform: `scale(${1 + t * 0.35})`,
              }}
            />
          ) : null;
        })}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 28,
            fontSize: 66,
            fontWeight: 900,
            padding: "34px 70px",
            borderRadius: 90,
            background: `linear-gradient(135deg, ${ORANGE}, ${AMBER})`,
            opacity: button,
            transform: `scale(${(0.8 + 0.2 * button) * pulse})`,
            boxShadow: "0 28px 70px rgba(255, 107, 0, 0.5)",
          }}
        >
          <ChatBubbleIcon size={80} />
          Fale com vendas
        </div>
      </div>
      <div
        style={{
          marginTop: 50,
          fontSize: 52,
          fontWeight: 800,
          color: MUTED,
          opacity: site,
        }}
      >
        innovafibra.com.br
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 26,
          color: MUTED,
          fontWeight: 500,
          opacity: site,
        }}
      >
        Planos sujeitos à disponibilidade de endereço
      </div>
    </Center>
  );
};

// --- Script -----------------------------------------------------------------------
// Timings are a first guess for the narration; adjust them once it is recorded.
// Sound effects come from public/sfx (see public/sfx/LEIA-ME.md).

const SCENES: SceneConfig[] = [
  {
    startSeconds: 0,
    durationSeconds: 3.2,
    mode: "illFull",
    caption: [{ text: "Innova", highlight: true }, { text: " Internet." }],
    Illustration: BrandScene,
    sfx: [
      { file: "impact.wav", atSeconds: 0.12, volume: 0.8 },
      { file: "sparkle.wav", atSeconds: 0.9, volume: 0.45 },
    ],
  },
  {
    startSeconds: 3.2,
    durationSeconds: 3.8,
    mode: "illFull",
    caption: [
      { text: "Planos de até " },
      { text: "1000 Mega", highlight: true },
      { text: " com Wi-Fi." },
    ],
    Illustration: SpeedScene,
    sfx: [
      { file: "whoosh.wav", atSeconds: 0, volume: 0.55 },
      { file: "riser.wav", atSeconds: 0.2, volume: 0.5 },
      { file: "pop.wav", atSeconds: 2.05, volume: 0.7 },
    ],
  },
  {
    startSeconds: 7,
    durationSeconds: 3.5,
    mode: "illFull",
    caption: [
      { text: "A " },
      { text: "melhor avaliação", highlight: true },
      { text: " da região." },
    ],
    Illustration: RatingScene,
    sfx: [
      { file: "whoosh.wav", atSeconds: 0, volume: 0.55 },
      { file: "sparkle.wav", atSeconds: 0.15, volume: 0.5 },
      { file: "ding.wav", atSeconds: 1.2, volume: 0.6 },
      { file: "pop.wav", atSeconds: 1.65, volume: 0.5 },
      { file: "pop.wav", atSeconds: 2.05, volume: 0.5 },
    ],
  },
  {
    startSeconds: 10.5,
    durationSeconds: 4.5,
    mode: "illFull",
    caption: [
      { text: "Assine já e fale agora com nosso time de " },
      { text: "vendas", highlight: true },
      { text: "." },
    ],
    Illustration: CtaScene,
    sfx: [
      { file: "whoosh.wav", atSeconds: 0, volume: 0.55 },
      { file: "pop.wav", atSeconds: 0.15, volume: 0.6 },
      { file: "pop.wav", atSeconds: 0.55, volume: 0.6 },
      { file: "notification.wav", atSeconds: 1.0, volume: 0.6 },
    ],
  },
];

const BOUNDARIES = SCENES.slice(1).map((scene) => sceneRange(scene).from);

const SwipeOverlay: React.FC = () => <Swipe boundaries={BOUNDARIES} />;

export const InnovaVideo: React.FC<InnovaVideoProps> = ({ narration }) => (
  <>
    <SplitVideo
      scenes={SCENES}
      theme={THEME}
      Background={Background}
      Overlay={SwipeOverlay}
    />
    {narration ? <Html5Audio src={staticFile(narration)} /> : null}
  </>
);
