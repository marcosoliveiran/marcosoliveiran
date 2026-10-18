# Regras do projeto

## Zonas mortas (Instagram Reels / TikTok) — sempre respeitar

Todos os vídeos são verticais 1080×1920. Instagram e TikTok cobrem parte da tela
com a própria interface, então rostos, textos, legendas e ilustrações importantes
ficam sempre dentro da área segura:

- topo: 250px livres
- base: 480px livres (nada importante abaixo de y = 1440)
- esquerda: 60px livres
- direita: 140px livres (botões de curtir/comentar). O centro útil fica em x = 500, não 540.

Só fundos e elementos decorativos podem invadir essas zonas.

**Legenda da fala sempre o mais baixo possível:** a base da legenda fica em
y = 1440 (limite da área segura), para nunca cobrir o rosto. Com rosto na tela,
o queixo fica acima do topo de uma legenda de duas linhas (~y 1270), então a
legenda tem no máximo duas linhas nessas cenas. Constante `CAPTION_BOTTOM` em
`src/kit.tsx`.
As constantes ficam em `SAFE` no começo de `src/UGCVideo.tsx`. Valores aproximados:
as interfaces das plataformas mudam, então confira em vídeos novos.

Ao criar uma composição nova, use essas constantes e confira um frame com a área
segura marcada antes de entregar.

## Cada marca tem a sua identidade — nunca um layout único

O perfil pessoal **@marcosoliveiran** e as marcas atendidas (Innova etc.) se
comunicam de formas diferentes. Não reaproveitar o visual de um para o outro.

- `src/kit.tsx` é só o motor (zonas mortas, legenda animada, cenas, efeitos
  sonoros). Cores, fontes, fundo, estilo de legenda, tipo de ilustração e
  formato (com ou sem apresentador) são definidos por vídeo/marca no `Theme`
  e nas cenas.
- **@marcosoliveiran (perfil pessoal):** estética de colagem animada, com o
  Marcos em tela dividida ou recortado sobre imagens. A identidade da **voom**
  prevalece em cores, fontes e guia de design como um todo (o logo não é
  relevante por enquanto): lima `#C6FF1A`, preto `#101010`, off-white
  `#F4F4EE`, cinza `#8B8B8B`; Fredoka Bold nos títulos, Nunito nos textos e
  legendas; lima nunca com texto branco; lima = o mais importante da peça.
  Tema em `src/themes/voom.ts` (fontes locais em `public/fonts`), modelo em
  `src/VoomBase.tsx` e opções de legenda em `src/VoomCaptionOptions.tsx`.
  A voom terá perfil próprio no futuro e absorverá essa identidade.
- **Marcas (clientes):** seguem a identidade do próprio site/marca (cores,
  fonte, logo), só com narração quando pedido, sem o rosto do Marcos.
  Innova: roxo `#1a0a3c`, laranja `#ff6b00`, fonte Inter, logo em
  `public/innova-logo.png`.
- Ao começar um vídeo novo, confirmar para qual perfil/marca ele é e olhar a
  identidade daquele perfil/marca antes de desenhar.

## Estilos de legenda do perfil pessoal (voom)

Três estilos, escolhidos por cena com `captionStyle` em `SceneConfig`
(`src/kit.tsx`). Opções para comparar: composição `Voom-Legendas`.

- **A · Marcador** (`"default"`, padrão): explicação, narração corrida e a
  maioria das cenas. Palavra-chave num bloco lima com texto preto.
- **D · Cartão lima** (`"card"`): frase de impacto, gancho, oferta e CTA. É o
  que mais usa o lima, então usar com parcimônia (lima ~20% do uso).
- **E · Minimalista** (`"minimal"`): momentos reflexivos, falas mais sérias ou
  mais longas, quando a imagem precisa respirar. Fica à esquerda, longe dos
  botões da direita.

Evitar trocar de estilo a cada cena: no máximo um estilo de destaque (D) por
vídeo, e o resto em A ou E.

## Quando e como fazer ilustração e motion (perfil pessoal)

Decisões do Marcos:

- **Motion limpo, normalmente.** O rosto domina; a ilustração entra quando
  acrescenta algo que a fala sozinha não mostra. Sem repetir a frase na tela e
  sem empilhar efeitos. Cenas emocionais ou pessoais ficam só com o rosto.
- **Sempre propor o mapa antes de montar.** A partir do roteiro ou da
  transcrição, listar por trecho: o que entra, em que modo (dividida ou tela
  cheia) e qual animação. Só montar depois da aprovação.
- **Estilo visual:** mais imagens recortadas (colagem). Para dados e números,
  gráficos e tipografia em lima e preto (identidade voom).

Quando entra ilustração: número/dado/comparação, lista ou passos, conceito
abstrato, prova ou exemplo visual, e quebra de atenção a cada ~4–6s de só rosto.

Modos: **dividida** quando a imagem apoia e o Marcos segue falando; **tela
cheia** quando a imagem é o assunto (a voz continua por cima).

Limites: não gero fotos realistas nem desenhos complexos. Faço motion
tipográfico, números, listas, gráficos, ícones, formas e fluxos; imagens
recortadas vêm do Marcos (enviadas ou geradas em outra ferramenta).

## Vídeo "Creep" (perfil pessoal, com o Marcos falando)

Fluxo no PC do Marcos (a nuvem não recebe o vídeo, ele tem 529 MB, 4K):
`npm run transcrever` → `npm run silencios` → `npm run compactar` →
`npm run cortar -- bruto/IMG_3556.MOV` (cria `public/creep/fala.mp4`, cortado e
normalizado em -14 LUFS). Cortes aprovados em `docs/creep-cortes.json` e
`docs/creep-decisoes.md`. Composição `Creep` em `src/creep/` (`CreepVideo.tsx`,
`motions.tsx`, `captions.ts`, `timing.ts`). Os motions são ligados a palavras
da fala por `wordAt` em `timing.ts`; `src/creep/fala-info.json` é gerado por
`tools/cortar.mjs` e tem que ser refeito se `docs/creep-cortes.json` mudar.
Imagens em `public/creep/` (lista em `public/creep/LEIA-ME.md`); sem elas
aparece um quadro de reserva. Vermelho só para o que é negativo (carimbo
ODEIAM, X, riscos, REC, coração partido); o resto é lima, preto e off-white.

No vídeo "Creep" a legenda da fala só aparece no começo (as 3 primeiras frases,
o gancho e a abertura) e em tamanho reduzido (72%), a pedido do Marcos. Ajuste em
`CAPTION_UNTIL_SENTENCE` e `CAPTION_SIZE` (`src/creep/CreepVideo.tsx`); o
componente `Caption` do `src/kit.tsx` aceita `size`.
