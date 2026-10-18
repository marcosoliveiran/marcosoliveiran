// Monta um áudio só com as falas (sem os silêncios), transcreve esse áudio e
// diz qual texto está em cada bloco de fala do vídeo bruto.
//
// Por que: com pausas de vários segundos, o Whisper erra o tempo das palavras.
// Sem as pausas, a transcrição fica precisa, e dá para voltar ao tempo do
// vídeo bruto bloco a bloco.
//
// Uso:  npm run compactar -- bruto/IMG_3556.MOV
// Pré-requisito: já ter rodado  npm run silencios  para esse vídeo.
//
// Gera transcricao/<nome>-blocos.txt (cole na conversa) e .json.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { transcribeWav } from "./transcrever.mjs";

const run = promisify(execFile);

const MIN_BLOCK_S = 0.3; // blocos menores são ruído ou respiro
const PAD_BEFORE_S = 0.12;
const PAD_AFTER_S = 0.2;
const GAP_S = 0.4; // silêncio colocado entre os blocos no áudio compacto

const mmss = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(2).padStart(5, "0");
  return `${String(minutes).padStart(2, "0")}:${rest}`;
};

// Escolhe os blocos que entram e calcula onde cada um fica no áudio compacto.
export const buildPlan = (blocks, duration) => {
  const kept = [];
  const dropped = [];
  blocks.forEach((block, index) => {
    const entry = { id: index + 1, ...block };
    if (block.end - block.start >= MIN_BLOCK_S) {
      kept.push(entry);
    } else {
      dropped.push(entry);
    }
  });

  let previousEnd = 0;
  let cursor = 0;
  const segments = kept.map((block, i) => {
    const nextStart = i + 1 < kept.length ? kept[i + 1].start : duration;
    const start = Math.max(previousEnd, block.start - PAD_BEFORE_S, 0);
    const end = Math.min(block.end + PAD_AFTER_S, nextStart - 0.02, duration);
    previousEnd = end;
    const length = end - start;
    const segment = {
      id: block.id,
      rawStart: start,
      rawEnd: end,
      speechStart: block.start,
      speechEnd: block.end,
      compactStart: cursor,
      compactEnd: cursor + length,
    };
    cursor += length + GAP_S;
    return segment;
  });

  return { segments, dropped, compactDuration: Math.max(0, cursor - GAP_S) };
};

// Distribui as palavras do áudio compacto entre os blocos e devolve também o
// tempo de cada palavra no vídeo bruto.
export const assignWords = (captions, segments) => {
  const result = segments.map((segment) => ({ ...segment, words: [] }));
  for (const word of captions) {
    if (word.text.trim() === "") {
      continue;
    }
    const mid = (word.startMs + word.endMs) / 2000;
    const target = result.find(
      (segment) =>
        mid >= segment.compactStart - GAP_S / 2 &&
        mid < segment.compactEnd + GAP_S / 2,
    );
    if (!target) {
      continue;
    }
    const toRaw = (ms) =>
      Math.min(
        target.rawEnd,
        Math.max(
          target.rawStart,
          target.rawStart + ms / 1000 - target.compactStart,
        ),
      );
    target.words.push({
      text: word.text,
      rawStart: toRaw(word.startMs),
      rawEnd: toRaw(word.endMs),
    });
  }
  return result.map((segment) => ({
    ...segment,
    text: segment.words
      .map((w) => w.text)
      .join("")
      .trim(),
  }));
};

export const makeCompactWav = async (wav, segments, dir) => {
  await mkdir(dir, { recursive: true });
  await run("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "anullsrc=r=16000:cl=mono",
    "-t",
    String(GAP_S),
    "-c:a",
    "pcm_s16le",
    path.join(dir, "gap.wav"),
  ]);

  const list = [];
  for (const [i, segment] of segments.entries()) {
    const name = `seg-${String(segment.id).padStart(3, "0")}.wav`;
    await run("ffmpeg", [
      "-y",
      "-ss",
      segment.rawStart.toFixed(3),
      "-t",
      (segment.rawEnd - segment.rawStart).toFixed(3),
      "-i",
      wav,
      "-c:a",
      "pcm_s16le",
      "-ar",
      "16000",
      "-ac",
      "1",
      path.join(dir, name),
    ]);
    list.push(`file '${name}'`);
    if (i < segments.length - 1) {
      list.push("file 'gap.wav'");
    }
  }
  await writeFile(path.join(dir, "lista.txt"), list.join("\n") + "\n");

  const out = path.join(dir, "compacto.wav");
  await run(
    "ffmpeg",
    [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "lista.txt",
      "-c:a",
      "pcm_s16le",
      "compacto.wav",
    ],
    { cwd: dir },
  );
  return out;
};

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error('Uso: npm run compactar -- "caminho/do/video.MOV"');
    process.exit(1);
  }
  const name = path.parse(input).name;
  const outDir = path.resolve("transcricao");
  const falasPath = path.join(outDir, `${name}-falas.json`);
  const wav = path.join(outDir, `${name}.wav`);

  if (!existsSync(falasPath) || !existsSync(wav)) {
    console.error(
      `Faltam arquivos de ${name}. Rode antes:  npm run silencios -- ${input}`,
    );
    process.exit(1);
  }

  const falas = JSON.parse(await readFile(falasPath, "utf8"));
  const plan = buildPlan(falas.speech, falas.duration);
  console.log(
    `Blocos: ${plan.segments.length} usados, ${plan.dropped.length} descartados por serem curtos demais.`,
  );

  console.log("1/2  Montando o áudio só com as falas...");
  const compact = await makeCompactWav(
    wav,
    plan.segments,
    path.join(outDir, "compacto"),
  );

  console.log("2/2  Transcrevendo o áudio compacto...");
  const captions = await transcribeWav(compact);
  const blocks = assignWords(captions, plan.segments);

  const lines = [
    `Arquivo: ${path.basename(input)}  |  blocos de fala usados: ${blocks.length}`,
    `Descartados (curtos): ${plan.dropped.map((b) => `${String(b.id).padStart(3, "0")} (${mmss(b.start)}, ${(b.end - b.start).toFixed(2)}s)`).join(", ") || "nenhum"}`,
    "",
    ...blocks.map(
      (b) =>
        `${String(b.id).padStart(3, "0")} | ${mmss(b.speechStart)} → ${mmss(b.speechEnd)} | ${(b.speechEnd - b.speechStart).toFixed(1)}s | ${b.text}`,
    ),
  ];
  await writeFile(
    path.join(outDir, `${name}-blocos.txt`),
    lines.join("\n") + "\n",
  );
  await writeFile(
    path.join(outDir, `${name}-blocos.json`),
    JSON.stringify({ dropped: plan.dropped, blocks }, null, 2),
  );

  console.log(
    `\nPronto! Cole na conversa o conteúdo de:\n  ${path.join(outDir, `${name}-blocos.txt`)}`,
  );
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
