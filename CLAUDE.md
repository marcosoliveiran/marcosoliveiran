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
