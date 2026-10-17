import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Center,
  FPS,
  FULL_AREA,
  HEIGHT,
  SceneConfig,
  SplitVideo,
  Theme,
  WIDTH,
  usePop,
} from "./kit";

// Innova Internet — "Chat, qual a melhor internet de Jaú e região?"
// Every claim on screen comes from innovafibra.com.br. Brand colors, font and
// logo are the site's own (--font-heading is Inter, logo is
// public/innova-logo.png).

export type InnovaVideoProps = {
  characterFolder: string;
  seed?: string;
};

export const INNOVA_VIDEO_DURATION_IN_FRAMES = 30 * FPS;
export const INNOVA_VIDEO_FPS = FPS;
export const INNOVA_VIDEO_SIZE = { width: WIDTH, height: HEIGHT };

const PURPLE_DARK = "#1a0a3c";
const PURPLE_MID = "#2d2640";
const MUTED = "#9689b8";
const ORANGE = "#ff6b00";
const AMBER = "#f5a300";
const LAVENDER = "#e7e5fe";
const PAPER = "#fffaf5";

const FONT = "'Inter', 'Segoe UI', Arial, sans-serif";

const THEME: Theme = {
  ink: PURPLE_DARK,
  accent: ORANGE,
  paper: PAPER,
  panel: PURPLE_DARK,
  panelInk: "white",
  font: FONT,
  serif: "'Georgia', 'Times New Roman', serif",
  shadow: "26, 10, 60",
};

// --- Background -----------------------------------------------------------
// Light paper with soft brand glows and a few fiber-optic lines that carry
// moving pulses of light.

const FIBER_PATHS = [
  "M -100 1560 C 300 1360, 700 1760, 1200 1160",
  "M -100 1760 C 400 1500, 800 1900, 1200 1400",
  "M -100 240 C 300 460, 700 60, 1200 380",
];

const InnovaBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: PAPER }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 92% 8%, rgba(255,107,0,0.16), transparent 42%), radial-gradient(circle at 6% 94%, rgba(150,137,184,0.2), transparent 46%)",
        }}
      />
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {FIBER_PATHS.map((d, i) => (
          <g key={d}>
            <path
              d={d}
              fill="none"
              stroke={MUTED}
              strokeOpacity={0.25}
              strokeWidth={3}
            />
            <path
              d={d}
              fill="none"
              stroke={ORANGE}
              strokeOpacity={0.75}
              strokeWidth={6}
              strokeLinecap="round"
              pathLength={1000}
              strokeDasharray="70 930"
              strokeDashoffset={-((frame * 7 + i * 340) % 1000)}
            />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// --- Helpers ----------------------------------------------------------------

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontSize: 38,
      fontWeight: 800,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: MUTED,
      marginBottom: 34,
    }}
  >
    {children}
  </div>
);

const Check: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill={ORANGE} />
    <path
      d="M6.5 12.5l3.6 3.6 7.4-7.6"
      stroke="white"
      strokeWidth="2.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Spring helper that can be called inside a loop (hooks cannot).
const popAt = (frame: number, fps: number, delay: number) =>
  spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// --- Scene 2: the "chat" answer ---------------------------------------------

const QUESTION = "Qual a melhor internet de Jaú e região?";
const TYPING_START = 4;
const TYPING_END = 40;
const THINKING_START = 46;
const ANSWER_START = 68;

const ChatIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const typedCount = Math.floor(
    interpolate(frame, [TYPING_START, TYPING_END], [0, QUESTION.length], clamp),
  );
  const caretVisible =
    Math.floor(frame / 8) % 2 === 0 && frame < THINKING_START;
  const thinking = frame >= THINKING_START && frame < ANSWER_START;
  const answer = usePop(ANSWER_START);

  return (
    <Center>
      <div
        style={{
          width: 900,
          height: 560,
          display: "flex",
          flexDirection: "column",
          gap: 36,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              maxWidth: 780,
              minHeight: 130,
              padding: "30px 40px",
              borderRadius: "40px 40px 10px 40px",
              backgroundColor: LAVENDER,
              color: PURPLE_DARK,
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {QUESTION.slice(0, typedCount)}
            <span style={{ opacity: caretVisible ? 1 : 0, color: ORANGE }}>
              |
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 22,
            alignItems: "flex-start",
            height: 260,
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              backgroundColor: ORANGE,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: frame >= THINKING_START ? 1 : 0,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                d="M12 2l2.2 6.3L20.5 10l-6.3 1.7L12 18l-2.2-6.3L3.5 10l6.3-1.7z"
                fill="white"
              />
            </svg>
          </div>

          {thinking ? (
            <div
              style={{
                display: "flex",
                gap: 14,
                padding: "34px 40px",
                borderRadius: "10px 40px 40px 40px",
                backgroundColor: PURPLE_MID,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: MUTED,
                    transform: `translateY(${Math.sin(frame * 0.4 - i * 0.9) * -8}px)`,
                  }}
                />
              ))}
            </div>
          ) : null}

          {frame >= ANSWER_START ? (
            <div
              style={{
                padding: "28px 40px",
                borderRadius: "10px 40px 40px 40px",
                backgroundColor: "white",
                transform: `scale(${0.85 + 0.15 * answer})`,
                transformOrigin: "left top",
                opacity: answer,
              }}
            >
              <Img
                src={staticFile("innova-logo.png")}
                style={{ height: 96, display: "block" }}
              />
              <div
                style={{
                  marginTop: 14,
                  fontSize: 38,
                  fontWeight: 700,
                  color: PURPLE_MID,
                }}
              >
                Fibra óptica em Jaú e região
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Center>
  );
};

// --- Scene 3: reasons ---------------------------------------------------------

const REASONS = [
  { title: "100% fibra óptica", detail: "Conexão estável, sem quedas" },
  { title: "Wi-Fi 6 incluso", detail: "Roteador na instalação" },
  { title: "Instalação grátis", detail: "Sem taxa de adesão" },
];

const ReasonsIllustration: React.FC = () => {
  const pops = [usePop(6), usePop(22), usePop(38)];

  return (
    <Center>
      <Label>Por que a Innova</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {REASONS.map((reason, i) => (
          <div
            key={reason.title}
            style={{
              width: 900,
              height: 148,
              padding: "0 44px",
              boxSizing: "border-box",
              borderRadius: 40,
              backgroundColor: PURPLE_MID,
              display: "flex",
              alignItems: "center",
              gap: 34,
              opacity: pops[i],
              transform: `translateX(${(1 - pops[i]) * 80}px)`,
            }}
          >
            <Check size={76} />
            <div>
              <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.1 }}>
                {reason.title}
              </div>
              <div style={{ fontSize: 34, fontWeight: 500, color: MUTED }}>
                {reason.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Center>
  );
};

// --- Scene 4: plans (full screen) ----------------------------------------------

const SPEEDS = [400, 600, 800, 1000];
const PLAN_PERKS = [
  "Wi-Fi 6 incluso",
  "Canais inclusos",
  "Sem franquia de dados",
];

const PlansIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const card = usePop(4);
  const price = Math.round(interpolate(frame, [8, 36], [0, 89], clamp));
  const perks = [usePop(30), usePop(38), usePop(46)];
  const speeds = [usePop(56), usePop(62), usePop(68), usePop(74)];

  return (
    <Center area={FULL_AREA} designHeight={860}>
      <Label>Planos a partir de</Label>
      <div
        style={{
          width: 880,
          padding: "52px 0 46px",
          borderRadius: 64,
          background: `linear-gradient(135deg, ${ORANGE}, ${AMBER})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
          transform: `scale(${0.85 + 0.15 * card})`,
          opacity: card,
          boxShadow: "0 30px 70px rgba(255, 107, 0, 0.35)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "flex-start", lineHeight: 1 }}
        >
          <span style={{ fontSize: 66, fontWeight: 800, marginTop: 34 }}>
            R$
          </span>
          <span style={{ fontSize: 250, fontWeight: 900, letterSpacing: -9 }}>
            {price}
          </span>
          <span style={{ fontSize: 100, fontWeight: 900, marginTop: 34 }}>
            ,90
          </span>
          <span
            style={{
              fontSize: 46,
              fontWeight: 700,
              alignSelf: "flex-end",
              marginBottom: 20,
            }}
          >
            /mês
          </span>
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, marginTop: 6 }}>
          400 mega
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
        {PLAN_PERKS.map((perk, i) => (
          <div
            key={perk}
            style={{
              fontSize: 30,
              fontWeight: 700,
              padding: "14px 22px",
              borderRadius: 40,
              backgroundColor: PURPLE_MID,
              whiteSpace: "nowrap",
              opacity: perks[i],
              transform: `translateY(${(1 - perks[i]) * 30}px)`,
            }}
          >
            {perk}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 40,
          fontSize: 32,
          fontWeight: 700,
          color: MUTED,
          opacity: speeds[0],
        }}
      >
        Também disponível em
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginTop: 16,
        }}
      >
        {SPEEDS.map((speed, i) => (
          <div
            key={speed}
            style={{
              fontSize: 40,
              fontWeight: 900,
              padding: "12px 26px",
              borderRadius: 24,
              border: `4px solid ${ORANGE}`,
              color: ORANGE,
              opacity: speeds[i],
              transform: `scale(${speeds[i]})`,
            }}
          >
            {speed}
          </div>
        ))}
        <div
          style={{ fontSize: 34, fontWeight: 700, color: MUTED, marginLeft: 6 }}
        >
          mega
        </div>
      </div>
    </Center>
  );
};

// --- Scene 5: support, activation, reviews ------------------------------------------

const STATS = [
  { value: "24h", label: "Suporte todos os dias", note: "" },
  { value: "24–48h", label: "Para ativar", note: "conforme disponibilidade" },
  {
    value: "4,7★",
    label: "No Google",
    note: "101 avaliações · Innova Ibitinga",
  },
];

const StatsIllustration: React.FC = () => {
  const pops = [usePop(6), usePop(20), usePop(34)];

  return (
    <Center>
      <div style={{ display: "flex", gap: 24 }}>
        {STATS.map((stat, i) => (
          <div
            key={stat.value}
            style={{
              width: 290,
              height: 420,
              borderRadius: 48,
              backgroundColor: PURPLE_MID,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 18px",
              boxSizing: "border-box",
              opacity: pops[i],
              transform: `translateY(${(1 - pops[i]) * 70}px)`,
            }}
          >
            <div
              style={{
                fontSize: stat.value.length > 4 ? 62 : 104,
                whiteSpace: "nowrap",
                fontWeight: 900,
                color: ORANGE,
                lineHeight: 1,
                letterSpacing: -2,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: 38,
                fontWeight: 800,
                marginTop: 18,
                lineHeight: 1.15,
              }}
            >
              {stat.label}
            </div>
            {stat.note ? (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: MUTED,
                  marginTop: 14,
                }}
              >
                {stat.note}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Center>
  );
};

// --- Scene 6: coverage ----------------------------------------------------------------

const CITIES = [
  "Jaú",
  "Dois Córregos",
  "Barra Bonita",
  "Igaraçu do Tietê",
  "Pederneiras",
  "Ibitinga",
  "Borborema",
  "Agudos",
];

const CoverageIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Center>
      <Label>Onde a Innova chega</Label>
      <div
        style={{
          width: 900,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 20,
        }}
      >
        {CITIES.map((city, i) => {
          const pop = popAt(frame, fps, 4 + i * 6);
          const isMain = i === 0;
          return (
            <div
              key={city}
              style={{
                fontSize: isMain ? 64 : 46,
                fontWeight: 800,
                padding: isMain ? "18px 56px" : "14px 36px",
                borderRadius: 60,
                backgroundColor: isMain ? ORANGE : PURPLE_MID,
                opacity: pop,
                transform: `scale(${0.7 + 0.3 * pop})`,
              }}
            >
              {city}
            </div>
          );
        })}
      </div>
      <div
        style={{ fontSize: 30, color: MUTED, fontWeight: 600, marginTop: 36 }}
      >
        Confirme pelo seu CEP no site
      </div>
    </Center>
  );
};

// --- Scene 7: call to action (full screen) ------------------------------------------------

const CtaIllustration: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = usePop(4);
  const title = usePop(20);
  const button = usePop(36);
  const pulse = 1 + 0.035 * Math.sin(frame * 0.3);

  return (
    <Center area={FULL_AREA} designHeight={760}>
      <div
        style={{
          padding: "44px 72px",
          borderRadius: 56,
          backgroundColor: "white",
          transform: `scale(${logo})`,
        }}
      >
        <Img
          src={staticFile("innova-logo.png")}
          style={{ height: 170, display: "block" }}
        />
      </div>
      <div
        style={{
          fontSize: 130,
          fontWeight: 900,
          marginTop: 64,
          lineHeight: 1,
          opacity: title,
          transform: `translateY(${(1 - title) * 40}px)`,
        }}
      >
        Assine <span style={{ color: ORANGE }}>já</span>
      </div>
      <div
        style={{
          marginTop: 56,
          fontSize: 64,
          fontWeight: 900,
          padding: "30px 64px",
          borderRadius: 80,
          backgroundColor: ORANGE,
          opacity: button,
          transform: `scale(${(0.8 + 0.2 * button) * pulse})`,
          boxShadow: "0 24px 60px rgba(255, 107, 0, 0.45)",
        }}
      >
        innovafibra.com.br
      </div>
      <div
        style={{ marginTop: 44, fontSize: 28, color: MUTED, fontWeight: 500 }}
      >
        Planos sujeitos à disponibilidade de endereço
      </div>
    </Center>
  );
};

// --- Script ------------------------------------------------------------------------------------
// Timings are a first guess for a ~30s narration; adjust them once the voice
// is recorded.

const SCENES: SceneConfig[] = [
  {
    startSeconds: 0,
    durationSeconds: 4,
    mode: "faceFull",
    caption: [
      { text: "Chat, qual a " },
      { text: "melhor internet", highlight: true },
      { text: " de Jaú e região?" },
    ],
  },
  {
    startSeconds: 4,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "A resposta? " },
      { text: "Innova", highlight: true },
      { text: " Internet." },
    ],
    Illustration: ChatIllustration,
  },
  {
    startSeconds: 8,
    durationSeconds: 4.5,
    mode: "split",
    caption: [
      { text: "Fibra óptica e instalação " },
      { text: "grátis", highlight: true },
      { text: "." },
    ],
    Illustration: ReasonsIllustration,
  },
  {
    startSeconds: 12.5,
    durationSeconds: 4.5,
    mode: "illFull",
    caption: [
      { text: "Planos a partir de " },
      { text: "R$ 89,90", highlight: true },
      { text: "." },
    ],
    Illustration: PlansIllustration,
  },
  {
    startSeconds: 17,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "Suporte " },
      { text: "24h", highlight: true },
      { text: " e ativação rápida." },
    ],
    Illustration: StatsIllustration,
  },
  {
    startSeconds: 21,
    durationSeconds: 4,
    mode: "split",
    caption: [
      { text: "Em Jaú e " },
      { text: "região", highlight: true },
      { text: "." },
    ],
    Illustration: CoverageIllustration,
  },
  {
    startSeconds: 25,
    durationSeconds: 5,
    mode: "illFull",
    caption: [
      { text: "Acesse o " },
      { text: "site", highlight: true },
      { text: " e peça já." },
    ],
    Illustration: CtaIllustration,
  },
];

export const InnovaVideo: React.FC<InnovaVideoProps> = ({
  characterFolder,
  seed = "innova",
}) => (
  <SplitVideo
    scenes={SCENES}
    theme={THEME}
    Background={InnovaBackground}
    characterFolder={characterFolder}
    seed={seed}
  />
);
