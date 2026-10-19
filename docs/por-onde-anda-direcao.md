# Por Onde Anda? — direção do quadro e do Episódio 1 (JoJo)

Quadro do perfil @marcosoliveiran: o Marcos conta o que aconteceu com artistas
que estouraram e saíram do radar. Formato do vídeo do Kimi (Marcos de frente
para a câmera embaixo, motions em cima, sem legenda da fala, só palavras-chave,
efeitos sonoros `k-*` + os de `public/sfx`, trilha no CapCut). Identidade voom.

## Layout fixo do quadro (decidido com o Marcos)

- **Cartaz de "procurado(a)"**: título **POR ONDE ANDA?** bem grande (preto;
  "ANDA?" sobre bloco lima), foto em preto e branco numa moldura preta com a
  palavra PROCURADA/PROCURADO e fitas lima, e a faixa de escudo
  **Episódio N: Nome** (preta, borda lima tracejada). Sem a linha "vista pela
  última vez" e sem papel branco.
- **Fundo: TV antiga** (escuro, linhas de varredura, faixa lima rolando,
  "● REC / ▶ PLAY 2006") **com os rabiscos dos anos 2000** (CD, cassete, notas,
  fone, celular de flip, estrelas) em traço preto com brilho lima.
  Componentes: `src/poronde/Capa.tsx` (`Capa`, `CapaConteudo`) e
  `src/poronde/Parede.tsx` (`CapaParede`, fundos `lima`, `halftone`, `tv`; o
  padrão é `tv`). Prévia: `npx remotion still PorOndeAnda-Parede out/capa.png`.
- Os rabiscos mudam conforme a época do artista (ex.: VHS e disquete para os
  anos 90).
- Zonas seguras sempre: nada importante acima de y = 250, abaixo de y = 1440,
  à esquerda de x = 60 ou à direita de x = 940.

## Como o vídeo se desenrola

1. **Gancho com o rosto** (~10 s): "Ela sumiu da mídia, mas não da música, e o
   motivo, a briga com a antiga gravadora, é uma boa história." Palavras-chave
   SUMIU DA MÍDIA / MAS NÃO DA MÚSICA / BRIGA COM A GRAVADORA.
2. **Cartaz animado em tela cheia** em "Por onde anda JoJo? A voz por trás de
   Too Little Too Late, sucesso dos anos 2000": o fundo de TV entra, o título
   bate na tela, a foto aparece com as fitas, a faixa se abre; adesivo ANOS 2000.
3. Em "A história começa quando...", o cartaz **encolhe para a esquerda** e vira
   o painel fixo; os motions entram na coluna da direita (12 anos, #12 → #3,
   13 anos, 7 anos, 2004 → 2016, capas removidas, 2018, 2021, 2 álbuns + 1 EP +
   2 turnês, 20 anos).
4. Em "E atualmente?", o cartaz volta em tela cheia por ~2 s e o carimbo lima
   **ENCONTRADA** bate com a foto atual em polaroid; depois encolhe de novo.
5. CTA: o painel vira um cartaz novo com "?" no lugar da foto; palavra-chave
   SEGUE. A capa do post é uma imagem separada (render do cartaz).
6. 13 planos de câmera (aberto 120%, médio 140%, fechado 160 a 175%, corte seco
   + zoom lento de 4%), como no Kimi; sons de corte `k-corte`/`k-zoom`, cartões
   `k-card`, bolinhas `k-dot`; falta criar um som de "papel batendo" para o
   cartaz.

## Texto aprovado (Episódio 1)

1. Ela sumiu da mídia, mas não da música, e o motivo, a briga com a antiga
   gravadora, é uma boa história. Por onde anda JoJo? A voz por trás de *Too
   Little Too Late*, sucesso dos anos 2000.
2. A história começa quando, aos 12 anos, JoJo e a mãe assinam com a Blackground,
   em 2004. O primeiro single, *Leave (Get Out)*, chegou ao 12º lugar da Hot 100,
   e aos 13 anos ela se tornou a artista solo mais jovem a liderar a parada
   Mainstream Top 40. Mas foi com *Too Little Too Late*, do álbum *The High
   Road*, em 2006, que ela chegou ao top 3 da Hot 100.
3. Então veio o sumiço. JoJo processou a gravadora, alegando que uma lei de Nova
   York impedia menores de assinarem contratos com mais de 7 anos. Quando quis
   sair, ficou presa em uma batalha judicial que durou anos, e só lançou o
   terceiro álbum, *Mad Love*, em 2016, já pela Atlantic.
4. A Blackground ainda tirou os dois primeiros álbuns das plataformas, incluindo
   *Too Little Too Late*, o que levou JoJo a regravar os dois em 2018. Em 2021, as
   versões originais voltaram.
5. E atualmente? Desde *Good to Know*, em 2020, JoJo lançou mais dois álbuns e um
   EP, e saiu em turnê em 2022 e 2025. Em 2026, *The High Road* faz 20 anos, e a
   pergunta fica: você lembrava dela?
6. Mas e aí, quem você quer ver no próximo Por Onde Anda? Me conta aqui nos
   comentários e me segue pra não perder nenhum vídeo.

Página de gravação (privada): https://claude.ai/artifact/WcRDytTcJuYUoZdJddpPh8

## Fatos conferidos (pesquisa na web)

- Assinatura com a Blackground em 2004, aos 12 anos (fontes secundárias).
- "Leave (Get Out)": 12º na Hot 100, ouro; aos 13 anos, a artista solo mais
  jovem a liderar a Mainstream Top 40 (a recorde é dessa parada, não da Hot 100).
- "Too Little Too Late" (2006, *The High Road*): 3º na Hot 100; pulou do 66º ao
  3º em uma semana (recorde na época). O total de semanas no top 10 não foi
  confirmado, por isso não entra.
- Processo de 2013 (argumento: lei de NY, contratos de menores até 7 anos);
  libertada em 2014; Atlantic; *Mad Love* em 2016.
- Depois que ela saiu, a Blackground tirou os dois primeiros álbuns do
  streaming; regravados no fim de 2018; originais de volta em setembro de 2021.
- Desde *Good to Know* (maio de 2020): *December Baby* (2020), *Trying Not to
  Think About It* (outubro de 2021, alguns o chamam de EP), EP *NGL* (24/01/2025),
  turnês em 2022 e 2025.
- Não confirmado (não usar): hino no US Open de 2026; data exata do aniversário
  de *The High Road* (nos EUA, outubro de 2006: conferir).

## Imagens necessárias (`public/jojo/` ou `public/poronde/`)

`jojo-2000s`, `jojo-hoje`, `capa-the-high-road`, `capa-jojo-2004` e,
opcional, `capa-mad-love`. JPG serve (o cartaz usa preto e branco). Cuidado com
direitos; sem logotipos de gravadora nem de plataforma.

## Pendente

- O Marcos grava/edita o episódio (CapCut, sem legenda) e roda
  `npm run transcrever`; depois `npm run kimi:info`-like para a JoJo (criar o
  equivalente em `src/jojo/`, reaproveitando `src/kimi/timing.ts` como modelo).
- Criar a composição do episódio (gancho com rosto, cartaz animado, painel fixo,
  motions, ENCONTRADA, CTA, planos de câmera e sons) e o som de "papel batendo".
- Exportar a capa do post como imagem separada.
- Conferir 16 quadros antes do render (como no Kimi) e o render no PC dele.
