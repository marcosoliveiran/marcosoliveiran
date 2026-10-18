import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE } from "../kit";
import { HERING, HERING_SCRIPT_FONT } from "../themes/hering";
import {
  CollarIcon,
  CottonIcon,
  EyeSlashIcon,
  PantsIcon,
  PersonIcon,
  SearchIcon,
  ShirtIcon,
  ShortsIcon,
  SneakerIcon,
  SparkleIcon,
  StarIcon,
} from "./icons";
import { VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "../themes/voom";

// Motions da publi Hering. Sem painel de fundo: cada recurso é pequeno,
// flutua sobre o vídeo do Marcos e carrega a própria sombra leve. Tudo fica
// dentro da área segura (topo 250, esquerda 60, direita 140).

const CENTER_X = SAFE.left + (1080 - SAFE.left - SAFE.right) / 2;
const SHADOW = "0 10px 26px rgba(10, 20, 40, 0.38)";

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 170 },
  });
};

const Column: React.FC<{ children: React.ReactNode; top?: number }> = ({
  children,
  top = SAFE.top + 40,
}) => (
  <div
    style={{
      position: "absolute",
      left: CENTER_X - 440,
      width: 880,
      top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 22,
    }}
  >
    {children}
  </div>
);

// Pílula pequena: `strong` usa o azul de destaque, as demais o azul-marinho.
const Pill: React.FC<{
  text: string;
  delay: number;
  strong?: boolean;
  size?: number;
}> = ({ text, delay, strong, size = 58 }) => {
  const pop = useIn(delay);
  return (
    <div
      style={{
        opacity: Math.min(1, pop * 2),
        transform: `translateY(${(1 - pop) * 40}px) scale(${0.85 + 0.15 * pop}) rotate(${(1 - pop) * -3}deg)`,
        padding: "8px 30px 12px",
        borderRadius: 999,
        backgroundColor: strong ? HERING.blue : "rgba(47, 77, 120, 0.92)",
        color: HERING.white,
        fontFamily: VOOM_TITLE_FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        boxShadow: SHADOW,
      }}
    >
      {text}
    </div>
  );
};

// --- Relógio dos motions ----------------------------------------------------
// Os tempos abaixo são em segundos desde o início do trecho do motion e foram
// medidos na narração do Marcos (cada fala tem o seu momento).

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

const useClock = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ramp = (a: number, b: number) =>
    interpolate(t, [a, b], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE,
    });
  const pop = (at: number) =>
    spring({
      frame: frame - at * fps,
      fps,
      config: { damping: 11, stiffness: 160 },
    });
  return { t, ramp, pop };
};

// Posiciona o centro de um elemento num ponto de um contêiner.
const At: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, children, style }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      ...style,
    }}
  >
    {children}
  </div>
);

const LABEL: React.CSSProperties = {
  color: HERING.white,
  fontFamily: VOOM_TEXT_FONT,
  fontWeight: 900,
  textShadow: "0 3px 14px rgba(10, 20, 40, 0.75)",
  textAlign: "center",
};

// --- Bloco 1 · a definição, como uma pesquisa -------------------------------
// Uma barra de busca digita "síndrome de protagonista" e o resultado mostra a
// definição, com a palavra que o Marcos está falando destacada.

const DEF_A =
  "Condição da pessoa que acredita que é o centro de todas as cenas,".split(
    " ",
  );
const DEF_B = "que a vida é um filme e que ela é o personagem principal.".split(
  " ",
);

const spread = (words: string[], from: number, to: number) => {
  const lens = words.map((w) => w.length + 1);
  const total = lens.reduce((a, b) => a + b, 0);
  let cum = 0;
  return words.map((word, i) => {
    const at = from + (cum / total) * (to - from);
    cum += lens[i];
    return { word, at, end: from + (cum / total) * (to - from) };
  });
};

const DEF_WORDS = [...spread(DEF_A, 2.28, 5.32), ...spread(DEF_B, 5.52, 8.26)];
const QUERY = "síndrome de protagonista";

export const DefinicaoBusca: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const { durationInFrames, fps } = useVideoConfig();
  const typed = QUERY.slice(0, Math.floor(ramp(0.14, 1.75) * QUERY.length));
  const cursor = t < 2.4 && Math.floor(t * 2.4) % 2 === 0;
  const bar = pop(0);
  const card = pop(1.95);
  const out = interpolate(
    t,
    [durationInFrames / fps - 0.45, durationInFrames / fps],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(16, 28, 48, 0.42)",
          opacity: ramp(0, 0.5),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top + 24,
          width: 880,
          height: 104,
          borderRadius: 52,
          backgroundColor: "#FFFFFF",
          boxShadow: SHADOW,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "0 34px",
          transform: `translateY(${(1 - bar) * -60}px)`,
          opacity: Math.min(1, bar * 2),
        }}
      >
        <SearchIcon size={56} />
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontSize: 46,
            color: HERING.navyDark,
            whiteSpace: "nowrap",
          }}
        >
          {typed}
          <span style={{ opacity: cursor ? 1 : 0, color: HERING.blue }}>|</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top + 160,
          width: 880,
          padding: "38px 44px 44px",
          borderRadius: 36,
          backgroundColor: "rgba(255, 255, 255, 0.97)",
          boxShadow: SHADOW,
          transform: `translateY(${(1 - card) * 70}px) scale(${0.93 + 0.07 * card})`,
          opacity: Math.min(1, card * 2),
        }}
      >
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: 4,
            color: HERING.blue,
          }}
        >
          DEFINIÇÃO
        </div>
        <div
          style={{
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 62,
            lineHeight: 1.1,
            color: HERING.navyDark,
            margin: "6px 0 22px",
          }}
        >
          síndrome de protagonista
        </div>
        <div
          style={{
            fontFamily: VOOM_TEXT_FONT,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: 1.42,
            color: HERING.navyDark,
            display: "flex",
            flexWrap: "wrap",
            columnGap: 12,
          }}
        >
          {DEF_WORDS.map((w, i) => {
            const lit = t >= w.at;
            const current = t >= w.at && t < w.end + 0.05;
            return (
              <span
                key={i}
                style={{
                  opacity: lit ? 1 : 0.22,
                  padding: "0 8px",
                  borderRadius: 10,
                  backgroundColor: current ? HERING.blue : "transparent",
                  color: current ? "#FFFFFF" : HERING.navyDark,
                }}
              >
                {w.word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Bloco 2 · "isso só acontecia com gente… agora todo look é sobre ela" ----
// Um holofote ilumina uma pessoa; quando ele diz "Camiseta Brasil", a camiseta
// cai no lugar dela e ganha a estrela de protagonista.

export const HolofoteProtagonista: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const spot = ramp(0.25, 0.8);
  const personOut = ramp(3.45, 3.75);
  const person = pop(0.35);
  const shirt = pop(3.65);
  const star = pop(6.5);
  return (
    <div
      style={{
        position: "absolute",
        left: 610,
        top: SAFE.top + 12,
        width: 330,
        height: 360,
      }}
    >
      <svg
        width={330}
        height={360}
        viewBox="0 0 330 360"
        style={{ position: "absolute", inset: 0, opacity: spot }}
      >
        <defs>
          <linearGradient id="holofote" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <polygon points="165,0 18,330 312,330" fill="url(#holofote)" />
        <ellipse
          cx={165}
          cy={334}
          rx={140}
          ry={16}
          fill="#FFFFFF"
          opacity={0.4}
        />
      </svg>

      <At
        x={165}
        y={232}
        style={{
          opacity: Math.min(1, person * 2) * (1 - personOut),
          transform: `translate(-50%, -50%) translateY(${personOut * 50}px) scale(${(0.7 + 0.3 * person) * (1 - 0.2 * personOut)})`,
        }}
      >
        <PersonIcon size={150} />
      </At>

      <At
        x={165}
        y={218}
        style={{
          opacity: Math.min(1, shirt * 2),
          transform: `translate(-50%, -50%) translateY(${(1 - shirt) * -160}px) rotate(${(1 - shirt) * 18}deg)`,
        }}
      >
        <ShirtIcon size={200} />
      </At>

      {[
        { x: 60, y: 140, at: 4.15 },
        { x: 285, y: 170, at: 4.3 },
        { x: 250, y: 90, at: 4.45 },
      ].map((sp, i) => {
        const k = ramp(sp.at, sp.at + 0.3);
        const twinkle = 0.75 + 0.25 * Math.sin((t - sp.at) * 9);
        return (
          <At
            key={i}
            x={sp.x}
            y={sp.y}
            style={{
              opacity: k * (t > 5.5 ? Math.max(0, 1 - (t - 5.5)) : 1),
              transform: `translate(-50%, -50%) scale(${k * twinkle})`,
            }}
          >
            <SparkleIcon size={46} />
          </At>
        );
      })}

      <At
        x={165}
        y={64}
        style={{
          opacity: Math.min(1, star * 2),
          transform: `translate(-50%, -50%) scale(${star}) rotate(${(1 - star) * -120}deg)`,
        }}
      >
        <StarIcon size={84} color={HERING.blue} />
      </At>
    </div>
  );
};

// --- Bloco 3 · "posso mudar a calça, combinar com bermuda, mas ela nunca sai" -
// A camiseta fica fixa e a peça de baixo troca. Em "nunca sai de cena" ela ganha
// a estrela; em "funciona com tudo" as peças giram ao redor dela.

export const LookCarousel: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const shirt = pop(0.1);
  const pants = pop(0.35) * (1 - ramp(1.45, 1.7)) * (1 - ramp(4.85, 5.1));
  const shorts = pop(1.7) * (1 - ramp(4.85, 5.1));
  const star = pop(3.3);
  const pulse = ramp(3.3, 4.3);
  const orbit = (4.9 + 0.0 <= t ? t - 4.9 : 0) * 22;
  return (
    <div
      style={{
        position: "absolute",
        left: 630,
        top: SAFE.top + 12,
        width: 310,
        height: 360,
      }}
    >
      <At
        x={155}
        y={115}
        style={{
          width: 250,
          height: 250,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79,123,201,0.75), rgba(79,123,201,0) 68%)",
          opacity: 0.5 + 0.2 * Math.sin(t * 3),
        }}
      >
        <span />
      </At>
      <At
        x={155}
        y={115}
        style={{
          width: 210,
          height: 210,
          borderRadius: "50%",
          border: "6px solid rgba(255,255,255,0.85)",
          opacity: pulse > 0 ? 1 - pulse : 0,
          transform: `translate(-50%, -50%) scale(${0.6 + pulse * 0.9})`,
        }}
      >
        <span />
      </At>

      <At
        x={155}
        y={110}
        style={{
          opacity: Math.min(1, shirt * 2),
          transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * shirt})`,
        }}
      >
        <ShirtIcon size={160} />
      </At>

      <At
        x={155}
        y={258 + (1 - pants) * 40}
        style={{ opacity: Math.max(0, pants) }}
      >
        <PantsIcon size={120} />
      </At>
      <At
        x={155}
        y={258 + (1 - shorts) * 40}
        style={{ opacity: Math.max(0, shorts) }}
      >
        <ShortsIcon size={120} />
      </At>

      <At
        x={248}
        y={34}
        style={{
          opacity: Math.min(1, star * 2),
          transform: `translate(-50%, -50%) scale(${star * (1 + 0.08 * Math.sin(t * 6))}) rotate(${(1 - star) * -90}deg)`,
        }}
      >
        <StarIcon size={72} color={HERING.blue} />
      </At>

      {[
        { Icon: PantsIcon, angle: 200, at: 4.95 },
        { Icon: SneakerIcon, angle: 340, at: 5.25 },
        { Icon: ShortsIcon, angle: 90, at: 5.55 },
      ].map(({ Icon, angle, at }, i) => {
        const k = pop(at);
        const rad = ((angle + orbit) * Math.PI) / 180;
        return (
          <At
            key={i}
            x={155 + Math.cos(rad) * 128}
            y={118 + Math.sin(rad) * 128}
            style={{
              opacity: Math.min(1, k * 2),
              transform: `translate(-50%, -50%) scale(${k})`,
            }}
          >
            <Icon size={70} />
          </At>
        );
      })}
    </div>
  );
};

// --- Bloco 4 · algodão, não fica transparente, gola que não deforma ---------
// Um ícone para cada diferencial, na hora em que o Marcos o fala. A gola estica
// e volta ao lugar.

export const Diferenciais: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const stretch = 1 + 0.38 * Math.sin(Math.PI * ramp(3.0, 3.95));
  const items = [
    {
      x: 215,
      at: 0.25,
      label: "100% algodão",
      node: <CottonIcon size={180} />,
    },
    {
      x: 500,
      at: 1.5,
      label: "não fica transparente",
      node: <EyeSlashIcon size={180} />,
    },
    {
      x: 785,
      at: 2.75,
      label: "gola não deforma",
      node: <CollarIcon size={180} stretch={stretch} />,
    },
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {items.map((it) => {
        const k = pop(it.at);
        const float = Math.sin((t - it.at) * 3) * 6;
        return (
          <div key={it.label}>
            <At
              x={it.x}
              y={SAFE.top + 115 + float}
              style={{
                opacity: Math.min(1, k * 2),
                transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * k})`,
              }}
            >
              {it.node}
            </At>
            <At
              x={it.x}
              y={SAFE.top + 262}
              style={{
                ...LABEL,
                width: 280,
                fontSize: 38,
                lineHeight: 1.1,
                opacity: ramp(it.at + 0.15, it.at + 0.45),
              }}
            >
              {it.label}
            </At>
          </div>
        );
      })}
    </div>
  );
};

// --- Bloco 5 · o preço e a estrela -----------------------------------------
// Uma etiqueta de preço balança com "R$ 49,99". Em "protagonista" a estrela
// grande aparece; em "coadjuvante", uma estrelinha ao lado.

export const Preco: React.FC = () => {
  const { t, ramp, pop } = useClock();
  const tag = pop(1.0);
  const swing =
    Math.sin((t - 1.0) * 5.2) * 11 * Math.exp(-Math.max(0, t - 1.0) * 0.9);
  const big = pop(3.45);
  const small = pop(5.25);
  return (
    <div
      style={{
        position: "absolute",
        left: 520,
        top: SAFE.top - 20,
        width: 420,
        height: 460,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 0,
          width: 0,
          height: 0,
          transformOrigin: "0 0",
          transform: `translateY(${(1 - Math.min(1, tag)) * -260}px) rotate(${swing}deg)`,
          opacity: Math.min(1, tag * 3),
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -3,
            top: 0,
            width: 6,
            height: 112,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.9)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -150,
            top: 104,
            width: 300,
            height: 150,
            backgroundColor: "#FFFFFF",
            clipPath: "polygon(0 0, 84% 0, 100% 50%, 84% 100%, 0 100%)",
            boxShadow: SHADOW,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -126,
            top: 166,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: HERING.navyDark,
            opacity: 0.85,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -88,
            top: 128,
            fontFamily: VOOM_TITLE_FONT,
            fontWeight: 700,
            fontSize: 74,
            lineHeight: 1,
            color: HERING.coral,
            whiteSpace: "nowrap",
          }}
        >
          R$ 49,99
        </div>
      </div>

      <At
        x={150}
        y={370}
        style={{
          opacity: Math.min(1, big * 2),
          transform: `translate(-50%, -50%) scale(${big}) rotate(${(1 - big) * -140}deg)`,
        }}
      >
        <StarIcon size={150} color={HERING.blue} />
      </At>
      {[0, 1, 2].map((i) => {
        const k = ramp(3.7 + i * 0.12, 4.0 + i * 0.12);
        const pos = [
          { x: 60, y: 300 },
          { x: 250, y: 330 },
          { x: 215, y: 430 },
        ][i];
        return (
          <At
            key={i}
            x={pos.x}
            y={pos.y}
            style={{
              opacity: k * Math.max(0, 1 - (t - 4.6) * 1.2),
              transform: `translate(-50%, -50%) scale(${k * (0.8 + 0.2 * Math.sin(t * 10 + i))})`,
            }}
          >
            <SparkleIcon size={40} />
          </At>
        );
      })}
      <At
        x={345}
        y={420}
        style={{
          opacity: Math.min(1, small * 2),
          transform: `translate(-50%, -50%) scale(${small})`,
        }}
      >
        <StarIcon size={52} color="#8FB0E6" />
      </At>
    </div>
  );
};

// CTA: espaço livre em cima do rosto do Marcos.
export const SeloCta: React.FC = () => {
  const pop = useIn(4);
  return (
    <Column top={SAFE.top + 20}>
      <div
        style={{
          transform: `translateY(${(1 - pop) * -50}px)`,
          opacity: pop,
          color: HERING.white,
          fontFamily: VOOM_TITLE_FONT,
          fontWeight: 700,
          fontSize: 104,
          lineHeight: 1,
          textAlign: "center",
          textShadow: "0 8px 26px rgba(10, 20, 40, 0.6)",
        }}
      >
        CAMISETA BRASIL
      </div>
      <Pill text="site e lojas participantes" delay={14} strong size={46} />
    </Column>
  );
};

// Cartela da abertura, no clima de abertura de sitcom: título grande em
// script retrô, com relevo, e o número do episódio pequeno embaixo. Entra
// sobre a primeira cena (de preferência uma tomada de "estabelecimento").
export const CartelaEpisodio: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const title = useIn(4);
  const sub = useIn(16);
  const out = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const relief = [1, 2, 3, 4, 5, 6]
    .map((n) => `${n}px ${n * 1.4}px 0 ${HERING.navy}`)
    .join(", ");
  return (
    <div
      style={{
        position: "absolute",
        left: CENTER_X - 440,
        width: 880,
        top: 560,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 64,
        opacity: out,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - title) * 70}px) scale(${0.85 + 0.15 * title}) rotate(-4deg)`,
          opacity: Math.min(1, title * 2),
          color: "#FFF8EC",
          fontFamily: HERING_SCRIPT_FONT,
          fontSize: 168,
          lineHeight: 0.98,
          textAlign: "center",
          textShadow: `${relief}, 0 24px 40px rgba(10, 20, 40, 0.6)`,
        }}
      >
        Marcos &amp; Hering
      </div>
      <div
        style={{
          opacity: sub,
          transform: `translateY(${(1 - sub) * 24}px)`,
          color: HERING.white,
          fontFamily: VOOM_TEXT_FONT,
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: 6,
          textAlign: "center",
          textShadow: "0 4px 16px rgba(10, 20, 40, 0.8)",
        }}
      >
        <div>EPISÓDIO 1</div>
        <div style={{ marginTop: 10, fontSize: 38 }}>
          A SÍNDROME DE PROTAGONISTA
        </div>
      </div>
    </div>
  );
};
