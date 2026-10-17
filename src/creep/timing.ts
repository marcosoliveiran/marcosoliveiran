import info from "./fala-info.json";

// Tempos (em segundos) das frases e palavras do vídeo JÁ CORTADO.
// fala-info.json é gerado por tools/cortar.mjs a partir de docs/creep-cortes.json.

export const FPS = 30;

type Word = { text: string; startMs: number; endMs: number };
type Sentence = {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
  words: Word[];
};

export const SENTENCES: Sentence[] = info.sentences;
export const TOTAL_SECONDS = info.durationMs / 1000;
export const TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS) + 15;

export const sentenceStart = (n: number): number =>
  SENTENCES[n - 1].startMs / 1000;
export const sentenceEnd = (n: number): number => SENTENCES[n - 1].endMs / 1000;

// Momento em que uma palavra começa. O Whisper erra a grafia de alguns nomes
// ("Tom York", "torneia"), então o padrão procura pelo que ele escreveu.
export const wordAt = (n: number, pattern: RegExp, occurrence = 0): number => {
  const sentence = SENTENCES[n - 1];
  const matches = sentence.words.filter((w) => pattern.test(w.text));
  if (!matches[occurrence]) {
    throw new Error(
      `Não achei ${pattern} na frase ${n} ("${sentence.text.slice(0, 60)}...")`,
    );
  }
  return matches[occurrence].startMs / 1000;
};

// Momento aproximado de um ponto do texto, dado como fração (0 a 1) dele.
export const timeAtFraction = (n: number, fraction: number): number => {
  const sentence = SENTENCES[n - 1];
  const lengths = sentence.words.map((w) => w.text.length + 1);
  const total = lengths.reduce((a, b) => a + b, 0);
  const target = Math.min(0.999, Math.max(0, fraction)) * total;
  let cumulative = 0;
  for (let i = 0; i < sentence.words.length; i++) {
    if (target < cumulative + lengths[i]) {
      const word = sentence.words[i];
      const inside = (target - cumulative) / lengths[i];
      return (word.startMs + inside * (word.endMs - word.startMs)) / 1000;
    }
    cumulative += lengths[i];
  }
  return sentence.endMs / 1000;
};
