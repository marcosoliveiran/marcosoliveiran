import { ReactNode } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Caption, HEIGHT, ThemeProvider, WIDTH } from "../kit";
import { HERING, HERING_THEME } from "../themes/hering";
import { TalkingMouth } from "./Mouth";
import * as M from "./motions";
import {
  FPS,
  HAS_PALMAS,
  HAS_RISADA,
  HAS_VIDEO,
  SEGMENTS,
  TOTAL_FRAMES,
  pageRanges,
  segmentById,
  syllablesOf,
} from "./timing";

// Publi Hering (Camiseta Brasil): sitcom "Episódio 1: A síndrome de
// protagonista". A camiseta fala (voz dela, legenda em azul Hering), o Marcos
// obedece. Vídeo do CapCut em public/hering/video.mp4; tempos em ./timing.ts.

export const HERING_FPS = FPS;
export const HERING_DURATION_IN_FRAMES = TOTAL_FRAMES;
export const HERING_SIZE = { width: WIDTH, height: HEIGHT };

const CAPTION_BOTTOM = 1440;
const sec = (s: number) => Math.round(s * FPS);

// Motions por trecho (id do trecho em SEGMENTS).
const MOTIONS: Record<string, { node: ReactNode; extra?: number }> = {
  abertura: { node: <M.CartelaEpisodio /> },
  e1: { node: <M.MantemACor /> },
  g2: { node: <M.GolaSeta /> },
  e3: { node: <M.AlgodaoOpaca /> },
  fecho: { node: <M.Preco /> },
  cta: { node: <M.SeloCta /> },
};

// Efeitos sonoros: [segundos, arquivo em public/sfx, volume].
const SFX: [number, string, number][] = [
  [0.1, "impact.wav", 0.6],
  [segmentById("e1").from, "ding.wav", 0.35],
  [segmentById("g2").from, "whoosh.wav", 0.4],
  [segmentById("e2").from, "ding.wav", 0.35],
  [segmentById("g3").from, "whoosh.wav", 0.4],
  [segmentById("e3").from, "ding.wav", 0.35],
  [segmentById("fecho").from + 0.1, "pop.wav", 0.5],
  [segmentById("cta").from, "whoosh.wav", 0.4],
];

// Placeholder do vídeo: camiseta branca num fundo escuro, só para conferir
// motions e a boca antes de existir public/hering/video.mp4.
const Placeholder: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle at 50% 45%, ${HERING.navy}, ${HERING.navyDark} 75%)`,
    }}
  >
    <svg width={WIDTH} height={HEIGHT} viewBox="0 0 1080 1920">
      <path
        d="M330,640 L430,600 Q500,660 570,600 L670,640 L760,780 L690,830 L650,780 L650,1250 L350,1250 L350,780 L310,830 L240,780 Z"
        fill="#F4F6FA"
      />
    </svg>
    <div
      style={{
        position: "absolute",
        top: 1560,
        width: WIDTH,
        textAlign: "center",
        color: "rgba(255,255,255,0.45)",
        fontFamily: HERING_THEME.font,
        fontWeight: 800,
        fontSize: 34,
      }}
    >
      quadro de reserva: public/hering/video.mp4 + HAS_VIDEO = true
    </div>
  </AbsoluteFill>
);

// Degradê escuro no topo, só enquanto há motion, para o texto ler sobre
// qualquer cena sem criar bloco de fundo.
const TopScrim: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ranges = Object.keys(MOTIONS).map((id) => {
    const s = segmentById(id);
    return [s.from, s.to] as const;
  });
  const opacity = Math.max(
    ...ranges.map(([from, to]) =>
      interpolate(t, [from, from + 0.3, to - 0.2, to], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  return (
    <AbsoluteFill
      style={{
        opacity: opacity * 0.9,
        background:
          "linear-gradient(to bottom, rgba(22,38,63,0.62) 0%, rgba(22,38,63,0.3) 26%, rgba(22,38,63,0) 46%)",
      }}
    />
  );
};

export const HeringVideo: React.FC = () => {
  return (
    <ThemeProvider value={HERING_THEME}>
      <AbsoluteFill style={{ backgroundColor: HERING.navyDark }}>
        {HAS_VIDEO ? (
          <OffthreadVideo
            src={staticFile("hering/video.mp4")}
            style={{ width: WIDTH, height: HEIGHT, objectFit: "cover" }}
          />
        ) : (
          <Placeholder />
        )}

        <TopScrim />

        {/* Abertura: o fundo escurece um pouco para a cartela ler */}
        <Sequence durationInFrames={sec(segmentById("abertura").to)}>
          <AbsoluteFill style={{ backgroundColor: "rgba(22,38,63,0.55)" }} />
        </Sequence>

        {Object.entries(MOTIONS).map(([id, motion]) => {
          const s = segmentById(id);
          return (
            <Sequence
              key={id}
              from={sec(s.from)}
              durationInFrames={Math.max(8, sec(s.to - s.from))}
              name={`motion ${id}`}
            >
              {motion.node}
            </Sequence>
          );
        })}

        {/* Boca da camiseta: só de frente para o espelho */}
        {SEGMENTS.filter((s) => s.mouth).map((s) => (
          <Sequence
            key={`boca-${s.id}`}
            from={sec(s.from)}
            durationInFrames={Math.max(8, sec(s.to - s.from))}
            name={`boca ${s.id}`}
          >
            <TalkingMouth
              place={s.mouth!}
              syllables={syllablesOf(s.pages.join(" "))}
            />
          </Sequence>
        ))}

        {/* Legenda: a voz dela em azul Hering, a do Marcos no padrão */}
        {SEGMENTS.flatMap((s) =>
          pageRanges(s).map((page, i) => (
            <Sequence
              key={`leg-${s.id}-${i}`}
              from={sec(page.from)}
              durationInFrames={Math.max(6, sec(page.to - page.from))}
              name={`legenda ${s.id} ${i + 1}`}
            >
              <Caption
                parts={[{ text: page.text }]}
                y={CAPTION_BOTTOM}
                onPanel={false}
                tone={s.who === "ela" ? "accent" : "dark"}
              />
            </Sequence>
          )),
        )}

        {/* Efeitos sonoros */}
        {SFX.map(([at, file, volume], i) => (
          <Sequence key={`sfx-${i}`} from={sec(at)} layout="none">
            <Html5Audio src={staticFile(`sfx/${file}`)} volume={() => volume} />
          </Sequence>
        ))}

        {/* Sitcom: palmas na abertura, risada ao fim de cada fala dela */}
        {HAS_PALMAS ? (
          <Sequence from={sec(0.2)} layout="none">
            <Html5Audio src={staticFile("sfx/palmas.wav")} volume={() => 0.35} />
          </Sequence>
        ) : null}
        {HAS_RISADA
          ? SEGMENTS.filter((s) => s.who === "ela" && s.kind !== "abertura").map(
              (s) => (
                <Sequence key={`risada-${s.id}`} from={sec(s.to - 0.3)} layout="none">
                  <Html5Audio
                    src={staticFile("sfx/risada.wav")}
                    volume={() => 0.25}
                  />
                </Sequence>
              ),
            )
          : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
