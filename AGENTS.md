<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ARMADA — convenções do projeto

Ficha de personagem de RPG apresentada como um sistema militar confidencial.
A UI é **em inglês militar** (é parte da ficção); comentários e docs em português.

## Estrutura

- `src/app/page.tsx` — tela 01, LOGIN / CLASSIFIED ACCESS
- `src/app/authenticating/` — tela 02, sequência de autenticação
- `src/app/(system)/` — as cinco seções; o layout do grupo guarda a credencial,
  carrega a ficha e monta `AppShell`
- `PaperSurface` + `PortraitBlock` são compartilhados: o dossiê (página 1) e o
  service record (página 4) são duas páginas do **mesmo documento**. Service
  record não usa `SectionLayout` — ela é a folha inteira, sem painel ao lado.
- `src/components/shell/sections.tsx` — a lista de seções é a fonte única da
  navegação lateral, das setas e da paginação de rodapé
- A ficha em papel aparece só onde ela é o assunto: no Dossier (via
  `SectionLayout`) e no Service Record, que é outra página do mesmo documento.
  War Tactics, Footlocker e os stubs usam a largura inteira — encostar a ficha
  em toda seção só empurrava o conteúdo para baixo.
- `SectionLayout` monta a grade do Dossier: ficha à esquerda, painel à direita
  e um `below` opcional em largura inteira. No celular empilha na ordem de
  leitura: ficha primeiro, painéis abaixo.
- `src/app/dossier/` — tela 03 em diante (placeholder por enquanto)
- `src/app/api/auth/` — valida credencial e emite o cookie de sessão
- `src/lib/session.ts` — único lugar que lê `ARMADA_ACCESS_*` e o cookie
- `src/lib/character.ts` — modelo da ficha, valores derivados e saneamento (puro)
- `serviceRecord` é um registro só (`{ title, paragraphs }`), com a narrativa em
  `paragraphs: string[]` e não num texto único: cada parágrafo é editável por si.
  Salvar um parágrafo vazio o remove. `sanitize` aceita o formato antigo (lista
  de seções) pegando a primeira.
- `src/lib/character-store.ts` — o único módulo que sabe onde a ficha é gravada:
  Redis quando há credencial (hospedagem serverless tem disco somente-leitura),
  arquivo no resto. Na primeira leitura com o Redis vazio ele semeia com o
  `data/character.json` que veio no deploy, senão o primeiro acesso mostraria a
  ficha inicial no lugar da sua.
- `outputFileTracingIncludes` no `next.config.ts` existe por causa dessa
  semente: o caminho do arquivo é montado em runtime, então o tracing do Next
  não o enxerga sozinho e ele não iria no bundle.
- `src/components/` — componentes de tela; `insignia.tsx` guarda os SVGs auxiliares
- `public/armada-emblem.png` — emblema oficial do programa; `src/app/icon.png` é
  o mesmo arquivo reduzido (favicon pela convenção de arquivo do App Router)

## Design

- O emblema é o único asset binário. Todo o resto — papel, grão, scanlines,
  desgaste de carimbo — é gradiente + `feTurbulence` em data URI
  (`@utility` no `globals.css`).
- O emblema tem dois tratamentos: colorido nas telas escuras (é um monitor) e
  `grayscale + mix-blend-multiply` sobre o papel (é tinta impressa, não adesivo).
- Tokens de cor/fonte ficam no bloco `@theme` do `globals.css` — use as
  utilities (`text-bone`, `border-line`, `bg-paper-200`) em vez de hex solto.
- `distress` = erosão de tinta em carimbos. `stone-text` = textura dentro do glifo.
- Tipografia: Oswald (display), Special Elite (datilografado), Geist Mono (terminal).
- Tamanhos dentro do dossiê usam `cqw` e os breakpoints internos são
  **container queries** (`@xl:`, `@3xl:`), não `sm:`/`lg:`. A folha é uma coluna
  de largura variável: quem manda no layout dela é a própria largura, não a
  da janela. Usar breakpoint de viewport ali quebra os campos de identidade.
- Animação de tela cheia (tela 02): a linha do tempo é derivada de um único
  `elapsed` via rAF, então "pular" é só saltar o relógio para o fim.

## Roadmap das telas

Login ✅ · Authentication sequence ✅ · Dossier ✅ · War tactics ✅ ·
Footlocker ✅ · Service record ✅

Combat status não é seção própria: o resumo de combate vive na ficha em papel
e os slots foram para War Tactics. Personnel virou **Footlocker**, o inventário
— as tropas invocadas já vivem em `tactics[].units`. Dentro do sistema são
4 seções, paginadas 01–04 no rodapé. `AppShell` mantém a
ficha em papel fixa à esquerda em todas elas; só o painel da direita muda.
As seções não construídas usam `SectionStub`, então a navegação nunca dá 404.

## Toque

Controles crescem só sob `@media (pointer: coarse)` — no desktop a densidade de
documento continua. Ao aumentar um alvo, **aumente também o que está dentro**:
a estrela de slot ficou 30px de alvo com 18px de glifo (`@utility slot-star`).
Alvo grande com ícone pequeno vira um vão maior que o próprio ícone.

## Ficha editável

- O modificador de atributo é guardado (`{ score, modifier }`) porque precisa
  ser sobrescrevível à mão. Mexer no score reescreve o modificador com o valor
  derivado — o override é sempre o passo seguinte, explícito.
- O resto continua calculado em `character.ts` e nunca vai para o disco: bônus
  de proficiência (do nível) e modificador de perícia (atributo + proficiência).
- `sanitizeCharacter` aceita `abilities` no formato antigo (só o número) e
  migra para `{ score, modifier }` na leitura.
- `CharacterProvider` mantém o estado, aplica a mutação sobre uma cópia e
  salva sozinho 700 ms depois da última alteração (`PUT /api/character`).
  A barra superior mostra o estado do autosave.
- `EditText` / `EditNumber` herdam a tipografia do slot onde estão — por isso
  o valor não "pula" ao virar input. Um estado só (`draft: string | null`),
  sem espelhar o valor externo.
- `sanitizeCharacter` valida campo a campo na entrada e na saída: arquivo
  corrompido cai na ficha inicial em vez de derrubar a página.

## War Tactics

- A progressão de slots (`SLOTS_BY_LEVEL` em `character.ts`) é a tabela do
  programa Armada, **não** a de conjurador pleno do 5e — L6 já abre 4º nível.
  Vai até o nível 15; acima disso repete a última linha.
- Vale **só a linha do nível atual**: a página de Combat Status do documento
  oficial mostra 1★ 4/4 e 2★ 3/3 no nível 4, sete no total. `warTactics.spent`
  é uma lista de nove, um por nível de estrela.
- Só o gasto vai para o disco. O total vem sempre da tabela, então subir ou
  descer de nível reajusta os slots sem migração.
- `slotSpent` aceita a grade antiga somando as linhas dela, para não perder
  gasto já registrado.
- Níveis de estrela que o personagem ainda não alcançou aparecem com o nível
  exigido, sem estrela clicável.
- `spellSaveDC`, `attackRoll` e `baseDamageRoll` são derivados de nível +
  Wisdom, como o documento define. Nunca vão para o disco.
- `features` são as features de classe por nível (War Tactics, Designate
  Target, Military Authority, Catch a Ride, War Focused). One Man Army não está
  ali: ela já vive em `tactics` como a básica, e duplicar significaria manter a
  tabela de tropas em dois lugares.
- A seção tem **dois painéis separados**: `WarTacticsPanel` (a tabela de slots),
  ao lado da ficha, e `TacticsPanel` (as habilidades), em largura inteira abaixo
  dos dois. Nenhum dos dois mora na ficha em papel.
- Uma tática ou é `atWill` (habilidade básica, sem custo e sem botão USE) ou
  gasta slot. One Man Army é `atWill`: ela **substitui** a ação de Attack, então
  não é recurso à parte.
- `Tactic.units` são as tropas que a tática invoca. Servem para dois casos: as
  do One Man Army são liberadas por nível de classe (acima do nível do
  personagem ficam `LOCKED`), e a do RPG Soldier é uma ficha de criatura com
  `ac` e `hp`. `level: 0` significa "não depende de nível" e esconde a etiqueta.
- `ac` e `hp` são string, não número: no RPG Soldier são fórmulas
  ("8 + nível de ★"), não valores fixos.
- Quando a seção Personnel existir, é daqui que ela deve ler as tropas.
- `atWill` é o que separa os dois grupos do painel: **Basic** (não gasta slot,
  não escala) e **War Tactics** (gasta slot, pode escalar). Alternar o rótulo
  do card move ele de grupo na hora.
- Os grupos recolhem com `<details>` nativo: teclado, semântica e o toggle vêm
  de graça, sem estado em React. Abertos por padrão; a escolha não persiste
  entre navegações.
- `Tactic.scaling` é a "Potência": o que a tática ganha ao ser usada com um slot
  acima do custo base. Só aparece nas de slot — Potência numa habilidade que não
  gasta slot não quer dizer nada. Campo livre, porque cada uma escala diferente.
- Campo opcional vazio não aparece com rótulo: o card mostra só o que tem, e o
  `+ balance rule` no rodapé cria o primeiro conteúdo.
- Para as que gastam slot, o nível **não** é fixo: `USE` abre `UseTacticDialog`
  e o nível é escolhido ali — como conjurar em nível mais alto no D&D. Só então
  um slot é gasto, pela linha liberada mais baixa (`findAvailableSlotRow`).
- O diálogo lista os nove níveis sempre: os que o personagem ainda não alcançou
  aparecem trancados com o nível exigido, em vez de sumirem. Ver o teto faz
  parte da informação.
- É um `<dialog>` nativo (foco preso e Esc de graça). Ele precisa de `m-auto`:
  o preflight do Tailwind zera a margem que o centraliza.

## Som

- Sintetizado com Web Audio em `src/lib/sfx.ts` — nenhum arquivo de áudio, pelo
  mesmo motivo das texturas. Notas curtas e secas: som de interface que se
  repete não pode ter cauda.
- Um ouvinte de clique só, no documento, em vez de `onClick` em cada botão. O
  elemento escolhe o som por `data-sfx="spend|restore|confirm|deny|rest|none"`;
  sem o atributo, botão/link/summary tocam o tick padrão.
- `clank` e `rummage` não saem da tabela de notas: metal é inarmônico, então
  `metalHit` soma parciais em razões não inteiras por um bandpass. `rummage`
  encadeia de três a cinco batidas com tempo e altura sorteados — som repetido
  idêntico vira ruído, o sorteio é o que faz soar como remexer.
- Para som que não vem de clique (login negado, passos da sequência de
  autenticação), use o `play` do `useSfx`.
- A preferência mora no `localStorage` e é lida com `useSyncExternalStore`, não
  com estado espelhado num efeito.
- O navegador só libera áudio depois de um gesto do usuário; como todo som
  parte de um clique, o `AudioContext` é criado na primeira vez e resumido se
  estiver suspenso.
