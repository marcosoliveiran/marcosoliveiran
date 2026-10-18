import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HERING } from "../themes/hering";
import { MouthPlacement } from "./timing";

// Boca de desenho da camiseta: carnuda, brilhosa e exagerada. `open` vai de 0
// (fechada) a 1 (aberta). Cartunesca de propósito (o briefing proíbe apelo
// sensual).
export const MouthShape: React.FC<{ open: number; width: number }> = ({
  open,
  width,
}) => {
  const gap = 6 + open * 74;
  const top = 100 - gap / 2;
  const bottom = 100 + gap / 2;
  const lip = HERING.coral;
  const lipDark = "#B8403F";

  return (
    <svg
      width={width}
      height={width * (230 / 300)}
      viewBox="0 0 300 230"
      style={{ overflow: "visible" }}
    >
      <defs>
        <clipPath id="mouth-inside">
          <path
            d={`M18,100 C80,${top - 8} 220,${top - 8} 282,100 C220,${bottom + 8} 80,${bottom + 8} 18,100 Z`}
          />
        </clipPath>
      </defs>
      {/* lábio de baixo, cheio */}
      <path
        d={`M12,100 C70,${bottom - 4} 230,${bottom - 4} 288,100 C268,${178 + gap * 0.3} 32,${178 + gap * 0.3} 12,100 Z`}
        fill={lip}
        stroke={lipDark}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* interior */}
      <path
        d={`M18,100 C80,${top - 8} 220,${top - 8} 282,100 C220,${bottom + 8} 80,${bottom + 8} 18,100 Z`}
        fill="#5B1620"
      />
      <g clipPath="url(#mouth-inside)">
        <rect x={40} y={top - 6} width={220} height={26} rx={8} fill="#FFFFFF" />
        <ellipse cx={150} cy={bottom + 4} rx={70} ry={20} fill="#C2495B" />
      </g>
      {/* lábio de cima, com as duas curvas */}
      <path
        d={`M10,100 C40,18 118,22 150,52 C182,22 260,18 290,100 C250,${top + 2} 190,${top - 6} 150,${top - 4} C110,${top - 6} 50,${top + 2} 10,100 Z`}
        fill={lip}
        stroke={lipDark}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* brilho */}
      <ellipse
        cx={92}
        cy={50}
        rx={34}
        ry={9}
        fill="#FFFFFF"
        opacity={0.55}
        transform="rotate(-14 92 50)"
      />
      <ellipse
        cx={150}
        cy={bottom + 24 + gap * 0.1}
        rx={40}
        ry={8}
        fill="#FFFFFF"
        opacity={0.5}
      />
    </svg>
  );
};

// Abertura da boca no frame: um pulso por sílaba, com variação para não ficar
// mecânico. `syllables` vem do texto da fala do trecho.
export const mouthOpenAt = (
  frame: number,
  length: number,
  syllables: number,
): number => {
  if (frame < 0 || frame > length) {
    return 0;
  }
  const t = (frame / length) * syllables;
  const index = Math.floor(t);
  const phase = t - index;
  const variation = 0.55 + 0.45 * Math.abs(Math.sin(index * 2.399));
  const pulse = Math.pow(Math.sin(Math.PI * phase), 0.8);
  const ending = Math.min(1, (length - frame) / 4);
  return Math.max(0, Math.min(1, pulse * variation * ending));
};

export const TalkingMouth: React.FC<{
  place: MouthPlacement;
  syllables: number;
}> = ({ place, syllables }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 190 } });
  const open = mouthOpenAt(frame, durationInFrames - 4, syllables);
  const wobble = Math.sin(frame * 0.7) * 1.6 * open;

  return (
    <div
      style={{
        position: "absolute",
        left: place.x - place.size / 2,
        top: place.y - place.size / 2,
        transform: `rotate(${place.rot + wobble}deg) scale(${pop * (1 + open * 0.05)})`,
        filter: "drop-shadow(0 10px 14px rgba(10, 20, 40, 0.35))",
      }}
    >
      <MouthShape open={open} width={place.size} />
    </div>
  );
};

// Clipe da boca solta, em fundo transparente, para sobrepor no CapCut. Uma
// composição por fala dela (a duração vem de SEGMENTS); no CapCut basta
// posicionar sobre o peito e alinhar com o áudio.
export const MouthClip: React.FC<{ syllables: number }> = ({ syllables }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 11, stiffness: 190 } });
  const open = mouthOpenAt(frame, durationInFrames - 4, syllables);
  const wobble = Math.sin(frame * 0.7) * 1.6 * open;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${-4 + wobble}deg) scale(${pop * (1 + open * 0.05)})`,
      }}
    >
      <MouthShape open={open} width={MOUTH_CLIP_SIZE.width - 80} />
    </div>
  );
};

// Quadro estático da boca em um estado (0 fechada, 1 aberta), para PNG.
export const MouthStill: React.FC<{ open: number }> = ({ open }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MouthShape open={open} width={MOUTH_CLIP_SIZE.width - 80} />
  </div>
);

export const MOUTH_CLIP_SIZE = { width: 720, height: 560 };
