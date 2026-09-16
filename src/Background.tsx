import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Soft, neutral pastel palette (sand, blush, sage, powder blue, lilac).
const BLOBS = [
  { color: "#f4d9cf", size: 0.62, baseX: 0.16, baseY: 0.26, driftX: 0.07, driftY: 0.06, cycles: 1 },
  { color: "#dde9dd", size: 0.55, baseX: 0.86, baseY: 0.18, driftX: 0.06, driftY: 0.08, cycles: 2 },
  { color: "#dbe5f0", size: 0.66, baseX: 0.82, baseY: 0.88, driftX: 0.08, driftY: 0.05, cycles: 1 },
  { color: "#efe1ef", size: 0.5, baseX: 0.18, baseY: 0.92, driftX: 0.06, driftY: 0.07, cycles: 2 },
  { color: "#f7ecd9", size: 0.45, baseX: 0.5, baseY: 0.5, driftX: 0.05, driftY: 0.05, cycles: 1 },
] as const;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  // One full progress cycle across the whole composition duration, so a
  // looping render (frame 0 and frame durationInFrames line up) is seamless.
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, #faf4ee 0%, #f6ece5 45%, #eef1ea 100%)",
        overflow: "hidden",
      }}
    >
      {BLOBS.map((blob, i) => {
        const angle = progress * blob.cycles * Math.PI * 2;
        const x = (blob.baseX + Math.sin(angle) * blob.driftX) * width;
        const y = (blob.baseY + Math.cos(angle) * blob.driftY) * height;
        const size = blob.size * height;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: blob.color,
              filter: "blur(90px)",
              opacity: 0.75,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
          mixBlendMode: "multiply",
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};
