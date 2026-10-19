import { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, HEIGHT, ThemeProvider, WIDTH } from "../kit";
import { VOOM, VOOM_TEXT_FONT, VOOM_THEME } from "../themes/voom";
import * as M from "./motions";
import { END, ESTIMADO, HAS_VIDEO, T, TOTAL_FRAMES } from "./timing";

// Vídeo do Kimi Antonelli (perfil @marcosoliveiran), no formato do Creep: o
// Marcos de frente para a câmera embaixo, motions em cima. Sem legenda da fala,
// só palavras-chave junto com os motions (a pedido do Marcos). Painel
// transparente: o fundo do vídeo aparece e cada recurso tem a sua sombra.
// Roteiro e mapa: docs/kimi-direcao.md.

export const KIMI_FPS = FPS;
export const KIMI_DURATION_IN_FRAMES = TOTAL_FRAMES;
export const KIMI_SIZE = { width: WIDTH, height: HEIGHT };

const STAGE = { x: 60, y: 250 };

// --- Motions: de quando a quando (segundos, na fala) -------------------------------
type Motion = { id: string; from: number; to: number; node: ReactNode };

const KEY_LEN = 1.5;
const rel = (a: number, b: number) => Math.max(0, b - a);

const MOTIONS: Motion[] = [
  // 1 · Gancho (a capa é o frame 0)
  { id: "kimi-capa", from: 0, to: T.sabe - 0.1, node: <M.KimiCover /> },
  {
    id: "capa-texto",
    from: 0,
    to: T.antonelliEnd + 0.15,
    node: <M.CoverText />,
  },
  {
    id: "campeao",
    from: T.campeao,
    to: T.campeao + KEY_LEN,
    node: <M.Keyword text="CAMPEÃO MAIS JOVEM" />,
  },
  {
    id: "vinte",
    from: T.vinte1,
    to: T.sabe - 0.1,
    node: <M.Twenty />,
  },
  // 2 · Suprema
  {
    id: "suprema",
    from: T.sabe,
    to: T.fracaEnd + 0.3,
    node: (
      <M.Suprema
        stampAt={rel(T.sabe, T.suprema)}
        barsAt={rel(T.sabe, T.anterior)}
      />
    ),
  },
  // 3 · Mercedes, Hamilton, Ferrari, Schumacher
  { id: "mercedes", from: T.mercedes, to: T.lugar, node: <M.MercedesKimi /> },
  {
    id: "substituto",
    from: T.lugar,
    to: T.lugar + KEY_LEN,
    node: <M.Keyword text="SUBSTITUTO" />,
  },
  {
    id: "hamilton",
    from: T.lugar,
    to: T.ferrari1,
    node: <M.HamiltonTitles titlesAt={rel(T.lugar, T.sete1)} />,
  },
  {
    id: "titulos7",
    from: T.sete1,
    to: T.sete1 + KEY_LEN,
    node: <M.Keyword text="7 TÍTULOS" />,
  },
  {
    id: "ferrari",
    from: T.ferrari1,
    to: T.ferrari2 + 0.1,
    node: <M.FerrariArrow />,
  },
  {
    id: "schumacher",
    from: T.schumacher,
    to: T.acompanhou,
    node: (
      <M.Schumacher
        dotsAt={0.6}
        fiveAt={Math.max(0.8, rel(T.schumacher, T.cinco))}
      />
    ),
  },
  {
    id: "cinco-dos-sete",
    from: T.cinco,
    to: T.cinco + KEY_LEN,
    node: <M.Keyword text="5 DOS 7" />,
  },
  // 5 · As corridas e o título italiano
  { id: "mais100", from: T.cem, to: T.austin, node: <M.PlusHundred /> },
  {
    id: "corridas",
    from: T.austin,
    to: T.ascari,
    node: (
      <M.RaceChips
        mexicoAt={rel(T.austin, T.mexico)}
        pauloAt={rel(T.austin, T.paulo)}
      />
    ),
  },
  {
    id: "ascari",
    from: T.ascari,
    to: T.mas + 0.4,
    node: (
      <M.Ascari
        yearsAt={rel(T.ascari, T.y1953)}
        countAt={rel(T.ascari, T.y1953) + 0.1}
        countDur={0.5}
      />
    ),
  },
  // 6 · CTA
  {
    id: "pra-quem-vai",
    from: T.quem,
    to: T.quem + KEY_LEN,
    node: <M.Keyword text="PRA QUEM VAI?" />,
  },
  {
    id: "versus",
    from: T.quem,
    to: T.segue,
    node: <M.VersusHeads cycleAt={0.5} />,
  },
  {
    id: "segue",
    from: T.segue,
    to: END,
    node: <M.Keyword text="SEGUE" />,
  },
];

// --- Enquadramentos -----------------------------------------------------------------
// Cada plano é um corte seco (como no CapCut) com um zoom lento durante o trecho.
// scale 1,2 = aberto: é o mais distante possível, porque abaixo disso o vídeo
// deixa de cobrir o topo do quadro. `y` é onde fica o centro do rosto; nos
// planos fechados ele desce um pouco para a testa não encostar nas palavras-chave.
type Shot = { at: number; scale: number; y: number };

const FACE = { x: 590, y: 816 }; // centro do rosto no vídeo de 1080 x 1920
const PUSH = 0.04; // zoom lento de cada plano
// A fala já vem perto de 0 dB; um pouco abaixo deixa folga para os efeitos sem estourar.
const VOICE_VOLUME = 0.85;
const OPEN = { scale: 1.2, y: 970 };
const MID = { scale: 1.4, y: 1005 };

const SHOTS: Shot[] = [
  { at: 0, ...OPEN }, // capa
  { at: T.italiano - 0.05, ...MID },
  { at: T.sabe - 0.05, scale: 1.7, y: 1080 }, // Suprema: tom de segredo
  { at: T.kimEntrou - 0.05, ...OPEN },
  { at: T.hamilton - 0.1, ...MID },
  { at: T.schumacher - 0.1, scale: 1.65, y: 1075 },
  { at: T.acompanhou - 0.05, scale: 1.75, y: 1085 }, // só o rosto
  { at: T.com - 0.05, ...OPEN },
  { at: T.austin - 0.1, ...MID },
  { at: T.mexico - 0.1, scale: 1.6, y: 1060 },
  { at: T.ascari - 0.1, ...MID },
  { at: T.mas - 0.05, ...OPEN },
  { at: T.conta - 0.05, scale: 1.7, y: 1080 }, // convite íntimo
];

const framingAt = (time: number): { shot: Shot; progress: number } => {
  let index = 0;
  SHOTS.forEach((shot, i) => {
    if (time >= shot.at) {
      index = i;
    }
  });
  const from = SHOTS[index].at;
  const to = index + 1 < SHOTS.length ? SHOTS[index + 1].at : END;
  const progress = Math.min(
    1,
    Math.max(0, (time - from) / Math.max(0.1, to - from)),
  );
  return { shot: SHOTS[index], progress };
};

// --- Efeitos sonoros ------------------------------------------------------------------
// [segundo, arquivo, volume, velocidade (opcional)]. Sons novos: tools/make-sfx-kimi.py.
type Sfx = [number, string, number, number?];

// Cortes de câmera: swish curto em todos; plano mais fechado ganha o som de aproximação.
const CUT_SFX: Sfx[] = SHOTS.slice(1).flatMap((shot, i): Sfx[] => {
  const closer = shot.scale > SHOTS[i].scale;
  return [
    [shot.at, "k-corte.wav", 0.5],
    ...(closer ? ([[shot.at - 0.05, "k-zoom.wav", 0.4]] as Sfx[]) : []),
  ];
});

// Cartões de foto entrando (e as trocas de rival no CTA).
const SWAPS: Sfx[] = [];
for (let t = T.quem + 0.5; t < T.segue - 0.3; t += 28 / FPS) {
  SWAPS.push([t, "k-card.wav", 0.4]);
}

const SFX: Sfx[] = [
  ...CUT_SFX,
  ...SWAPS,
  [T.campeao, "pop.wav", 0.45],
  [T.vinte1, "riser.wav", 0.4],
  [T.sabe, "k-card.wav", 0.5],
  [T.suprema, "stamp.wav", 0.85],
  [T.anterior, "riser.wav", 0.4],
  [T.mercedes, "k-card.wav", 0.5],
  [T.lugar, "k-card.wav", 0.5],
  [T.lugar + 0.1, "pop.wav", 0.45],
  [T.sete1, "riser.wav", 0.4],
  [T.sete1 + 0.9, "ding.wav", 0.45],
  [T.ferrari1, "whoosh.wav", 0.4],
  [T.schumacher, "k-card.wav", 0.5],
  ...[0, 1, 2, 3, 4].map(
    (i): Sfx => [
      T.schumacher + Math.max(0.8, T.cinco - T.schumacher) + 0.18 * i,
      "k-dot.wav",
      0.4,
      1 + 0.12 * i,
    ],
  ),
  [T.cinco, "sparkle.wav", 0.45],
  [T.cem, "riser.wav", 0.45],
  [T.cem + 0.7, "impact.wav", 0.5],
  [T.austin, "pop.wav", 0.5],
  [T.mexico, "pop.wav", 0.5],
  [T.paulo, "pop.wav", 0.5],
  [T.ascari, "k-card.wav", 0.5],
  [T.y1953, "riser.wav", 0.35],
  [T.y1953 + 0.5, "ding.wav", 0.5],
  [T.quem, "impact.wav", 0.55],
  [T.quem + 0.5, "pop.wav", 0.4],
  [T.segue, "notification.wav", 0.5],
];

// --- Vídeo do Marcos --------------------------------------------------------------------
const FacePlaceholder: React.FC = () => (
  <svg
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    width="100%"
    height="100%"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#343432" />
        <stop offset="1" stopColor="#1c1c1b" />
      </linearGradient>
    </defs>
    <rect width={WIDTH} height={HEIGHT} fill="url(#wall)" />
    <ellipse cx={FACE.x} cy={1330} rx={330} ry={260} fill="#454542" />
    <circle cx={FACE.x} cy={FACE.y} r={150} fill="#5a5a56" />
    <text
      x={FACE.x}
      y={1560}
      textAnchor="middle"
      fontFamily={VOOM_TEXT_FONT}
      fontWeight={800}
      fontSize={34}
      fill={VOOM.gray}
    >
      quadro de reserva: coloque public/kimi/fala.mp4 e use npm run render:kimi
    </text>
  </svg>
);

export type KimiProps = { hasVideo?: boolean };

export const KimiVideo: React.FC<KimiProps> = ({ hasVideo = HAS_VIDEO }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const { shot, progress } = framingAt(time);

  const scale = shot.scale * (1 + PUSH * progress);
  const video = {
    width: WIDTH * scale,
    height: HEIGHT * scale,
    left: FACE.x - FACE.x * scale,
    top: shot.y - FACE.y * scale,
  };

  return (
    <ThemeProvider value={VOOM_THEME}>
      <AbsoluteFill style={{ backgroundColor: VOOM.black }}>
        {/* O Marcos (vídeo já editado no CapCut, sem legenda) */}
        <div
          style={{
            position: "absolute",
            left: video.left,
            top: video.top,
            width: video.width,
            height: video.height,
          }}
        >
          {hasVideo ? (
            <OffthreadVideo
              src={staticFile("kimi/fala.mp4")}
              volume={VOICE_VOLUME}
              style={{ width: "100%", height: "100%", objectFit: "fill" }}
            />
          ) : (
            <FacePlaceholder />
          )}
        </div>

        {/* Motions (painel transparente, dentro da área segura) */}
        <div
          style={{
            position: "absolute",
            left: STAGE.x,
            top: STAGE.y,
            width: 880,
            height: 550,
          }}
        >
          {MOTIONS.map((motion) => (
            <Sequence
              key={motion.id}
              from={Math.round(motion.from * fps)}
              durationInFrames={Math.max(
                8,
                Math.round((motion.to - motion.from) * fps),
              )}
              name={motion.id}
            >
              <Window>{motion.node}</Window>
            </Sequence>
          ))}
        </div>

        {ESTIMADO && !hasVideo ? (
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 1500,
              fontFamily: VOOM_TEXT_FONT,
              fontWeight: 800,
              fontSize: 26,
              color: VOOM.gray,
            }}
          >
            tempos estimados: rode npm run kimi:info com a transcrição real
          </div>
        ) : null}

        {/* Efeitos sonoros */}
        {SFX.map(([at, file, volume, rate = 1], i) => (
          <Sequence
            key={`sfx-${i}`}
            from={Math.round(at * fps)}
            layout="none"
            name={`sfx ${file}`}
          >
            <Html5Audio
              src={staticFile(`sfx/${file}`)}
              volume={() => volume}
              playbackRate={rate}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
    </ThemeProvider>
  );
};

// Saída curta de cada motion (evita o "pulo" seco). A entrada fica por conta
// de cada motion, para a capa já estar completa no frame 0.
const Window: React.FC<{ children: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(
    frame,
    [durationInFrames - 6, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity, ...style }}>{children}</AbsoluteFill>;
};
