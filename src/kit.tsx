import { createContext, useContext } from "react";
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TalkingHead } from "./TalkingHead";

// Shared engine for the vertical "face + illustrations" videos: layout modes
// (face / split / full illustration), Instagram and TikTok safe zones,
// kinetic captions and the face. Each video supplies its scenes and a theme.

export const FPS = 30;

export const WIDTH = 1080;
export const HEIGHT = 1920;

// Instagram Reels and TikTok draw their own UI over the video: the top bar,
// the account/caption block at the bottom and the like/comment buttons on the
// right. Everything that must be read or seen (faces, text, illustrations)
// stays inside this box; only backgrounds may bleed into the dead zones.
export const SAFE = { top: 250, bottom: 480, left: 60, right: 140 };
export const SAFE_WIDTH = WIDTH - SAFE.left - SAFE.right;
export const SAFE_CENTER_X = SAFE.left + SAFE_WIDTH / 2;

export type Theme = {
  ink: string; // caption text
  accent: string; // highlighted caption words and underline
  paper: string; // caption outline and video background
  panel: string; // illustration panel background
  panelInk: string; // default text color inside the panel
  panelOutline?: string; // caption outline over the panel (default: panel)
  font: string;
  serif: string; // font of highlighted caption words
  // "serif": accent-colored italic with an underline (default).
  // "marker": accent-colored block behind the word, with `highlightInk` text.
  highlightStyle?: "serif" | "marker";
  highlightInk?: string;
  // Caption layout used when a scene does not choose one. Personal profile
  // (voom) uses "clean"; brands keep the kinetic "default".
  captionVariant?: CaptionStyle;
  shadow: string; // rgb triplet used for soft shadows, e.g. "80, 60, 50"
};

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ThemeContext.Provider;

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used inside <SplitVideo>");
  }
  return theme;
};

// --- Layout --------------------------------------------------------------
// The video switches between three layouts: the face fills the screen, the
// screen is split (illustration on top, face below), or the illustration
// fills the whole screen. Every value below is blended between layouts.

export type Mode = "faceFull" | "split" | "illFull";

export type Layout = {
  topHeight: number; // height of the illustration panel
  faceY: number; // vertical center of the face
  faceSize: number;
  faceOpacity: number;
  captionY: number; // bottom edge of the caption
};

// Spoken captions always sit as low as the safe zone allows (their bottom edge
// is at y = 1440), so they never cover the face. In layouts with a face, the
// chin stays above the top of a two-line caption (~y 1270): keep captions to
// two lines whenever a face is on screen.
export const CAPTION_BOTTOM = HEIGHT - SAFE.bottom;

export const LAYOUTS: Record<Mode, Layout> = {
  faceFull: {
    topHeight: 0,
    faceY: 800,
    faceSize: 760,
    faceOpacity: 1,
    captionY: CAPTION_BOTTOM,
  },
  split: {
    topHeight: 800,
    faceY: 1040,
    faceSize: 440,
    faceOpacity: 1,
    captionY: CAPTION_BOTTOM,
  },
  illFull: {
    topHeight: HEIGHT,
    faceY: 1040,
    faceSize: 440,
    faceOpacity: 0,
    captionY: CAPTION_BOTTOM,
  },
};

const TRANSITION_IN_FRAMES = 14;
const EASE = Easing.bezier(0.4, 0, 0.2, 1);

export type Part = { text: string; highlight?: boolean };

// Caption layouts: "clean" (standard of the personal profile: one line, white
// caps on a 40% black strip, pops in whole), "default" (word-by-word, key word
// highlighted, centered), "card" (accent-colored card, bottom) and "minimal"
// (small, left aligned, with an accent bar). The last three are for brands.
export type CaptionStyle = "clean" | "default" | "card" | "minimal";

export type SceneConfig = {
  startSeconds: number;
  durationSeconds: number;
  mode: Mode;
  caption: Part[];
  captionStyle?: CaptionStyle;
  Illustration?: React.FC;
  // Sound effects played during the scene, from public/sfx.
  sfx?: SceneSfx[];
};

export type SceneSfx = {
  file: string; // e.g. "whoosh.wav"
  atSeconds: number; // relative to the start of the scene
  volume?: number;
};

export const sceneRange = (scene: SceneConfig) => ({
  from: Math.round(scene.startSeconds * FPS),
  duration: Math.round(scene.durationSeconds * FPS),
});

export const layoutAt = (frame: number, scenes: SceneConfig[]): Layout => {
  let index = 0;
  for (let i = 0; i < scenes.length; i++) {
    if (frame >= sceneRange(scenes[i]).from) {
      index = i;
    }
  }

  const current = LAYOUTS[scenes[index].mode];
  if (index === 0) {
    return current;
  }

  const previous = LAYOUTS[scenes[index - 1].mode];
  const from = sceneRange(scenes[index]).from;
  const t = interpolate(frame, [from, from + TRANSITION_IN_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const mix = (a: number, b: number) => a + (b - a) * t;
  return {
    topHeight: mix(previous.topHeight, current.topHeight),
    faceY: mix(previous.faceY, current.faceY),
    faceSize: mix(previous.faceSize, current.faceSize),
    faceOpacity: mix(previous.faceOpacity, current.faceOpacity),
    captionY: mix(previous.captionY, current.captionY),
  };
};

export const usePop = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 140 },
  });
};

// Fades a scene's illustration in and out so cuts between scenes are soft.
export const FadeInOut: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [0, 8, durationInFrames - 8, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// Illustrations are designed on a 960px-wide box and scaled to fit the safe
// area they are given (the strip above the caption in split mode, or most of
// the safe box in full-screen mode).
export type Area = { top: number; height: number };
export const SPLIT_AREA: Area = { top: SAFE.top, height: 520 };
export const FULL_AREA: Area = { top: SAFE.top, height: 880 };
const DESIGN_WIDTH = 960;

export const Center: React.FC<{
  children: React.ReactNode;
  area?: Area;
  designHeight?: number;
}> = ({ children, area = SPLIT_AREA, designHeight = 740 }) => {
  const theme = useTheme();
  const scale = Math.min(SAFE_WIDTH / DESIGN_WIDTH, area.height / designHeight);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE_WIDTH,
        top: area.top,
        height: area.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.font,
        color: theme.panelInk,
      }}
    >
      <div
        style={{
          width: DESIGN_WIDTH,
          height: designHeight,
          flexShrink: 0,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// --- Caption --------------------------------------------------------------
// Agency-style kinetic type: heavy uppercase sans for normal words, an italic
// serif in the accent color for the key words, popping in one by one. There is
// no box; a paper-colored outline keeps the text legible over the face.

const WORD_STAGGER_IN_FRAMES = 4;
const EXIT_IN_FRAMES = 8;

const toWords = (parts: Part[]): Part[] => {
  const words: Part[] = [];
  for (const part of parts) {
    for (const token of part.text.split(" ").filter(Boolean)) {
      const isPunctuation = /^[.,!?;:]+$/.test(token);
      if (isPunctuation && words.length > 0) {
        words[words.length - 1].text += token;
      } else {
        words.push({ text: token, highlight: part.highlight });
      }
    }
  }
  return words;
};

const CaptionWord: React.FC<{
  word: Part;
  delay: number;
  ink: string;
  outline: string;
}> = ({ word, delay, ink, outline }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - delay,
    fps,
    config: { damping: 13, stiffness: 160 },
  });
  const underline = spring({
    frame: frame - delay - 6,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  if (word.highlight && theme.highlightStyle === "marker") {
    return (
      <span
        style={{
          display: "inline-block",
          opacity: pop,
          transform: `translateY(${(1 - pop) * 44}px) rotate(${-1.5 + (1 - pop) * -5}deg) scale(${0.8 + 0.2 * pop})`,
          backgroundColor: theme.accent,
          color: theme.highlightInk ?? "black",
          fontFamily: theme.serif,
          fontWeight: 700,
          fontSize: 74,
          lineHeight: 1,
          letterSpacing: -1,
          padding: "10px 22px 14px",
          borderRadius: 20,
        }}
      >
        {word.text}
      </span>
    );
  }

  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        opacity: pop,
        transform: `translateY(${(1 - pop) * 44}px) rotate(${(1 - pop) * -4}deg)`,
        color: word.highlight ? theme.accent : ink,
        fontFamily: word.highlight ? theme.serif : theme.font,
        fontStyle: word.highlight ? "italic" : "normal",
        fontWeight: word.highlight ? 700 : 900,
        fontSize: word.highlight ? 84 : 64,
        textTransform: word.highlight ? "none" : "uppercase",
        letterSpacing: word.highlight ? -2 : -3,
        lineHeight: 1,
        WebkitTextStroke: `16px ${outline}`,
        paintOrder: "stroke fill",
        strokeLinejoin: "round",
      }}
    >
      {word.text}
      {word.highlight ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -6,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.accent,
            transformOrigin: "left center",
            transform: `scaleX(${underline})`,
          }}
        />
      ) : null}
    </span>
  );
};

const CardCaption: React.FC<{ words: Part[]; maxWidth: number }> = ({
  words,
  maxWidth,
}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - 2,
    fps,
    config: { damping: 10, stiffness: 160 },
  });
  const ink = theme.highlightInk ?? "black";

  return (
    <div
      style={{
        maxWidth,
        padding: "34px 48px 40px",
        borderRadius: 48,
        backgroundColor: theme.accent,
        color: ink,
        fontFamily: theme.font,
        fontWeight: 900,
        fontSize: 62,
        lineHeight: 1.12,
        textTransform: "uppercase",
        letterSpacing: -1.5,
        textAlign: "center",
        transform: `translateY(${(1 - pop) * 80}px) rotate(${-1.5 * pop}deg)`,
        opacity: Math.min(1, pop * 2),
      }}
    >
      {words.map((word, i) => (
        <span key={i}>
          {word.highlight ? (
            <span
              style={{
                display: "inline-block",
                backgroundColor: ink,
                color: theme.accent,
                fontFamily: theme.serif,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 68,
                padding: "0 18px 6px",
                borderRadius: 16,
              }}
            >
              {word.text}
            </span>
          ) : (
            word.text
          )}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

const MinimalCaption: React.FC<{
  words: Part[];
  ink: string;
  outline: string;
  width: number;
}> = ({ words, ink, outline, width }) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame, fps, config: { damping: 18, stiffness: 160 } });

  return (
    <div style={{ display: "flex", gap: 30, alignItems: "stretch", width }}>
      <div
        style={{
          width: 12,
          borderRadius: 6,
          backgroundColor: theme.accent,
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
          fontFamily: theme.font,
          fontSize: 60,
          lineHeight: 1.15,
        }}
      >
        {words.map((word, i) => {
          const pop = spring({
            frame: frame - (4 + i * 4),
            fps,
            config: { damping: 13, stiffness: 160 },
          });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: pop,
                transform: `translateY(${(1 - pop) * 24}px)`,
                color: word.highlight ? theme.accent : ink,
                fontWeight: word.highlight ? 900 : 800,
                WebkitTextStroke: `16px ${outline}`,
                paintOrder: "stroke fill",
                strokeLinejoin: "round",
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Standard caption of the personal profile: always a single line, white
// uppercase on a 40% black strip, entering whole with a short pop. The font
// shrinks to keep the line inside the safe width (keep chunks to ~28 letters;
// longer ones get small, and below CLEAN_MIN_FONT they would overflow).
// "accent": faixa na cor de destaque da marca, para diferenciar outra voz.
export type CaptionTone = "dark" | "accent";

const CLEAN_FONT = 56;
const CLEAN_MIN_FONT = 36;
const CLEAN_PAD_X = 32;
const CLEAN_CHAR_WIDTH = 0.68; // average Nunito 900 uppercase width, in em

const CleanCaption: React.FC<{ words: Part[]; tone: CaptionTone }> = ({
  words,
  tone,
}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({
    frame: frame - 1,
    fps,
    config: { damping: 14, stiffness: 220 },
  });
  const text = words.map((w) => w.text).join(" ");
  const room = SAFE_WIDTH - CLEAN_PAD_X * 2;
  const fontSize = Math.max(
    CLEAN_MIN_FONT,
    Math.min(CLEAN_FONT, room / (text.length * CLEAN_CHAR_WIDTH)),
  );

  return (
    <div
      style={{
        whiteSpace: "nowrap",
        padding: `10px ${CLEAN_PAD_X}px 14px`,
        borderRadius: 18,
        backgroundColor:
          tone === "accent" ? theme.accent : "rgba(0, 0, 0, 0.4)",
        color: "white",
        fontFamily: theme.font,
        fontWeight: 900,
        fontSize,
        lineHeight: 1.15,
        textTransform: "uppercase",
        textAlign: "center",
        opacity: Math.min(1, pop * 2),
        transform: `scale(${0.82 + 0.18 * pop})`,
        transformOrigin: "50% 100%",
      }}
    >
      {text}
    </div>
  );
};

// `onPanel` is true when the caption sits on the (dark) illustration panel,
// so it switches to the panel's text color and outline.
export const Caption: React.FC<{
  parts: Part[];
  y: number;
  onPanel: boolean;
  variant?: CaptionStyle;
  // 1 = tamanho padrão; menos que 1 encolhe a legenda inteira (e ela cabe em
  // menos linhas, porque a largura útil continua a mesma).
  size?: number;
  tone?: CaptionTone;
}> = ({ parts, y, onPanel, variant: variantProp, size = 1, tone = "dark" }) => {
  const theme = useTheme();
  const variant = variantProp ?? theme.captionVariant ?? "default";
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const words = toWords(parts);
  const ink = onPanel ? theme.panelInk : theme.ink;
  const outline = onPanel ? (theme.panelOutline ?? theme.panel) : theme.paper;
  const exit = interpolate(
    frame,
    [durationInFrames - EXIT_IN_FRAMES, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: SAFE_WIDTH,
        top: y,
        display: "flex",
        justifyContent: variant === "minimal" ? "flex-start" : "center",
        transform: `translateY(-100%) translateY(${(1 - exit) * -24}px)`,
        opacity: exit,
      }}
    >
      <div style={{ zoom: size }}>
        {variant === "clean" ? (
          <CleanCaption words={words} tone={tone} />
        ) : variant === "card" ? (
          <CardCaption words={words} maxWidth={SAFE_WIDTH / size} />
        ) : variant === "minimal" ? (
          <MinimalCaption
            words={words}
            ink={ink}
            outline={outline}
            width={720 / size}
          />
        ) : (
          <div
            style={{
              maxWidth: SAFE_WIDTH / size,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "baseline",
              columnGap: 26,
              rowGap: 6,
              textAlign: "center",
            }}
          >
            {words.map((word, i) => (
              <CaptionWord
                key={i}
                word={word}
                delay={2 + i * WORD_STAGGER_IN_FRAMES}
                ink={ink}
                outline={outline}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Video ----------------------------------------------------------------

// The source face PNGs have an opaque white background baked in, so the head
// is faded out at the edges (same trick as Scene.tsx).
const SOFT_EDGE_MASK = "radial-gradient(circle, black 58%, transparent 80%)";

export type SplitVideoProps = {
  scenes: SceneConfig[];
  theme: Theme;
  Background: React.FC;
  // Animated head from public/<folder>. Leave out for videos with no face
  // (voice-over only): the scenes then use the whole screen.
  characterFolder?: string;
  // Drawn above everything, e.g. transitions between scenes.
  Overlay?: React.FC;
  seed?: string;
};

export const SplitVideo: React.FC<SplitVideoProps> = ({
  scenes,
  theme,
  Background,
  Overlay,
  characterFolder,
  seed = "video",
}) => {
  const frame = useCurrentFrame();
  const layout = layoutAt(frame, scenes);
  const floatY = Math.sin(frame * 0.05) * 10;
  const transparentPanel = theme.panel === "transparent";

  return (
    <ThemeContext.Provider value={theme}>
      <AbsoluteFill style={{ backgroundColor: theme.paper }}>
        <Background />

        {characterFolder ? (
          <div
            style={{
              position: "absolute",
              left: SAFE_CENTER_X - layout.faceSize / 2,
              top: layout.faceY - layout.faceSize / 2 + floatY,
              width: layout.faceSize,
              height: layout.faceSize,
              opacity: layout.faceOpacity,
              maskImage: SOFT_EDGE_MASK,
              WebkitMaskImage: SOFT_EDGE_MASK,
              filter: `drop-shadow(0 30px 35px rgba(${theme.shadow}, 0.18))`,
            }}
          >
            <TalkingHead characterFolder={characterFolder} seed={seed} />
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: WIDTH,
            height: layout.topHeight,
            overflow: "hidden",
            backgroundColor: theme.panel,
            // Transparent panel (personal profile): no block, the resources
            // float over the background; each one carries its own soft shadow.
            borderRadius: transparentPanel ? 0 : "0 0 56px 56px",
            boxShadow:
              layout.topHeight > 0 && !transparentPanel
                ? `0 20px 50px rgba(${theme.shadow}, 0.2)`
                : "none",
          }}
        >
          {scenes.map((scene, i) => {
            const { Illustration } = scene;
            if (!Illustration) {
              return null;
            }
            const { from, duration } = sceneRange(scene);
            return (
              <Sequence
                key={i}
                from={from}
                durationInFrames={duration}
                name={`Scene ${i + 1}`}
              >
                <FadeInOut>
                  <Illustration />
                </FadeInOut>
              </Sequence>
            );
          })}
        </div>

        {scenes.map((scene, i) =>
          (scene.sfx ?? []).map((effect, j) => (
            <Sequence
              key={`sfx-${i}-${j}`}
              from={sceneRange(scene).from + Math.round(effect.atSeconds * FPS)}
              name={`SFX ${effect.file}`}
              layout="none"
            >
              <Html5Audio
                src={staticFile(`sfx/${effect.file}`)}
                volume={() => effect.volume ?? 0.6}
              />
            </Sequence>
          )),
        )}

        {scenes.map((scene, i) => {
          const { from, duration } = sceneRange(scene);
          return (
            <Sequence
              key={i}
              from={from}
              durationInFrames={duration}
              name={`Caption ${i + 1}`}
            >
              <Caption
                parts={scene.caption}
                y={layout.captionY}
                onPanel={layout.topHeight >= layout.captionY}
                variant={scene.captionStyle}
              />
            </Sequence>
          );
        })}
        {Overlay ? <Overlay /> : null}
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
