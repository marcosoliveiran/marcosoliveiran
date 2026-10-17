// Mede onde há silêncio no áudio de um vídeo e lista os blocos de fala.
//
// Uso:  npm run silencios -- bruto/IMG_3556.MOV
//       npm run silencios -- bruto/IMG_3556.MOV -35 0.35
//                                                │    └ pausa mínima, em segundos
//                                                └ limiar de silêncio, em dB
//
// Gera transcricao/<nome>-falas.txt e .json com os blocos de fala (início e
// fim em segundos). Quem cuida de cortar é o próximo passo; este só mede.
//
// Requisito: ffmpeg no PATH.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

const DEFAULT_NOISE_DB = -35;
const DEFAULT_MIN_SILENCE_S = 0.35;
const MIN_SPEECH_S = 0.15;

const mmss = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(2).padStart(5, "0");
  return `${String(minutes).padStart(2, "0")}:${rest}`;
};

// Lê a saída (stderr) do filtro silencedetect do ffmpeg.
export const parseSilenceLog = (log) => {
  const durationMatch = log.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  const duration = durationMatch
    ? Number(durationMatch[1]) * 3600 +
      Number(durationMatch[2]) * 60 +
      Number(durationMatch[3])
    : null;

  const silences = [];
  let open = null;
  for (const line of log.split(/\r?\n/)) {
    const start = line.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/);
    const end = line.match(/silence_end:\s*(-?\d+(?:\.\d+)?)/);
    if (start) {
      open = Math.max(0, Number(start[1]));
    }
    if (end && open !== null) {
      silences.push({ start: open, end: Number(end[1]) });
      open = null;
    }
  }
  // Silêncio que continua até o fim do arquivo.
  if (open !== null && duration !== null) {
    silences.push({ start: open, end: duration });
  }
  return { duration, silences };
};

// Os blocos de fala são o que sobra entre os silêncios.
export const toSpeechBlocks = (silences, duration) => {
  const blocks = [];
  let cursor = 0;
  for (const silence of silences) {
    if (silence.start - cursor >= MIN_SPEECH_S) {
      blocks.push({ start: cursor, end: silence.start });
    }
    cursor = Math.max(cursor, silence.end);
  }
  if (duration - cursor >= MIN_SPEECH_S) {
    blocks.push({ start: cursor, end: duration });
  }
  return blocks;
};

const main = async () => {
  const input = process.argv[2];
  const noiseDb = Number(process.argv[3] ?? DEFAULT_NOISE_DB);
  const minSilence = Number(process.argv[4] ?? DEFAULT_MIN_SILENCE_S);

  if (!input) {
    console.error('Uso: npm run silencios -- "caminho/do/video.MOV"');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`Não encontrei o arquivo: ${input}`);
    process.exit(1);
  }

  console.log(
    `Medindo silêncios (limiar ${noiseDb} dB, pausa mínima ${minSilence}s)...`,
  );
  let log;
  try {
    const result = await run(
      "ffmpeg",
      [
        "-hide_banner",
        "-i",
        input,
        "-vn",
        "-af",
        `silencedetect=noise=${noiseDb}dB:d=${minSilence}`,
        "-f",
        "null",
        "-",
      ],
      { maxBuffer: 64 * 1024 * 1024 },
    );
    log = result.stderr;
  } catch (error) {
    console.error(
      "Não consegui rodar o ffmpeg. Abra um CMD novo e digite  ffmpeg -version  para conferir.",
    );
    console.error(String(error.message ?? error).slice(0, 400));
    process.exit(1);
  }

  const { duration, silences } = parseSilenceLog(log);
  if (duration === null) {
    console.error("Não consegui ler a duração do vídeo.");
    process.exit(1);
  }
  const speech = toSpeechBlocks(silences, duration);
  const speechTotal = speech.reduce((sum, b) => sum + (b.end - b.start), 0);

  const name = path.parse(input).name;
  const outDir = path.resolve("transcricao");
  await mkdir(outDir, { recursive: true });

  const lines = [
    `Arquivo: ${path.basename(input)}`,
    `Duração total: ${mmss(duration)}  |  só fala: ${mmss(speechTotal)}  |  silêncio: ${mmss(duration - speechTotal)}`,
    `Limiar: ${noiseDb} dB  |  pausa mínima: ${minSilence}s  |  blocos de fala: ${speech.length}`,
    "",
    ...speech.map(
      (b, i) =>
        `${String(i + 1).padStart(3, "0")}  ${mmss(b.start)} → ${mmss(b.end)}  (${(b.end - b.start).toFixed(2)}s)`,
    ),
  ];
  await writeFile(path.join(outDir, `${name}-falas.txt`), lines.join("\n") + "\n");
  await writeFile(
    path.join(outDir, `${name}-falas.json`),
    JSON.stringify({ duration, noiseDb, minSilence, speech, silences }, null, 2),
  );

  console.log("\n" + lines.slice(0, 3).join("\n"));
  console.log(`\nPronto! Arquivos gerados em ${outDir}:`);
  console.log(`  ${name}-falas.txt   <- cole o conteúdo deste na conversa`);
  console.log(`  ${name}-falas.json`);
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    console.error("\nDeu erro:", error?.message ?? error);
    process.exit(1);
  });
}
