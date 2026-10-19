import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH } from "../kit";
import { SafeImage } from "../kimi/motions";
import { VOOM, VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "../themes/voom";

// Quadro "Por Onde Anda?": cartaz de procurado em tela cheia (a capa do vídeo).
// De cima para baixo: o título bem grande, a foto de "procurada" e a faixa
// "Episódio N: Nome", como a de um escudo. Tudo importante fica dentro da área
// segura (x 60 a 940, y 250 a 1440); só o papel sangra até as bordas.

export type CapaProps = {
  episode?: number;
  name?: string;
  photo?: string; // arquivo em public/poronde (png, jpg, jpeg ou webp)
  female?: boolean; // PROCURADA x PROCURADO
};

const CENTER_X = 500; // centro útil (a direita é coberta pelos botões)

const Paper: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: VOOM.offWhite,
      backgroundImage: [
        // vinheta e manchas de papel
        "radial-gradient(circle at 50% 42%, rgba(255,255,255,0) 45%, rgba(120,110,90,0.28) 100%)",
        "radial-gradient(circle at 18% 12%, rgba(120,110,90,0.10), transparent 26%)",
        "radial-gradient(circle at 86% 78%, rgba(120,110,90,0.10), transparent 30%)",
        // duas dobras suaves (uma vertical, uma horizontal), com sombra e luz
        "linear-gradient(90deg, transparent 49.2%, rgba(255,255,255,0.35) 49.7%, rgba(80,70,50,0.10) 50.1%, transparent 50.8%)",
        "linear-gradient(0deg, transparent 49.2%, rgba(255,255,255,0.30) 49.7%, rgba(80,70,50,0.08) 50.1%, transparent 50.8%)",
      ].join(", "),
    }}
  />
);

const Tape: React.FC<{ x: number; y: number; rotate: number }> = ({
  x,
  y,
  rotate,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 150,
      height: 46,
      background: "rgba(198,255,26,0.82)",
      transform: `rotate(${rotate}deg)`,
      boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
    }}
  />
);

// Faixa de escudo: pontas dobradas para trás e cortes em "V".
const Ribbon: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "relative", width: 860, height: 190 }}>
    <svg viewBox="0 0 860 190" width="860" height="190">
      {/* pontas dobradas atrás */}
      <polygon points="0,52 90,52 90,176 0,176 38,114" fill="#2a2a28" />
      <polygon points="860,52 770,52 770,176 860,176 822,114" fill="#2a2a28" />
      {/* dobras escuras */}
      <polygon points="90,128 90,176 150,128" fill="#000" />
      <polygon points="770,128 770,176 710,128" fill="#000" />
      {/* faixa principal */}
      <polygon
        points="60,18 800,18 800,146 60,146"
        fill={VOOM.black}
        stroke={VOOM.lime}
        strokeWidth="6"
      />
      <polygon
        points="60,38 800,38 800,126 60,126"
        fill="none"
        stroke={VOOM.lime}
        strokeWidth="2"
        strokeDasharray="10 8"
      />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 60,
        top: 18,
        width: 740,
        height: 128,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: 64,
        letterSpacing: 2,
        color: VOOM.offWhite,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  </div>
);

export const Capa: React.FC<CapaProps> = ({
  episode = 1,
  name = "JoJo",
  photo = "jojo-2000s",
  female = true,
}) => (
  <AbsoluteFill style={{ backgroundColor: VOOM.offWhite }}>
    <Paper />

    {/* Título */}
    <div
      style={{
        position: "absolute",
        left: 60,
        width: 880,
        top: 262,
        textAlign: "center",
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        color: VOOM.black,
        lineHeight: 0.92,
      }}
    >
      <div style={{ fontSize: 178, letterSpacing: -2 }}>POR ONDE</div>
      <div
        style={{
          display: "inline-block",
          marginTop: 10,
          padding: "0 34px 8px",
          fontSize: 200,
          background: VOOM.lime,
          transform: "rotate(-2deg)",
          boxShadow: "0 10px 0 rgba(0,0,0,0.9)",
        }}
      >
        ANDA?
      </div>
    </div>

    {/* Foto de procurada */}
    <div
      style={{
        position: "absolute",
        left: CENTER_X - 310,
        top: 752,
        width: 620,
        height: 610,
        transform: "rotate(-2deg)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: VOOM.black,
          padding: 16,
          boxSizing: "border-box",
          boxShadow: "0 22px 34px rgba(0,0,0,0.38)",
        }}
      >
        <div
          style={{
            height: 92,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 84,
            letterSpacing: 6,
            color: VOOM.offWhite,
            lineHeight: 1,
          }}
        >
          {female ? "PROCURADA" : "PROCURADO"}
        </div>
        <div
          style={{
            position: "relative",
            height: 470,
            background: "#1c1c1b",
            filter: "grayscale(1) contrast(1.15)",
            overflow: "hidden",
          }}
        >
          <SafeImage
            file={photo}
            dir="poronde"
            fit="cover"
            position="50% 25%"
          />
        </div>
      </div>
      <Tape x={-52} y={-12} rotate={-38} />
      <Tape x={522} y={-12} rotate={38} />
    </div>

    {/* Faixa Episódio N: Nome */}
    <div
      style={{
        position: "absolute",
        left: CENTER_X - 430,
        top: 1236,
        transform: "rotate(1.5deg)",
        filter: "drop-shadow(0 14px 16px rgba(0,0,0,0.45))",
      }}
    >
      <Ribbon text={`Episódio ${episode}: ${name}`} />
    </div>

    <div
      style={{
        position: "absolute",
        left: 60,
        top: 1850,
        fontFamily: VOOM_TEXT_FONT,
        fontSize: 1,
        opacity: 0,
      }}
    >
      {WIDTH}x{HEIGHT}
    </div>
  </AbsoluteFill>
);
