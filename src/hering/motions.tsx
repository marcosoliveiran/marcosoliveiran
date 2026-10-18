import { CSSProperties } from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SAFE } from "../kit";
import { HERING, HERING_FONT, HERING_SCRIPT_FONT } from "../themes/hering";
import {
  ClapperIcon,
  CollarIcon,
  CottonIcon,
  EyeSlashIcon,
  PantsIcon,
  SearchIcon,
  ShirtIcon,
  ShortsIcon,
  SneakerIcon,
} from "./icons";
import { CARTELA_ESTILO } from "./timing";

// Motions da publi Hering. Linguagem da marca: tipografia geométrica e limpa
// (Plus Jakarta Sans, "Camiseta Brasil" leve e "Hering" em negrito), azul-marinho,
// traços finos e muito espaço. Sem painel de fundo grande: cada recurso é pequeno,
// flutua sobre o vídeo e fica dentro da área segura (topo 250, esquerda 60,
// direita 140). O rosto do Marcos fica livre: os recursos ocupam os cantos.

const SHADOW = "0 10px 30px rgba(10, 20, 40, 0.35)";
const TEXT_SHADOW = "0 3px 18px rgba(10, 20, 40, 0.7)";
const GLASS = "rgba(22, 38, 63, 0.84)";

// --- Relógio dos motions ----------------------------------------------------
// Tempos em segundos desde o início do trecho do motion, medidos na narração.

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

const useClock = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const total = durationInFrames / fps;
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
      config: { damping: 15, stiffness: 150 },
    });
  // 1 durante o motion, caindo a 0 nos últimos 0,35 s.
  const out = interpolate(t, [total - 0.35, total], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { t, total, ramp, pop, out };
};

const At: React.FC<{
  x: number;
  y: number;
  children: React.ReactNode;
  style?: CSSProperties;
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

// Painel azul-marinho translúcido, para o traço branco dos ícones ler sobre
// qualquer parede (é o mesmo material do cartão do preço).
const Tile: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  opacity?: number;
}> = ({ x, y, w, h, opacity = 1 }) => (
  <At
    x={x}
    y={y}
    style={{
      width: w,
      height: h,
      borderRadius: 28,
      backgroundColor: GLASS,
      boxShadow: SHADOW,
      opacity,
    }}
  >
    <span />
  </At>
);

// "Camiseta Brasil" leve e "Hering" em negrito, como no briefing da marca.
const Lockup: React.FC<{
  size: number;
  align?: "left" | "center";
  progress?: number;
}> = ({ size, align = "left", progress = 1 }) => (
  <div
    style={{
      fontFamily: HERING_FONT,
      color: HERING.white,
      textShadow: TEXT_SHADOW,
      lineHeight: 1.02,
      textAlign: align,
      opacity: progress,
      transform: `translateX(${(1 - progress) * -40}px)`,
    }}
  >
    <div style={{ fontWeight: 300, fontSize: size, letterSpacing: -1 }}>
      Camiseta Brasil
    </div>
    <div
      style={{ fontWeight: 800, fontSize: size * 1.08, letterSpacing: -1.5 }}
    >
      Hering
    </div>
    <div
      style={{
        marginTop: size * 0.2,
        height: 4,
        width: size * 2.4 * progress,
        backgroundColor: HERING.blue,
        borderRadius: 2,
        marginLeft: align === "center" ? "auto" : 0,
        marginRight: align === "center" ? "auto" : 0,
      }}
    />
  </div>
);

// --- Bloco 1 · a definição, como uma pesquisa -------------------------------
// A barra de busca digita "síndrome de protagonista" e o resultado mostra a
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
  const { t, ramp, pop, out } = useClock();
  // Digitação linear (uma letra a cada 67 ms) para os toques de tecla baterem.
  const typed = QUERY.slice(
    0,
    Math.floor(Math.min(1, Math.max(0, (t - 0.14) / 1.61)) * QUERY.length),
  );
  const cursor = t < 2.4 && Math.floor(t * 2.4) % 2 === 0;
  const bar = pop(0);
  const card = pop(1.95);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(16, 28, 48, 0.3)",
          opacity: ramp(0, 0.5),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: SAFE.top + 12,
          width: 880,
          height: 88,
          borderRadius: 44,
          backgroundColor: "#FFFFFF",
          boxShadow: SHADOW,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 32px",
          transform: `translateY(${(1 - bar) * -50}px)`,
          opacity: Math.min(1, bar * 2),
        }}
      >
        <SearchIcon size={42} />
        <div
          style={{
            fontFamily: HERING_FONT,
            fontWeight: 600,
            fontSize: 38,
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
          top: SAFE.top + 120,
          width: 880,
          padding: "26px 36px 30px",
          borderRadius: 28,
          backgroundColor: GLASS,
          boxShadow: SHADOW,
          transform: `translateY(${(1 - card) * 40}px)`,
          opacity: Math.min(1, card * 2),
        }}
      >
        <div
          style={{
            fontFamily: HERING_FONT,
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: 4,
            color: "#8FB0E6",
          }}
        >
          DEFINIÇÃO
        </div>
        <div
          style={{
            fontFamily: HERING_FONT,
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 1.15,
            color: HERING.white,
            margin: "4px 0 14px",
          }}
        >
          síndrome de protagonista
        </div>
        <div
          style={{
            fontFamily: HERING_FONT,
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.5,
            display: "flex",
            flexWrap: "wrap",
            columnGap: 9,
          }}
        >
          {DEF_WORDS.map((w, i) => {
            const lit = t >= w.at;
            const current = t >= w.at && t < w.end + 0.05;
            return (
              <span
                key={i}
                style={{
                  opacity: lit ? 1 : 0.3,
                  padding: "0 7px",
                  borderRadius: 8,
                  backgroundColor: current ? HERING.blue : "transparent",
                  color: HERING.white,
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

// --- Bloco 2 · o nome do produto, em destaque --------------------------------
// Entra quando o Marcos diz "Camiseta Brasil" (~3,65 s) e sai ao fim do trecho.

export const NomeProduto: React.FC = () => {
  const { ramp, out } = useClock();
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top + 20,
        opacity: out,
      }}
    >
      <Lockup size={68} progress={ramp(3.65, 4.4)} />
    </div>
  );
};

// --- Bloco 3 · a camiseta fica, a peça de baixo muda -------------------------
// "Posso mudar a calça, combinar com bermuda, mas ela nunca sai de cena. O básico
// que funciona com tudo!" Em "nunca sai de cena" um anel pulsa ao redor dela; em
// "funciona com tudo" as peças giram à volta.

export const LookCarousel: React.FC = () => {
  const { t, ramp, pop, out } = useClock();
  const shirt = pop(0.1);
  const pants = pop(0.35) * (1 - ramp(1.45, 1.7)) * (1 - ramp(4.85, 5.1));
  const shorts = pop(1.7) * (1 - ramp(4.85, 5.1));
  const pulse1 = ramp(3.3, 4.2);
  const pulse2 = ramp(3.65, 4.55);
  const orbit = t > 4.9 ? (t - 4.9) * 24 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 630,
        top: SAFE.top + 12,
        width: 310,
        height: 360,
        transformOrigin: "100% 0",
        transform: "scale(1.18)",
        opacity: out,
      }}
    >
      <Tile x={155} y={160} w={260} h={350} opacity={Math.min(1, shirt * 2)} />
      {[pulse1, pulse2].map((k, i) => (
        <At
          key={i}
          x={155}
          y={112}
          style={{
            width: 210,
            height: 210,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,0.8)",
            opacity: k > 0 ? 1 - k : 0,
            transform: `translate(-50%, -50%) scale(${0.65 + k * 0.85})`,
          }}
        >
          <span />
        </At>
      ))}
      <At
        x={155}
        y={112}
        style={{
          opacity: Math.min(1, shirt * 2),
          transform: `translate(-50%, -50%) scale(${0.75 + 0.25 * shirt})`,
        }}
      >
        <ShirtIcon size={150} />
      </At>
      <At
        x={155}
        y={262 + (1 - pants) * 36}
        style={{ opacity: Math.max(0, pants) }}
      >
        <PantsIcon size={110} />
      </At>
      <At
        x={155}
        y={262 + (1 - shorts) * 36}
        style={{ opacity: Math.max(0, shorts) }}
      >
        <ShortsIcon size={110} />
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
            x={155 + Math.cos(rad) * 126}
            y={118 + Math.sin(rad) * 126}
            style={{
              opacity: Math.min(1, k * 2),
              transform: `translate(-50%, -50%) scale(${k})`,
            }}
          >
            <Icon size={64} />
          </At>
        );
      })}
    </div>
  );
};

// --- Bloco 4 · os diferenciais ---------------------------------------------
// Um ícone para cada um, na hora em que o Marcos fala. A gola estica e volta.

export const Diferenciais: React.FC = () => {
  const { t, ramp, pop, out } = useClock();
  const stretch = 1 + 0.38 * Math.sin(Math.PI * ramp(3.0, 3.95));
  const items = [
    {
      x: 215,
      at: 0.25,
      label: "100% algodão",
      node: <CottonIcon size={170} />,
    },
    {
      x: 500,
      at: 1.5,
      label: "Não fica transparente",
      node: <EyeSlashIcon size={170} />,
    },
    {
      x: 785,
      at: 2.75,
      label: "Gola que não deforma",
      node: <CollarIcon size={170} stretch={stretch} />,
    },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out }}>
      {items.map((it) => {
        const k = pop(it.at);
        const float = Math.sin((t - it.at) * 3) * 5;
        return (
          <div key={it.label}>
            <Tile
              x={it.x}
              y={SAFE.top + 140}
              w={250}
              h={300}
              opacity={Math.min(1, k * 2)}
            />
            <At
              x={it.x}
              y={SAFE.top + 108 + float}
              style={{
                opacity: Math.min(1, k * 2),
                transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * k})`,
              }}
            >
              {it.node}
            </At>
            <At
              x={it.x}
              y={SAFE.top + 240}
              style={{
                width: 230,
                textAlign: "center",
                fontFamily: HERING_FONT,
                fontWeight: 700,
                fontSize: 34,
                lineHeight: 1.15,
                color: HERING.white,
                textShadow: TEXT_SHADOW,
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

// --- Bloco 5 · o preço ------------------------------------------------------
// O preço sobe contando até R$ 49,99 (único elemento em coral). Em
// "protagonista" a claquete de cinema fecha: a vida é um filme.

const fmt = (v: number) => v.toFixed(2).replace(".", ",");

export const Preco: React.FC = () => {
  const { ramp, pop, out } = useClock();
  const card = pop(0.9);
  const value = 49.99 * ramp(1.15, 2.4);
  const clap = pop(3.45);
  return (
    <div
      style={{
        position: "absolute",
        left: 560,
        top: SAFE.top + 20,
        width: 380,
        opacity: out,
      }}
    >
      <div
        style={{
          padding: "22px 30px 26px",
          borderRadius: 26,
          backgroundColor: GLASS,
          boxShadow: SHADOW,
          transform: `translateY(${(1 - Math.min(1, card)) * -50}px)`,
          opacity: Math.min(1, card * 2),
        }}
      >
        <div
          style={{
            fontFamily: HERING_FONT,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 4,
            color: "#8FB0E6",
          }}
        >
          CUSTO-BENEFÍCIO
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            fontFamily: HERING_FONT,
            color: HERING.coral,
            marginTop: 4,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 40 }}>R$</span>
          <span
            style={{
              fontWeight: 800,
              fontSize: 104,
              letterSpacing: -3,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmt(value)}
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            width: `${ramp(1.2, 2.6) * 100}%`,
            backgroundColor: HERING.blue,
            marginTop: 6,
          }}
        />
      </div>
      <Tile x={190} y={292} w={190} h={150} opacity={Math.min(1, clap * 2)} />
      <At
        x={190}
        y={292}
        style={{
          opacity: Math.min(1, clap * 2),
          transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * Math.min(1, clap)})`,
        }}
      >
        <ClapperIcon size={130} open={Math.max(0, (1 - clap) * 38)} />
      </At>
    </div>
  );
};

// --- CTA: nome do produto em destaque, espaço livre em cima do rosto --------

export const SeloCta: React.FC = () => {
  const { ramp, pop } = useClock();
  const sub = pop(0.8);
  return (
    <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top + 20 }}>
      <Lockup size={92} progress={ramp(0.1, 0.8)} />
      <div
        style={{
          marginTop: 22,
          fontFamily: HERING_FONT,
          fontWeight: 600,
          fontSize: 38,
          color: HERING.white,
          textShadow: TEXT_SHADOW,
          opacity: Math.min(1, sub * 2),
          transform: `translateY(${(1 - sub) * 20}px)`,
        }}
      >
        Disponível no site e nas lojas participantes
      </div>
    </div>
  );
};

// --- Cartela de abertura ----------------------------------------------------

const CartelaHering: React.FC = () => {
  const { ramp, pop, out } = useClock();
  const title = pop(0.15);
  const sub = pop(0.55);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        width: 880,
        top: 620,
        textAlign: "center",
        color: HERING.white,
        fontFamily: HERING_FONT,
        textShadow: TEXT_SHADOW,
        opacity: out,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: 10,
          color: "#8FB0E6",
          opacity: ramp(0, 0.5),
        }}
      >
        EPISÓDIO 1
      </div>
      <div
        style={{
          marginTop: 26,
          fontSize: 150,
          lineHeight: 1.02,
          letterSpacing: -3,
          opacity: Math.min(1, title * 2),
          transform: `translateY(${(1 - title) * 50}px)`,
        }}
      >
        <div style={{ fontWeight: 300 }}>Marcos &amp;</div>
        <div style={{ fontWeight: 800 }}>Hering</div>
      </div>
      <div
        style={{
          margin: "30px auto 0",
          height: 4,
          width: 220 * ramp(0.3, 1),
          backgroundColor: HERING.blue,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          marginTop: 28,
          fontWeight: 600,
          fontSize: 40,
          letterSpacing: 1,
          opacity: Math.min(1, sub * 2),
        }}
      >
        A síndrome de protagonista
      </div>
    </div>
  );
};

// Variante retrô (script de abertura de sitcom, como na referência).
const CartelaRetro: React.FC = () => {
  const { pop, out } = useClock();
  const title = pop(0.15);
  const sub = pop(0.55);
  const relief = [1, 2, 3, 4, 5, 6]
    .map((n) => `${n}px ${n * 1.4}px 0 ${HERING.navy}`)
    .join(", ");
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
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
          color: HERING.white,
          fontFamily: HERING_FONT,
          fontWeight: 800,
          fontSize: 34,
          letterSpacing: 6,
          textAlign: "center",
          textShadow: "0 4px 16px rgba(10, 20, 40, 0.8)",
        }}
      >
        EPISÓDIO 1 · A SÍNDROME DE PROTAGONISTA
      </div>
    </div>
  );
};

export const CartelaEpisodio: React.FC = () =>
  CARTELA_ESTILO === "retro" ? <CartelaRetro /> : <CartelaHering />;
