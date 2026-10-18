import { Theme } from "../kit";
import { loadLocalFont } from "./fonts";
import { VOOM_TEXT_FONT, VOOM_TITLE_FONT } from "./voom";

// Script retrô da cartela de abertura (sitcom), só nesta publi.
loadLocalFont("Lobster", "lobster-latin-400-normal.woff2", "400");
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
  font: VOOM_TEXT_FONT,
  serif: VOOM_TITLE_FONT,
  highlightStyle: "marker",
  highlightInk: HERING.white,
  captionVariant: "clean",
  shadow: "10, 20, 40",
};
