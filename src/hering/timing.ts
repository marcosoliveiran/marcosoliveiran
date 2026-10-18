// Roteiro e tempos da publi Hering, em segundos do vídeo FINAL (já editado no
// CapCut, sem legenda). Os tempos abaixo são estimados pelo roteiro: depois de
// transcrever o vídeo (npm run transcrever), acertar from/to de cada trecho.
// Tudo que se ajusta no vídeo mora neste arquivo.

export const FPS = 30;

// Troque para true quando public/hering/video.mp4 existir. Sem o vídeo, a
// composição mostra um quadro de reserva (camiseta) só para conferir motions.
export const HAS_VIDEO = false;

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

export type Kind = "abertura" | "guarda" | "espelho" | "fecho" | "cta";

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
  from: number;
  to: number;
  // Páginas da legenda: linha única, até ~28 letras cada.
  pages: string[];
  // Boca da camiseta (só quando o Marcos está de frente para o espelho).
  mouth?: MouthPlacement;
};

// Posição da boca no peito, para o Marcos parado no espelho (ajustar por take).
// Corpo inteiro (cabeça ~y 480, pés ~y 1360): peito perto de y 740, ~230 px.
const PEITO: MouthPlacement = { x: 500, y: 740, size: 230, rot: -4 };

export const SEGMENTS: Segment[] = [
  {
    id: "abertura",
    kind: "abertura",
    who: "ela",
    from: 0,
    to: 3,
    pages: [],
  },
  {
    id: "g1",
    kind: "guarda",
    who: "ela",
    from: 3,
    to: 6.2,
    pages: ["Reunião importante.", "Calça de alfaiataria."],
  },
  {
    id: "e1",
    kind: "espelho",
    who: "ela",
    from: 6.2,
    to: 9.4,
    pages: ["Incrível como o tempo", "só me valoriza."],
    mouth: PEITO,
  },
  {
    id: "g2",
    kind: "guarda",
    who: "ela",
    from: 9.4,
    to: 13.4,
    pages: ["Agora algo pra combinar", "com meu caimento.", "Calça jogger."],
  },
  {
    id: "e2",
    kind: "espelho",
    who: "ela",
    from: 13.4,
    to: 16.8,
    pages: ["Maravilhosa.", "Com esse caimento então…"],
    mouth: PEITO,
  },
  {
    id: "g3",
    kind: "guarda",
    who: "ela",
    from: 16.8,
    to: 21.6,
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
    from: 21.6,
    to: 26.6,
    pages: [
      "Pode suar:",
      "eu continuo intacta.",
      "Zero transparência:",
      "opaca e orgulhosa.",
    ],
    mouth: PEITO,
  },
  {
    id: "fecho",
    kind: "fecho",
    who: "ela",
    from: 26.6,
    to: 31.4,
    pages: [
      "Quarenta e nove",
      "e noventa e nove.",
      "Barato? Eu sou investimento,",
      "querida.",
    ],
    mouth: PEITO,
  },
  {
    id: "cta",
    kind: "cta",
    who: "eu",
    from: 31.4,
    to: 40,
    pages: [
      "Camiseta Brasil da Hering,",
      "feita no Brasil",
      "para os brasileiros.",
      "Ela vai ser a protagonista",
      "do seu guarda-roupa.",
    ],
  },
];

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
