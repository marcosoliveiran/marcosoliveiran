import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
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
  WIDTH,
  sceneRange,
} from "./kit";
import {
  VOOM,
  VOOM_TEXT_FONT,
  VOOM_THEME,
  VOOM_TITLE_FONT,
} from "./themes/voom";

// Base template in the voom identity ("Direção 1: Energia"): black base,
// lime for what matters most, off-white for breathing room, Fredoka Bold for
// titles and Nunito for text. The copy below is placeholder text that shows
// the components; swap it for the real script.

export const VOOM_BASE_DURATION_IN_FRAMES = 9 * FPS;
export const VOOM_BASE_FPS = FPS;
export const VOOM_BASE_SIZE = { width: WIDTH, height: HEIGHT };

const SCENE_AREA: Area = { top: SAFE.top, height: 930 };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const popAt = (frame: number, fps: number, delay: number, damping = 12) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 150 } });

// --- Background: black with fast lime and off-white streaks ------------------

const STREAKS = Array.from({ length: 18 }, (_, i) => ({
  y: random(`voom-y-${i}`) * HEIGHT,
  length: 220 + random(`voom-l-${i}`) * 520,
  speed: 16 + random(`voom-s-${i}`) * 26,
  offset: random(`voom-x-${i}`) * 3000,
  thickness: 3 + random(`voom-h-${i}`) * 6,
  lime: random(`voom-c-${i}`) > 0.62,
}));

const Background: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: VOOM.black, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 88% 92%, rgba(198,255,26,0.16), transparent 46%)",
        }}
      />
      {STREAKS.map((streak, i) => {
        const travel = WIDTH + streak.length + 400;
        const x =
          ((frame * streak.speed + streak.offset) % travel) -
          streak.length -
          200;
        const color = streak.lime ? VOOM.lime : VOOM.offWhite;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: streak.y,
              left: x,
              width: streak.length,
              height: streak.thickness,
              borderRadius: streak.thickness,
              background: `linear-gradient(90deg, transparent, ${color})`,
              opacity: streak.lime ? 0.55 : 0.1,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// --- Transition: a lime band cutting across the screen -----------------------

const SWIPE_FRAMES = 14;

const Swipe: React.FC<{ boundaries: number[] }> = ({ boundaries }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {boundaries.map((boundary) => {
        const t = interpolate(
          frame,
          [boundary - SWIPE_FRAMES / 2, boundary + SWIPE_FRAMES / 2],
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
              width: "55%",
              left: `${-65 + t * 185}%`,
              transform: "skewX(-16deg)",
              backgroundColor: VOOM.lime,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// --- Scene 1: hook title ----------------------------------------------------------

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: VOOM_TEXT_FONT,
      fontSize: 38,
      fontWeight: 800,
      letterSpacing: 8,
      textTransform: "uppercase",
      color: VOOM.gray,
      marginBottom: 44,
    }}
  >
    {children}
  </div>
);

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const first = popAt(frame, fps, 4);
  const second = popAt(frame, fps, 12);
  const marker = popAt(frame, fps, 20, 9);

  return (
    <Center area={SCENE_AREA} designHeight={700}>
      <Tag>modelo</Tag>
      <div
        style={{
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 210,
          lineHeight: 1,
          letterSpacing: -6,
          color: VOOM.offWhite,
          opacity: first,
          transform: `translateX(${(1 - first) * -260}px)`,
        }}
      >
        o gancho
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 34,
          marginTop: 14,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 210,
          lineHeight: 1,
          letterSpacing: -6,
          color: VOOM.offWhite,
          opacity: second,
          transform: `translateX(${(1 - second) * 260}px)`,
        }}
      >
        vem
        <span
          style={{
            backgroundColor: VOOM.lime,
            color: VOOM.black,
            padding: "6px 40px 22px",
            borderRadius: 40,
            transform: `rotate(${-2.5 * marker}deg) scale(${0.7 + 0.3 * marker})`,
            display: "inline-block",
          }}
        >
          aqui
        </span>
      </div>
    </Center>
  );
};

// --- Scene 2: big number ------------------------------------------------------------

const StatScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const value = Math.round(
    interpolate(frame, [4, 34], [0, 127], {
      ...clamp,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }),
  );
  const bar = interpolate(frame, [10, 38], [0, 1], clamp);
  const text = popAt(frame, fps, 30);

  return (
    <Center area={SCENE_AREA} designHeight={700}>
      <Tag>modelo · número</Tag>
      <div
        style={{
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 360,
          lineHeight: 1,
          letterSpacing: -12,
          color: VOOM.lime,
        }}
      >
        +{value}%
      </div>
      <div
        style={{
          width: 780 * bar,
          height: 22,
          borderRadius: 11,
          backgroundColor: VOOM.lime,
          marginTop: 36,
        }}
      />
      <div
        style={{
          marginTop: 48,
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 800,
          fontSize: 60,
          color: VOOM.offWhite,
          opacity: text,
          transform: `translateY(${(1 - text) * 30}px)`,
        }}
      >
        texto de apoio em Nunito
      </div>
    </Center>
  );
};

// --- Scene 3: call to action ------------------------------------------------------------

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = popAt(frame, fps, 4, 9);
  const handle = popAt(frame, fps, 22);
  const pulse = 1 + 0.025 * Math.sin(frame * 0.35);

  return (
    <Center area={SCENE_AREA} designHeight={700}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 44,
          padding: "70px 80px",
          borderRadius: 90,
          backgroundColor: VOOM.lime,
          color: VOOM.black,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 130,
          lineHeight: 1,
          letterSpacing: -3,
          transform: `scale(${(0.8 + 0.2 * card) * pulse})`,
          opacity: card,
        }}
      >
        siga
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12h15m0 0l-6-6m6 6l-6 6"
            stroke={VOOM.black}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        style={{
          marginTop: 56,
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 900,
          fontSize: 66,
          color: VOOM.offWhite,
          opacity: handle,
          transform: `translateY(${(1 - handle) * 30}px)`,
        }}
      >
        @marcosoliveiran
      </div>
    </Center>
  );
};

// --- Script ----------------------------------------------------------------------------------

const SCENES: SceneConfig[] = [
  {
    startSeconds: 0,
    durationSeconds: 3,
    mode: "illFull",
    caption: [
      { text: "Mensagem " },
      { text: "principal", highlight: true },
      { text: " em poucas palavras." },
    ],
    Illustration: HookScene,
    sfx: [
      { file: "impact.wav", atSeconds: 0.1, volume: 0.7 },
      { file: "pop.wav", atSeconds: 0.7, volume: 0.6 },
    ],
  },
  {
    startSeconds: 3,
    durationSeconds: 3,
    mode: "illFull",
    captionStyle: "minimal",
    caption: [
      { text: "Um número que " },
      { text: "prova", highlight: true },
      { text: " o ponto." },
    ],
    Illustration: StatScene,
    sfx: [
      { file: "whoosh.wav", atSeconds: 0, volume: 0.5 },
      { file: "riser.wav", atSeconds: 0.1, volume: 0.45 },
      { file: "ding.wav", atSeconds: 1.2, volume: 0.5 },
    ],
  },
  {
    startSeconds: 6,
    durationSeconds: 3,
    mode: "illFull",
    captionStyle: "card",
    caption: [
      { text: "Siga para ver " },
      { text: "mais", highlight: true },
      { text: "." },
    ],
    Illustration: CtaScene,
    sfx: [
      { file: "whoosh.wav", atSeconds: 0, volume: 0.5 },
      { file: "pop.wav", atSeconds: 0.15, volume: 0.6 },
      { file: "notification.wav", atSeconds: 0.7, volume: 0.5 },
    ],
  },
];

const BOUNDARIES = SCENES.slice(1).map((scene) => sceneRange(scene).from);

const SwipeOverlay: React.FC = () => <Swipe boundaries={BOUNDARIES} />;

export const VoomBase: React.FC = () => (
  <SplitVideo
    scenes={SCENES}
    theme={VOOM_THEME}
    Background={Background}
    Overlay={SwipeOverlay}
  />
);
