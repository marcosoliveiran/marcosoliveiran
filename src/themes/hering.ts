import { Theme } from "../kit";
import { loadLocalFont } from "./fonts";

// Script retrô da cartela de abertura (sitcom), só nesta publi.
loadLocalFont("Lobster", "lobster-latin-400-normal.woff2", "400");

// Tipografia da publi: Plus Jakarta Sans, geométrica e limpa, parecida com a
// que o briefing da Hering usa nos títulos ("Camiseta Brasil" leve, "Hering"
// em negrito).
for (const weight of ["300", "400", "600", "700", "800"]) {
  loadLocalFont(
    "Plus Jakarta Sans",
    `plus-jakarta-sans-latin-${weight}-normal.woff2`,
    weight,
  );
}
export const HERING_FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif";
export const HERING_SCRIPT_FONT = "'Lobster', 'Fredoka', cursive";

// Paleta da Hering (Camiseta Brasil), usada no lugar da voom só na publi.
// Tirada do briefing da marca; trocar aqui se houver o guia oficial.
// Sem verde nem amarelo (o briefing proíbe lembrar a bandeira do Brasil).
export const HERING = {
  navy: "#2F4D78",
  navyDark: "#16263F",
  blue: "#4F7BC9",
  white: "#FFFFFF",
  coral: "#E8625A", // preço e a boca da camiseta
} as const;

// Fontes seguem as do perfil (Fredoka nos títulos, Nunito nos textos); o
// import de ./voom já carrega as fontes locais.
export const HERING_THEME: Theme = {
  ink: HERING.white,
  accent: HERING.blue,
  paper: HERING.navyDark,
  panel: "transparent",
  panelInk: HERING.white,
  panelOutline: HERING.navyDark,
  font: HERING_FONT,
  serif: HERING_FONT,
  highlightStyle: "marker",
  highlightInk: HERING.white,
  captionVariant: "clean",
  // Legenda no estilo da marca: faixa azul-marinho e texto em caixa mista.
  captionBackground: "rgba(47, 77, 120, 0.92)",
  captionUppercase: false,
  shadow: "10, 20, 40",
};
