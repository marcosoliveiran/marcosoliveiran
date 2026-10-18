import { Theme } from "../kit";
import { loadLocalFont } from "./fonts";

// voom — "Direção 1: Energia" (ousada, rápida, performance).
// Identity guide:
//   Lima #C6FF1A    destaque, CTA, perfil        ~20% do uso
//   Preto #101010   base, textos, fundos          ~50%
//   Off-white #F4F4EE respiro, fundo claro        ~25%
//   Cinza #8B8B8B   apoio, legendas               ~5%
//   Fredoka Bold: logo e títulos / Nunito: textos corridos, legendas
// Rules: lima nunca com texto branco; lima = o que é mais importante na peça.
// The logo is not used for now.

export const VOOM = {
  lime: "#C6FF1A",
  black: "#101010",
  offWhite: "#F4F4EE",
  gray: "#8B8B8B",
} as const;

loadLocalFont("Fredoka", "fredoka-latin-700-normal.woff2", "700");
loadLocalFont("Nunito", "nunito-latin-700-normal.woff2", "700");
loadLocalFont("Nunito", "nunito-latin-800-normal.woff2", "800");
loadLocalFont("Nunito", "nunito-latin-900-normal.woff2", "900");

export const VOOM_TITLE_FONT = "'Fredoka', 'Nunito', Arial, sans-serif";
export const VOOM_TEXT_FONT = "'Nunito', 'Segoe UI', Arial, sans-serif";

// Dark base: off-white captions, key words as a lime marker with black text.
export const VOOM_THEME: Theme = {
  ink: VOOM.offWhite,
  accent: VOOM.lime,
  paper: VOOM.black,
  panel: "transparent",
  panelInk: VOOM.offWhite,
  panelOutline: VOOM.black,
  font: VOOM_TEXT_FONT,
  serif: VOOM_TITLE_FONT,
  highlightStyle: "marker",
  highlightInk: VOOM.black,
  shadow: "0, 0, 0",
};
