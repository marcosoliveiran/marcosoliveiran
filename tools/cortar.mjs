// Aplica os cortes aprovados: junta só as falas escolhidas, sem os silêncios
// longos, e gera uma versão leve do vídeo (H.264, 1440 de largura, 30 fps).
//
// Uso:  npm run cortar -- bruto/IMG_3556.MOV
//       npm run cortar -- bruto/IMG_3556.MOV --plano     (só mostra o plano)
//
// Lê:    docs/creep-cortes.json  e  transcricao/<nome>-blocos.json
// Gera:  public/creep/fala.mp4        vídeo cortado, enquadramento original
//        public/creep/fala-info.json  frases e palavras no tempo do vídeo novo
//
// O vídeo original não é alterado. Requisito: ffmpeg no PATH.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

const FPS = 30;
// 1440 de largura (a gravação é 4K): sobra resolução para os enquadramentos com
// aproximação, sem pesar tanto quanto o 4K.
const WIDTH = 1440;

// Folgas ao redor de cada fala (em segundos). Mais folga no fim da frase dá
// um respiro natural; a folga depois da fala também protege as sílabas finais,
// que costumam ser baixinhas.
export const RHYTHMS = {
  rapido: { before: 0.12, after: 0.3, afterSentence: 0.55 },
  respirado: { before: 0.15, after: 0.4, afterSentence: 0.8 },
};

const mmss = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(2).padStart(5, "0");
  return `${String(minutes).padStart(2, "0")}:${rest}`;
};

// Tira de [start, end] os trechos listados em `ranges`.
const subtract = (start, end, ranges) => {
  let pieces = [[start, end]];
  for (const range of ranges) {
    pieces = pieces.flatMap(([a, b]) => {
      if (range.ate <= a || range.de >= b) {
        return [[a, b]];
      }
      const out = [];
      if (range.de > a) {
        out.push([a, range.de]);
      }
      if (range.ate < b) {
        out.push([range.ate, b]);
      }
      return out;
    });
  }
  return pieces.filter(([a, b]) => b - a > 0.05);
};

// Monta a lista de trechos do vídeo bruto que entram, em ordem.
export const buildEdit = (blocks, config, duration) => {
  const rhythm = RHYTHMS[config.ritmo] ?? RHYTHMS.rapido;
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const startsAfter = (id) => {
    const next = blocks.find((b) => b.speechStart > byId.get(id).speechStart);
    return next ? next.speechStart : duration;
  };

  const segments = [];
  let previousEnd = 0;
  config.frases.forEach((sentence, sIndex) => {
    sentence.forEach((id, bIndex) => {
      const block = byId.get(id);
      if (!block) {
        throw new Error(`O bloco ${id} não existe em ...-blocos.json`);
      }
      const isLast = bIndex === sentence.length - 1;
      const start = Math.max(previousEnd, block.speechStart - rhythm.before, 0);
      const wanted =
        block.speechEnd + (isLast ? rhythm.afterSentence : rhythm.after);
      const end = Math.min(wanted, startsAfter(id) - 0.03, duration);
      previousEnd = end;
      for (const [a, b] of subtract(start, end, config.remover ?? [])) {
        segments.push({ id, sentence: sIndex, rawStart: a, rawEnd: b });
      }
    });
  });

  let cursor = 0;
  for (const segment of segments) {
    segment.editStart = cursor;
    cursor += segment.rawEnd - segment.rawStart;
    segment.editEnd = cursor;
  }
  return { segments, duration: cursor };
};

// Transforma o tempo do vídeo bruto no tempo do vídeo cortado.
export const toEditTime = (segments, rawTime) => {
  const segment = segments.find(
    (s) => rawTime >= s.rawStart && rawTime <= s.rawEnd,
  );
  return segment ? segment.editStart + (rawTime - segment.rawStart) : null;
};

// Junta os pedaços de palavra do Whisper ("fam" + "osa") em palavras inteiras.
const mergeTokens = (tokens) => {
  const words = [];
  for (const token of tokens) {
    const isPunctuation = /^[\s.,!?;:…"'“”()-]+$/.test(token.text);
    const startsWord = token.text.startsWith(" ") && !isPunctuation;
    if (words.length === 0 || (startsWord && !isPunctuation)) {
      if (!isPunctuation) {
        words.push({
          text: token.text.trim(),
          start: token.start,
          end: token.end,
        });
        continue;
      }
    }
    const last = words[words.length - 1];
    if (last) {
      last.text += token.text.trim();
      last.end = Math.max(last.end, token.end);
    }
  }
  return words;
};

export const buildInfo = (blocks, edit, config) => {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const sentences = config.frases.map((ids, index) => {
    const tokens = [];
    for (const id of ids) {
      for (const word of byId.get(id).words) {
        const middle = (word.rawStart + word.rawEnd) / 2;
        const start =
          toEditTime(edit.segments, word.rawStart) ??
          toEditTime(edit.segments, middle);
        const end = toEditTime(edit.segments, word.rawEnd) ?? start;
        if (start !== null && toEditTime(edit.segments, middle) !== null) {
          tokens.push({ text: word.text, start, end: end ?? start });
        }
      }
    }
    const words = mergeTokens(tokens).map((w) => ({
      text: w.text,
      startMs: Math.round(w.start * 1000),
      endMs: Math.round(w.end * 1000),
    }));
    const segs = edit.segments.filter((s) => s.sentence === index);
    return {
      index: index + 1,
      blocks: ids,
      startMs: Math.round(segs[0].editStart * 1000),
      endMs: Math.round(segs[segs.length - 1].editEnd * 1000),
      text: words.map((w) => w.text).join(" "),
      words,
    };
  });
  return { fps: FPS, durationMs: Math.round(edit.duration * 1000), sentences };
};

const filterGraph = (segments) => {
  const n = segments.length;
  const lines = [
    `[0:v]fps=${FPS},scale=${WIDTH}:-2:flags=lanczos,format=yuv420p,split=${n}${segments.map((_, i) => `[s${i}]`).join("")}`,
    `[0:a]aresample=48000,asplit=${n}${segments.map((_, i) => `[t${i}]`).join("")}`,
  ];
  segments.forEach((s, i) => {
    const length = s.rawEnd - s.rawStart;
    lines.push(
      `[s${i}]trim=start=${s.rawStart.toFixed(3)}:end=${s.rawEnd.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`,
      `[t${i}]atrim=start=${s.rawStart.toFixed(3)}:end=${s.rawEnd.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.02,afade=t=out:st=${Math.max(0, length - 0.03).toFixed(3)}:d=0.03[a${i}]`,
    );
  });
  lines.push(
    `${segments.map((_, i) => `[v${i}][a${i}]`).join("")}concat=n=${n}:v=1:a=1[v][a]`,
  );
  return lines.join(";");
};

const main = async () => {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--plano");
  const outArg = args.find((a) => a.startsWith("--saida="));
  const outDir = path.resolve(outArg ? outArg.slice(8) : "public/creep");

  if (!input) {
    console.error('Uso: npm run cortar -- "caminho/do/video.MOV"');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`Não encontrei o arquivo: ${input}`);
    process.exit(1);
  }

  const config = JSON.parse(await readFile("docs/creep-cortes.json", "utf8"));
  const name = path.parse(input).name;
  const blocosPath = path.resolve("transcricao", `${name}-blocos.json`);
  const falasPath = path.resolve("transcricao", `${name}-falas.json`);
  if (!existsSync(blocosPath) || !existsSync(falasPath)) {
    console.error(
      `Faltam os arquivos de ${name} em transcricao/. Rode antes: npm run silencios e npm run compactar.`,
    );
    process.exit(1);
  }
  const { blocks } = JSON.parse(await readFile(blocosPath, "utf8"));
  const { duration } = JSON.parse(await readFile(falasPath, "utf8"));

  const edit = buildEdit(blocks, config, duration);
  const info = buildInfo(blocks, edit, config);

  console.log(
    `Ritmo: ${config.ritmo}  |  trechos: ${edit.segments.length}  |  vídeo final: ${mmss(edit.duration)}  (bruto: ${mmss(duration)})`,
  );
  if (dryRun) {
    for (const s of edit.segments) {
      console.log(
        `  bloco ${String(s.id).padStart(3, "0")}  bruto ${mmss(s.rawStart)} → ${mmss(s.rawEnd)}  =>  final ${mmss(s.editStart)}`,
      );
    }
    return;
  }

  await mkdir(outDir, { recursive: true });
  const scriptPath = path.join(outDir, "filtro.txt");
  const graph = filterGraph(edit.segments);
  await writeFile(scriptPath, graph);
  await writeFile(
    path.join(outDir, "fala-info.json"),
    JSON.stringify(info, null, 2),
  );

  console.log("Cortando e codificando (pode levar alguns minutos)...");
  try {
    await run(
      "ffmpeg",
      [
        "-y",
        "-i",
        input,
        "-filter_complex",
        graph,
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-r",
        String(FPS),
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        path.join(outDir, "fala.mp4"),
      ],
      { maxBuffer: 256 * 1024 * 1024 },
    );
  } catch (error) {
    console.error("Deu erro no ffmpeg:");
    console.error(String(error.stderr ?? error.message ?? error).slice(-1200));
    process.exit(1);
  }

  console.log(`\nPronto! Gerados em ${outDir}:`);
  console.log("  fala.mp4        (vídeo cortado)");
  console.log("  fala-info.json  (frases e palavras no tempo novo)");
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
