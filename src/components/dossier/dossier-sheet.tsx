"use client";

import Image from "next/image";

import { useCharacter } from "@/components/character-provider";
import { EditNumber, EditText } from "@/components/editable";
import { PortraitBlock } from "@/components/dossier/portrait-block";
import { Paperclip } from "@/components/insignia";
import { PaperSurface } from "@/components/paper";
import {
  ABILITIES,
  ABILITY_LABEL,
  abilityModifier,
  attackRoll,
  baseDamageRoll,
  MAX_CHARACTER_LEVEL,
  proficiencyBonus,
  signed,
  spellSaveDC,
} from "@/lib/character";

export function DossierSheet() {
  const { character, update } = useCharacter();
  const { identity, combat } = character;
  const xpPercent = Math.min(100, Math.round((character.xp.current / character.xp.next) * 100));

  return (
    <PaperSurface
      crease={false}
      className="shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9),0_2px_0_rgba(255,255,255,0.05)]"
    >
      <Paperclip className="absolute -top-5 left-6 z-10 h-24 w-9 rotate-[-5deg] text-[#4e5155] drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]" />

      <div className="relative space-y-6 px-5 py-7 @xl:px-8 @xl:py-9 @4xl:px-10">
        {/* cabeçalho do documento */}
        <header className="flex items-start justify-between gap-4">
          <p className="pl-12 text-[0.6rem] font-medium uppercase leading-tight tracking-[0.2em] text-ink-soft @xl:tracking-[0.26em]">
            Military Personnel Dossier
          </p>
          <div className="flex items-start gap-3">
            <div className="text-right leading-tight">
              <p className="whitespace-nowrap text-[0.55rem] font-medium uppercase tracking-[0.24em] text-ink-soft">
                Document ID
              </p>
              <EditText
                label="Document ID"
                value={identity.idCode}
                onCommit={(next) => update((draft) => void (draft.identity.idCode = next))}
                className="whitespace-nowrap text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink"
              />
            </div>
            <Image
              src="/armada-emblem.png"
              alt=""
              width={900}
              height={946}
              className="h-9 w-auto opacity-70 mix-blend-multiply [filter:grayscale(1)_contrast(1.25)]"
            />
          </div>
        </header>

        {/* retrato + identidade */}
        <div className="flex flex-col gap-6 @xl:flex-row @xl:gap-7">
          <PortraitBlock className="mx-auto w-full max-w-[220px] shrink-0 @xl:mx-0" />

          <div className="relative min-w-0 flex-1">
            <ClassifiedStamp />

            <h1 className="flex flex-wrap items-baseline gap-x-2 pr-0 text-2xl font-bold uppercase tracking-[0.1em] text-ink @xl:pr-32 @3xl:text-3xl">
              <EditText
                label="Patente"
                value={identity.rank}
                onCommit={(next) => update((draft) => void (draft.identity.rank = next))}
                className="w-auto"
              />
              <span className="text-ink-soft">—</span>
              <span>LV{character.level}</span>
            </h1>

            <dl className="mt-5 space-y-1.5">
              <Field
                label="Class"
                value={identity.className}
                onCommit={(next) => update((draft) => void (draft.identity.className = next))}
                accent
              />
              <Field
                label="Role"
                value={identity.role}
                onCommit={(next) => update((draft) => void (draft.identity.role = next))}
              />
              <Field
                label="Faction"
                value={identity.faction}
                onCommit={(next) => update((draft) => void (draft.identity.faction = next))}
              />
              <Field
                label="Clearance"
                value={identity.clearance}
                onCommit={(next) => update((draft) => void (draft.identity.clearance = next))}
              />
              <Field
                label="ID Code"
                value={identity.idCode}
                onCommit={(next) => update((draft) => void (draft.identity.idCode = next))}
              />
              <Field
                label="Enlistment"
                value={identity.enlistedAt}
                onCommit={(next) => update((draft) => void (draft.identity.enlistedAt = next))}
              />
            </dl>
          </div>
        </div>

        {/* blocos de fichário */}
        <div className="grid gap-5 @xl:grid-cols-2">
          <div className="space-y-5">
            {/* nível e experiência */}
            <div className="flex items-stretch gap-3">
              <div className="flex w-24 shrink-0 flex-col items-center justify-center border border-ink/30 px-3 py-2">
                <p className="text-[0.5rem] font-medium uppercase tracking-[0.26em] text-ink-soft">
                  Level
                </p>
                <EditNumber
                  label="Nível"
                  value={character.level}
                  min={1}
                  max={MAX_CHARACTER_LEVEL}
                  onCommit={(next) => update((draft) => void (draft.level = next))}
                  className="text-3xl font-bold leading-none text-ink"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center border border-ink/30 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[0.55rem] font-medium uppercase tracking-[0.26em] text-ink-soft">
                    Experience
                  </p>
                  <p className="flex items-baseline gap-1 text-[0.65rem] tabular-nums text-ink">
                    <EditNumber
                      label="XP atual"
                      value={character.xp.current}
                      max={999999}
                      format={(value) => value.toLocaleString("en-US")}
                      onCommit={(next) => update((draft) => void (draft.xp.current = next))}
                      className="w-auto"
                    />
                    <span className="text-ink-soft">/</span>
                    <EditNumber
                      label="XP do próximo nível"
                      value={character.xp.next}
                      min={1}
                      max={999999}
                      format={(value) => value.toLocaleString("en-US")}
                      onCommit={(next) => update((draft) => void (draft.xp.next = next))}
                      className="w-auto"
                    />
                    <span className="text-[0.5rem] uppercase tracking-[0.2em] text-ink-soft">xp</span>
                  </p>
                </div>
                <div className="mt-2 h-2.5 w-full border border-ink/30 bg-ink/5 p-px">
                  <div
                    className="h-full bg-mil-dim/80"
                    style={{ width: `${xpPercent}%` }}
                    role="progressbar"
                    aria-valuenow={character.xp.current}
                    aria-valuemin={0}
                    aria-valuemax={character.xp.next}
                    aria-label="Experiência"
                  />
                </div>
              </div>
            </div>

            {/* resumo de combate */}
            <Panel title="Combat Summary">
              {/* derivados do nível e do Wisdom — não se editam à mão */}
              <div className="grid grid-cols-4 divide-x divide-ink/20 border-b border-ink/20 text-center">
                {(
                  [
                    ["PB", signed(proficiencyBonus(character.level))],
                    ["DC", String(spellSaveDC(character))],
                    ["Attack", signed(attackRoll(character))],
                    ["Damage", signed(baseDamageRoll(character))],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="px-1 py-2">
                    <p className="text-[0.45rem] font-medium uppercase tracking-[0.2em] text-ink-soft">
                      {label}
                    </p>
                    <p className="text-[0.9rem] font-bold leading-none text-ink">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 divide-x divide-ink/20 border-b border-ink/20">
                <Stat label="AC">
                  <EditNumber
                    label="Classe de armadura"
                    value={combat.armorClass}
                    max={99}
                    onCommit={(next) => update((draft) => void (draft.combat.armorClass = next))}
                    className="text-3xl font-bold leading-none"
                  />
                </Stat>
                <Stat label="Hit Points">
                  <span className="flex items-baseline justify-center gap-1 text-xl font-bold leading-none">
                    <EditNumber
                      label="HP atual"
                      value={combat.hitPoints.current}
                      min={-99}
                      max={999}
                      onCommit={(next) =>
                        update((draft) => void (draft.combat.hitPoints.current = next))
                      }
                      className="w-auto"
                    />
                    <span className="text-ink-soft">/</span>
                    <EditNumber
                      label="HP máximo"
                      value={combat.hitPoints.max}
                      max={999}
                      onCommit={(next) => update((draft) => void (draft.combat.hitPoints.max = next))}
                      className="w-auto"
                    />
                  </span>
                  <span className="mt-1 flex items-baseline justify-center gap-1 text-[0.72rem] font-medium text-mil-dim">
                    <span>(</span>
                    <EditNumber
                      label="Dados de vida disponíveis"
                      value={combat.hitDice.current}
                      max={99}
                      onCommit={(next) => update((draft) => void (draft.combat.hitDice.current = next))}
                      className="w-auto"
                    />
                    <span>/</span>
                    <EditNumber
                      label="Dados de vida totais"
                      value={combat.hitDice.max}
                      max={99}
                      onCommit={(next) => update((draft) => void (draft.combat.hitDice.max = next))}
                      className="w-auto"
                    />
                    <span>)</span>
                  </span>
                </Stat>
                <Stat label="Temp HP">
                  <EditNumber
                    label="HP temporário"
                    value={combat.tempHitPoints}
                    max={999}
                    onCommit={(next) => update((draft) => void (draft.combat.tempHitPoints = next))}
                    className="text-3xl font-bold leading-none"
                  />
                </Stat>
              </div>
              <div className="grid grid-cols-3 divide-x divide-ink/20">
                <Stat label="Inspiration">
                  <Ratio
                    label="Inspiração"
                    current={combat.inspiration.current}
                    max={combat.inspiration.max}
                    onCurrent={(next) =>
                      update((draft) => void (draft.combat.inspiration.current = next))
                    }
                    onMax={(next) => update((draft) => void (draft.combat.inspiration.max = next))}
                  />
                </Stat>
                <Stat label="Exhaustion">
                  <Ratio
                    label="Exaustão"
                    current={combat.exhaustion.current}
                    max={combat.exhaustion.max}
                    onCurrent={(next) =>
                      update((draft) => void (draft.combat.exhaustion.current = next))
                    }
                    onMax={(next) => update((draft) => void (draft.combat.exhaustion.max = next))}
                  />
                </Stat>
                <Stat label="Speed">
                  <span className="flex items-baseline justify-center gap-1 text-2xl font-bold leading-none">
                    <EditNumber
                      label="Deslocamento"
                      value={combat.speed}
                      max={999}
                      onCommit={(next) => update((draft) => void (draft.combat.speed = next))}
                      className="w-auto"
                    />
                    <span className="text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft">ft</span>
                  </span>
                </Stat>
              </div>
            </Panel>
            {/* tabela de classe */}
            <Panel title={`Class Table — ${identity.className}`}>
              <table className="w-full text-[0.65rem]">
                <thead>
                  <tr className="border-b border-ink/25 text-[0.5rem] uppercase tracking-[0.18em] text-ink-soft">
                    <th className="w-12 px-2 py-1.5 text-center font-medium">Level</th>
                    <th className="w-20 px-2 py-1.5 text-center font-medium leading-tight">
                      Proficiency
                      <br />
                      Bonus
                    </th>
                    <th className="px-3 py-1.5 text-left font-medium">Features</th>
                  </tr>
                </thead>
                <tbody>
                  {character.classTable.map((row, index) => (
                    <tr key={row.level} className="border-b border-ink/12 last:border-0">
                      <td className="px-2 py-1.5 text-center tabular-nums">{row.level}</td>
                      <td className="px-2 py-1.5 text-center tabular-nums text-ink-soft">
                        {signed(proficiencyBonus(row.level))}
                      </td>
                      <td className="px-3 py-1.5">
                        <EditText
                          label={`Recursos do nível ${row.level}`}
                          value={row.features}
                          multiline
                          onCommit={(next) =>
                            update((draft) => void (draft.classTable[index].features = next))
                          }
                          className="w-full leading-snug"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-ink/20 px-2 py-1">
                <button
                  type="button"
                  onClick={() =>
                    update((draft) => {
                      const level = (draft.classTable.at(-1)?.level ?? 0) + 1;
                      draft.classTable.push({ level, bonus: "", features: "—" });
                    })
                  }
                  className="editable px-2 py-2 text-[0.55rem] font-medium uppercase tracking-[0.2em] text-ink-soft"
                >
                  + Add level
                </button>
                {character.classTable.length > 1 && (
                  <button
                    type="button"
                    onClick={() => update((draft) => void draft.classTable.pop())}
                    className="editable px-2 py-2 text-[0.55rem] font-medium uppercase tracking-[0.2em] text-ink-soft"
                  >
                    − Remove last
                  </button>
                )}
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            {/* atributos */}
            <Panel title="Attributes">
              <table className="w-full text-[0.68rem]">
                <thead>
                  <tr className="border-b border-ink/25 text-[0.55rem] uppercase tracking-[0.2em] text-ink-soft">
                    <th className="px-3 py-1.5 text-left font-medium">Attribute</th>
                    <th className="w-20 px-2 py-1.5 text-center font-medium">Score</th>
                    <th className="w-24 px-2 py-1.5 text-center font-medium">Modifier</th>
                  </tr>
                </thead>
                <tbody>
                  {ABILITIES.map((ability) => (
                    <tr key={ability} className="border-b border-ink/12 last:border-0">
                      <td className="px-3 py-1.5 uppercase tracking-[0.14em]">
                        {ABILITY_LABEL[ability]}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <EditNumber
                          label={`${ABILITY_LABEL[ability]} score`}
                          value={character.abilities[ability].score}
                          min={1}
                          max={30}
                          onCommit={(next) =>
                            update((draft) => {
                              // mexer no score ressincroniza o modificador;
                              // sobrescrever à mão é o passo seguinte, explícito
                              draft.abilities[ability].score = next;
                              draft.abilities[ability].modifier = abilityModifier(next);
                            })
                          }
                          className="w-full font-medium tabular-nums"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <EditNumber
                          label={`Modificador de ${ABILITY_LABEL[ability]}`}
                          value={character.abilities[ability].modifier}
                          min={-20}
                          max={20}
                          format={signed}
                          onCommit={(next) =>
                            update((draft) => void (draft.abilities[ability].modifier = next))
                          }
                          className="w-full font-medium tabular-nums text-ink-soft"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            {/* proficiências */}
            <Panel title="Proficiencies">
              <dl className="text-[0.68rem]">
                {(
                  [
                    ["Saving Throws", "savingThrows"],
                    ["Skills", "skills"],
                    ["Tools", "tools"],
                    ["Languages", "languages"],
                  ] as const
                ).map(([label, key]) => (
                  <div
                    key={key}
                    className="flex items-baseline gap-3 border-b border-ink/12 px-3 py-1.5 last:border-0"
                  >
                    <dt className="w-24 shrink-0 text-[0.52rem] uppercase leading-tight tracking-[0.16em] text-ink-soft @3xl:w-32 @3xl:text-[0.55rem] @3xl:tracking-[0.2em]">
                      {label}
                    </dt>
                    <dd className="min-w-0 flex-1">
                      <EditText
                        label={label}
                        value={character.proficiencies[key]}
                        onCommit={(next) =>
                          update((draft) => void (draft.proficiencies[key] = next))
                        }
                        className="w-full"
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>

          </div>
        </div>

        {/* rodapé do documento */}
        <footer className="flex items-center justify-between gap-4 border-t border-ink/20 pt-4">
          <span className="w-24" />
          <div className="flex items-center gap-3 text-center">
            <Image
              src="/armada-emblem.png"
              alt=""
              width={900}
              height={946}
              className="h-7 w-auto opacity-60 mix-blend-multiply [filter:grayscale(1)_contrast(1.25)]"
            />
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-ink">
                Armada Command
              </p>
              <p className="text-[0.5rem] uppercase tracking-[0.22em] text-ink-soft">
                For glory, for duty, for freedom.
              </p>
            </div>
          </div>
          <p className="w-24 text-right text-[0.55rem] uppercase tracking-[0.2em] text-ink/75">
            Page 1 of 4
          </p>
        </footer>
      </div>
    </PaperSurface>
  );
}

/* ── peças reutilizadas dentro da folha ─────────────────────── */

function Field({
  label,
  value,
  onCommit,
  accent = false,
}: {
  label: string;
  value: string;
  onCommit: (next: string) => void;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-24 shrink-0 text-[0.55rem] font-medium uppercase leading-tight tracking-[0.16em] text-ink-soft @3xl:w-36 @3xl:text-[0.58rem] @3xl:tracking-[0.2em]">
        {label}:
      </dt>
      <dd className="min-w-0 flex-1">
        <EditText
          label={label}
          value={value}
          onCommit={onCommit}
          className={`w-full text-[0.68rem] font-medium uppercase tracking-[0.1em] @3xl:text-[0.72rem] @3xl:tracking-[0.14em] ${
            accent ? "text-mil-dim" : "text-ink"
          }`}
        />
      </dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink/30">
      <h2 className="border-b border-ink/25 bg-ink/[0.07] px-3 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 text-ink">
      <p className="text-[0.5rem] font-medium uppercase tracking-[0.22em] text-ink-soft">{label}</p>
      <div className="flex flex-col items-center">{children}</div>
    </div>
  );
}

function Ratio({
  label,
  current,
  max,
  onCurrent,
  onMax,
}: {
  label: string;
  current: number;
  max: number;
  onCurrent: (next: number) => void;
  onMax: (next: number) => void;
}) {
  return (
    <span className="flex items-baseline justify-center gap-1 text-2xl font-bold leading-none">
      <EditNumber
        label={`${label} atual`}
        value={current}
        max={99}
        onCommit={onCurrent}
        className="w-auto"
      />
      <span className="text-ink-soft">/</span>
      <EditNumber label={`${label} máximo`} value={max} max={99} onCommit={onMax} className="w-auto" />
    </span>
  );
}

function ClassifiedStamp() {
  return (
    <div
      aria-hidden
      className="distress pointer-events-none absolute right-0 top-0 hidden rotate-[-8deg] select-none
                 border-[3px] border-double border-stamp px-3 py-1 text-center text-stamp opacity-85 @xl:block"
    >
      <p className="text-lg font-bold uppercase leading-none tracking-[0.06em]">Classified</p>
      <p className="mt-0.5 text-[0.5rem] font-medium uppercase tracking-[0.3em]">Eyes Only</p>
    </div>
  );
}
