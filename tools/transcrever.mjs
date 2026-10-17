// Transcreve um vídeo com o Whisper local (CPU), com o tempo de cada palavra.
//
// Uso:  npm run transcrever -- bruto/IMG_3556.MOV
//
// Gera, dentro de transcricao/:
//   <nome>.txt   texto por frase com o tempo, fácil de ler e colar no chat
//   <nome>.json  palavra por palavra, com início e fim em milissegundos
//
// Requisitos: Node.js e ffmpeg no PATH. Na primeira execução baixa o
// whisper.cpp e o modelo "small" (cerca de 500 MB); depois fica em cache.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.5.5";
const MODEL = "small";
const LANGUAGE = "pt";
const SENTENCE_GAP_MS = 700;

const run = promisify(execFile);

const mmss = (ms) => {
  const total = Math.max(0, ms) / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = (total - minutes * 60).toFixed(1).padStart(4, "0");
  return `${String(minutes).padStart(2, "0")}:${seconds}`;
};

// Agrupa as palavras em frases: quebra em pontuação final ou em pausa longa.
export const toSentences = (captions) => {
  const sentences = [];
  let current = null;

  for (const word of captions) {
    const text = word.text;
    if (text.trim() === "") {
      continue;
    }
    const gap = current ? word.startMs - current.endMs : 0;
    if (current && gap > SENTENCE_GAP_MS) {
      sentences.push(current);
      current = null;
    }
    if (!current) {
      current = { startMs: word.startMs, endMs: word.endMs, text: "" };
    }
    current.text += text;
    current.endMs = word.endMs;
    if (/[.!?…]\s*$/.test(text)) {
      sentences.push(current);
      current = null;
    }
  }
  if (current) {
    sentences.push(current);
  }
  return sentences.map((s) => ({ ...s, text: s.text.trim() }));
};

export const toTxt = (captions) => {
  const lines = toSentences(captions).map(
    (s) => `[${mmss(s.startMs)} → ${mmss(s.endMs)}] ${s.text}`,
  );
  return lines.join("\n") + "\n";
};

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error('Uso: npm run transcrever -- "caminho/do/video.MOV"');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`Não encontrei o arquivo: ${input}`);
    process.exit(1);
  }

  const name = path.parse(input).name;
  const outDir = path.resolve("transcricao");
  const whisperPath = path.resolve("whisper.cpp");
  await mkdir(outDir, { recursive: true });

  const wav = path.join(outDir, `${name}.wav`);
  console.log("1/3  Extraindo o áudio com o ffmpeg...");
  try {
    await run("ffmpeg", ["-y", "-i", input, "-vn", "-ac", "1", "-ar", "16000", wav]);
  } catch (error) {
    console.error(
      "Não consegui rodar o ffmpeg. Confira se ele está instalado: abra um CMD novo e digite  ffmpeg -version",
    );
    console.error(String(error.message ?? error).slice(0, 400));
    process.exit(1);
  }

  console.log("2/3  Preparando o Whisper (só demora na primeira vez)...");
  await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION, printOutput: false });
  await downloadWhisperModel({ model: MODEL, folder: whisperPath, printOutput: false });

  console.log("3/3  Transcrevendo... isso pode levar alguns minutos.");
  const output = await transcribe({
    inputPath: wav,
    whisperPath,
    whisperCppVersion: WHISPER_VERSION,
    model: MODEL,
    modelFolder: whisperPath,
    tokenLevelTimestamps: true,
    language: LANGUAGE,
    printOutput: false,
    onProgress: (progress) => {
      process.stdout.write(`\r     ${Math.round(progress * 100)}%   `);
    },
  });
  process.stdout.write("\n");

  const { captions } = toCaptions({ whisperCppOutput: output });
  const jsonPath = path.join(outDir, `${name}.json`);
  const txtPath = path.join(outDir, `${name}.txt`);
  await writeFile(jsonPath, JSON.stringify(captions, null, 2));
  await writeFile(txtPath, toTxt(captions));

  console.log("\nPronto! Arquivos gerados:");
  console.log(`  ${txtPath}`);
  console.log(`  ${jsonPath}`);
  console.log("\nPróximo passo: me mande o conteúdo do arquivo .txt (cole na conversa)");
  console.log("e suba o .json no Drive, ou cole também se for pequeno.");
};

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error("\nDeu erro:", error?.message ?? error);
    process.exit(1);
  });
}
