import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, HEIGHT, SAFE, WIDTH } from "./kit";
import { VOOM, VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "./themes/voom";

// Caption options in the voom identity, to choose from. Each option shows the
// same sentence over a stand-in for the speaker. Open "Voom-Legendas" in the
// Studio to see them animated.

const OPTION_SECONDS = 3;
export const VOOM_CAPTION_OPTIONS_DURATION_IN_FRAMES = 5 * OPTION_SECONDS * FPS;
export const VOOM_CAPTION_OPTIONS_SIZE = { width: WIDTH, height: HEIGHT };

const SAFE_WIDTH = WIDTH - SAFE.left - SAFE.right;
const CAPTION_BOTTOM = HEIGHT - SAFE.bottom;

type Word = { text: string; highlight?: boolean };

const SENTENCE: Word[] = [
  { text: "Mensagem" },
  { text: "principal", highlight: true },
  { text: "em" },
  { text: "poucas" },
  { text: "palavras." },
];

const useSpringAt = (delay: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness: 160 },
  });
};

const popAt = (frame: number, fps: number, delay: number, damping = 13) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 160 } });

// --- Shared frame: black background and a stand-in for the speaker -----------

const Stage: React.FC<{ name: string; children: React.ReactNode }> = ({
  name,
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: VOOM.black }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 88% 92%, rgba(198,255,26,0.14), transparent 46%)",
      }}
    />
    <svg
      width="760"
      viewBox="0 0 100 100"
      style={{ position: "absolute", left: 160, top: 420 }}
    >
      <circle cx="50" cy="32" r="19" fill={VOOM.offWhite} fillOpacity={0.09} />
      <path
        d="M8 100c0-26 18-40 42-40s42 14 42 40z"
        fill={VOOM.offWhite}
        fillOpacity={0.09}
      />
    </svg>
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top + 10,
        fontFamily: VOOM_TEXT_FONT,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: VOOM.gray,
      }}
    >
      {name}
    </div>
    {children}
  </AbsoluteFill>
);

const outline = {
  WebkitTextStroke: `16px ${VOOM.black}`,
  paintOrder: "stroke fill",
  strokeLinejoin: "round",
} as const;

// --- A: lime marker on the key word --------------------------------------------

const OptionA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Stage name="Opção A · Marcador">
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE_WIDTH,
          top: CAPTION_BOTTOM,
          transform: "translateY(-100%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 24,
          rowGap: 6,
        }}
      >
        {SENTENCE.map((word, i) => {
          const pop = popAt(frame, fps, 4 + i * 4);
          const motion = {
            opacity: pop,
            transform: `translateY(${(1 - pop) * 44}px) rotate(${(1 - pop) * -4}deg)`,
          };
          return word.highlight ? (
            <span
              key={i}
              style={{
                ...motion,
                display: "inline-block",
                backgroundColor: VOOM.lime,
                color: VOOM.black,
                fontFamily: VOOM_TITLE_FONT,
                fontWeight: 700,
                fontSize: 78,
                lineHeight: 1,
                padding: "10px 22px 14px",
                borderRadius: 20,
              }}
            >
              {word.text}
            </span>
          ) : (
            <span
              key={i}
              style={{
                ...motion,
                display: "inline-block",
                color: VOOM.offWhite,
                fontFamily: VOOM_TEXT_FONT,
                fontWeight: 900,
                fontSize: 66,
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: -2,
                ...outline,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </Stage>
  );
};

// --- B: karaoke, the spoken word lights up in lime ----------------------------------

const OptionB: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(
    SENTENCE.length - 1,
    Math.max(0, Math.floor((frame - 6) / 14)),
  );
  const enter = useSpringAt(2);

  return (
    <Stage name="Opção B · Karaokê">
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE_WIDTH,
          top: CAPTION_BOTTOM,
          transform: `translateY(-100%) translateY(${(1 - enter) * 40}px)`,
          opacity: enter,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: 40,
          rowGap: 8,
        }}
      >
        {SENTENCE.map((word, i) => {
          const isActive = i === active;
          const isPast = i < active;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: VOOM_TEXT_FONT,
                fontWeight: 900,
                fontSize: 74,
                lineHeight: 1,
                textTransform: "uppercase",
                letterSpacing: -2,
                color: isActive
                  ? VOOM.lime
                  : isPast
                    ? VOOM.offWhite
                    : "rgba(244,244,238,0.32)",
                transform: `scale(${isActive ? 1.12 : 1})`,
                transformOrigin: "center bottom",
                ...outline,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </Stage>
  );
};

// --- C: one giant word at a time ------------------------------------------------------

const OptionC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = Math.min(SENTENCE.length - 1, Math.floor(frame / 15));
  const word = SENTENCE[index];
  const pop = popAt(frame, fps, index * 15, 10);

  return (
    <Stage name="Opção C · Palavra gigante">
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE_WIDTH,
          top: 1180,
          display: "flex",
          justifyContent: "center",
          transform: "translateY(-50%)",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: word.text.length > 8 ? 168 : 230,
            lineHeight: 1,
            letterSpacing: -6,
            color: word.highlight ? VOOM.lime : VOOM.offWhite,
            transform: `scale(${0.6 + 0.4 * pop}) rotate(${(1 - pop) * -5}deg)`,
            opacity: Math.min(1, pop * 2),
            ...outline,
          }}
        >
          {word.text}
        </span>
      </div>
    </Stage>
  );
};

// --- D: lime card with black text ------------------------------------------------------

const OptionD: React.FC = () => {
  const pop = useSpringAt(2, 10);

  return (
    <Stage name="Opção D · Cartão lima">
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: SAFE_WIDTH,
          top: CAPTION_BOTTOM,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(-100%) translateY(${(1 - pop) * 80}px) rotate(${-1.5 * pop}deg)`,
          opacity: Math.min(1, pop * 2),
        }}
      >
        <div
          style={{
            maxWidth: SAFE_WIDTH,
            padding: "34px 48px 40px",
            borderRadius: 48,
            backgroundColor: VOOM.lime,
            color: VOOM.black,
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 900,
            fontSize: 62,
            lineHeight: 1.12,
            textTransform: "uppercase",
            letterSpacing: -1.5,
            textAlign: "center",
          }}
        >
          Mensagem{" "}
          <span
            style={{
              display: "inline-block",
              backgroundColor: VOOM.black,
              color: VOOM.lime,
              fontFamily: VOOM_TITLE_FONT,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 68,
              padding: "0 18px 6px",
              borderRadius: 16,
            }}
          >
            principal
          </span>{" "}
          em poucas palavras.
        </div>
      </div>
    </Stage>
  );
};

// --- E: minimal, left aligned, with a lime bar --------------------------------------------

const OptionE: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = popAt(frame, fps, 0, 18);

  return (
    <Stage name="Opção E · Minimalista">
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: 720,
          top: CAPTION_BOTTOM,
          transform: "translateY(-100%)",
          display: "flex",
          gap: 30,
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            width: 12,
            borderRadius: 6,
            backgroundColor: VOOM.lime,
            transform: `scaleY(${bar})`,
            transformOrigin: "bottom",
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: 18,
            rowGap: 4,
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontSize: 60,
            lineHeight: 1.15,
          }}
        >
          {SENTENCE.map((word, i) => {
            const pop = popAt(frame, fps, 4 + i * 4);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: pop,
                  transform: `translateY(${(1 - pop) * 24}px)`,
                  color: word.highlight ? VOOM.lime : VOOM.offWhite,
                  fontWeight: word.highlight ? 900 : 800,
                  ...outline,
                }}
              >
                {word.text}
              </span>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

// --- Composition ---------------------------------------------------------------------------

const OPTIONS = [OptionA, OptionB, OptionC, OptionD, OptionE];

export const VoomCaptionOptions: React.FC = () => (
  <AbsoluteFill>
    {OPTIONS.map((Option, i) => (
      <Sequence
        key={i}
        from={i * OPTION_SECONDS * FPS}
        durationInFrames={OPTION_SECONDS * FPS}
        name={`Opção ${"ABCDE"[i]}`}
      >
        <Option />
      </Sequence>
    ))}
  </AbsoluteFill>
);
