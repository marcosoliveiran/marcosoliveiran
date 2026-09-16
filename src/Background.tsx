import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const CELL_SIZE = 130;
const LINE_RGB = "126,109,92";

// Larger accent triangles that slowly rotate on top of the grid, in the
// same neutral pastel family used across the character videos.
const ACCENT_TRIANGLES = [
  { cx: 0.18, cy: 0.14, size: 420, color: "#f0c9c2", rotationCycles: 1, phase: 0 },
  { cx: 0.85, cy: 0.22, size: 340, color: "#cfe0d1", rotationCycles: -1, phase: 40 },
  { cx: 0.78, cy: 0.62, size: 480, color: "#c9d9ea", rotationCycles: 1, phase: 120 },
  { cx: 0.2, cy: 0.78, size: 380, color: "#e6d3ea", rotationCycles: -1, phase: 200 },
  { cx: 0.5, cy: 0.45, size: 300, color: "#f2e0bd", rotationCycles: 1, phase: 280 },
] as const;

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames; // 0..1, loops seamlessly

  const cols = Math.ceil(width / CELL_SIZE) + 1;
  const rows = Math.ceil(height / CELL_SIZE) + 1;

  // A soft diagonal shimmer that sweeps across the triangle grid twice per
  // loop (an integer number of cycles keeps the loop seamless).
  const waveCycles = 2;
  const wavePhase = progress * waveCycles * Math.PI * 2;

  const gridLines: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * CELL_SIZE;
      const y = row * CELL_SIZE;
      const tl = `${x},${y}`;
      const tr = `${x + CELL_SIZE},${y}`;
      const bl = `${x},${y + CELL_SIZE}`;
      const br = `${x + CELL_SIZE},${y + CELL_SIZE}`;

      const d = (row + col) * 0.35;
      const opacity = 0.06 + 0.16 * (0.5 + 0.5 * Math.sin(wavePhase - d));
      const stroke = `rgba(${LINE_RGB},${opacity.toFixed(3)})`;

      gridLines.push(
        <polygon
          key={`a-${row}-${col}`}
          points={`${tl} ${tr} ${bl}`}
          fill="none"
          stroke={stroke}
        />,
      );
      gridLines.push(
        <polygon
          key={`b-${row}-${col}`}
          points={`${tr} ${br} ${bl}`}
          fill="none"
          stroke={stroke}
        />,
      );
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#faf6f0" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {gridLines}
        {ACCENT_TRIANGLES.map((t, i) => {
          const angle = progress * t.rotationCycles * 360 + t.phase;
          const half = t.size / 2;
          const cx = t.cx * width;
          const cy = t.cy * height;
          const points = `${cx},${cy - half} ${cx + half},${cy + half} ${cx - half},${cy + half}`;

          return (
            <polygon
              key={i}
              points={points}
              fill={t.color}
              fillOpacity={0.3}
              transform={`rotate(${angle} ${cx} ${cy})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
