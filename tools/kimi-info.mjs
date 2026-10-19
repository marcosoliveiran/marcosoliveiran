// Gera src/kimi/fala-info.json, o mapa de palavras e tempos do vídeo do Kimi.
//
// Sem argumentos: faz uma ESTIMATIVA a partir do roteiro (serve para montar e
// conferir os motions antes da gravação).
//   npm run kimi:info
//
// Com a transcrição do vídeo final (gerada por `npm run transcrever`): usa os
// tempos reais da fala.
//   npm run kimi:info -- transcricao/kimi.json

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { toSentences } from "./transcrever.mjs";

const OUT = path.resolve("src/kimi/fala-info.json");

// Roteiro aprovado, uma frase por item (a quebra só importa para a estimativa).
const ROTEIRO = [
  "Você já ouviu falar de Kimi Antonelli?",
  "O italiano que pode se tornar o campeão mais jovem da história da Fórmula 1, aos 20 anos.",
  "Sabe aquela história de quando uma Suprema surge, a anterior vai ficando cada vez mais fraca?",
  "Kimi entrou na Mercedes aos 18 anos, no lugar do Lewis Hamilton, que depois de 7 títulos mundiais foi para a Ferrari.",
  "A mesma Ferrari em que Michael Schumacher ganhou 5 dos 7 títulos mundiais dele.",
  "Quem acompanhou a temporada 2026 viu nascer um astro da Fórmula 1.",
  "Foi como ver a Taylor Swift ganhar o primeiro Álbum do Ano, dos quatro dela, com Fearless, lá em 2010, aos 20 anos.",
  "Igualzinho ao Kimi.",
  "Com mais de 100 pontos de vantagem, o título pode vir no GP de Austin, improvável mas matematicamente possível.",
  "A aposta é que o título venha na Cidade do México ou até mesmo no GP de São Paulo.",
  "E será o primeiro título de um italiano na Fórmula 1 desde Alberto Ascari, em 1953, 70 e poucos anos depois.",
  "Mas e aí, pra quem vai a sua torcida?",
  "Conta aqui nos comentários, e me segue pra acompanhar a reta final dessa temporada da Fórmula 1.",
];

const estimar = () => {
  let t = 300;
  const sentences = ROTEIRO.map((text, i) => {
    const words = text.split(/\s+/).map((w) => {
      const dur = 100 + 38 * w.replace(/[^\p{L}\p{N}]/gu, "").length;
      const word = {
        text: w,
        startMs: Math.round(t),
        endMs: Math.round(t + dur),
      };
      t += dur + (/[,.?!]$/.test(w) ? 140 : 30);
      return word;
    });
    const sentence = {
      index: i + 1,
      startMs: words[0].startMs,
      endMs: words[words.length - 1].endMs,
      text,
      words,
    };
    t += 240;
    return sentence;
  });
  return { fps: 30, estimado: true, durationMs: Math.round(t), sentences };
};

const dosTempos = async (file) => {
  const raw = JSON.parse(await readFile(file, "utf8"));
  const captions = raw.filter((w) => w.text.trim() !== "");
  const sentences = toSentences(captions).map((s, i) => ({
    index: i + 1,
    startMs: s.startMs,
    endMs: s.endMs,
    text: s.text,
    words: captions
      .filter((w) => w.startMs >= s.startMs && w.endMs <= s.endMs)
      .map((w) => ({
        text: w.text.trim(),
        startMs: w.startMs,
        endMs: w.endMs,
      })),
  }));
  const last = captions[captions.length - 1];
  return {
    fps: 30,
    estimado: false,
    durationMs: last.endMs + 600,
    sentences,
  };
};

const main = async () => {
  const input = process.argv[2];
  const info = input ? await dosTempos(input) : estimar();
  await writeFile(OUT, JSON.stringify(info, null, 1) + "\n");
  console.log(
    `${input ? "Tempos reais" : "Estimativa"} gravados em src/kimi/fala-info.json (${(info.durationMs / 1000).toFixed(1)} s)`,
  );
};

main().catch((error) => {
  console.error("Deu erro:", error?.message ?? error);
  process.exit(1);
});
