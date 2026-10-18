import { continueRender, delayRender, staticFile } from "remotion";

// Loads a font file from public/fonts and makes Remotion wait for it, so
// Studio and renders never draw a frame with a fallback font.
export const loadLocalFont = (
  family: string,
  file: string,
  weight: string,
): void => {
  const handle = delayRender(`Loading font ${family} ${weight}`);
  const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, {
    weight,
    style: "normal",
  });

  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      continueRender(handle);
    })
    .catch((error) => {
      console.error(`Could not load font ${family} ${weight}`, error);
      continueRender(handle);
    });
};
