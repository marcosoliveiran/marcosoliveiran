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
import {
  MOUTH_CLIP_SIZE,
  MOUTH_SHEET_SIZE,
  MouthClip,
  MouthSheet,
  MouthStill,
} from "./hering/Mouth";
import {
  DEFAULT_GRADE,
  FPS as HERING_CLIP_FPS,
  SEGMENTS,
  syllablesOf,
} from "./hering/timing";
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
      {/* Boca solta em fundo transparente (uma por fala dela), para o CapCut */}
      {SEGMENTS.filter((s) => s.mouth).map((s) => (
        <Composition
          key={`boca-${s.id}`}
          id={`Boca-${s.id}`}
          component={MouthClip}
          defaultProps={{ syllables: syllablesOf(s.pages.join(" ")) }}
          durationInFrames={Math.round((s.to - s.from) * HERING_CLIP_FPS)}
          fps={HERING_CLIP_FPS}
          width={MOUTH_CLIP_SIZE.width}
          height={MOUTH_CLIP_SIZE.height}
        />
      ))}
      <Composition
        id="Boca-opcoes"
        component={MouthSheet}
        durationInFrames={1}
        fps={HERING_CLIP_FPS}
        width={MOUTH_SHEET_SIZE.width}
        height={MOUTH_SHEET_SIZE.height}
      />
      {[0, 0.5, 1].map((open) => (
        <Composition
          key={`boca-pose-${open}`}
          id={`Boca-pose-${open * 10}`}
          component={MouthStill}
          defaultProps={{ open }}
          durationInFrames={1}
          fps={HERING_CLIP_FPS}
          width={MOUTH_CLIP_SIZE.width}
          height={MOUTH_CLIP_SIZE.height}
        />
      ))}
    </>
  );
};
