import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";

export type TalkingHeadProps = {
  // Folder under public/ that holds this character's
  // mouth-closed.png / mouth-small.png / mouth-open.png / mouth-wide.png.
  characterFolder: string;
  // Change this to get a different (but still deterministic) talking
  // pattern, e.g. when placing multiple heads in the same video.
  seed?: string;
};

// How long each mouth shape is held, in frames, before it can change again.
const BEAT_LENGTH_IN_FRAMES = 4;

// Chance that a beat is a silent/closed-mouth beat, to mimic natural
// pauses for breathing in between words and sentences.
const PAUSE_CHANCE = 0.15;

// Odds of each mouth shape (closed, small, open, wide) on a talking beat.
const MOUTH_WEIGHTS = [0.15, 0.35, 0.35, 0.15];

const pickMouthIndex = (beatIndex: number, seed: string) => {
  if (random(`${seed}-pause-${beatIndex}`) < PAUSE_CHANCE) {
    return 0;
  }

  const roll = random(`${seed}-mouth-${beatIndex}`);
  let cumulative = 0;

  for (let i = 0; i < MOUTH_WEIGHTS.length; i++) {
    cumulative += MOUTH_WEIGHTS[i];
    if (roll < cumulative) {
      return i;
    }
  }

  return MOUTH_WEIGHTS.length - 1;
};

export const TalkingHead: React.FC<TalkingHeadProps> = ({
  characterFolder,
  seed = "talking-head",
}) => {
  const frame = useCurrentFrame();
  const beatIndex = Math.floor(frame / BEAT_LENGTH_IN_FRAMES);
  const mouthIndex = pickMouthIndex(beatIndex, seed);

  const mouthStates = [
    staticFile(`${characterFolder}/mouth-closed.png`),
    staticFile(`${characterFolder}/mouth-small.png`),
    staticFile(`${characterFolder}/mouth-open.png`),
    staticFile(`${characterFolder}/mouth-wide.png`),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <Img
        src={mouthStates[mouthIndex]}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </AbsoluteFill>
  );
};
