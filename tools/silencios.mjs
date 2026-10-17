// Mede onde há silêncio no áudio de um vídeo e lista os blocos de fala.
//
// Uso:  npm run silencios -- bruto/IMG_3556.MOV
//       npm run silencios -- bruto/IMG_3556.MOV -50 0.4
//                                                │   └ pausa mínima, em segundos
//                                                └ limiar de silêncio, em dB
//
// Sem limiar, ele mede o volume do áudio, testa vários limiares e escolhe um
// sozinho (quanto mais baixa a voz, mais baixo o limiar). Mostra a tabela dos
// testados para conferir.
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

const SWEEP_DB = [-35, -40, -45, -50, -55, -60];
const AUTO_BELOW_PEAK_DB = 30;
const AUTO_MIN_DB = -60;
const AUTO_MAX_DB = -40;
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

// Roda o silencedetect sobre um arquivo e devolve a duração e os silêncios.
const detect = async (file, noiseDb, minSilence) => {
  const result = await run(
    "ffmpeg",
    [
      "-hide_banner",
      "-i",
      file,
      "-vn",
      "-af",
      `silencedetect=noise=${noiseDb}dB:d=${minSilence}`,
      "-f",
      "null",
      "-",
    ],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const { duration, silences } = parseSilenceLog(result.stderr);
  return {
    duration,
    silences,
    speech: toSpeechBlocks(silences, duration ?? 0),
  };
};

// Volume médio e de pico (em dB) do arquivo.
export const parseVolume = (log) => {
  const mean = log.match(/mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/);
  const max = log.match(/max_volume:\s*(-?\d+(?:\.\d+)?)\s*dB/);
  return {
    mean: mean ? Number(mean[1]) : null,
    max: max ? Number(max[1]) : null,
  };
};

export const pickThreshold = (maxVolume) => {
  if (maxVolume === null) {
    return -45;
  }
  const raw = Math.round(maxVolume - AUTO_BELOW_PEAK_DB);
  return Math.min(AUTO_MAX_DB, Math.max(AUTO_MIN_DB, raw));
};

const totalOf = (speech) =>
  speech.reduce((sum, b) => sum + (b.end - b.start), 0);

const main = async () => {
  const input = process.argv[2];
  const noiseArg = process.argv[3];
  const minSilence = Number(process.argv[4] ?? DEFAULT_MIN_SILENCE_S);

  if (!input) {
    console.error('Uso: npm run silencios -- "caminho/do/video.MOV"');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`Não encontrei o arquivo: ${input}`);
    process.exit(1);
  }

  const name = path.parse(input).name;
  const outDir = path.resolve("transcricao");
  await mkdir(outDir, { recursive: true });

  // Trabalhar sobre um áudio leve é bem mais rápido que reler o vídeo 4K.
  const wav = path.join(outDir, `${name}.wav`);
  try {
    if (!existsSync(wav)) {
      console.log("Extraindo o áudio...");
      await run("ffmpeg", [
        "-y",
        "-i",
        input,
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        wav,
      ]);
    }

    console.log("Medindo o volume...");
    const volumeRun = await run(
      "ffmpeg",
      ["-hide_banner", "-i", wav, "-af", "volumedetect", "-f", "null", "-"],
      { maxBuffer: 64 * 1024 * 1024 },
    );
    const volume = parseVolume(volumeRun.stderr);
    console.log(
      `  volume de pico: ${volume.max} dB  |  médio: ${volume.mean} dB`,
    );

    console.log(`Testando limiares (pausa mínima ${minSilence}s)...`);
    const table = [];
    for (const db of SWEEP_DB) {
      const r = await detect(wav, db, minSilence);
      table.push({ db, blocks: r.speech.length, total: totalOf(r.speech) });
    }

    const chosenDb =
      noiseArg !== undefined ? Number(noiseArg) : pickThreshold(volume.max);
    const chosen = await detect(wav, chosenDb, minSilence);
    if (chosen.duration === null) {
      console.error("Não consegui ler a duração do áudio.");
      process.exit(1);
    }

    const tableLines = table.map(
      (row) =>
        `  ${String(row.db).padStart(4)} dB  ->  fala ${mmss(row.total)}  em ${String(row.blocks).padStart(3)} blocos`,
    );
    const speechTotal = totalOf(chosen.speech);
    const lines = [
      `Arquivo: ${path.basename(input)}`,
      `Duração total: ${mmss(chosen.duration)}  |  só fala: ${mmss(speechTotal)}  |  silêncio: ${mmss(chosen.duration - speechTotal)}`,
      `Volume: pico ${volume.max} dB, médio ${volume.mean} dB`,
      `Limiar usado: ${chosenDb} dB${noiseArg === undefined ? " (escolhido sozinho)" : ""}  |  pausa mínima: ${minSilence}s  |  blocos de fala: ${chosen.speech.length}`,
      "",
      "Testes de limiar:",
      ...tableLines,
      "",
      ...chosen.speech.map(
        (b, i) =>
          `${String(i + 1).padStart(3, "0")}  ${mmss(b.start)} → ${mmss(b.end)}  (${(b.end - b.start).toFixed(2)}s)`,
      ),
    ];
    await writeFile(
      path.join(outDir, `${name}-falas.txt`),
      lines.join("\n") + "\n",
    );
    await writeFile(
      path.join(outDir, `${name}-falas.json`),
      JSON.stringify(
        {
          duration: chosen.duration,
          noiseDb: chosenDb,
          minSilence,
          volume,
          sweep: table,
          speech: chosen.speech,
          silences: chosen.silences,
        },
        null,
        2,
      ),
    );

    console.log("\n" + lines.slice(0, 4).join("\n"));
    console.log("\nTestes de limiar:\n" + tableLines.join("\n"));
    console.log(`\nPronto! Arquivos gerados em ${outDir}:`);
    console.log(`  ${name}-falas.txt   <- cole o conteúdo deste na conversa`);
    console.log(`  ${name}-falas.json`);
  } catch (error) {
    console.error(
      "Deu erro ao rodar o ffmpeg. Abra um CMD novo e digite  ffmpeg -version  para conferir.",
    );
    console.error(String(error.message ?? error).slice(0, 400));
    process.exit(1);
  }
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
