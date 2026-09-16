import { Composition } from "remotion";
import { TalkingHead } from "./TalkingHead";

const FPS = 30;
const DURATION_IN_SECONDS = 10;

export const TalkingHeadComposition = () => {
  return (
    <Composition
      id="TalkingHead"
      component={TalkingHead}
      durationInFrames={DURATION_IN_SECONDS * FPS}
      fps={FPS}
      width={1080}
      height={1080}
      defaultProps={{ seed: "talking-head" }}
    />
  );
};
