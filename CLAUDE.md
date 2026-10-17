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
