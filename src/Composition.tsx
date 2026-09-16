import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { TalkingHead, TalkingHeadProps } from "./TalkingHead";

const AUDIO_FILE = "audio/dub.mp3";
const FPS = 30;
const FALLBACK_DURATION_IN_SECONDS = 10;

const calculateMetadata: CalculateMetadataFunction<
  TalkingHeadProps
> = async ({ props }) => {
  let durationInSeconds = FALLBACK_DURATION_IN_SECONDS;

  try {
    durationInSeconds = await getAudioDurationInSeconds(props.audioSrc);
  } catch {
    // No audio file yet (e.g. `public/audio/dub.mp3` hasn't been added).
    // Falls back to a fixed length so the Studio still renders.
  }

  return {
    durationInFrames: Math.max(1, Math.round(durationInSeconds * FPS)),
  };
};

export const TalkingHeadComposition = () => {
  return (
    <Composition
      id="TalkingHead"
      component={TalkingHead}
      durationInFrames={FALLBACK_DURATION_IN_SECONDS * FPS}
      fps={FPS}
      width={1080}
      height={1080}
      defaultProps={{ audioSrc: staticFile(AUDIO_FILE) }}
      calculateMetadata={calculateMetadata}
    />
  );
};
