# ARMADA — Military Personnel System

Ficha de personagem de RPG disfarçada de sistema militar confidencial.
O jogador não abre uma ficha de D&D: ele acessa o dossiê do **General Armada**.

## Rodando

```bash
npm install
cp .env.example .env.local   # defina a senha de acesso
npm run dev
```

Abre em <http://localhost:3000>.

## Credenciais

Ficam só em variável de ambiente — nada no cliente.

| Variável              | Padrão   | O que é                          |
| --------------------- | -------- | -------------------------------- |
| `ARMADA_ACCESS_USER`  | `armada` | usuário aceito (case-insensitive) |
| `ARMADA_ACCESS_CODE`  | —        | senha; sem ela o sistema recusa tudo |

O `POST /api/auth` compara em tempo constante, espera 450 ms fixos e, em caso
de acerto, grava um cookie `httpOnly` derivado do segredo (12 h). Trocar
`ARMADA_ACCESS_CODE` invalida todas as sessões abertas.

Fluxo: `/` → `/authenticating` (sequência, pulável com qualquer tecla ou
clique) → `/dossier`. As duas últimas exigem o cookie; sem ele voltam para `/`.

## Telas

Fora do sistema: **login** ✅ e **sequência de autenticação** ✅.

Dentro do sistema, a ficha em papel fica fixa à esquerda e o painel da direita
muda por seção — paginadas 01–05 no rodapé:

| # | Seção | Painéis |
| - | ----- | ------- |
| 01 | Dossier | Skills ✅ |
| 02 | War tactics | Slots ✅ · Tactics ✅ |
| 03 | Footlocker | Inventário ✅ |
| 04 | Service record | História ✅ |
| 05 | War Chronicles | Capítulos ✅ |

O resumo de combate (AC, HP, velocidade, inspiração, exaustão) fica na própria
ficha em papel, então Combat Status não é uma seção separada.

## A ficha

Todo valor do dossiê é editável: clique nele, edite, `Enter` confirma e `Esc`
descarta. As estrelas ao lado de cada perícia alternam
sem proficiência → proficiente → especialista.

O modificador de atributo pode ser digitado direto, para cobrir buff, item ou
regra de mesa. Mexer no **score** reescreve o modificador com o valor derivado,
então a sobrescrita é sempre deliberada.

O modificador de perícia continua calculado (atributo + bônus de proficiência
do nível) e acompanha qualquer mudança nos dois.

### Onde a ficha é gravada

Em desenvolvimento, em `data/character.json` — dá para abrir, versionar e editar
à mão. Apagar o arquivo restaura a ficha inicial.

Em produção não dá para usar arquivo: o disco de uma função serverless é
somente-leitura. Defina `KV_REST_API_URL` e `KV_REST_API_TOKEN` e a ficha passa
a viver num Redis. Na Vercel isso é *Storage → Create Database → Upstash for
Redis*, que injeta as duas variáveis sozinha; depois é só fazer redeploy.

A troca é automática: com as variáveis, Redis; sem elas, arquivo. Na primeira
leitura o Redis é semeado com o `data/character.json` do deploy, então a ficha
que está no repo é a que aparece — nada se perde na migração.

Nos dois casos a gravação é automática, ~700 ms depois da última edição.

## War Tactics

Slots no modelo de conjurador: usar uma tática de nível N gasta uma estrela
daquele nível. Clique numa estrela cheia para gastar, numa vazia para recuperar.
**LONG REST** devolve tudo.

**Cada linha até o seu nível tem os próprios slots.** No nível 4 valem as linhas
1 a 4 somadas — 18 slots. As linhas acima ficam trancadas e não entram na conta;
destravam conforme você sobe.

A tabela é a do programa Armada (L6 já abre 4º nível), não a do conjurador pleno
do 5e, e vai até o nível 15.

Abaixo dela, em painel de largura inteira, ficam as **táticas** — One Man Army,
Air Support e Tactical Command, com fala, descrição, balance rule, as ordens do
Tactical Command e as tropas que One Man Army invoca. Tudo editável, e dá para
adicionar e remover táticas, ordens e tropas.

As táticas ficam em dois grupos. **Basic** não gasta slot nem escala — hoje só
One Man Army, que substitui a ação de Attack e por isso nem tem botão USE.
**War Tactics** gasta um slot e pode ser usada em nível mais alto, com o ganho
descrito no campo Potência. Clicar no rótulo `AT WILL` / `SLOT` do card troca
o grupo. As tropas dela mostram em que nível de ARMADA são liberadas,
e as que você ainda não alcançou aparecem `LOCKED`.

Cada tática é marcada como `AT WILL` ou `SLOT`, e o rótulo alterna com um
clique. Summon Soldier é `AT WILL` — ele entrega o ataque básico e não gasta
nada, então nem tem botão USE.

Nas de `SLOT`, o botão **USE** abre um diálogo perguntando em qual nível ela
vai ser usada — 1º, 2º, e assim por diante, como conjurar em nível mais alto.
Escolhido o nível, gasta-se um slot dele, tirado da linha liberada mais baixa.

Os níveis que você ainda não alcançou aparecem no diálogo trancados, com o
nível de personagem que os libera. **LONG REST** devolve todos os slots.

## Service Record

É outra página do mesmo documento em papel: retrato, assinatura e, da assinatura
para baixo, a história escrita na folha. Sem bloco de identidade, atributos ou
proficiências — isso é a página 1.

Cada parágrafo se edita sozinho — clique nele. Apagar todo o texto de um parágrafo o remove, e o
`+ parágrafo` que aparece ao passar o mouse insere um novo logo abaixo.

A folha tem 760px e a coluna de texto 576px — prosa esticada é cansativa de ler,
e o resto vira margem, como numa página de verdade.

## Footlocker

O inventário. Fundos em gold, silver e copper, e os itens com quantidade, notas
e um marcador `CARRIED` / `STOWED` para separar o que está em uso do que está
guardado. O contador do cabeçalho mostra quantos itens estão sendo carregados.

## Som

A interface tem som: um tick nos cliques, um tom descendente ao gastar um star
slot e ascendente ao recuperar, um acorde na long rest, e confirmação ou recusa
no login. Tudo sintetizado na hora, sem arquivo de áudio.

O Footlocker soa a metal: abrir a seção ou adicionar um item soa como remexer
no baú, e mexer numa peça dá uma batida só. Nunca sai igual duas vezes.

O alto-falante na barra superior liga e desliga, e a escolha fica guardada no
navegador.

## War Chronicles

A campanha contada em capítulos. Cada um tem título, uma chamada de duas linhas
e o texto em si, que abre no card. Capítulo trancado mostra cadeado no lugar do
OPEN e não abre — o `LOCK` / `UNLOCK` no cabeçalho alterna.

Começa com um capítulo; `+ ADD CHAPTER` acrescenta os próximos, já trancados.

Ao abrir, o capítulo é datilografado na tela, a cerca de 220 caracteres por
segundo — à frente de quem lê, sem virar espera. **PULAR A DATILOGRAFIA**
mostra tudo de uma vez, e só então o texto fica editável.

Dentro do capítulo, um parágrafo que começa com `## ` vira subtítulo e um `---`
sozinho vira quebra de cena.
