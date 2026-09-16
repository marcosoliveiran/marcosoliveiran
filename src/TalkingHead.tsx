import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type TalkingHeadProps = {
  audioSrc: string;
};

const MOUTH_STATES = [
  staticFile("faces/mouth-closed.png"),
  staticFile("faces/mouth-small.png"),
  staticFile("faces/mouth-open.png"),
  staticFile("faces/mouth-wide.png"),
];

// Volume thresholds that decide which mouth shape to show.
// Tune these once you hear how your dub audio maps to them.
const THRESHOLDS = [0.02, 0.08, 0.18];

export const TalkingHead: React.FC<TalkingHeadProps> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(audioSrc);

  let mouthIndex = 0;

  if (audioData) {
    // Average the amplitude over a few neighboring frames so the mouth
    // doesn't flicker on every tiny spike in the waveform.
    const windowSize = 2;
    let total = 0;
    let samples = 0;

    for (let f = frame - windowSize; f <= frame + windowSize; f++) {
      if (f < 0) continue;
      const visualization = visualizeAudio({
        audioData,
        frame: f,
        fps,
        numberOfSamples: 16,
      });
      total += visualization.reduce((a, b) => a + b, 0) / visualization.length;
      samples++;
    }

    const amplitude = samples > 0 ? total / samples : 0;

    mouthIndex = THRESHOLDS.filter((t) => amplitude >= t).length;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <Audio src={audioSrc} />
      <Img
        src={MOUTH_STATES[mouthIndex]}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </AbsoluteFill>
  );
};
