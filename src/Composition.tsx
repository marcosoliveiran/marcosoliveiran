import { Composition } from "remotion";
import { Background } from "./Background";
import { Scene } from "./Scene";
import { TalkingHead } from "./TalkingHead";
import {
  CreepVideo,
  CREEP_DURATION_IN_FRAMES,
  CREEP_FPS,
  CREEP_SIZE,
} from "./creep/CreepVideo";
import {
  HERING_DURATION_IN_FRAMES,
  HERING_FPS,
  HERING_SIZE,
  HeringVideo,
} from "./hering/HeringVideo";
import { DEFAULT_GRADE } from "./hering/timing";
import { HAS_VIDEO } from "./kimi/timing";
import { Capa } from "./poronde/Capa";
import { CapaParede } from "./poronde/Parede";
import {
  KIMI_DURATION_IN_FRAMES,
  KIMI_FPS,
  KIMI_SIZE,
  KimiVideo,
} from "./kimi/KimiVideo";
import {
  VoomCaptionOptions,
  VOOM_CAPTION_OPTIONS_DURATION_IN_FRAMES,
  VOOM_CAPTION_OPTIONS_SIZE,
} from "./VoomCaptionOptions";
import {
  VoomBase,
  VOOM_BASE_DURATION_IN_FRAMES,
  VOOM_BASE_FPS,
  VOOM_BASE_SIZE,
} from "./VoomBase";
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
        id="Innova-Reels"
        component={InnovaVideo}
        durationInFrames={INNOVA_VIDEO_DURATION_IN_FRAMES}
        fps={INNOVA_VIDEO_FPS}
        width={INNOVA_VIDEO_SIZE.width}
        height={INNOVA_VIDEO_SIZE.height}
        defaultProps={{}}
      />
      <Composition
        id="Voom-Base"
        component={VoomBase}
        durationInFrames={VOOM_BASE_DURATION_IN_FRAMES}
        fps={VOOM_BASE_FPS}
        width={VOOM_BASE_SIZE.width}
        height={VOOM_BASE_SIZE.height}
      />
      <Composition
        id="Voom-Legendas"
        component={VoomCaptionOptions}
        durationInFrames={VOOM_CAPTION_OPTIONS_DURATION_IN_FRAMES}
        fps={VOOM_BASE_FPS}
        width={VOOM_CAPTION_OPTIONS_SIZE.width}
        height={VOOM_CAPTION_OPTIONS_SIZE.height}
      />
      <Composition
        id="Creep"
        component={CreepVideo}
        durationInFrames={CREEP_DURATION_IN_FRAMES}
        fps={CREEP_FPS}
        width={CREEP_SIZE.width}
        height={CREEP_SIZE.height}
      />
      <Composition
        id="Hering"
        component={HeringVideo}
        defaultProps={{ grade: DEFAULT_GRADE }}
        durationInFrames={HERING_DURATION_IN_FRAMES}
        fps={HERING_FPS}
        width={HERING_SIZE.width}
        height={HERING_SIZE.height}
      />
      <Composition
        id="Kimi"
        component={KimiVideo}
        defaultProps={{ hasVideo: HAS_VIDEO }}
        durationInFrames={KIMI_DURATION_IN_FRAMES}
        fps={KIMI_FPS}
        width={KIMI_SIZE.width}
        height={KIMI_SIZE.height}
      />
      <Composition
        id="PorOndeAnda-Parede"
        component={CapaParede}
        defaultProps={{ fundo: "tv" as const }}
        durationInFrames={90}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PorOndeAnda-Capa"
        component={Capa}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
