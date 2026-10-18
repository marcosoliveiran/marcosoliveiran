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
// Legenda da narração na base (y = 1440). Desligada a pedido do Marcos, até o
// texto novo ficar pronto. As páginas de cada trecho continuam em SEGMENTS.
export const MOSTRAR_LEGENDA = false;

export const NARRACAO_FILE: string | null = "narracao-final.mp3";
export const NARRACAO_INICIO = 0;

// Efeitos de sitcom (do CapCut ou banco livre de uso comercial). Coloque em
// public/sfx/ e mude para true. Volume sempre abaixo da fala (briefing).
// vinheta.wav e vinheta-curta.wav são sintetizadas por tools/make-vinheta.py.
// Efeitos sonoros (vinhetas, impacto, risada, palmas) ficam DESLIGADOS: o Marcos
// faz o som no CapCut, na edição final. Ligue para ouvir uma prévia com som.
export const EFEITOS_SONOROS = false;
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
  // Velocidade do take (1 = normal). Menos que 1 estica o trecho do bruto.
  rate?: number;
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

// Sem enquadramento especial por enquanto: os takes entram em tela cheia, sem
// desfoque nem redução (o Marcos não gostou do desfoque). `framing` continua
// disponível por trecho (zoom e deslocamento) se precisar.

type Draft = Omit<Segment, "from" | "to"> & { dur: number };

const DRAFTS: Draft[] = [
  {
    // BLOCO 1 (narração raw 0,06–8,20 s): a definição. Sobre o guarda-roupa
    // abrindo e a escolha da primeira calça.
    id: "def",
    src: 0,
    kind: "guarda",
    dur: 8.8,
    pages: [
      "Síndrome de protagonista.",
      "Condição da pessoa que acredita",
      "que é o centro de todas as cenas,",
      "que a vida é um filme",
      "e que ela é o personagem principal.",
    ],
  },
  // Cartela depois da definição (sem fala), com a vinheta.
  { id: "cartela", src: 8.8, kind: "abertura", dur: 3, pages: [] },
  {
    // BLOCO 2 (narração raw 15,70–23,16 s): a ligação com a camiseta. Em pé de
    // calça bege. O selo "Camiseta Brasil" entra quando ele diz o nome (~3,8 s).
    id: "e1",
    src: 15.45,
    kind: "espelho",
    dur: 8.2,
    pages: [
      "Eu achava que isso só",
      "acontecia com gente.",
      "Mas aí eu conheci a",
      "Camiseta Brasil, da Hering,",
      "e agora todo look",
      "tem que ser sobre ela.",
    ],
  },
  // Depois de "tem que ser sobre ela": silêncio. Pose dramática na parede e
  // olhar para a lente em close (bruto 24,2–28,7 s).
  { id: "beat", src: 24.2, kind: "reacao", dur: 4.5, pages: [] },
  // BLOCO 3 (narração raw 35,96–42,98 s): cada pedaço cai no look que cita. Os
  // cortes seguem as pausas da voz: "calça," (37,35 s), "bermuda," (39,0 s).
  {
    id: "m1", // jogger azul-marinho
    src: 34.2,
    kind: "espelho",
    dur: 1.6,
    pages: ["Posso mudar a calça,"],
  },
  {
    id: "m2", // trocando para a bermuda
    src: 44.6,
    kind: "guarda",
    dur: 1.65,
    pages: ["combinar com bermuda,"],
  },
  {
    id: "m3", // de bermuda, de perfil
    src: 46.6,
    kind: "espelho",
    dur: 1.65,
    pages: ["mas ela nunca", "sai de cena."],
  },
  {
    id: "m4", // abre os braços para a lente
    src: 49.3,
    kind: "espelho",
    dur: 2.7,
    pages: ["O básico que funciona", "com tudo!"],
  },
  {
    // BLOCO 4 (narração raw 45,92–49,76 s): os diferenciais. Close na gola
    // (bruto 52–55 s) em câmera lenta 0,7x. Depois de 55,4 s a etiqueta aparece:
    // nunca usar.
    id: "gola",
    src: 52,
    rate: 0.7,
    kind: "insert",
    dur: 4.4,
    pages: ["100% algodão,", "não fica transparente", "e a gola não deforma."],
  },
  {
    // BLOCO 5 (narração raw 50,44–55,88 s): o preço. Preço do briefing:
    // R$ 49,99. Confirmar que a fala gravada diz "quarenta e nove e noventa e
    // nove".
    id: "f1", // jogger, mãos nos bolsos
    src: 36,
    kind: "fecho",
    dur: 3.4,
    pages: ["E o melhor:", "R$ 49,99!"],
  },
  {
    id: "f2", // de perfil, sorrindo para a lente (0,8x)
    src: 39.5,
    rate: 0.8,
    kind: "fecho",
    dur: 2.7,
    pages: ["Protagonista por preço", "de coadjuvante."],
  },
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
