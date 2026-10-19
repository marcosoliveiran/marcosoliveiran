# Kimi Antonelli — direção (perfil @marcosoliveiran)

Formato do Creep: o Marcos de frente para a câmera embaixo, motions em cima
(painel transparente, sem "blocão"). **Sem legenda da fala**: só palavras-chave
junto com os motions. Efeitos sonoros incluídos; trilha fica para o CapCut.
O frame 0 é a capa: a frase "Você já ouviu falar de Kimi Antonelli?" já está
inteira na tela (sem animação de entrada).

Composição `Kimi` em `src/kimi/` (`KimiVideo.tsx`, `motions.tsx`, `timing.ts`).
Tempos ligados a palavras da fala, na ordem em que são ditas (`timing.ts`);
`src/kimi/fala-info.json` é estimativa até rodar `npm run kimi:info` com a
transcrição real.

## Texto aprovado

1. Você já ouviu falar de Kimi Antonelli? O italiano que pode se tornar o
   campeão mais jovem da história da Fórmula 1, aos 20 anos.
2. Sabe aquela história de quando uma Suprema surge, a anterior vai ficando
   cada vez mais fraca?
3. Kimi entrou na Mercedes aos 18 anos, no lugar do Lewis Hamilton, que depois
   de 7 títulos mundiais foi para a Ferrari. A mesma Ferrari em que Michael
   Schumacher ganhou 5 dos 7 títulos mundiais dele.
4. Quem acompanhou a temporada 2026 viu nascer um astro da Fórmula 1. Foi como
   ver a Taylor Swift ganhar o primeiro Álbum do Ano, dos quatro dela, com
   Fearless, lá em 2010, aos 20 anos. Igualzinho ao Kimi.
5. Com mais de 100 pontos de vantagem, o título pode vir no GP de Austin,
   improvável mas matematicamente possível. A aposta é que o título venha na
   Cidade do México ou até mesmo no GP de São Paulo. E será o primeiro título de
   um italiano na Fórmula 1 desde Alberto Ascari, em 1953, 70 e poucos anos
   depois.
6. Mas e aí, pra quem vai a sua torcida? Conta aqui nos comentários, e me segue
   pra acompanhar a reta final dessa temporada da Fórmula 1.

## Motions (resumo; o mapa completo está na página publicada)

1. Capa com o nome; "20 ANOS" em contador; palavra-chave CAMPEÃO MAIS JOVEM.
2. AHS Coven, carimbo SUPREMA, barras de poder (anterior cai, nova sobe).
3. Mercedes + 18 anos; Hamilton + 7 títulos; seta Hamilton → Ferrari;
   Schumacher + sete bolinhas (5 lima, 2 cinza). Palavras-chave SUBSTITUTO,
   7 TÍTULOS, 5 DOS 7.
4. Taylor; troféu que vira quatro; FEARLESS · 2010; 20 ANOS e Kimi ao lado dela.
5. +100 PONTOS DE VANTAGEM; chips AUSTIN (improvável, mas possível), CIDADE DO
   MÉXICO (aposta), SÃO PAULO (até mesmo); Ascari + 1953 → 2026 + 73 anos.
6. Kimi VS cabeças que rodam (Russell, Hamilton, Verstappen); PRA QUEM VAI?;
   SEGUE.

## Conferido

- Antonelli: Mercedes em 2025, aos 18, no lugar do Hamilton (que foi para a
  Ferrari). Hamilton: 7 títulos. Schumacher: 7, 5 deles pela Ferrari.
- Taylor Swift: 4 Álbuns do Ano; o primeiro, Fearless, no Grammy de janeiro de
  2010, aos 20 anos.
- Último campeão italiano: Alberto Ascari, 1953 (73 anos).
- Pontos e datas das corridas valem para quem posta antes de Austin; reconferir
  no dia. Austin só fecha o título se o Kimi vencer e o Russell não pontuar.

## Gravação (transcrição em `transcricao/kimibruto.txt`)

- O bloco da Taylor Swift foi cortado pelo Marcos (saíram o troféu do Grammy,
  "Fearless · 2010" e o "20 anos" ao lado do Kimi). A frase "Quem está
  acompanhando a temporada de 2026 da F1 está vendo o surgimento de um astro"
  ficou, só com o rosto.
- "70 e poucos anos depois" não foi dito: o contador de 73 anos virou um
  número fixo que aparece junto com "1953 → 2026".
- Vídeo de 59,67 s, mas o final tem a tela do CapCut (a partir de 57,67 s): a composição termina em 57,6 s e não mostra essa tela. Tempos reais em `src/kimi/fala-info.json`
  (`npm run kimi:info -- transcricao/kimibruto.json --duracao=57.6`).
- Enquadramento conferido com o vídeo leve: o rosto fica na mesma posição do
  Creep (`FACE` em `KimiVideo.tsx`) e os motions de cima não o cobrem. Nos
  primeiros ~2 s ele está mais longe da câmera e à esquerda; é o frame da capa.

## Enquadramentos e efeitos sonoros (cortes por assunto)

- 13 planos em ~57 s, cortes secos com zoom lento de 4% em cada um (`SHOTS` em
  `src/kimi/KimiVideo.tsx`): aberto 120% (o mais distante, limite do próprio
  vídeo), médio 140% e fechado 160 a 175% (rosto um pouco mais baixo, para a
  testa não encostar nas palavras-chave). Mapa: capa aberto; "O italiano" médio;
  Suprema fechado; Mercedes aberto; Hamilton médio; Schumacher fechado; "Quem
  está acompanhando" fechado (só o rosto); "100 pontos" aberto; Austin médio;
  México fechado; Ascari médio; "Mas e aí" aberto; "Conta para mim" fechado.
- Sons novos (`tools/make-sfx-kimi.py`): `k-corte` em todo corte, `k-zoom` nos
  cortes para plano mais fechado, `k-card` nos cartões de foto e nas trocas de
  rival do CTA, `k-dot` nas bolinhas do "5 dos 7" (tom sobe a cada uma).
- Fala a 85% de volume (já vinha a -0,2 dB) para os efeitos não estourarem.
