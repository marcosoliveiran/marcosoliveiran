import info from "./fala-info.json";

// Tempos (em segundos) do vídeo do Kimi. fala-info.json vem de
// `npm run kimi:info`: sem argumento é uma ESTIMATIVA do roteiro; com a
// transcrição do vídeo final (`npm run kimi:info -- transcricao/kimi.json`)
// são os tempos reais. Os motions e as palavras-chave se ligam à fala por
// palavra, na ordem em que ela é dita.

export const FPS = 30;

// Troque para true quando public/kimi/fala.mp4 existir. Sem o vídeo, aparece
// um quadro de reserva só para conferir motions e tempos.
export const HAS_VIDEO = false;

export const ESTIMADO: boolean = info.estimado;
export const TOTAL_FRAMES = Math.ceil((info.durationMs / 1000) * FPS) + 15;

type Word = { text: string; startMs: number; endMs: number };
const WORDS: Word[] = info.sentences.flatMap((s) => s.words);

// Sem acento, sem pontuação, minúsculo: o Whisper erra a grafia de nomes.
const norm = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

let cursor = 0;

export type Hit = { start: number; end: number };

// Próxima palavra, a partir da última achada, que combina com o padrão. Se o
// Whisper escreveu diferente e não achou, usa a palavra seguinte e avisa.
const next = (pattern: RegExp): Hit => {
  for (let i = cursor; i < WORDS.length; i++) {
    if (pattern.test(norm(WORDS[i].text))) {
      cursor = i + 1;
      return { start: WORDS[i].startMs / 1000, end: WORDS[i].endMs / 1000 };
    }
  }
  const i = Math.min(cursor, WORDS.length - 1);
  console.warn(
    `[kimi] não achei ${pattern} depois de "${WORDS[Math.max(0, cursor - 1)]?.text}"; usando "${WORDS[i].text}"`,
  );
  cursor = i + 1;
  return { start: WORDS[i].startMs / 1000, end: WORDS[i].endMs / 1000 };
};

// --- Momentos, na ordem da fala -------------------------------------------------
const kimi1 = next(/^kimi?$/);
const antonelli = next(/^antonel/);
const italiano = next(/^italiano/);
const campeao = next(/^campea/);
const jovem = next(/^jovem/);
const vinte1 = next(/^(20|vinte)$/);
const sabe = next(/^sabe$/);
const suprema = next(/^suprema/);
const anterior = next(/^anterior/);
const fraca = next(/^fraca/);
const kimEntrou = next(/^kimi?$/);
const entrou = next(/^entrou/);
const mercedes = next(/^mercedes/);
const lugar = next(/^lugar$/);
const hamilton = next(/^hamil/);
const sete1 = next(/^(7|sete)$/);
const ferrari1 = next(/^ferrari/);
const ferrari2 = next(/^ferrari/);
const schumacher = next(/^(sch|shu|chu|xu)/);
const cinco = next(/^(5|cinco)$/);
const sete2 = next(/^(7|sete)$/);
const acompanhou = next(/^acompanh/);
const com = next(/^com$/);
const cem = next(/^(100|cem)$/);
const austin = next(/^austin/);
const mexico = next(/^mexico/);
const paulo = next(/^paulo/);
const ascari = next(/^as[ck]ar/);
const y1953 = next(/^(1953|mil)$/);
const mas = next(/^mas$/);
const quem = next(/^quem$/);
const torcida = next(/^torcida/);
const conta = next(/^cont/);
const comentarios = next(/^comentarios/);
const segue = next(/^(segue|siga)$/);

export const END = info.durationMs / 1000;

export const T = {
  kimi1: kimi1.start,
  antonelliEnd: antonelli.end,
  italiano: italiano.start,
  campeao: campeao.start,
  jovem: jovem.start,
  vinte1: vinte1.start,
  sabe: sabe.start,
  suprema: suprema.start,
  anterior: anterior.start,
  fracaEnd: fraca.end,
  kimEntrou: kimEntrou.start,
  entrou: entrou.start,
  mercedes: mercedes.start,
  lugar: lugar.start,
  hamilton: hamilton.start,
  sete1: sete1.start,
  ferrari1: ferrari1.start,
  ferrari2: ferrari2.start,
  schumacher: schumacher.start,
  cinco: cinco.start,
  sete2: sete2.start,
  acompanhou: acompanhou.start,
  com: com.start,
  cem: cem.start,
  austin: austin.start,
  mexico: mexico.start,
  paulo: paulo.start,
  pauloEnd: paulo.end,
  ascari: ascari.start,
  y1953: y1953.start,
  mas: mas.start,
  quem: quem.start,
  torcida: torcida.start,
  conta: conta.start,
  comentarios: comentarios.start,
  segue: segue.start,
};
