import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./Background";
import {
  Center,
  FULL_AREA,
  HEIGHT,
  SceneConfig,
  SplitVideo,
  Theme,
  WIDTH,
  usePop,
} from "./kit";

export type UGCVideoProps = {
  characterFolder: string;
  seed?: string;
};

const FPS = 30;
export const UGC_VIDEO_DURATION_IN_FRAMES = 30 * FPS;
export const UGC_VIDEO_FPS = FPS;

const INK = "#3b2f2a";
const MUTED = "#a39a92";
const PINK = "#f0c9c2";
const PINK_STRONG = "#e8836f";
const GREEN = "#cfe0d1";
const GREEN_STRONG = "#5b9a72";
const BLUE = "#c9d9ea";
const BLUE_STRONG = "#4f7fb0";
const PURPLE = "#e6d3ea";
const YELLOW = "#f2e0bd";
const YELLOW_STRONG = "#e0a82e";
const PAPER = "#fffdf9";

const FONT = "'Inter', 'Segoe UI', Arial, sans-serif";

// --- Script --------------------------------------------------------------
// 30 seconds: hook -> why UGC works -> three benefits -> how it works -> CTA.

const SCENES: SceneConfig[] = [
  {
    startSeconds: 0,
    durationSeconds: 4,
    mode: "faceFull",
    caption: [
      { text: "Seu público não confia mais em " },
      { text: "anúncios", highlight: true },
      { text: "." },
    ],
  },
  {
    startSeconds: 4,
    durationSeconds: 5,
    mode: "split",
    caption: [
      { text: "Gente de verdade", highlight: true },
      { text: " convence mais." },
    ],
    Illustration: () => <CompareIllustration />,
  },
  {
    startSeconds: 9,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "Parece " },
      { text: "recomendação", highlight: true },
      { text: ", não anúncio." },
    ],
    Illustration: () => <TrustIllustration />,
  },
  {
    startSeconds: 13,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "Produção " },
      { text: "simples e barata", highlight: true },
      { text: "." },
    ],
    Illustration: () => <CostIllustration />,
  },
  {
    startSeconds: 17,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "Mais variações para " },
      { text: "testar", highlight: true },
      { text: " o que funciona." },
    ],
    Illustration: () => <TestingIllustration />,
  },
  {
    startSeconds: 21,
    durationSeconds: 5,
    mode: "illFull",
    caption: [
      { text: "Grava, aprova, " },
      { text: "roda", highlight: true },
      { text: "." },
    ],
    Illustration: () => <FlowIllustration />,
  },
  {
    startSeconds: 26,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "Comece pequeno. " },
      { text: "Meça. Escale.", highlight: true },
    ],
    Illustration: () => <CallToActionIllustration />,
  },
];

// --- Helpers -------------------------------------------------------------

const Heading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 40,
      fontWeight: 800,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: MUTED,
      marginBottom: 36,
    }}
  >
    {children}
  </div>
);

const Heart: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.5 4.5c2 0 3.7 1.1 4.5 2.7h2c.8-1.6 2.5-2.7 4.5-2.7 3.8 0 5.6 3.9 4.1 7.3C19.5 16.4 12 21 12 21z"
      fill={color}
    />
  </svg>
);

const Star: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z"
      fill={color}
    />
  </svg>
);

// --- Scene 2: advertising vs real people ---------------------------------

const CompareIllustration: React.FC = () => {
  const left = usePop(6);
  const right = usePop(22);
  const cross = interpolate(usePop(44), [0, 1], [0, 1]);
  const heartPulse = 1 + 0.12 * Math.sin(useCurrentFrame() * 0.3);

  const cardStyle = (scale: number): React.CSSProperties => ({
    width: 430,
    height: 540,
    borderRadius: 40,
    padding: 32,
    boxSizing: "border-box",
    transform: `scale(${scale})`,
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  });

  const bar = (width: string, color: string): React.CSSProperties => ({
    width,
    height: 22,
    borderRadius: 11,
    backgroundColor: color,
  });

  return (
    <Center>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ ...cardStyle(left), backgroundColor: "#ece7e1" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={bar("50%", "#d6cfc7")} />
            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: MUTED,
                border: `4px solid ${MUTED}`,
                borderRadius: 12,
                padding: "0 12px",
              }}
            >
              AD
            </div>
          </div>
          <div
            style={{ flex: 1, borderRadius: 24, backgroundColor: "#d6cfc7" }}
          />
          <div style={bar("90%", "#d6cfc7")} />
          <div style={bar("65%", "#d6cfc7")} />
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: MUTED,
              textAlign: "center",
            }}
          >
            Propaganda
          </div>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0 }}
          >
            <line
              x1="14"
              y1="14"
              x2="86"
              y2="86"
              stroke={PINK_STRONG}
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - cross}
            />
            <line
              x1="86"
              y1="14"
              x2="14"
              y2="86"
              stroke={PINK_STRONG}
              strokeWidth="3"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - cross}
            />
          </svg>
        </div>

        <div
          style={{
            ...cardStyle(right),
            backgroundColor: "white",
            boxShadow: "0 24px 50px rgba(80, 60, 50, 0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: PINK,
              }}
            />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={bar("70%", INK)} />
              <div style={bar("45%", PINK)} />
            </div>
          </div>
          <div
            style={{
              flex: 1,
              borderRadius: 24,
              backgroundColor: GREEN,
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <svg width="90" height="90" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="white" fillOpacity={0.85} />
              <path d="M10 7.5l6 4.5-6 4.5z" fill={GREEN_STRONG} />
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ transform: `scale(${heartPulse})` }}>
              <Heart size={52} color={PINK_STRONG} />
            </div>
            <div style={bar("55%", "#e8e1da")} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, textAlign: "center" }}>
            Gente de verdade
          </div>
        </div>
      </div>
    </Center>
  );
};

// --- Scene 3: trust -------------------------------------------------------

const TrustIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const grow = (delay: number, target: number) =>
    target *
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 18, stiffness: 70 },
    });

  const rows = [
    { label: "Anúncio tradicional", width: grow(8, 0.3), color: "#cfc7be" },
    {
      label: "Conteúdo de criador (UGC)",
      width: grow(26, 0.88),
      color: PINK_STRONG,
    },
  ];

  return (
    <Center>
      <Heading>Nível de confiança</Heading>
      <div
        style={{
          width: 860,
          display: "flex",
          flexDirection: "column",
          gap: 44,
        }}
      >
        {rows.map((row) => (
          <div key={row.label}>
            <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 14 }}>
              {row.label}
            </div>
            <div
              style={{
                height: 70,
                borderRadius: 35,
                backgroundColor: "#efe9e2",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${row.width * 100}%`,
                  height: "100%",
                  borderRadius: 35,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{ marginTop: 36, fontSize: 28, color: MUTED, fontWeight: 600 }}
      >
        *ilustrativo
      </div>
    </Center>
  );
};

// --- Scene 4: cost --------------------------------------------------------

const CostIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const drop = (delay: number) =>
    spring({
      frame: frame - delay,
      fps,
      config: { damping: 11, stiffness: 120 },
    });

  const studio = ["Estúdio", "Equipe", "Locação", "Edição", "Equipamento"];
  const studioColors = [BLUE, PURPLE, YELLOW, GREEN, PINK];

  const block = (
    label: string,
    color: string,
    delay: number,
    height: number,
  ): React.ReactNode => {
    const progress = drop(delay);
    return (
      <div
        key={label}
        style={{
          width: 380,
          height,
          borderRadius: 24,
          backgroundColor: color,
          fontSize: 38,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: Math.min(1, progress * 2),
          transform: `translateY(${(1 - progress) * -160}px)`,
        }}
      >
        {label}
      </div>
    );
  };

  return (
    <Center>
      <div style={{ display: "flex", gap: 60, alignItems: "flex-end" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              gap: 10,
            }}
          >
            {studio.map((label, i) =>
              block(label, studioColors[i], 6 + i * 5, 90),
            )}
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: MUTED,
              marginTop: 12,
            }}
          >
            Produção tradicional
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
          }}
        >
          {block("Criador + celular", GREEN, 36, 110)}
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: GREEN_STRONG,
              marginTop: 12,
            }}
          >
            UGC
          </div>
        </div>
      </div>
    </Center>
  );
};

// --- Scene 5: creative testing -------------------------------------------

const TILE_COLORS = [
  PINK,
  GREEN,
  BLUE,
  PURPLE,
  YELLOW,
  PINK,
  GREEN,
  BLUE,
  PURPLE,
];
const WINNER_INDEX = 4;
const WINNER_FRAME = 62;

const TestingIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const winnerProgress = spring({
    frame: frame - WINNER_FRAME,
    fps,
    config: { damping: 10, stiffness: 140 },
  });

  return (
    <Center>
      <Heading>Teste de criativos</Heading>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 200px)",
          gap: 24,
        }}
      >
        {TILE_COLORS.map((color, i) => {
          const pop = spring({
            frame: frame - (4 + i * 4),
            fps,
            config: { damping: 12, stiffness: 150 },
          });
          const isWinner = i === WINNER_INDEX;
          const scale = pop * (isWinner ? 1 + 0.12 * winnerProgress : 1);
          const opacity = isWinner ? 1 : 1 - 0.5 * winnerProgress;

          return (
            <div
              key={i}
              style={{
                height: 200,
                borderRadius: 32,
                backgroundColor: color,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                fontWeight: 900,
                transform: `scale(${scale})`,
                opacity,
                border: isWinner
                  ? `${6 * winnerProgress}px solid ${YELLOW_STRONG}`
                  : "none",
                boxSizing: "border-box",
              }}
            >
              V{i + 1}
              {isWinner ? (
                <div
                  style={{
                    position: "absolute",
                    top: -26,
                    right: -22,
                    transform: `scale(${winnerProgress}) rotate(${(1 - winnerProgress) * 90}deg)`,
                  }}
                >
                  <Star size={84} color={YELLOW_STRONG} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Center>
  );
};

// --- Scene 6: how it works (full screen) ---------------------------------

const FLOW_STEPS = [
  {
    title: "Criador grava",
    subtitle: "no celular, com o seu produto",
    color: PINK,
    strong: PINK_STRONG,
  },
  {
    title: "Você aprova",
    subtitle: "ajusta e libera o conteúdo",
    color: BLUE,
    strong: BLUE_STRONG,
  },
  {
    title: "Anúncio roda",
    subtitle: "tráfego pago e redes sociais",
    color: GREEN,
    strong: GREEN_STRONG,
  },
];

const FlowIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Center area={FULL_AREA} designHeight={1070}>
      <Heading>Como funciona</Heading>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        {FLOW_STEPS.map((step, i) => {
          const pop = spring({
            frame: frame - (10 + i * 28),
            fps,
            config: { damping: 13, stiffness: 130 },
          });
          const arrow = spring({
            frame: frame - (28 + i * 28),
            fps,
            config: { damping: 18, stiffness: 120 },
          });

          return (
            <div key={step.title} style={{ display: "contents" }}>
              <div
                style={{
                  width: 900,
                  height: 250,
                  borderRadius: 48,
                  backgroundColor: step.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 40,
                  padding: "0 56px",
                  boxSizing: "border-box",
                  opacity: pop,
                  transform: `scale(${0.85 + 0.15 * pop})`,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: step.strong,
                    color: "white",
                    fontSize: 64,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 64, fontWeight: 900 }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 600, opacity: 0.7 }}>
                    {step.subtitle}
                  </div>
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 ? (
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  style={{
                    opacity: arrow,
                    transform: `translateY(${(1 - arrow) * -20}px)`,
                  }}
                >
                  <path
                    d="M12 3v15m0 0l-6-6m6 6l6-6"
                    stroke={MUTED}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>
    </Center>
  );
};

// --- Scene 7: call to action ---------------------------------------------

const CallToActionIllustration: React.FC = () => {
  const avatars = [usePop(4), usePop(12), usePop(20)];
  const title = usePop(26);
  const chips = [usePop(38), usePop(48)];
  const avatarColors = [PINK, BLUE, GREEN];

  return (
    <Center>
      <div style={{ display: "flex", marginBottom: 40 }}>
        {avatars.map((scale, i) => (
          <div
            key={i}
            style={{
              width: 190,
              height: 190,
              borderRadius: 95,
              backgroundColor: avatarColors[i],
              border: "8px solid white",
              marginLeft: i === 0 ? 0 : -36,
              transform: `scale(${scale})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={76} color="white" />
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 78,
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.1,
          transform: `scale(${title})`,
          opacity: title,
        }}
      >
        Comece com <span style={{ color: PINK_STRONG }}>3 criadores</span>
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 36 }}>
        {["Meça", "Escale"].map((label, i) => (
          <div
            key={label}
            style={{
              fontSize: 48,
              fontWeight: 800,
              padding: "14px 44px",
              borderRadius: 50,
              backgroundColor: i === 0 ? YELLOW : GREEN,
              transform: `scale(${chips[i]})`,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </Center>
  );
};

// --- Video ----------------------------------------------------------------

const THEME: Theme = {
  ink: INK,
  accent: PINK_STRONG,
  paper: PAPER,
  panel: PAPER,
  panelInk: INK,
  font: FONT,
  serif: "'Georgia', 'Times New Roman', serif",
  shadow: "80, 60, 50",
};

export const UGCVideo: React.FC<UGCVideoProps> = ({
  characterFolder,
  seed = "ugc",
}) => (
  <SplitVideo
    scenes={SCENES}
    theme={THEME}
    Background={Background}
    characterFolder={characterFolder}
    seed={seed}
  />
);

export const UGC_VIDEO_SIZE = { width: WIDTH, height: HEIGHT };
