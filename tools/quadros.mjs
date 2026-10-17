// Extrai alguns quadros do vídeo e mostra o formato dele (tamanho, fps,
// rotação). Serve para escolher o enquadramento sem abrir o vídeo inteiro.
//
// Uso:  npm run quadros -- bruto/IMG_3556.MOV
//       npm run quadros -- bruto/IMG_3556.MOV 26 164 330     (segundos escolhidos)
//
// Gera as imagens em transcricao/quadros/. Requisito: ffmpeg e ffprobe no PATH.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const DEFAULT_TIMES = [26, 38, 164, 330];

const rotationOf = (stream) => {
  const side = (stream.side_data_list ?? []).find(
    (s) => s.rotation !== undefined,
  );
  const value = side ? Number(side.rotation) : Number(stream.tags?.rotate ?? 0);
  return Math.abs(value) % 360;
};

const fraction = (text) => {
  const [a, b] = String(text).split("/").map(Number);
  return b ? a / b : a;
};

const main = async () => {
  const input = process.argv[2];
  if (!input) {
    console.error('Uso: npm run quadros -- "caminho/do/video.MOV"');
    process.exit(1);
  }
  if (!existsSync(input)) {
    console.error(`Não encontrei o arquivo: ${input}`);
    process.exit(1);
  }
  const extra = process.argv
    .slice(3)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const times = extra.length > 0 ? extra : DEFAULT_TIMES;

  try {
    const probe = await run("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      input,
    ]);
    const data = JSON.parse(probe.stdout);
    const stream = data.streams[0];
    const turned = rotationOf(stream) % 180 === 90;
    const width = turned ? stream.height : stream.width;
    const height = turned ? stream.width : stream.height;
    const seconds = Number(data.format.duration);

    console.log("Formato do vídeo:");
    console.log(
      `  tamanho: ${width} x ${height} (${height >= width ? "vertical" : "horizontal"})`,
    );
    console.log(
      `  quadros por segundo: ${fraction(stream.avg_frame_rate).toFixed(2)}`,
    );
    console.log(
      `  codec: ${stream.codec_name}  |  duração: ${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`,
    );

    const outDir = path.resolve("transcricao", "quadros");
    await mkdir(outDir, { recursive: true });
    for (const t of times) {
      const file = path.join(
        outDir,
        `quadro-${String(t).padStart(3, "0")}s.jpg`,
      );
      await run("ffmpeg", [
        "-y",
        "-ss",
        String(t),
        "-i",
        input,
        "-frames:v",
        "1",
        "-vf",
        "scale=540:-2",
        "-q:v",
        "3",
        file,
      ]);
      console.log(`  quadro em ${t}s -> ${file}`);
    }
    console.log(
      "\nPronto! Anexe na conversa as imagens da pasta transcricao/quadros",
    );
    console.log("e copie aqui o bloco 'Formato do vídeo' acima.");
  } catch (error) {
    console.error(
      "Deu erro. Confira se o ffmpeg e o ffprobe estão instalados (ffmpeg -version).",
    );
    console.error(String(error.stderr ?? error.message ?? error).slice(0, 500));
    process.exit(1);
  }
};

main();
