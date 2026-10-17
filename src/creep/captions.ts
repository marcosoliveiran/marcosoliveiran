import { CaptionStyle, Part } from "../kit";
import { timeAtFraction, sentenceEnd, sentenceStart } from "./timing";

// Legenda da fala, já com a grafia certa (o Whisper errou alguns nomes).
// *palavra* = destaque. Cada linha é uma "página" de até duas linhas na tela.
// Estilos: A = padrão, E = "minimal" (frase do Jonny), D = "card" (CTA).
type Block = { sentence: number; style?: CaptionStyle; chunks: string[] };

export const CAPTION_BLOCKS: Block[] = [
  {
    sentence: 1,
    chunks: [
      "A música *mais famosa* do Radiohead",
      "quase acabou com a banda",
      "e eles *odeiam* ela até hoje.",
    ],
  },
  {
    sentence: 2,
    chunks: [
      "*Creep* nasceu no final dos anos 80,",
      "quando Thom Yorke ainda era universitário.",
    ],
  },
  {
    sentence: 3,
    chunks: [
      "Ele escreveu a música depois de passar",
      "meses *obcecado* por uma garota",
      "que ele nunca nem falou.",
    ],
  },
  {
    sentence: 4,
    chunks: [
      "Anos depois, em estúdio,",
      "a banda tocou a música em um ensaio",
      "e, quando os produtores descobriram",
      "que não era nenhum cover,",
      "sim uma música *original*,",
      "eles gravaram na hora, em um *take só*.",
    ],
  },
  {
    sentence: 5,
    chunks: [
      "O guitarrista odiava a música",
      "e, na hora de gravar,",
      "quis *sabotar* a gravação",
      "com uma distorção de guitarra",
      "que acabou virando a *marca registrada*",
      "da canção.",
    ],
  },
  {
    sentence: 6,
    chunks: [
      "Lançada em *92*,",
      "em um primeiro momento,",
      "a música fracassou.",
    ],
  },
  {
    sentence: 7,
    chunks: [
      "A *BBC* barrou",
      "por ser deprimente demais",
      "e a música estacionou",
      "no *78º lugar* no Reino Unido,",
      "mas pegou nas rádios",
      "dos Estados Unidos.",
    ],
  },
  {
    sentence: 8,
    chunks: [
      "Já em 93, a música chegou",
      "ao *2º lugar* do top alternativo",
      "da Billboard",
      "e ao *34º* no Hot 100.",
    ],
  },
  {
    sentence: 9,
    chunks: [
      "Foi relançada novamente",
      "no Reino Unido",
      "e alcançou o *7º lugar*.",
    ],
  },
  { sentence: 10, chunks: ["Também teve a acusação de *plágio*."] },
  {
    sentence: 11,
    chunks: [
      "A melodia lembrava",
      '"The Air That I Breathe",',
      "dos Hollies,",
      "e os compositores passaram",
      "a ser creditados na música.",
    ],
  },
  {
    sentence: 12,
    chunks: ["O sucesso virou uma *maldição*", "entre 93 e 95."],
  },
  {
    sentence: 13,
    chunks: [
      "A banda passou a *turnê inteira*",
      "cantando para uma plateia",
      "que só conhecia a música.",
    ],
  },
  {
    sentence: 14,
    chunks: [
      "O Tom chegou a chamar",
      'a música de "*lixo*",',
      "e conta-se que ele mandou",
      "um fã *catar coquinho*",
      "de tanto que pedia a música",
      "nos shows deles.",
    ],
  },
  {
    sentence: 15,
    chunks: [
      "No fim da turnê",
      "do *OK Computer*, de 98,",
      "a banda basicamente tirou",
      '"Creep" dos *setlists* dos shows.',
    ],
  },
  {
    sentence: 16,
    style: "minimal",
    chunks: [
      "O guitarrista *Jonny Greenwood* explicou:",
      "a letra é do Tom,",
      "e ele simplesmente não está mais",
      "naquele *lugar emocional*.",
    ],
  },
  {
    sentence: 17,
    chunks: [
      "A última vez que eles tocaram",
      '"Creep" ao vivo foi em *Bogotá*,',
      "em *2018*.",
    ],
  },
  { sentence: 18, chunks: ["Na turnê de *2025*,", "nem sinal."] },
  {
    sentence: 19,
    chunks: [
      "E agora a *parte doida*:",
      "se na época a música chegou",
      "num modesto *34º lugar*",
      "nos Estados Unidos,",
      "hoje já acumula cerca de",
      "*3 bilhões* de reproduções",
      "apenas no Spotify.",
    ],
  },
  {
    sentence: 20,
    chunks: [
      "Mas e aí, o que você acha de *Creep*?",
      "Conta pra mim aqui nos comentários",
      "e me siga pra mais conteúdos como esse.",
    ],
  },
];

export const parseParts = (text: string): Part[] =>
  text
    .split("*")
    .map((piece, i) => ({ text: piece, highlight: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);

export type CaptionEntry = {
  from: number; // segundos
  to: number;
  parts: Part[];
  style: CaptionStyle;
};

// Distribui as páginas pelo tempo da frase, pelo tamanho do texto de cada uma.
export const buildCaptionEntries = (): CaptionEntry[] => {
  const entries: CaptionEntry[] = [];
  for (const block of CAPTION_BLOCKS) {
    const lengths = block.chunks.map((c) => c.replace(/\*/g, "").length);
    const total = lengths.reduce((a, b) => a + b, 0);
    let before = 0;
    const starts = block.chunks.map((_, i) => {
      const start =
        i === 0
          ? sentenceStart(block.sentence)
          : timeAtFraction(block.sentence, before / total) - 0.08;
      before += lengths[i];
      return start;
    });
    block.chunks.forEach((chunk, i) => {
      const end =
        i + 1 < block.chunks.length
          ? starts[i + 1]
          : sentenceEnd(block.sentence) + 0.1;
      entries.push({
        from: starts[i],
        to: Math.max(end, starts[i] + 0.4),
        parts: parseParts(chunk),
        style:
          block.style ?? (block.sentence === 20 && i > 0 ? "card" : "default"),
      });
    });
  }
  return entries;
};
