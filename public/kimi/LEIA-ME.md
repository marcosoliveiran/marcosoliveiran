# Pasta de imagens do vídeo do Kimi

Coloque aqui os arquivos abaixo, com exatamente estes nomes (a extensão pode ser `.png`, `.jpg`, `.jpeg` ou `.webp`; só `.png` e `.webp` têm fundo transparente). Se algum faltar, o
vídeo mostra um quadro de reserva com o nome do arquivo, então dá para ir
montando aos poucos. Recortes em PNG com fundo transparente, rosto nítido,
de preferência com até 1200 px de altura. Use imagens que você tenha direito
de usar.

| Arquivo | O que é |
|---|---|
| `fala.mp4` | O vídeo do Marcos, já editado no CapCut e sem legenda (não vai para o Git) |
| `kimi.png` | Kimi Antonelli (também vira a capa) |
| `hamilton.png` | Lewis Hamilton (aparece no bloco 3 e no CTA) |
| `schumacher.png` | Michael Schumacher |
| `taylor.png` | Taylor Swift |
| `ascari.png` | Alberto Ascari |
| `russell.png` | George Russell (CTA) |
| `verstappen.png` | Max Verstappen (CTA) |
| `ahs-coven.png` | Cena de American Horror Story: Coven (Suprema) |
| `trofeu.png` | Troféu do Grammy (sem ele aparece uma taça de reserva) |

Depois de pôr `fala.mp4` aqui:
1. `npm run transcrever -- "caminho/do/video.mp4"` (gera `transcricao/*.json`)
2. `npm run kimi:info -- transcricao/NOME.json` (tempos reais da fala)
3. `HAS_VIDEO = true` em `src/kimi/timing.ts`
4. `npm run previa:kimi` ou `npm run render:kimi`
