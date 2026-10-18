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
import * as M from "./motions";
import {
  DEFAULT_GRADE,
  FPS,
  Grade,
  EFEITOS_SONOROS,
  HAS_VINHETA,
  PALMAS_FILE,
  RISADA_FILES,
  HAS_VIDEO,
  MOSTRAR_LEGENDA,
  NARRACAO_FILE,
  NARRACAO_INICIO,
  Segment,
  SEGMENTS,
  TOTAL_FRAMES,
  pageRanges,
  segmentById,
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
const MOTIONS: Record<
  string,
  { node: ReactNode; offset?: number; until?: string }
> = {
  def: { node: <M.DefinicaoBusca /> },
  cartela: { node: <M.CartelaEpisodio /> },
  e1: { node: <M.NomeProduto /> },
  m1: { node: <M.LookCarousel />, until: "m4" },
  gola: { node: <M.Diferenciais /> },
  f1: { node: <M.Preco />, until: "f2" },
  cta: { node: <M.SeloCta /> },
};

// Efeitos sonoros: [segundos, arquivo em public/sfx, volume].
const SFX: [number, string, number][] = [
  [segmentById("cartela").from + 0.1, "impact.wav", 0.6],
  [segmentById("f1").from + 0.1, "pop.wav", 0.5],
  [segmentById("cta").from, "whoosh.wav", 0.4],
];

// Placeholder do vídeo: camiseta branca num fundo escuro, só para conferir
// motions e a boca antes de existir public/hering/video.mp4.
const Placeholder: React.FC<{ label?: string }> = ({ label }) => (
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
      {label ?? "quadro de reserva: public/hering/video.mp4 + HAS_VIDEO = true"}
    </div>
  </AbsoluteFill>
);

// Um take do bruto: ponto de início (`src`), enquadramento (zoom e deslocamento)
// e, se pedido, o topo desfocado para esconder a prateleira do guarda-roupa. Só
// o CTA mantém o áudio original; os demais são mudos (a voz é a narração).
const Take: React.FC<{ seg: Segment }> = ({ seg }) => {
  if (seg.src === undefined) {
    return <Placeholder label={`take ${seg.id}: defina src em timing.ts`} />;
  }
  const f = seg.framing ?? {};
  const scale = f.scale ?? 1;
  const video = (extra?: React.CSSProperties) => (
    <OffthreadVideo
      src={staticFile("hering/video.mp4")}
      startFrom={sec(seg.src ?? 0)}
      playbackRate={seg.rate ?? 1}
      volume={seg.keepAudio ? 1 : 0}
      muted={!seg.keepAudio}
      style={{ width: WIDTH, height: HEIGHT, objectFit: "cover", ...extra }}
    />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translate(${f.x ?? 0}px, ${f.y ?? 0}px) scale(${scale})`,
        }}
      >
        {video()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Degradê escuro no topo, só enquanto há motion, para o texto ler sobre
// qualquer cena sem criar bloco de fundo.
const TopScrim: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ranges = Object.entries(MOTIONS).map(([id, motion]) => {
    const s = segmentById(id);
    return [
      s.from + (motion.offset ?? 0),
      segmentById(motion.until ?? id).to,
    ] as const;
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

// Gradação por CSS: tom quente suave, contraste um pouco maior, vinheta leve.
const GRADES: Record<
  Exclude<Grade, "off">,
  { filter: string; warm: number; vignette: number }
> = {
  leve: {
    filter: "sepia(0.12) saturate(1.05) contrast(1.05) brightness(0.99)",
    warm: 0.12,
    vignette: 0.22,
  },
  cinema: {
    filter: "sepia(0.28) saturate(1.12) contrast(1.12) brightness(0.96)",
    warm: 0.22,
    vignette: 0.4,
  },
};

const Graded: React.FC<{ grade: Grade; children: ReactNode }> = ({
  grade,
  children,
}) => {
  if (grade === "off") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }
  const g = GRADES[grade];
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: g.filter }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 170, 90, ${g.warm})`,
          mixBlendMode: "soft-light",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 45%, rgba(20,10,0,${g.vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export type HeringProps = { grade?: Grade };

export const HeringVideo: React.FC<HeringProps> = ({
  grade = DEFAULT_GRADE,
}) => {
  return (
    <ThemeProvider value={HERING_THEME}>
      <AbsoluteFill style={{ backgroundColor: HERING.navyDark }}>
        <Graded grade={grade}>
          {HAS_VIDEO ? (
            SEGMENTS.map((seg) => (
              <Sequence
                key={`take-${seg.id}`}
                from={sec(seg.from)}
                durationInFrames={Math.max(1, sec(seg.to - seg.from))}
                name={`take ${seg.id}`}
              >
                <Take seg={seg} />
              </Sequence>
            ))
          ) : (
            <Placeholder />
          )}
        </Graded>

        <TopScrim />

        {/* Abertura: o fundo escurece um pouco para a cartela ler */}
        <Sequence
          from={sec(segmentById("cartela").from)}
          durationInFrames={sec(
            segmentById("cartela").to - segmentById("cartela").from,
          )}
        >
          <AbsoluteFill style={{ backgroundColor: "rgba(22,38,63,0.55)" }} />
        </Sequence>

        {Object.entries(MOTIONS).map(([id, motion]) => {
          const s = segmentById(id);
          return (
            <Sequence
              key={id}
              from={sec(s.from + (motion.offset ?? 0))}
              durationInFrames={Math.max(
                8,
                sec(
                  segmentById(motion.until ?? id).to -
                    s.from -
                    (motion.offset ?? 0),
                ),
              )}
              name={`motion ${id}`}
            >
              {motion.node}
            </Sequence>
          );
        })}

        {/* Legenda da narração (padrão do perfil: uma linha, faixa preta 40%) */}
        {MOSTRAR_LEGENDA
          ? SEGMENTS.flatMap((s) =>
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
                  />
                </Sequence>
              )),
            )
          : null}

        {/* Efeitos sonoros */}
        {(EFEITOS_SONOROS ? SFX : []).map(([at, file, volume], i) => (
          <Sequence key={`sfx-${i}`} from={sec(at)} layout="none">
            <Html5Audio src={staticFile(`sfx/${file}`)} volume={() => volume} />
          </Sequence>
        ))}

        {/* Narração do Marcos, gravada por último */}
        {NARRACAO_FILE ? (
          <Sequence from={sec(NARRACAO_INICIO)} layout="none">
            <Html5Audio src={staticFile(`hering/${NARRACAO_FILE}`)} />
          </Sequence>
        ) : null}

        {/* Sitcom: vinheta musical na abertura e entre os looks (como as
            vinhetas de troca de cena da referência), palmas na abertura e
            risada ao fim de cada fala dela */}
        {EFEITOS_SONOROS && HAS_VINHETA ? (
          <>
            <Sequence
              from={sec(segmentById("cartela").from + 0.1)}
              layout="none"
            >
              <Html5Audio
                src={staticFile("sfx/vinheta.wav")}
                volume={() => 0.4}
              />
            </Sequence>
            {["m1", "m2"].map((id) => (
              <Sequence
                key={`vinheta-${id}`}
                from={sec(segmentById(id).from - 0.1)}
                layout="none"
              >
                <Html5Audio
                  src={staticFile("sfx/vinheta-curta.wav")}
                  volume={() => 0.3}
                />
              </Sequence>
            ))}
          </>
        ) : null}
        {EFEITOS_SONOROS && PALMAS_FILE ? (
          <Sequence from={sec(0.2)} layout="none">
            <Html5Audio
              src={staticFile(`sfx/${PALMAS_FILE}`)}
              volume={() => 0.35}
            />
          </Sequence>
        ) : null}
        {EFEITOS_SONOROS && RISADA_FILES.length > 0
          ? // Risada nas piadas: depois de "tem que ser sobre ela" (o silêncio
            // "beat") e no fim de "protagonista por preço de coadjuvante".
            (
              [
                ["beat", segmentById("beat").from + 0.1],
                ["f2", segmentById("f2").to - 0.3],
              ] as const
            ).map(([id, at], i) => (
              <Sequence key={`risada-${id}`} from={sec(at)} layout="none">
                <Html5Audio
                  src={staticFile(
                    `sfx/${RISADA_FILES[i % RISADA_FILES.length]}`,
                  )}
                  volume={() => 0.25}
                />
              </Sequence>
            ))
          : null}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
