// Roteiro, takes e tempos da publi Hering. Tudo que se ajusta mora aqui.
//
// Fluxo: o bruto vira public/hering/video.mp4 (npm run hering:preparar) e cada
// trecho de SEGMENTS aponta para o ponto do bruto de onde sai (`src`, em
// segundos) e para o enquadramento (`framing`). A narração (a voz dela) entra
// por último em public/hering/narracao.wav; os tempos (`dur`) passam a seguir
// as falas dela. Só o CTA usa o áudio original do vídeo (`keepAudio`).

export const FPS = 30;

// Troque para true quando public/hering/video.mp4 existir. Sem o vídeo, a
// composição mostra um quadro de reserva (camiseta) só para conferir motions.
// Trechos sem `src` também mostram o quadro de reserva, com o nome do take.
export const HAS_VIDEO = false;

// Narração (a voz dela, gravada por último). null = sem narração ainda.
// Coloque o arquivo em public/hering/ e escreva o nome, ex.: "narracao.wav".
// NARRACAO_INICIO = segundo do VÍDEO FINAL em que a narração começa.
export const NARRACAO_FILE: string | null = null;
export const NARRACAO_INICIO = 0;

// Efeitos de sitcom (do CapCut ou banco livre de uso comercial). Coloque em
// public/sfx/ e mude para true. Volume sempre abaixo da fala (briefing).
// vinheta.wav e vinheta-curta.wav são sintetizadas por tools/make-vinheta.py.
export const HAS_VINHETA = true; // public/sfx/vinheta*.wav

// Palmas e risada têm que ser arquivos REAIS (sintético soa falso): do CapCut
// ou de banco livre de uso comercial, salvos em public/sfx/. Lista vazia =
// desligado. Várias risadas: o código alterna entre elas a cada fala, para
// não repetir. Se o Marcos colocar palmas/risada no CapCut, deixar vazio aqui.
export const PALMAS_FILE: string | null = null; // ex.: "palmas.wav"
export const RISADA_FILES: string[] = []; // ex.: ["risada-1.wav", "risada-2.wav"]

export type Grade = "off" | "leve" | "cinema";
export const DEFAULT_GRADE: Grade = "leve";

export type Kind =
  | "abertura"
  | "guarda"
  | "espelho"
  | "reacao"
  | "fecho"
  | "cta";

// Enquadramento do take dentro do quadro 1080×1920: zoom e deslocamento em
// pixels. Serve para pôr cabeça e pés nas faixas livres (cabeça ~y 540, pés até
// ~y 1360 no corpo inteiro; cabelo ~y 620 no CTA) sem regravar.
export type Framing = { scale?: number; x?: number; y?: number };

export type MouthPlacement = {
  x: number;
  y: number;
  size: number;
  rot: number;
};

export type Segment = {
  id: string;
  kind: Kind;
  who: "ela" | "eu";
  from: number; // início no vídeo final (calculado a partir de `dur`)
  to: number;
  // Ponto do bruto (segundos em video.mp4) de onde o take começa.
  src?: number;
  framing?: Framing;
  // Só o CTA: usa o áudio original do vídeo (os outros são mudos).
  keepAudio?: boolean;
  // Páginas da legenda: linha única, até ~28 letras cada.
  pages: string[];
  // Boca da camiseta (só quando o Marcos está de frente para o espelho).
  mouth?: MouthPlacement;
};

// Posição da boca no peito, para o Marcos parado no espelho (ajustar por take).
// Corpo inteiro (cabeça ~y 480, pés ~y 1360): peito perto de y 745, ~150 px.
const PEITO: MouthPlacement = { x: 500, y: 745, size: 150, rot: -4 };

// Cada trecho tem `dur` (segundos no vídeo final); `from`/`to` saem da soma.
// As durações abaixo são estimativas do roteiro: com a narração gravada, acertar
// `dur` pelo tempo real de cada fala. Os trechos "reacao" são os planos
// silenciosos do Marcos olhando para a lente depois de cada piada dela.
type Draft = Omit<Segment, "from" | "to"> & { dur: number };

const DRAFTS: Draft[] = [
  { id: "abertura", kind: "abertura", who: "ela", dur: 3, pages: [] },
  {
    id: "g1",
    kind: "guarda",
    who: "ela",
    dur: 3.2,
    pages: ["Reunião importante.", "Calça de alfaiataria."],
  },
  {
    id: "e1",
    kind: "espelho",
    who: "ela",
    dur: 3.2,
    pages: ["Incrível como o tempo", "só me valoriza."],
    mouth: PEITO,
  },
  { id: "r1", kind: "reacao", who: "eu", dur: 1, pages: [] },
  {
    id: "g2",
    kind: "guarda",
    who: "ela",
    dur: 4,
    pages: ["Agora algo pra combinar", "com meu caimento.", "Calça jogger."],
  },
  {
    id: "e2",
    kind: "espelho",
    who: "ela",
    dur: 3.4,
    pages: ["Maravilhosa.", "Com esse caimento então…"],
    mouth: PEITO,
  },
  { id: "r2", kind: "reacao", who: "eu", dur: 1, pages: [] },
  {
    id: "g3",
    kind: "guarda",
    who: "ela",
    dur: 4.8,
    pages: [
      "Algo pra combinar com meu",
      "algodão cem por cento.",
      "Bermuda de treino.",
    ],
  },
  {
    id: "e3",
    kind: "espelho",
    who: "ela",
    dur: 5,
    pages: [
      "Pode suar:",
      "eu continuo intacta.",
      "Zero transparência:",
      "opaca e orgulhosa.",
    ],
    mouth: PEITO,
  },
  { id: "r3", kind: "reacao", who: "eu", dur: 1, pages: [] },
  {
    id: "fecho",
    kind: "fecho",
    who: "ela",
    dur: 4.8,
    pages: [
      "Quarenta e nove",
      "e noventa e nove.",
      "Barato? Eu sou investimento,",
      "querida.",
    ],
    mouth: PEITO,
  },
  { id: "r4", kind: "reacao", who: "eu", dur: 1, pages: [] },
  {
    id: "cta",
    kind: "cta",
    who: "eu",
    dur: 8.6,
    keepAudio: true,
    pages: [
      "Camiseta Brasil da Hering,",
      "feita no Brasil",
      "para os brasileiros.",
      "Ela vai ser a protagonista",
      "do seu guarda-roupa.",
    ],
  },
];

export const SEGMENTS: Segment[] = DRAFTS.reduce<Segment[]>((acc, draft) => {
  const { dur, ...rest } = draft;
  const from = acc.length ? acc[acc.length - 1].to : 0;
  acc.push({ ...rest, from, to: from + dur });
  return acc;
}, []);

export const TOTAL_SECONDS = SEGMENTS[SEGMENTS.length - 1].to;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS) + 15;

export const segmentById = (id: string): Segment => {
  const found = SEGMENTS.find((s) => s.id === id);
  if (!found) {
    throw new Error(`Trecho "${id}" não existe em SEGMENTS`);
  }
  return found;
};

// Distribui as páginas da legenda pelo tempo do trecho, pelo tamanho do texto.
export const pageRanges = (
  segment: Segment,
): { text: string; from: number; to: number }[] => {
  const lengths = segment.pages.map((p) => p.length);
  const total = lengths.reduce((a, b) => a + b, 0);
  const span = segment.to - segment.from;
  let before = 0;
  return segment.pages.map((text, i) => {
    const from = segment.from + (before / total) * span;
    before += lengths[i];
    return { text, from, to: segment.from + (before / total) * span };
  });
};

// Sílabas aproximadas (grupos de vogais), para mexer a boca no ritmo da fala.
export const syllablesOf = (text: string): number =>
  Math.max(1, (text.match(/[aeiouáàâãéêíóôõúü]+/gi) ?? []).length);
