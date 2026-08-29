/**
 * Modelo da ficha. Puro — sem I/O — para poder ser usado no servidor e no
 * cliente. Valores derivados (modificadores, bônus de proficiência) nunca são
 * guardados: são calculados a partir dos atributos e do nível.
 */

export const ABILITIES = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
] as const;

export type Ability = (typeof ABILITIES)[number];

export const ABILITY_LABEL: Record<Ability, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

export const ABILITY_SHORT: Record<Ability, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

/**
 * O modificador é guardado, não só derivado: dá para sobrescrever à mão
 * (buffs, itens, regras de mesa). Mexer no score ressincroniza o modificador.
 */
export type AbilityScore = { score: number; modifier: number };

export type Proficiency = "none" | "proficient" | "expertise";

export type Skill = {
  id: string;
  name: string;
  ability: Ability;
  proficiency: Proficiency;
};

/**
 * Slots de War Tactics — progressão de conjurador pleno do D&D 5e.
 * Índice 0 do array interno = tática de 1º nível.
 */
export const MAX_TACTIC_LEVEL = 9;
/** A tabela do programa Armada vai até o nível 15. */
export const MAX_CHARACTER_LEVEL = 15;

/** Linha por nível de personagem; coluna 0 = tática de 1º nível. */
const SLOTS_BY_LEVEL: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 3, 2, 0, 0, 0],
  [4, 3, 3, 3, 3, 3, 1, 0, 0],
  [4, 3, 3, 3, 3, 3, 2, 0, 0],
  [4, 3, 3, 3, 3, 3, 3, 1, 0],
  [4, 3, 3, 3, 3, 3, 3, 3, 1],
  [4, 3, 3, 3, 3, 3, 3, 3, 2],
];

/** A tabela inteira, para exibir como referência. */
export const SLOT_TABLE = SLOTS_BY_LEVEL.slice(1);

/** Quantos slots de cada nível o personagem tem. Acima de 15 usa a última linha. */
export function slotsAtLevel(level: number): number[] {
  const row = Math.min(MAX_CHARACTER_LEVEL, Math.max(0, Math.round(level)));
  return SLOTS_BY_LEVEL[row] ?? SLOTS_BY_LEVEL[0];
}

export type SlotCell = { total: number; spent: number; available: number };

/**
 * Slots de um nível de estrela. Vale só a linha do nível atual do personagem —
 * é o que a página de Combat Status do documento mostra: no nível 4, 1★ 4/4 e
 * 2★ 3/3, sete no total.
 */
export function slotCell(character: Character, starLevel: number): SlotCell {
  const total = slotsAtLevel(character.level)[starLevel - 1] ?? 0;
  const spent = Math.min(total, Math.max(0, character.warTactics.spent[starLevel - 1] ?? 0));
  return { total, spent, available: total - spent };
}

/** Soma dos nove níveis de estrela. */
export function unlockedSlots(character: Character) {
  let total = 0;
  let spent = 0;
  for (let star = 1; star <= MAX_TACTIC_LEVEL; star++) {
    const cell = slotCell(character, star);
    total += cell.total;
    spent += cell.spent;
  }
  return { total, spent, available: total - spent };
}

/** A história do personagem: um título e os parágrafos. */
export type ServiceRecord = {
  title: string;
  paragraphs: string[];
};

/** Tropa que a tática pode invocar, liberada num nível de classe. */
export type SummonUnit = {
  id: string;
  /** Nível de ARMADA que libera a tropa; 0 quando não depende de nível. */
  level: number;
  name: string;
  /** Fórmulas, não números: "8 + nível de ★". Vazio quando não há ficha. */
  ac: string;
  hp: string;
  action: string;
  description: string;
};

/** Uma das ordens de TACTICAL COMMAND. */
export type TacticOrder = {
  id: string;
  name: string;
  quote: string;
  effect: string;
  role: string;
};

export type Tactic = {
  id: string;
  name: string;
  kind: string;
  /** Habilidade básica: não consome slot e não pergunta nível ao usar. */
  atWill: boolean;
  quote: string;
  description: string;
  rule: string;
  /** Ganho ao gastar um slot acima do custo base ("Potência"). */
  scaling: string;
  orders: TacticOrder[];
  units: SummonUnit[];
};

/** Menor nível de personagem que concede algum slot daquele nível de tática. */
export function levelRequiredFor(tacticLevel: number): number | null {
  const index = SLOT_TABLE.findIndex((row) => (row[tacticLevel - 1] ?? 0) > 0);
  return index < 0 ? null : index + 1;
}

export type TacticLevelOption = {
  tacticLevel: number;
  total: number;
  available: number;
  requiredLevel: number | null;
};

/** Os nove níveis de estrela com o que o personagem tem em cada um. */
export function tacticLevelOptions(character: Character): TacticLevelOption[] {
  return Array.from({ length: MAX_TACTIC_LEVEL }, (_, index) => {
    const { total, available } = slotCell(character, index + 1);
    return {
      tacticLevel: index + 1,
      total,
      available,
      requiredLevel: levelRequiredFor(index + 1),
    };
  });
}

/** Um capítulo da campanha. */
export type Chapter = {
  id: string;
  title: string;
  /** A chamada de duas linhas que aparece no card fechado. */
  summary: string;
  /** Trancado mostra cadeado no lugar do OPEN. */
  locked: boolean;
  paragraphs: string[];
};

/** Um item do inventário. */
export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  /** Em uso agora, em oposição a guardado na mochila. */
  equipped: boolean;
};

export type Inventory = {
  coins: { gp: number; sp: number; cp: number };
  items: InventoryItem[];
};

/** Uma feature de classe, liberada num nível de ARMADA. */
export type ClassFeature = {
  id: string;
  level: number;
  name: string;
  /** "Action", "10 minutos" — vazio quando é passiva. */
  kind: string;
  description: string;
  /** Tabela da feature, quando ela tem uma (veículos do Catch a Ride). */
  units: SummonUnit[];
};

export type ClassRow = {
  level: number;
  bonus: string;
  features: string;
};

export type Character = {
  identity: {
    rank: string;
    className: string;
    role: string;
    faction: string;
    clearance: string;
    idCode: string;
    enlistedAt: string;
    signature: string;
  };
  level: number;
  xp: { current: number; next: number };
  combat: {
    armorClass: number;
    hitPoints: { current: number; max: number };
    hitDice: { current: number; max: number };
    tempHitPoints: number;
    inspiration: { current: number; max: number };
    exhaustion: { current: number; max: number };
    speed: number;
  };
  abilities: Record<Ability, AbilityScore>;
  proficiencies: {
    savingThrows: string;
    skills: string;
    tools: string;
    languages: string;
  };
  classTable: ClassRow[];
  skills: Skill[];
  /** Gasto por nível de estrela: `spent[nível − 1]`. */
  warTactics: { spent: number[] };
  tactics: Tactic[];
  features: ClassFeature[];
  inventory: Inventory;
  chronicles: Chapter[];
  serviceRecord: ServiceRecord;
};

/* ── valores derivados ──────────────────────────────────────── */

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number) {
  return Math.floor((Math.max(1, level) - 1) / 4) + 2;
}

export function skillModifier(character: Character, skill: Skill) {
  const base = character.abilities[skill.ability].modifier;
  const bonus = proficiencyBonus(character.level);
  const factor = skill.proficiency === "expertise" ? 2 : skill.proficiency === "proficient" ? 1 : 0;
  return base + bonus * factor;
}

/** DC das habilidades: 8 + proficiência + Wisdom. */
export function spellSaveDC(character: Character) {
  return 8 + proficiencyBonus(character.level) + character.abilities.wisdom.modifier;
}

/** Attack roll das tropas: proficiência + Wisdom. */
export function attackRoll(character: Character) {
  return proficiencyBonus(character.level) + character.abilities.wisdom.modifier;
}

/** Dano base: o modificador de Wisdom. */
export function baseDamageRoll(character: Character) {
  return character.abilities.wisdom.modifier;
}

export function signed(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

/* ── ficha inicial: o dossiê do General Armada ──────────────── */

const SKILL_SEED: Array<[string, Ability, Proficiency]> = [
  ["Athletics", "strength", "none"],
  ["Acrobatics", "dexterity", "none"],
  ["Sleight of Hand", "dexterity", "none"],
  ["Stealth", "dexterity", "none"],
  ["Arcana", "intelligence", "none"],
  ["History", "intelligence", "none"],
  ["Investigation", "intelligence", "none"],
  ["Nature", "intelligence", "none"],
  ["Religion", "intelligence", "proficient"],
  ["Animal Handling", "wisdom", "none"],
  ["Insight", "wisdom", "none"],
  ["Medicine", "wisdom", "none"],
  ["Perception", "wisdom", "proficient"],
  ["Survival", "wisdom", "none"],
  ["Deception", "charisma", "proficient"],
  ["Intimidation", "charisma", "expertise"],
  ["Performance", "charisma", "none"],
  ["Persuasion", "charisma", "proficient"],
];

export const DEFAULT_CHARACTER: Character = {
  identity: {
    rank: "General",
    className: "Armada",
    role: "Commander / Summoner",
    faction: "Army of the Free World",
    clearance: "LV4 — General",
    idCode: "ARMD-7821-GR4",
    enlistedAt: "12.06.2024",
    signature: "G. Armada",
  },
  level: 4,
  xp: { current: 1450, next: 2700 },
  combat: {
    armorClass: 14,
    hitPoints: { current: 17, max: 17 },
    hitDice: { current: 3, max: 3 },
    tempHitPoints: 0,
    inspiration: { current: 1, max: 3 },
    exhaustion: { current: 0, max: 6 },
    speed: 30,
  },
  abilities: {
    strength: { score: 8, modifier: -1 },
    dexterity: { score: 14, modifier: 2 },
    constitution: { score: 12, modifier: 1 },
    intelligence: { score: 12, modifier: 1 },
    wisdom: { score: 17, modifier: 3 },
    charisma: { score: 14, modifier: 2 },
  },
  proficiencies: {
    savingThrows: "Wisdom, Dexterity",
    skills: "Choose 3",
    tools: "—",
    languages: "Common",
  },
  classTable: [
    { level: 1, bonus: "+2", features: "War Tactics, One Man Army, Designate Target" },
    { level: 2, bonus: "+2", features: "Military Authority" },
    { level: 3, bonus: "+2", features: "Catch a Ride" },
    { level: 4, bonus: "+2", features: "War Focused (ASI)" },
  ],
  warTactics: { spent: Array.from({ length: MAX_TACTIC_LEVEL }, () => 0) },
  features: [
    {
      id: "war-tactics",
      level: 1,
      name: "War Tactics",
      kind: "",
      description:
        "Você é um invocador capaz de trazer à vida tudo que é relacionado à história militar da Terra. Você possui o que chamamos de WAR TACTICS, habilidades nascidas do seu próprio poder, usadas gastando STAR SLOTS — a sua capacidade de usá-las antes de esgotar o seu poder.\n\nOs STAR SLOTS têm diferentes potências, de uma estrela (1★) até nove (9★). Quanto mais estrelas, mais potente a habilidade é — ou se torna, quando usada numa potência acima da sua potência base.\n\nTodos os seus STAR SLOTS são recuperados ao fazer uma Long Rest.",
      units: [],
    },
    {
      id: "designate-target",
      level: 1,
      name: "Designate Target",
      kind: "Action",
      description:
        "Graças à sua posição no campo de batalha, você é capaz de identificar fraquezas e aberturas na guarda do inimigo. Como uma Action, você grita um comando para um aliado, expondo a melhor forma de atacar um adversário.\n\nEscolha um aliado a 30 ft de você: ele terá vantagem no próximo roll de ataque.",
      units: [],
    },
    {
      id: "military-authority",
      level: 2,
      name: "Military Authority",
      kind: "",
      description:
        "Como o comandante de um exército, você impõe sua autoridade dentro e fora dos campos de batalha. Você se torna proficiente e ganha expertise em Intimidation.",
      units: [],
    },
    {
      id: "catch-a-ride",
      level: 3,
      name: "Catch a Ride",
      kind: "10 minutos",
      description:
        "Seu poder te dá acesso a vários métodos de locomoção. Gastando 10 minutos, você consegue invocar um veículo à sua escolha da tabela abaixo. A invocação é desfeita quando você quiser, usando uma Action, ou se o veículo chegar a 0 de HP.",
      units: [
        {
          id: "indian-scout",
          level: 3,
          name: "Indian Scout (Moto)",
          ac: "",
          hp: "12",
          action: "80 ft de Speed",
          description: "Você invoca uma moto, capaz de transportar 2 pessoas.",
        },
        {
          id: "jeep-willys",
          level: 6,
          name: "Jeep Willys",
          ac: "",
          hp: "40",
          action: "90 ft de Speed",
          description: "Você invoca um jeep, capaz de transportar 5 pessoas.",
        },
      ],
    },
    {
      id: "war-focused",
      level: 4,
      name: "War Focused",
      kind: "",
      description:
        "Seu foco é aumentado quando no campo de batalha. Você ganha os seguintes benefícios:\n\nASI. Seu Wisdom aumenta em +1.\n\nPain Resistance. Você tem vantagem em saves de Constitution para manter concentração em habilidades.\n\nAlways Prepared. Você pode adicionar seu bônus de proficiência à sua iniciativa.",
      units: [],
    },
  ],
  inventory: {
    coins: { gp: 0, sp: 0, cp: 0 },
    items: [],
  },
  chronicles: [
    {
      id: "the-call-to-arms",
      title: "The Call to Arms",
      summary:
        "In a world on the brink of chaos, you receive the orders that will change everything.",
      locked: false,
      paragraphs: [],
    },
  ],
  serviceRecord: {
    title: "A Outra Vida",
    paragraphs: [
        "Ninguém sabe exatamente como ele chegou à Mortalha. Para os poucos que conhecem sua história, ele simplesmente apareceu naquele mundo carregando conhecimentos que não deveriam existir. Ele conhecia máquinas que ainda não haviam sido inventadas, estratégias de guerra desenvolvidas em uma realidade completamente diferente e princípios de engenharia que pareciam impossíveis para uma civilização acostumada a explicar tudo através da magia.",
        "Mas ele também não sabia de onde aquilo vinha.",
        "Todas as noites, quando dormia, ele sonhava. No início eram sonhos desconexos, como qualquer outro: o som distante de explosões, o cheiro de fumaça e óleo, homens correndo entre veículos, mapas espalhados sobre mesas e aeronaves cruzando o céu. Com o passar do tempo, porém, percebeu algo estranho. Os sonhos não terminavam. Quando voltava a dormir na noite seguinte, ele não começava uma nova história. Retornava exatamente ao ponto onde havia parado.",
        "A guerra continuava acontecendo enquanto ele estava acordado.",
        "Foi então que começou a perceber que não estava apenas observando aqueles acontecimentos. Ele estava vivendo outra vida.",
        "Em seus sonhos, ele era um General durante a Segunda Guerra Mundial. Não apenas um comandante responsável por mover tropas sobre mapas, mas um homem profundamente envolvido com o funcionamento da guerra moderna. Ele entendia estratégia, logística e organização militar, mas também estudava as máquinas que tornavam aquela guerra possível. Aeronaves, aerodinâmica, veículos blindados, artilharia e sistemas de comunicação não eram apenas ferramentas sob seu comando; eram coisas que ele compreendia.",
        "Todas as noites, o homem que vivia em Mortalha acordava naquela outra realidade e assumia novamente aquela vida. Às vezes passava apenas algumas horas em uma sala de comando. Em outras noites, vivia dias inteiros acompanhando operações, tomando decisões e testemunhando batalhas. Conhecia soldados, aprendia seus nomes e histórias, criava relações com pessoas que, ao acordar, sabia que jamais encontraria em Mortalha.",
        "Com o tempo, algo ainda mais estranho começou a acontecer.",
        "As memórias daquela outra vida começaram a permanecer.",
        "Quando acordava em Mortalha, ele se lembrava das coisas que havia aprendido. Sabia por que uma aeronave conseguia voar. Entendia como o formato de uma asa influenciava sua sustentação, como veículos militares eram projetados para sobreviver em combate e como diferentes unidades poderiam trabalhar juntas no campo de batalha. Ele carregava dentro de si o conhecimento de um mundo que não existia.",
        "Foi através disso que nasceu a ARMADA.",
        "A magia de Mortalha parecia responder de maneira diferente a ele. Enquanto outros conjuradores aprendiam feitiços e manipulavam forças mágicas, ele utilizava seu conhecimento para dar forma a coisas que jamais deveriam existir naquele mundo. Quando precisava de apoio em combate, não imaginava simplesmente uma criatura para lutar ao seu lado. Ele pensava em um soldado, em sua função, seu equipamento e sua posição dentro de uma unidade militar. E então um soldado surgia.",
        "Mais tarde vieram máquinas mais complexas. Um Jeep. Um soldado equipado com um lançador de foguetes. Um ataque aéreo. Sistemas de reconhecimento. Cada nova habilidade não surgia simplesmente porque ele havia se tornado mais poderoso. Ela surgia porque, em algum momento de sua outra vida, ele havia aprendido o suficiente para compreender aquilo.",
        "Algumas noites o ensinavam mais do que outras. Em uma delas, poderia passar horas estudando mapas e estratégias sem que nada aparentemente importante acontecesse. Em outra, poderia acordar no meio de uma operação aérea e acompanhar cada detalhe de uma missão. Dias depois, em Mortalha, aquele conhecimento começaria a se manifestar como uma nova War Tactic.",
        "Para ele, suas habilidades não eram apenas magia. Eram lembranças.",
        "O problema é que ele ainda não sabe qual das duas vidas é a verdadeira.",
        "Ele sabe que existe em Mortalha. Sente a dor, luta, cria laços e toma decisões. Mas, quando dorme, também sente o peso do uniforme, escuta as ordens pelo rádio e conhece pessoas que existem em outro mundo. Ambas as vidas parecem reais. Ambas continuam existindo quando ele não está presente.",
        "E existe uma pergunta que ele ainda não conseguiu responder.",
        "Se ele é uma cópia daquele General da Terra, por que consegue lembrar da vida dele?",
        "E, mais importante, será que o General também sonha com Mortalha?",
        "Talvez, enquanto ele dorme e vive a guerra da Terra, sua outra versão também feche os olhos e veja um mundo impossível. Um mundo de magia, demônios e cidades flutuantes. Talvez aquele homem também acorde todas as manhãs com memórias de batalhas que nunca aconteceram em seu mundo.",
        "Por enquanto, a única certeza do General é que, todas as noites, quando fecha os olhos, uma outra guerra continua esperando por ele.",
        "E, todas as manhãs, ele acorda trazendo uma parte dela consigo.",
    ],
  },
  tactics: [
    {
      id: "one-man-army",
      name: "One Man Army",
      kind: "Level 1 • Mecânica principal",
      atWill: true,
      quote: "SOLDIER! YOU HAVE BEEN PROMOTED TO EXISTENCE. ENGAGE!",
      description:
        "Você é o general que controla o campo de batalha por trás das linhas, ordenando seus aliados e suas tropas em direção à vitória. Seu trabalho é estratégico e não braçal, e por isso existem aqueles que lutam por você.",
      rule:
        "Você não possui a ação de Attack. No lugar dela, você é capaz de invocar tropas como uma free action e comandá-las no seu turno usando uma Bonus Action. Quanto maior o seu nível na classe ARMADA, maior a variação de tropas que você pode invocar para lutar ao seu lado.",
      scaling: "",
      orders: [],
      units: [
        {
          id: "basic-soldier",
          level: 1,
          name: "Basic Soldier",
          ac: "",
          hp: "",
          action: "Bonus Action — Shoot!",
          description:
            "Você ordena o soldado a atirar em um inimigo. Faça um spell attack; em um acerto você dá 1d6 + wisdom de dano.",
        },
        {
          id: "basic-medic",
          level: 3,
          name: "Basic Medic",
          ac: "",
          hp: "",
          action: "Bonus Action — Patch Em' Up!",
          description:
            "Você ordena o médico a cuidar das feridas de um aliado em até 30 ft de você. O aliado recebe 1d4 + wisdom de vida temporária.",
        },
      ],
    },
    {
      id: "gun-run",
      name: "Gun Run",
      kind: "Action • 1★",
      atWill: false,
      quote: "GET SOME!",
      description:
        "Você invoca um P-51 para fuzilar inimigos no campo de batalha. Escolha uma linha de 30 ft; inimigos nessa área fazem um saving throw de Dexterity, e numa falha recebem 3d6 de dano piercing, ou metade num sucesso.",
      rule: "",
      scaling: "(+1★) O dano aumenta em 1d6.",
      orders: [],
      units: [],
    },
    {
      id: "tactical-command",
      name: "Tactical Command",
      kind: "Buff / Support",
      atWill: false,
      quote: "MEN! WE ARE SURROUNDED! EXCELLENT! THAT MEANS WE CAN ATTACK IN EVERY DIRECTION!",
      description:
        "Você emite uma ordem militar ensurdecedora, inspirando seus aliados através de uma combinação de autoridade absoluta, gritaria e uma confiança completamente desproporcional à situação.",
      rule: "Seu comando não precisa fazer sentido. O importante é que seja dito com convicção.",
      scaling: "",
      orders: [
        {
          id: "advance",
          name: "Advance!",
          quote: "FORWARD, MAGGOT! THE ENEMY IS BEHIND THAT DIRECTION!",
          effect:
            "O aliado recebe um bônus temporário de movimento e/ou pode se reposicionar sem sofrer a penalidade normal.",
          role: "Movement",
        },
        {
          id: "hold-the-line",
          name: "Hold the Line!",
          quote: "YOU ARE NOT DYING TODAY! THAT IS AN ORDER!",
          effect:
            "Um aliado recebe proteção temporária, como vida temporária, bônus defensivo ou resistência limitada.",
          role: "Defesa",
        },
        {
          id: "fight-harder",
          name: "Fight Harder!",
          quote: "ARE YOU BLEEDING? GOOD! THAT MEANS YOU'RE STILL ALIVE! NOW GET BACK IN THERE!",
          effect:
            "O aliado recebe um pequeno buff ofensivo, como bônus no próximo ataque ou dano adicional temporário.",
          role: "Buff",
        },
      ],
      units: [],
    },
    {
      id: "fire-in-the-hole",
      name: "Fire in the Hole!",
      kind: "Action • 1★",
      atWill: false,
      quote: "FIRE IN THE HOLE!",
      description:
        "Você invoca um soldado que joga uma granada no meio dos seus inimigos. Escolha uma área de 3x3; inimigos nessa área fazem um saving throw de Dexterity, e numa falha recebem 3d6 de fire damage, ou metade num sucesso.",
      rule: "",
      scaling: "(+1★) O dano aumenta em 1d6.",
      orders: [],
      units: [],
    },
    {
      id: "uav",
      name: "UAV",
      kind: "Action • 1 turno • 1★",
      atWill: false,
      quote: "",
      description:
        "Você invoca um UAV que detecta inimigos e te informa a localização deles no mapa por rádio. Enquanto o UAV estiver no campo de batalha, o flanqueamento por inimigos é desativado.",
      rule: "",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "get-down-mr-commander",
      name: "Get Down, Mr. Commander!",
      kind: "Reaction • 1 round • 1★",
      atWill: false,
      quote: "GET DOWN, MR. COMMANDER!",
      description:
        "Quando você estiver prestes a ser atacado, um soldado é invocado, pulando em direção ao ataque para proteger seu general. Até o início do seu próximo turno, você recebe um bônus de +5 para sua AC.",
      rule: "",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "rpg-soldier",
      name: "RPG Soldier",
      kind: "Action • Concentration, 1 minuto • 1★",
      atWill: false,
      quote: "",
      description:
        "Você invoca um soldado carregando um Rocket Launcher. O soldado compartilha da sua iniciativa e do seu spell DC. Você pode ordenar ele como uma free action no seu turno.",
      rule: "",
      scaling: "(+2★) O dano aumenta em 1d4.",
      orders: [],
      units: [
        {
          id: "rpg-soldier-sheet",
          level: 0,
          name: "RPG Soldier",
          ac: "8 + nível de ★",
          hp: "12 + 3 para cada nível acima de 1★",
          action: "Shoot! • Action, 60 ft range, 5 ft area",
          description:
            "O soldado atira com o RPG em direção a um alvo. O alvo e todos à volta dele fazem um saving throw de Dexterity. Em uma falha recebem 1d4 + wisdom de fire damage, ou metade num sucesso.",
        },
      ],
    },
    {
      id: "suppression-fire",
      name: "Suppression Fire",
      kind: "Action • 1 turno • 1★",
      atWill: false,
      quote: "",
      description:
        "Você invoca soldados armados e os ordena a proteger a área ao redor de um aliado. Os soldados fuzilam qualquer inimigo a 5 ft ao redor do alvo escolhido, fazendo inimigos na área terem desvantagem para atacar e terem sua AC reduzida em 1.",
      rule: "",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "barbed-wire",
      name: "Barbed Wire",
      kind: "Action • 1★",
      atWill: false,
      quote: "",
      description:
        "Você invoca uma cerca de arame farpado em uma área de 1x4 em até 30 ft de você. Essa área é considerada terreno difícil, e criaturas que passarem por ela ou começarem seu turno nela recebem 2d4 de slashing damage.",
      rule: "",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "fulton-recovery-system",
      name: "Fulton Recovery System",
      kind: "Action • 100 ft • 1★",
      atWill: false,
      quote: "",
      description:
        "Você puxa o rádio e aciona o sistema fulton para se transportar para outro lugar no campo de batalha. Até um range máximo de 100 ft, escolha um lugar que não esteja ocupado por uma criatura; no próximo turno você será transportado para lá, e esse movimento ignora reações.",
      rule:
        "Você será transportado mesmo se estiver inconsciente.",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "decoy-maneuver",
      name: "Decoy Maneuver",
      kind: "Action • 1 minuto • 2★",
      atWill: false,
      quote: "",
      description:
        "Você agarra o ar, invocando na sua mão uma granada de fumaça que joga imediatamente nos próprios pés. A fumaça esconde você momentaneamente e, quando se dispersa, outras 3 cópias suas existem ao seu redor, imitando seus gestos e movimentos.",
      rule:
        "Toda vez que uma criatura acertar você durante a duração, role um d6 para cada cópia restante. Se qualquer d6 for 3 ou mais, uma das cópias é atingida no seu lugar e é destruída. As cópias ignoram qualquer outra fonte de dano ou efeito. A habilidade acaba quando as três cópias são destruídas.",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "advanced-soldier",
      name: "Advanced Soldier",
      kind: "Action • Concentration, 1 minuto • 2★",
      atWill: false,
      quote: "",
      description:
        "Você invoca um soldado armado, melhor treinado que seus soldados comuns. O soldado compartilha da sua iniciativa e do seu attack roll. Você pode ordenar ele como uma free action no seu turno.",
      rule: "",
      scaling: "(+2★) O dano aumenta em 1d8.",
      orders: [],
      units: [
        {
          id: "advanced-soldier-sheet",
          level: 0,
          name: "Advanced Soldier",
          ac: "9 + nível de ★",
          hp: "17 + 5 para cada nível acima de 1★",
          action: "Shoot! • Action, 60 ft range",
          description:
            "O soldado atira em um alvo à sua escolha. Faça um attack roll contra o alvo; se acertar, você dá 1d8 + wisdom de piercing damage.",
        },
      ],
    },
    {
      id: "moral-up",
      name: "Moral Up",
      kind: "Action • 1 turno • 2★",
      atWill: false,
      quote: "",
      description:
        "Você profere palavras bonitas e muito salmo para seus aliados, os inspirando a lutar mais ferozmente. Escolha 3 aliados num range de até 30 ft para receber 1d6 + wisdom de vida temporária e +1d4 para acerto por 1 turno.",
      rule: "",
      scaling: "",
      orders: [],
      units: [],
    },
    {
      id: "stealth-box",
      name: "Stealth Box",
      kind: "Action • Concentration, 1 hora • 2★",
      atWill: false,
      quote: "",
      description:
        "Você invoca uma confiável caixa de papelão capaz de esconder perfeitamente uma pessoa dos seus inimigos. A caixa comporta uma pessoa, e quem estiver dentro dela fica Invisível pela duração — ou até fazer um attack roll, dar dano ou usar uma habilidade, casos em que a caixa é desfeita e a habilidade se encerra.",
      rule: "",
      scaling: "",
      orders: [],
      units: [],
    },
  ],
  skills: SKILL_SEED.map(([name, ability, proficiency]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    ability,
    proficiency,
  })),
};

/* ── saneamento: o arquivo em disco nunca derruba a página ──── */

const PROFICIENCIES: Proficiency[] = ["none", "proficient", "expertise"];

function str(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() !== "" ? value : fallback;
}

function bool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function int(value: unknown, fallback: number, min = -999, max = 9999) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function summonUnits(value: unknown, fallback: SummonUnit[]): SummonUnit[] {
  return (Array.isArray(value) ? value : fallback).slice(0, 20).map((entry, i) => {
    const unit = (entry ?? {}) as Record<string, unknown>;
    const base = fallback[i] ?? {
      id: `unit-${i}`,
      level: 0,
      name: "—",
      ac: "",
      hp: "",
      action: "",
      description: "",
    };
    return {
      id: str(unit.id, base.id),
      level: int(unit.level, base.level, 0, MAX_CHARACTER_LEVEL),
      name: str(unit.name, base.name),
      ac: str(unit.ac, base.ac),
      hp: str(unit.hp, base.hp),
      action: str(unit.action, base.action),
      description: str(unit.description, base.description),
    };
  });
}

function inventory(value: unknown, fallback: Inventory): Inventory {
  const raw = (value ?? {}) as Record<string, unknown>;
  const coins = (raw.coins ?? {}) as Record<string, unknown>;
  const items = Array.isArray(raw.items) ? raw.items : fallback.items;

  return {
    coins: {
      gp: int(coins.gp, fallback.coins.gp, 0, 999999),
      sp: int(coins.sp, fallback.coins.sp, 0, 999999),
      cp: int(coins.cp, fallback.coins.cp, 0, 999999),
    },
    items: items.slice(0, 200).map((entry, index) => {
      const item = (entry ?? {}) as Record<string, unknown>;
      return {
        id: str(item.id, `item-${index}`),
        name: str(item.name, "—"),
        quantity: int(item.quantity, 1, 0, 9999),
        notes: typeof item.notes === "string" ? item.notes : "",
        equipped: bool(item.equipped, false),
      };
    }),
  };
}

/** Aceita o formato antigo (lista de seções) pegando a primeira. */
function serviceRecord(value: unknown, fallback: ServiceRecord): ServiceRecord {
  const source = (Array.isArray(value) ? value[0] : value) as Record<string, unknown> | undefined;
  const raw = source ?? {};
  const paragraphs = Array.isArray(raw.paragraphs) ? raw.paragraphs : fallback.paragraphs;
  return {
    title: str(raw.title, fallback.title),
    paragraphs: paragraphs
      .slice(0, 300)
      .map((entry) => (typeof entry === "string" ? entry : ""))
      .filter((entry) => entry.trim() !== ""),
  };
}

/** Aceita a lista de nove e também a grade antiga, somando as linhas dela. */
function slotSpent(value: unknown): number[] {
  const zeros = Array.from({ length: MAX_TACTIC_LEVEL }, () => 0);
  if (!Array.isArray(value)) return zeros;

  return zeros.map((_, index) =>
    value.reduce<number>((soma, entry: unknown) => {
      const cell = Array.isArray(entry) ? entry[index] : index === 0 ? entry : 0;
      return soma + int(cell, 0, 0, 99);
    }, 0),
  );
}

/** Aceita tanto o formato antigo (só o score) quanto `{ score, modifier }`. */
function ability(value: unknown, fallback: AbilityScore): AbilityScore {
  if (typeof value === "number" || typeof value === "string") {
    const score = int(value, fallback.score, 1, 30);
    return { score, modifier: abilityModifier(score) };
  }
  const source = (value ?? {}) as Record<string, unknown>;
  const score = int(source.score, fallback.score, 1, 30);
  return { score, modifier: int(source.modifier, abilityModifier(score), -20, 20) };
}

function pair(value: unknown, fallback: { current: number; max: number }) {
  const source = (value ?? {}) as Record<string, unknown>;
  return {
    current: int(source.current, fallback.current, -999),
    max: int(source.max, fallback.max, 0),
  };
}

/** Aceita qualquer entrada e devolve uma ficha válida, campo a campo. */
export function sanitizeCharacter(input: unknown): Character {
  const raw = (input ?? {}) as Record<string, unknown>;
  const base = DEFAULT_CHARACTER;

  const identity = (raw.identity ?? {}) as Record<string, unknown>;
  const combat = (raw.combat ?? {}) as Record<string, unknown>;
  const abilities = (raw.abilities ?? {}) as Record<string, unknown>;
  const proficiencies = (raw.proficiencies ?? {}) as Record<string, unknown>;
  const xp = (raw.xp ?? {}) as Record<string, unknown>;

  const level = int(raw.level, base.level, 1, MAX_CHARACTER_LEVEL);
  const classTable = Array.isArray(raw.classTable) ? raw.classTable : base.classTable;
  const skills = Array.isArray(raw.skills) ? raw.skills : base.skills;

  return {
    identity: {
      rank: str(identity.rank, base.identity.rank),
      className: str(identity.className, base.identity.className),
      role: str(identity.role, base.identity.role),
      faction: str(identity.faction, base.identity.faction),
      clearance: str(identity.clearance, base.identity.clearance),
      idCode: str(identity.idCode, base.identity.idCode),
      enlistedAt: str(identity.enlistedAt, base.identity.enlistedAt),
      signature: str(identity.signature, base.identity.signature),
    },
    level,
    xp: {
      current: int(xp.current, base.xp.current, 0),
      next: int(xp.next, base.xp.next, 1),
    },
    combat: {
      armorClass: int(combat.armorClass, base.combat.armorClass, 0, 99),
      hitPoints: pair(combat.hitPoints, base.combat.hitPoints),
      hitDice: pair(combat.hitDice, base.combat.hitDice),
      tempHitPoints: int(combat.tempHitPoints, base.combat.tempHitPoints, 0),
      inspiration: pair(combat.inspiration, base.combat.inspiration),
      exhaustion: pair(combat.exhaustion, base.combat.exhaustion),
      speed: int(combat.speed, base.combat.speed, 0),
    },
    abilities: Object.fromEntries(
      ABILITIES.map((key) => [key, ability(abilities[key], base.abilities[key])]),
    ) as Record<Ability, AbilityScore>,
    proficiencies: {
      savingThrows: str(proficiencies.savingThrows, base.proficiencies.savingThrows),
      skills: str(proficiencies.skills, base.proficiencies.skills),
      tools: str(proficiencies.tools, base.proficiencies.tools),
      languages: str(proficiencies.languages, base.proficiencies.languages),
    },
    classTable: classTable.slice(0, 20).map((row, index) => {
      const source = (row ?? {}) as Record<string, unknown>;
      const fallback = base.classTable[index] ?? { level: index + 1, bonus: "+2", features: "—" };
      return {
        level: int(source.level, fallback.level, 1, MAX_CHARACTER_LEVEL),
        bonus: str(source.bonus, fallback.bonus),
        features: str(source.features, fallback.features),
      };
    }),
    warTactics: { spent: slotSpent(((raw.warTactics ?? {}) as Record<string, unknown>).spent) },
    tactics: (Array.isArray(raw.tactics) ? raw.tactics : base.tactics)
      .slice(0, 30)
      .map((row, index) => {
        const source = (row ?? {}) as Record<string, unknown>;
        const fallback = base.tactics[index] ?? base.tactics[0];
        return {
          id: str(source.id, fallback.id),
          name: str(source.name, fallback.name),
          kind: str(source.kind, fallback.kind),
          atWill: bool(source.atWill, fallback.atWill),
          quote: str(source.quote, fallback.quote),
          description: str(source.description, fallback.description),
          rule: str(source.rule, fallback.rule),
          scaling: str(source.scaling, fallback.scaling),
          orders: (Array.isArray(source.orders) ? source.orders : []).slice(0, 12).map((entry, i) => {
            const order = (entry ?? {}) as Record<string, unknown>;
            const orderFallback = fallback.orders[i] ?? {
              id: `order-${i}`,
              name: "—",
              quote: "",
              effect: "",
              role: "",
            };
            return {
              id: str(order.id, orderFallback.id),
              name: str(order.name, orderFallback.name),
              quote: str(order.quote, orderFallback.quote),
              effect: str(order.effect, orderFallback.effect),
              role: str(order.role, orderFallback.role),
            };
          }),
          units: (Array.isArray(source.units) ? source.units : fallback.units)
            .slice(0, 20)
            .map((entry, i) => {
              const unit = (entry ?? {}) as Record<string, unknown>;
              const unitFallback = fallback.units[i] ?? {
                id: `unit-${i}`,
                level: 1,
                name: "—",
                ac: "",
                hp: "",
                action: "",
                description: "",
              };
              return {
                id: str(unit.id, unitFallback.id),
                level: int(unit.level, unitFallback.level, 0, MAX_CHARACTER_LEVEL),
                name: str(unit.name, unitFallback.name),
                ac: str(unit.ac, unitFallback.ac ?? ""),
                hp: str(unit.hp, unitFallback.hp ?? ""),
                action: str(unit.action, unitFallback.action),
                description: str(unit.description, unitFallback.description),
              };
            }),
        };
      }),
    features: (Array.isArray(raw.features) ? raw.features : base.features)
      .slice(0, 40)
      .map((row, index) => {
        const source = (row ?? {}) as Record<string, unknown>;
        const fallback = base.features[index] ?? {
          id: `feature-${index}`,
          level: 1,
          name: "—",
          kind: "",
          description: "",
          units: [],
        };
        return {
          id: str(source.id, fallback.id),
          level: int(source.level, fallback.level, 1, MAX_CHARACTER_LEVEL),
          name: str(source.name, fallback.name),
          kind: str(source.kind, fallback.kind),
          description: str(source.description, fallback.description),
          units: summonUnits(source.units, fallback.units),
        };
      }),
    inventory: inventory(raw.inventory, base.inventory),
    chronicles: (Array.isArray(raw.chronicles) ? raw.chronicles : base.chronicles)
      .slice(0, 100)
      .map((row, index) => {
        const source = (row ?? {}) as Record<string, unknown>;
        const fallback = base.chronicles[index] ?? {
          id: `chapter-${index}`,
          title: "—",
          summary: "",
          locked: true,
          paragraphs: [],
        };
        const paragraphs = Array.isArray(source.paragraphs) ? source.paragraphs : [];
        return {
          id: str(source.id, fallback.id),
          title: str(source.title, fallback.title),
          summary: typeof source.summary === "string" ? source.summary : fallback.summary,
          locked: bool(source.locked, fallback.locked),
          paragraphs: paragraphs
            .slice(0, 300)
            .map((entry) => (typeof entry === "string" ? entry : ""))
            .filter((entry) => entry.trim() !== ""),
        };
      }),
    serviceRecord: serviceRecord(raw.serviceRecord, base.serviceRecord),
    skills: skills.slice(0, 40).map((row, index) => {
      const source = (row ?? {}) as Record<string, unknown>;
      const fallback = base.skills[index] ?? base.skills[0];
      const ability = ABILITIES.includes(source.ability as Ability)
        ? (source.ability as Ability)
        : fallback.ability;
      const proficiency = PROFICIENCIES.includes(source.proficiency as Proficiency)
        ? (source.proficiency as Proficiency)
        : fallback.proficiency;
      return {
        id: str(source.id, fallback.id),
        name: str(source.name, fallback.name),
        ability,
        proficiency,
      };
    }),
  };
}
