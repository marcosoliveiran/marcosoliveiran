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
import { Caption, FPS, HEIGHT, ThemeProvider, WIDTH } from "../kit";
import { VOOM, VOOM_THEME } from "../themes/voom";
import { buildCaptionEntries } from "./captions";
import * as M from "./motions";
import {
  SENTENCES,
  TOTAL_FRAMES,
  sentenceEnd,
  sentenceStart,
  wordAt as w,
} from "./timing";

// Vídeo "Creep": metade de cima = motions, metade de baixo = o Marcos (vídeo
// gravado e cortado por tools/cortar.mjs), legenda da fala rente à base da
// área segura. Cada motion é ligado a uma palavra da fala (veja T abaixo).

export const CREEP_FPS = FPS;
export const CREEP_DURATION_IN_FRAMES = TOTAL_FRAMES;
export const CREEP_SIZE = { width: WIDTH, height: HEIGHT };

// Legenda da fala: só no começo (o gancho e a abertura), a pedido do Marcos.
// CAPTION_UNTIL_SENTENCE = quantas frases do começo têm legenda (0 = nenhuma).
// CAPTION_SIZE = 1 é o tamanho padrão; menor deixa a legenda mais discreta.
const CAPTION_UNTIL_SENTENCE = 3;
const CAPTION_SIZE = 0.72;

const STAGE = { x: 60, y: 250 };
const PANEL_HEIGHT = 800;
const CAPTION_BOTTOM = 1440;

// --- Momentos (segundos, no vídeo cortado) ----------------------------------------
const T = {
  vinil: w(1, /^mais$/),
  odeiam: w(1, /^odeiam/),
  thom: w(2, /^Tom$/),
  anos80: w(2, /^universit/),
  obcecado: w(3, /^obcecad/),
  estudio: w(4, /^estúdio/),
  cover: w(4, /^couve/),
  take: w(4, /^take$/),
  guitarrista: w(5, /^guitarista/),
  sabotar: w(5, /^sabotar/),
  distorcao: w(5, /^distorção/),
  marca: w(5, /^marca$/),
  lancada: w(6, /^Lançada/),
  bbc: w(7, /^BBC/),
  s78: w(7, /^sceptuagesmo/),
  eua: w(7, /^Estados$/),
  segundo: w(8, /^segundo/),
  s34: w(8, /^trigésimo/),
  setimo: w(9, /^sétimo/),
  plagio: w(10, /^plágio/),
  air: w(11, /^the$/),
  creditados: w(11, /^acreditados/),
  maldicao: w(12, /^audição/),
  turne: w(13, /^torneia/),
  conheciam: w(13, /^só$/),
  lixo: w(14, /Lixo/i),
  coquinho: w(14, /^catar/),
  okc: w(15, /^K-Compiler/),
  setlist: w(15, /^set$/),
  jonny: w(16, /^Johnny$/),
  bogota: w(17, /^Bogotá/),
  y2025: w(18, /^2025/),
  n34: w(19, /^34º/),
  bi: w(19, /^3$/),
  acha: w(20, /^acha$/),
  conta: w(20, /^Conta$/),
  comentarios: w(20, /^comentários/),
  siga: w(20, /^siga/),
};
const END = SENTENCES[SENTENCES.length - 1].endMs / 1000 + 0.5;

// --- Motions: de quando a quando ------------------------------------------------------
type Motion = { id: string; from: number; to: number; node: ReactNode };

const MOTIONS: Motion[] = [
  { id: "vinil", from: T.vinil, to: T.thom, node: <M.Vinyl /> },
  { id: "odeiam", from: T.odeiam, to: T.thom, node: <M.StampOdeiam /> },
  { id: "thom", from: T.thom, to: T.estudio, node: <M.ThomPhoto /> },
  { id: "anos80", from: T.anos80, to: T.estudio, node: <M.FimAnos80 /> },
  {
    id: "coracao-partido",
    from: T.obcecado,
    to: T.estudio,
    node: <M.BrokenHeart />,
  },
  { id: "banda", from: T.estudio, to: T.guitarrista, node: <M.BandPhoto /> },
  {
    id: "original",
    from: T.cover,
    to: T.guitarrista,
    node: <M.StampOriginal />,
  },
  { id: "rec", from: T.take, to: T.guitarrista, node: <M.RecTake /> },
  { id: "jonny", from: T.guitarrista, to: T.lancada, node: <M.JonnyPhoto /> },
  { id: "bomba", from: T.sabotar, to: T.marca, node: <M.Bomb /> },
  {
    id: "onda",
    from: T.distorcao,
    to: T.distorcao + 1.8,
    node: <M.SoundWave />,
  },
  { id: "trofeu", from: T.marca, to: T.lancada, node: <M.Trophy /> },
  { id: "single", from: T.lancada, to: T.eua, node: <M.SingleCover /> },
  { id: "bbc", from: T.bbc, to: T.s78, node: <M.BbcLogo /> },
  { id: "grafico", from: T.s78, to: T.eua, node: <M.FallingChart /> },
  { id: "pablo", from: T.eua, to: T.plagio, node: <M.PabloHoney /> },
  {
    id: "selos",
    from: T.segundo,
    to: T.plagio,
    node: (
      <M.Seals
        times={[
          0,
          Math.round((T.s34 - T.segundo) * FPS),
          Math.round((T.setimo - T.segundo) * FPS),
        ]}
      />
    ),
  },
  { id: "martelo", from: T.plagio, to: T.air, node: <M.Gavel /> },
  { id: "capas", from: T.air, to: T.creditados, node: <M.CoversEquals /> },
  {
    id: "creditos",
    from: T.creditados,
    to: sentenceEnd(11),
    node: <M.Credits />,
  },
  {
    id: "plateia",
    from: sentenceStart(13),
    to: T.conheciam,
    node: <M.Crowd />,
  },
  { id: "silhuetas", from: T.conheciam, to: T.lixo, node: <M.Silhouettes /> },
  { id: "crap", from: T.lixo, to: T.coquinho, node: <M.ThomCrap /> },
  { id: "coqueiro", from: T.coquinho, to: T.okc, node: <M.PalmTree /> },
  { id: "okcomputer", from: T.okc, to: T.jonny, node: <M.OkComputer /> },
  { id: "setlist", from: T.setlist, to: T.jonny, node: <M.SetlistSheet /> },
  { id: "jonny-frase", from: T.jonny, to: T.bogota, node: <M.JonnyQuote /> },
  { id: "calendario", from: T.bogota, to: T.y2025, node: <M.Calendar /> },
  { id: "setlist-2025", from: T.y2025, to: T.n34, node: <M.Setlist2025 /> },
  {
    id: "numeros-esq",
    from: T.n34,
    to: sentenceEnd(19),
    node: <M.NumbersLeft />,
  },
  {
    id: "numeros-dir",
    from: T.bi,
    to: sentenceEnd(19),
    node: <M.NumbersRight />,
  },
  { id: "balao", from: T.comentarios, to: END, node: <M.CommentBubble /> },
  { id: "seguir", from: T.siga, to: END, node: <M.FollowButton /> },
];

// --- Enquadramentos ----------------------------------------------------------------------
// A = aberto, B = médio (112%), C = tela cheia (135%) sem o painel de motions.
type Mode = "A" | "B" | "C";
type Framing = { scale: number; x: number; y: number; panel: number };

// Centro do rosto no vídeo de 1080 x 1920 (medido num quadro da gravação).
const FACE = { x: 590, y: 816 };
const FRAMINGS: Record<Mode, Framing> = {
  A: { scale: 1.0, x: 590, y: 1056, panel: PANEL_HEIGHT },
  B: { scale: 1.12, x: 540, y: 1050, panel: PANEL_HEIGHT },
  C: { scale: 1.35, x: 500, y: 800, panel: 0 },
};

type Shot = { from: number; to: number; mode: Mode };

const buildShots = (): Shot[] => {
  const shots: Shot[] = [];
  SENTENCES.forEach((_, i) => {
    const n = i + 1;
    const from = sentenceStart(n);
    const to = i + 1 < SENTENCES.length ? sentenceStart(n + 1) : END + 1;
    if (n === 12) {
      shots.push({ from, to, mode: "C" });
    } else if (n === 20) {
      shots.push({ from, to: T.conta, mode: "C" });
      shots.push({ from: T.conta, to, mode: "A" });
    } else {
      shots.push({ from, to, mode: n % 2 === 1 ? "A" : "B" });
    }
  });
  return shots;
};
const SHOTS = buildShots();

const BLEND_SECONDS = 0.35;

const framingAt = (time: number): { framing: Framing; progress: number } => {
  let index = SHOTS.findIndex((s) => time >= s.from && time < s.to);
  if (index < 0) {
    index = time < SHOTS[0].from ? 0 : SHOTS.length - 1;
  }
  const shot = SHOTS[index];
  const previous = SHOTS[Math.max(0, index - 1)];
  const current = FRAMINGS[shot.mode];
  const smooth = shot.mode === "C" || previous.mode === "C";
  const t = smooth
    ? interpolate(time, [shot.from, shot.from + BLEND_SECONDS], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const before = FRAMINGS[previous.mode];
  const mix = (a: number, b: number) => a + (b - a) * t;
  const progress = Math.min(
    1,
    Math.max(0, (time - shot.from) / Math.max(0.1, shot.to - shot.from)),
  );
  return {
    framing: {
      scale: mix(before.scale, current.scale),
      x: mix(before.x, current.x),
      y: mix(before.y, current.y),
      panel: mix(before.panel, current.panel),
    },
    progress,
  };
};

// --- Efeitos sonoros ------------------------------------------------------------------------
const SFX: Array<[number, string, number]> = [
  [T.vinil, "whoosh.wav", 0.35],
  [T.odeiam, "stamp.wav", 0.85],
  [T.thom, "whoosh.wav", 0.4],
  [T.obcecado, "pop.wav", 0.5],
  [T.estudio, "whoosh.wav", 0.35],
  [T.cover, "stamp.wav", 0.6],
  [T.take, "rec.wav", 0.45],
  [T.guitarrista, "whoosh.wav", 0.4],
  [T.sabotar, "fuse.wav", 0.5],
  [T.distorcao, "riser.wav", 0.45],
  [T.marca, "sparkle.wav", 0.5],
  [T.lancada, "whoosh.wav", 0.4],
  [T.bbc + 0.35, "stamp.wav", 0.5],
  [T.s78, "riser.wav", 0.4],
  [T.s78 + 1, "impact.wav", 0.5],
  [T.eua, "whoosh.wav", 0.4],
  [T.segundo, "stamp.wav", 0.7],
  [T.s34, "stamp.wav", 0.7],
  [T.setimo, "stamp.wav", 0.7],
  [T.plagio + 0.1, "gavel.wav", 0.85],
  [T.air, "whoosh.wav", 0.4],
  [T.creditados, "pop.wav", 0.5],
  [T.creditados + 1.1, "pop.wav", 0.45],
  [T.maldicao, "impact.wav", 0.7],
  [sentenceStart(13), "whoosh.wav", 0.35],
  [T.turne, "riser.wav", 0.4],
  [T.conheciam, "whoosh.wav", 0.3],
  [T.lixo, "stamp.wav", 0.5],
  [T.coquinho, "bounce.wav", 0.7],
  [T.okc, "whoosh.wav", 0.4],
  [T.setlist, "pop.wav", 0.5],
  [T.setlist + 0.9, "click.wav", 0.5],
  [T.jonny, "pop.wav", 0.4],
  [T.bogota, "whoosh.wav", 0.4],
  [T.bogota + 1.3, "ding.wav", 0.5],
  [T.y2025, "whoosh.wav", 0.4],
  [T.n34, "whoosh.wav", 0.3],
  [T.bi, "riser.wav", 0.5],
  [T.bi + 1.4, "ding.wav", 0.5],
  [T.acha, "pop.wav", 0.5],
  [T.comentarios, "pop.wav", 0.5],
  [T.siga, "pop.wav", 0.5],
  [T.siga + 0.8, "notification.wav", 0.5],
];

// Tremida de tela logo depois de uma batida (carimbo, martelo).
const shake = (time: number, start: number): number => {
  const dt = time - start;
  if (dt < 0 || dt > 0.6) {
    return 0;
  }
  return 12 * Math.exp(-dt * 9) * Math.sin(dt * 70);
};

const CAPTIONS = buildCaptionEntries();
const GLOOM_FROM = T.maldicao;
const GLOOM_TO = T.okc;

const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: VOOM.black }} />
);

export const CreepVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const { framing, progress } = framingAt(time);

  const scale = framing.scale * (1 + 0.025 * progress);
  const panel = framing.panel;
  const video = {
    width: WIDTH * scale,
    height: HEIGHT * scale,
    left: framing.x - FACE.x * scale,
    top: framing.y - FACE.y * scale - panel,
  };

  const gloom = interpolate(
    time,
    [GLOOM_FROM, GLOOM_FROM + 0.6, GLOOM_TO - 0.4, GLOOM_TO],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const jitter = shake(time, T.odeiam) + shake(time, T.plagio + 0.1);

  return (
    <ThemeProvider value={VOOM_THEME}>
      <AbsoluteFill style={{ backgroundColor: VOOM.black }}>
        <Background />

        {/* O Marcos (vídeo cortado) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: panel,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: video.left,
              top: video.top,
              width: video.width,
              height: video.height,
              filter: `saturate(${1 - 0.45 * gloom}) brightness(${1 - 0.18 * gloom}) contrast(${1 + 0.1 * gloom})`,
            }}
          >
            <OffthreadVideo
              src={staticFile("creep/fala.mp4")}
              style={{ width: "100%", height: "100%", objectFit: "fill" }}
            />
          </div>
        </div>

        {/* Painel de motions */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: WIDTH,
            height: panel,
            overflow: "hidden",
            backgroundColor: VOOM.black,
            borderRadius: "0 0 56px 56px",
            boxShadow: panel > 4 ? "0 24px 60px rgba(0,0,0,0.55)" : "none",
          }}
        >
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle at 88% 96%, rgba(198,255,26,0.14), transparent 46%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: STAGE.x,
              top: STAGE.y,
              width: 880,
              height: 550,
              transform: `translate(${jitter}px, ${-jitter * 0.6}px)`,
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
        </div>

        {/* Vinheta pesada: "maldição" */}
        <AbsoluteFill
          style={{
            opacity: gloom,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.78) 100%)",
          }}
        />

        {/* Coração do CTA, sobre o vídeo em tela cheia */}
        <Sequence
          from={Math.round(T.acha * fps)}
          durationInFrames={Math.max(8, Math.round((T.conta - T.acha) * fps))}
          name="coracao"
        >
          <Window style={{ alignItems: "center", paddingTop: 270 }}>
            <M.HeartPulse size={250} />
          </Window>
        </Sequence>

        {/* Legenda da fala, sempre rente à base da área segura */}
        {CAPTIONS.filter(
          (entry) => entry.sentence <= CAPTION_UNTIL_SENTENCE,
        ).map((entry, i) => (
          <Sequence
            key={i}
            from={Math.round(entry.from * fps)}
            durationInFrames={Math.max(
              6,
              Math.round((entry.to - entry.from) * fps),
            )}
            name={`legenda ${i + 1}`}
          >
            <Caption
              parts={entry.parts}
              y={CAPTION_BOTTOM}
              onPanel={false}
              variant={entry.style}
              size={CAPTION_SIZE}
            />
          </Sequence>
        ))}

        {/* Efeitos sonoros */}
        {SFX.map(([at, file, volume], i) => (
          <Sequence
            key={`sfx-${i}`}
            from={Math.round(at * fps)}
            layout="none"
            name={`sfx ${file}`}
          >
            <Html5Audio src={staticFile(`sfx/${file}`)} volume={() => volume} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </ThemeProvider>
  );
};

// Entrada e saída curtas de cada motion (a saída evita o "pulo" seco).
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
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  return <AbsoluteFill style={{ opacity, ...style }}>{children}</AbsoluteFill>;
};
