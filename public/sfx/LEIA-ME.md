# Efeitos sonoros

Todos os sons foram gerados do zero (ondas e ruído sintetizados), então não têm
direitos autorais: pode usar em qualquer vídeo, inclusive de cliente.
Formato: WAV, mono, 44,1 kHz. Funcionam em CapCut, Premiere, DaVinci etc.

| Arquivo | Som | Para que serve |
|---|---|---|
| `whoosh.wav` | passagem de ar (0,75s) | transição entre cenas |
| `impact.wav` | batida grave (0,95s) | entrada de logo ou título |
| `sparkle.wav` | brilhos agudos (1s) | revelar marca, estrelas, destaque |
| `riser.wav` | subida de tensão (1,5s) | contador crescendo (ex.: 0 a 1000) |
| `pop.wav` | estalo curto (0,22s) | elemento aparecendo na tela |
| `ding.wav` | sino (1,3s) | resultado, nota, "deu certo" |
| `notification.wav` | duas notas (0,6s) | botão, mensagem, chamada para ação |
| `tick.wav` | clique seco (0,07s) | digitação, contagem |
| `click.wav` | clique de botão (0,1s) | toque na tela |
| `stamp.wav` | batida de carimbo (0,5s) | selo ou carimbo caindo |
| `gavel.wav` | duas batidas de martelo (0,8s) | decisão, tribunal |
| `bounce.wav` | objeto quicando (1,1s) | humor, coco ou bola |
| `fuse.wav` | pavio aceso (1,3s) | tensão, bomba |
| `rec.wav` | bipe de gravação (0,2s) | botão REC |

## No vídeo da Innova (Innova-Reels)

Os efeitos já estão posicionados no código (`src/InnovaVideo.tsx`, campo `sfx`
de cada cena) e entram na exportação. Se preferir mixar na sua edição, remova
os campos `sfx` e use os arquivos desta pasta.

| Momento | Efeito |
|---|---|
| 0,1s — logo entra | `impact` |
| 0,9s — brilho no logo | `sparkle` |
| 3,2s — troca de cena | `whoosh` |
| 3,4s — contador de Mega sobe | `riser` |
| 5,25s — chip Wi-Fi 6 aparece | `pop` |
| 7,0s — troca de cena | `whoosh` + `sparkle` |
| 8,2s — nota 4,7 completa | `ding` |
| 8,65s e 9,05s — cartões de avaliação | `pop` |
| 10,5s — troca de cena | `whoosh` |
| 10,65s e 11,05s — logo e "Assine já" | `pop` |
| 11,5s — botão "Fale com vendas" | `notification` |

Os tempos acompanham as animações, não a narração. Quando a voz estiver
gravada, ajuste os tempos das cenas.
