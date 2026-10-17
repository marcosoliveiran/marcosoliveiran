import { Composition } from "remotion";
import { Background } from "./Background";
import { Scene } from "./Scene";
import { TalkingHead } from "./TalkingHead";
import {
  InnovaVideo,
  INNOVA_VIDEO_DURATION_IN_FRAMES,
  INNOVA_VIDEO_FPS,
  INNOVA_VIDEO_SIZE,
} from "./InnovaVideo";
import {
  UGCVideo,
  UGC_VIDEO_DURATION_IN_FRAMES,
  UGC_VIDEO_FPS,
  UGC_VIDEO_SIZE,
} from "./UGCVideo";

const FPS = 30;
const DURATION_IN_SECONDS = 10;
// Vertical 9:16, matching Instagram/TikTok/WhatsApp story dimensions.
const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

export const TalkingHeadComposition = () => {
  return (
    <>
      <Composition
        id="TalkingHead"
        component={TalkingHead}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ characterFolder: "faces", seed: "talking-head" }}
      />
      <Composition
        id="TalkingHead-Zico"
        component={TalkingHead}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ characterFolder: "faces-zico", seed: "zico" }}
      />
      <Composition
        id="TalkingHead-Gi"
        component={TalkingHead}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ characterFolder: "faces-gi", seed: "gi" }}
      />
      <Composition
        id="TalkingHead-Mae"
        component={TalkingHead}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ characterFolder: "faces-mae", seed: "mae" }}
      />
      <Composition
        id="TalkingHead-Maju"
        component={TalkingHead}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ characterFolder: "faces-maju", seed: "maju" }}
      />
      <Composition
        id="TalkingHead-Marcos"
        component={TalkingHead}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ characterFolder: "faces-marcos", seed: "marcos" }}
      />
      <Composition
        id="Background"
        component={Background}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={STORY_WIDTH}
        height={STORY_HEIGHT}
      />
      <Composition
        id="Scene"
        component={Scene}
        durationInFrames={DURATION_IN_SECONDS * FPS}
        fps={FPS}
        width={STORY_WIDTH}
        height={STORY_HEIGHT}
        defaultProps={{ characterFolder: "faces", seed: "talking-head" }}
      />
      <Composition
        id="UGC-30s"
        component={UGCVideo}
        durationInFrames={UGC_VIDEO_DURATION_IN_FRAMES}
        fps={UGC_VIDEO_FPS}
        width={UGC_VIDEO_SIZE.width}
        height={UGC_VIDEO_SIZE.height}
        defaultProps={{ characterFolder: "faces-marcos", seed: "ugc" }}
      />
      <Composition
        id="Innova-30s"
        component={InnovaVideo}
        durationInFrames={INNOVA_VIDEO_DURATION_IN_FRAMES}
        fps={INNOVA_VIDEO_FPS}
        width={INNOVA_VIDEO_SIZE.width}
        height={INNOVA_VIDEO_SIZE.height}
        defaultProps={{ characterFolder: "faces-marcos", seed: "innova" }}
      />
    </>
  );
};
