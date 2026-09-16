import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "./Background";
import { TalkingHead, TalkingHeadProps } from "./TalkingHead";

export type SceneProps = TalkingHeadProps;

const FLOAT_AMPLITUDE_PX = 16;
const FLOAT_SPEED = 0.05;

// The source face PNGs have an opaque white background baked in, so we
// fade the edges of the head with a radial mask instead of showing a hard
// white square — it reads as an intentional soft portrait vignette.
const SOFT_EDGE_MASK = "radial-gradient(circle, black 58%, transparent 80%)";

export const Scene: React.FC<SceneProps> = ({ characterFolder, seed }) => {
  const frame = useCurrentFrame();
  const floatY = Math.sin(frame * FLOAT_SPEED) * FLOAT_AMPLITUDE_PX;
  const rotate = Math.sin(frame * FLOAT_SPEED * 0.6) * 2;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 560,
            height: 560,
            position: "relative",
            transform: `translateY(${floatY}px) rotate(${rotate}deg)`,
            filter: "drop-shadow(0 30px 35px rgba(80, 60, 50, 0.18))",
            maskImage: SOFT_EDGE_MASK,
            WebkitMaskImage: SOFT_EDGE_MASK,
          }}
        >
          <TalkingHead characterFolder={characterFolder} seed={seed} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
