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
  | "insert"
  | "fecho"
  | "cta";

// Enquadramento do take dentro do quadro 1080×1920: zoom e deslocamento em
// pixels. Serve para pôr cabeça e pés nas faixas livres (cabeça ~y 540, pés até
// ~y 1360 no corpo inteiro; cabelo ~y 620 no CTA) sem regravar.
export type Framing = {
  scale?: number;
  x?: number;
  y?: number;
  // Fração do topo (0 a 1) que fica desfocada, para esconder objetos de outras
  // marcas na prateleira do guarda-roupa (briefing: nenhum logo de outra marca).
  blurTop?: number;
};

export type Segment = {
  id: string;
  kind: Kind;
  from: number; // início no vídeo final (calculado a partir de `dur`)
  to: number;
  // Ponto do bruto (segundos em video.mp4) de onde o take começa.
  src?: number;
  framing?: Framing;
  // Só o CTA: usa o áudio original do vídeo (os outros são mudos).
  keepAudio?: boolean;
  // Páginas da legenda: linha única, até ~28 letras cada.
  pages: string[];
};

// Tudo é a voz do Marcos em off (narração gravada por último), em primeira
// pessoa, ajustada ao que acontece na imagem de cada take. A graça mantém a
// ideia da "síndrome de protagonista": a camiseta é a estrela, ele só obedece.
//
// Cada trecho tem `dur` (segundos no vídeo final); `from`/`to` saem da soma.
// As durações são estimativas (~2,7 palavras por segundo): com a narração
// gravada, acertar `dur` pelo tempo real de cada fala. Os trechos "reacao" são
// planos silenciosos do Marcos olhando para a lente, sem fala.
//
// `src` = ponto do bruto (video.mp4) de onde o take começa. Pontos escolhidos
// pelo contato do bruto de 18/10 (64 s): ver docs/hering-direcao.md.

// Corpo inteiro em pé: um pouco menor e mais baixo, para a cabeça ficar abaixo
// da faixa dos motions (de y 250 a ~560). O fundo vira cópia desfocada.
const EM_PE: Framing = { scale: 0.88, y: 120 };
// Guarda-roupa: topo desfocado para esconder objetos de outras marcas.
const GUARDA: Framing = { blurTop: 0.36 };

type Draft = Omit<Segment, "from" | "to"> & { dur: number };

const DRAFTS: Draft[] = [
  {
    id: "abertura",
    src: 0,
    framing: GUARDA,
    kind: "abertura",
    dur: 3,
    pages: [],
  },
  {
    // Ele pega a calça (bege) no cabide. Fala: "Hoje, quem escolheu o meu look
    // não fui eu. Foi ela, a camiseta. Calça de alfaiataria."
    id: "g1",
    src: 6,
    framing: GUARDA,
    kind: "guarda",
    dur: 5.2,
    pages: [
      "Hoje, quem escolheu",
      "o meu look não fui eu.",
      "Foi ela, a camiseta.",
      "Calça de alfaiataria.",
    ],
  },
  {
    // Em pé de calça bege, encosta na porta, ajeita a barra, olha para a lente.
    id: "e1",
    src: 20.6,
    framing: EM_PE,
    kind: "espelho",
    dur: 5.2,
    pages: [
      "Eu só obedeci.",
      "Ela é toda convencida:",
      "mantém a cor,",
      "não forma bolinha,",
      "segundo a Hering.",
    ],
  },
  // Close no rosto olhando para a lente (silêncio).
  { id: "r1", src: 27.4, kind: "reacao", dur: 1, pages: [] },
  {
    // Volta ao guarda-roupa e troca a calça.
    id: "g2",
    src: 30,
    framing: GUARDA,
    kind: "guarda",
    dur: 3.4,
    pages: [
      "Cinco minutos depois,",
      "ela quis trocar.",
      "Agora, calça jogger.",
    ],
  },
  {
    // De jogger azul-marinho, mãos nos bolsos, vira de lado.
    id: "e2",
    src: 36,
    framing: EM_PE,
    kind: "espelho",
    dur: 3.4,
    pages: ["Olha esse caimento.", "Se ela se acha,", "eu entendo."],
  },
  // De perfil, sorrindo para a lente.
  { id: "r2", src: 39.6, kind: "reacao", dur: 1, pages: [] },
  {
    // Insert do close na gola (52–55 s do bruto). Depois de 55 s a etiqueta
    // aparece: nunca usar.
    id: "gola",
    src: 52,
    kind: "insert",
    dur: 3,
    pages: ["A gola? Puxo, estico", "e ela não deforma."],
  },
  {
    // Guarda-roupa de novo: troca para a bermuda.
    id: "g3",
    src: 42,
    framing: GUARDA,
    kind: "guarda",
    dur: 3,
    pages: ["Aí decidiu: hora de treinar.", "Bermuda."],
  },
  {
    // De bermuda preta, parado e de perfil.
    id: "e3",
    src: 46.2,
    framing: EM_PE,
    kind: "espelho",
    dur: 4.8,
    pages: [
      "Cem por cento algodão",
      "e zero transparência.",
      "Pode suar:",
      "ela não entrega nada.",
    ],
  },
  // Abre os braços olhando para a lente.
  { id: "r3", src: 51, kind: "reacao", dur: 1, pages: [] },
  {
    id: "fecho",
    src: 14.5,
    framing: EM_PE,
    kind: "fecho",
    dur: 6.5,
    pages: [
      "Tudo isso por",
      "quarenta e nove",
      "e noventa e nove.",
      "Pra quem tem síndrome",
      "de protagonista,",
      "é até barato.",
    ],
  },
  { id: "r4", src: 28.4, kind: "reacao", dur: 1, pages: [] },
  {
    // Único trecho falando ao vivo, com a sacola da Hering (áudio original).
    id: "cta",
    src: 58.84, // corte seco: antes de 58,83 s aparece a etiqueta (proibida)
    kind: "cta",
    dur: 5.6, // do corte até o fim do bruto (64,4 s)
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
