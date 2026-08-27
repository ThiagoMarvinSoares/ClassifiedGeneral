"use client";

import { useState } from "react";

import { useCharacter } from "@/components/character-provider";
import { EditNumber, EditText } from "@/components/editable";
import { SectionPanel } from "@/components/shell/section-panel";
import { UseTacticDialog } from "@/components/war-tactics/use-tactic-dialog";
import { findAvailableSlotRow, tacticLevelOptions, type Tactic } from "@/lib/character";

/** As habilidades do Armada. Painel próprio: nem na ficha, nem na tabela. */
export function TacticsPanel() {
  const { character, update } = useCharacter();

  // o índice original acompanha o card: é por ele que a edição encontra a
  // tática dentro da lista completa
  const entries = character.tactics.map((tactic, index) => ({ tactic, index }));
  const basic = entries.filter((entry) => entry.tactic.atWill);
  const slotted = entries.filter((entry) => !entry.tactic.atWill);

  return (
    <SectionPanel
      title="Tactics"
      subtitle="Abilities the General can call on right now."
      footer={
        <button
          type="button"
          onClick={() =>
            update((draft) => {
              draft.tactics.push({
                id: `tactic-${draft.tactics.length + 1}-${draft.tactics.length}`,
                name: "New tactic",
                kind: "—",
                atWill: false,
                quote: "",
                description: "",
                rule: "",
                scaling: "",
                orders: [],
                units: [],
              });
            })
          }
          className="rounded-[2px] border border-line px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em]
                     text-bone-dim transition-colors hover:border-mil-dim hover:text-mil-bright"
        >
          + Add tactic
        </button>
      }
    >
      <div className="space-y-7">
        <TacticGroup
          title="Basic"
          note="Sem custo. Não gasta slot e não escala."
          entries={basic}
        />
        <TacticGroup
          title="War Tactics"
          note="Gastam um slot. Podem ser usadas em nível mais alto."
          entries={slotted}
        />
      </div>
    </SectionPanel>
  );
}

type Entry = { tactic: Tactic; index: number };

function TacticGroup({
  title,
  note,
  entries,
}: {
  title: string;
  note: string;
  entries: Entry[];
}) {
  if (entries.length === 0) return null;

  return (
    <section>
      <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-soft pb-2">
        <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-brass">{title}</h3>
        <p className="text-[0.55rem] uppercase tracking-[0.14em] text-bone-dim/60">{note}</p>
      </header>
      <ul className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {entries.map(({ tactic, index }) => (
          <TacticCard key={tactic.id} tactic={tactic} index={index} />
        ))}
      </ul>
    </section>
  );
}

function TacticCard({ tactic, index }: { tactic: Tactic; index: number }) {
  const { character, update } = useCharacter();
  const edit = (recipe: (draft: Tactic) => void) =>
    update((draft) => recipe(draft.tactics[index]));

  const [picking, setPicking] = useState(false);
  const options = tacticLevelOptions(character);
  const anyAvailable = options.some((option) => option.available > 0);

  /** Gasta um slot do nível escolhido, tirando da linha liberada mais baixa. */
  function deploy(tacticLevel: number) {
    update((draft) => {
      const row = findAvailableSlotRow(draft, tacticLevel);
      if (row !== null) draft.warTactics.spent[row][tacticLevel - 1] += 1;
    });
    setPicking(false);
  }

  return (
    <li className="flex flex-col rounded-[2px] border border-line-soft bg-black/25">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-4 py-3">
        <div className="min-w-0">
          <EditText
            label="Nome da tática"
            value={tactic.name}
            onCommit={(next) => edit((t) => void (t.name = next))}
            className="text-[0.95rem] font-bold uppercase tracking-[0.16em] text-bone"
          />
          <EditText
            label="Tipo da tática"
            value={tactic.kind}
            onCommit={(next) => edit((t) => void (t.kind = next))}
            className="mt-0.5 block text-[0.55rem] uppercase tracking-[0.2em] text-brass"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => edit((t) => void (t.atWill = !t.atWill))}
            aria-label={`${tactic.name}: ${
              tactic.atWill ? "habilidade básica, não gasta slot" : "gasta um slot de War Tactic"
            }. Clique para alternar`}
            className="touch-target rounded-[2px] border border-line px-2.5 py-1 text-[0.55rem]
                       uppercase tracking-[0.18em] text-brass transition-colors
                       hover:border-mil-dim hover:text-mil-bright"
          >
            {tactic.atWill ? "at will" : "slot"}
          </button>

          {!tactic.atWill && (
            <button
              type="button"
              onClick={() => setPicking(true)}
              disabled={!anyAvailable}
              title={anyAvailable ? undefined : "Nenhum slot disponível"}
              className="touch-target rounded-[2px] border border-mil-dim/70 bg-mil-dim/20 px-4 py-1.5
                         text-[0.55rem] uppercase tracking-[0.2em] text-bone transition-colors
                         hover:border-mil hover:bg-mil-dim/40 disabled:cursor-not-allowed
                         disabled:opacity-30 disabled:hover:border-mil-dim/70 disabled:hover:bg-mil-dim/20"
            >
              Use
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 py-3">
        {tactic.quote && (
          <EditText
            label="Fala da tática"
            value={tactic.quote}
            multiline
            onCommit={(next) => edit((t) => void (t.quote = next))}
            className="block w-full border-l-2 border-brass/50 pl-3 text-[0.7rem] italic leading-relaxed text-brass/90"
          />
        )}
        <EditText
          label="Descrição da tática"
          value={tactic.description}
          multiline
          onCommit={(next) => edit((t) => void (t.description = next))}
          className="block w-full text-[0.72rem] leading-relaxed text-bone-dim"
        />

        {tactic.rule && (
          <div>
            <p className="mb-1 text-[0.5rem] font-medium uppercase tracking-[0.24em] text-bone-dim/60">
              Balance rule
            </p>
            <EditText
              label="Regra de equilíbrio"
              value={tactic.rule}
              multiline
              onCommit={(next) => edit((t) => void (t.rule = next))}
              className="block w-full text-[0.68rem] leading-relaxed text-bone-dim/80"
            />
          </div>
        )}

        {tactic.orders.length > 0 && (
          <ul className="space-y-2 border-t border-line-soft pt-3">
            {tactic.orders.map((order, orderIndex) => (
              <li key={order.id} className="rounded-[2px] border border-line-soft/70 px-3 py-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <EditText
                    label="Nome da ordem"
                    value={order.name}
                    onCommit={(next) =>
                      edit((t) => void (t.orders[orderIndex].name = next))
                    }
                    className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-mil-bright"
                  />
                  <span className="flex items-baseline gap-1.5 text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/60">
                    Função
                    <EditText
                      label="Função da ordem"
                      value={order.role}
                      onCommit={(next) =>
                        edit((t) => void (t.orders[orderIndex].role = next))
                      }
                      className="text-bone-dim"
                    />
                  </span>
                </div>
                <EditText
                  label="Fala da ordem"
                  value={order.quote}
                  multiline
                  onCommit={(next) => edit((t) => void (t.orders[orderIndex].quote = next))}
                  className="mt-1 block w-full text-[0.65rem] italic leading-relaxed text-brass/80"
                />
                <EditText
                  label="Efeito da ordem"
                  value={order.effect}
                  multiline
                  onCommit={(next) => edit((t) => void (t.orders[orderIndex].effect = next))}
                  className="mt-1 block w-full text-[0.68rem] leading-relaxed text-bone-dim"
                />
                <button
                  type="button"
                  onClick={() => edit((t) => void t.orders.splice(orderIndex, 1))}
                  className="mt-1 text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/40 transition-colors hover:text-alert"
                >
                  − Remove order
                </button>
              </li>
            ))}
          </ul>
        )}

        {!tactic.atWill && (
          <div>
            <p className="mb-1 text-[0.5rem] font-medium uppercase tracking-[0.24em] text-brass/70">
              Potência
            </p>
            <EditText
              label="Escalonamento por slot extra"
              value={tactic.scaling}
              multiline
              placeholder="Sem escalonamento"
              onCommit={(next) => edit((t) => void (t.scaling = next))}
              className="block w-full text-[0.68rem] leading-relaxed text-bone-dim/80"
            />
          </div>
        )}

        {tactic.units.length > 0 && (
          <div className="border-t border-line-soft pt-3">
            <p className="mb-2 text-[0.5rem] font-medium uppercase tracking-[0.24em] text-bone-dim/60">
              Units available
            </p>
            <ul className="space-y-2">
              {tactic.units.map((unit, unitIndex) => {
                const locked = unit.level > character.level;
                return (
                  <li
                    key={unit.id}
                    className={`rounded-[2px] border px-3 py-2 ${
                      locked ? "border-line-soft/60 opacity-45" : "border-line-soft"
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="flex items-baseline gap-2">
                        <EditNumber
                          label={`Nível que libera ${unit.name}`}
                          value={unit.level}
                          min={0}
                          onCommit={(next) =>
                            edit((t) => void (t.units[unitIndex].level = next))
                          }
                          format={(value) => (value === 0 ? "—" : `LV${value}`)}
                          className="text-[0.5rem] uppercase tracking-[0.18em] text-brass"
                        />
                        <EditText
                          label="Nome da tropa"
                          value={unit.name}
                          onCommit={(next) => edit((t) => void (t.units[unitIndex].name = next))}
                          className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-bone"
                        />
                      </span>
                      {locked && (
                        <span className="text-[0.48rem] uppercase tracking-[0.2em] text-bone-dim/70">
                          Locked
                        </span>
                      )}
                    </div>
                    {(unit.ac || unit.hp) && (
                      <dl className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-[2px] border border-line-soft bg-line-soft">
                        {([["AC", "ac"], ["HP", "hp"]] as const).map(([rotulo, chave]) => (
                          <div key={chave} className="flex items-baseline gap-2 bg-black/40 px-2 py-1.5">
                            <dt className="text-[0.5rem] font-medium uppercase tracking-[0.2em] text-bone-dim/60">
                              {rotulo}
                            </dt>
                            <dd className="min-w-0 flex-1">
                              <EditText
                                label={`${rotulo} da tropa`}
                                value={unit[chave]}
                                placeholder="—"
                                onCommit={(next) =>
                                  edit((t) => void (t.units[unitIndex][chave] = next))
                                }
                                className="w-full text-[0.65rem] text-bone"
                              />
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <EditText
                      label="Ação da tropa"
                      value={unit.action}
                      onCommit={(next) => edit((t) => void (t.units[unitIndex].action = next))}
                      className="mt-1 block text-[0.6rem] font-medium uppercase tracking-[0.14em] text-mil-bright"
                    />
                    <EditText
                      label="Efeito da tropa"
                      value={unit.description}
                      multiline
                      onCommit={(next) =>
                        edit((t) => void (t.units[unitIndex].description = next))
                      }
                      className="mt-1 block w-full text-[0.68rem] leading-relaxed text-bone-dim"
                    />
                    <button
                      type="button"
                      onClick={() => edit((t) => void t.units.splice(unitIndex, 1))}
                      className="mt-1 text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/40 transition-colors hover:text-alert"
                    >
                      − Remove unit
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-2">
          <button
            type="button"
            onClick={() =>
              edit((t) =>
                void t.orders.push({
                  id: `order-${t.orders.length}-${Date.now()}`,
                  name: "New order",
                  quote: "",
                  effect: "",
                  role: "",
                }),
              )
            }
            className="text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/50 transition-colors hover:text-mil-bright"
          >
            + Add order
          </button>
          <button
            type="button"
            onClick={() =>
              edit((t) =>
                void t.units.push({
                  id: `unit-${t.units.length}-${Date.now()}`,
                  level: 0,
                  name: "New unit",
                  ac: "",
                  hp: "",
                  action: "",
                  description: "",
                }),
              )
            }
            className="text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/50 transition-colors hover:text-mil-bright"
          >
            + Add unit
          </button>
          {!tactic.quote && (
            <button
              type="button"
              onClick={() => edit((t) => void (t.quote = "—"))}
              className="text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/50 transition-colors hover:text-mil-bright"
            >
              + Quote
            </button>
          )}
          {!tactic.rule && (
            <button
              type="button"
              onClick={() => edit((t) => void (t.rule = "—"))}
              className="text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/50 transition-colors hover:text-mil-bright"
            >
              + Balance rule
            </button>
          )}

          <button
            type="button"
            onClick={() => update((draft) => void draft.tactics.splice(index, 1))}
            className="text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/40 transition-colors hover:text-alert"
          >
            − Remove tactic
          </button>
        </div>
      </div>

      <UseTacticDialog
        tacticName={tactic.name}
        options={options}
        open={picking}
        onPick={deploy}
        onClose={() => setPicking(false)}
      />
    </li>
  );
}
