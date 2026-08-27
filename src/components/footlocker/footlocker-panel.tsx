"use client";

import { useCharacter } from "@/components/character-provider";
import { EditNumber, EditText } from "@/components/editable";
import { SectionPanel } from "@/components/shell/section-panel";

const COINS = [
  ["gp", "Gold"],
  ["sp", "Silver"],
  ["cp", "Copper"],
] as const;

export function FootlockerPanel() {
  const { character, update } = useCharacter();
  const { coins, items } = character.inventory;
  const carried = items.filter((item) => item.equipped).length;

  return (
    <SectionPanel
      title="Footlocker"
      subtitle="Equipamento pessoal, suprimentos e fundos."
      trailing={
        <div className="text-right">
          <p className="text-[0.55rem] uppercase tracking-[0.22em] text-bone-dim/70">Carried</p>
          <p className="text-xl font-bold tabular-nums text-mil-bright sm:text-2xl">
            {carried} <span className="text-bone-dim/50">/</span> {items.length}
          </p>
        </div>
      }
      footer={
        <button
          type="button"
          onClick={() =>
            update((draft) => {
              draft.inventory.items.push({
                id: `item-${draft.inventory.items.length}-${Date.now()}`,
                name: "New item",
                quantity: 1,
                notes: "",
                equipped: false,
              });
            })
          }
          data-sfx="rummage"
          className="rounded-[2px] border border-line px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em]
                     text-bone-dim transition-colors hover:border-mil-dim hover:text-mil-bright"
        >
          + Add item
        </button>
      }
    >
      {/* fundos */}
      <dl className="mb-5 grid grid-cols-3 gap-px overflow-hidden rounded-[2px] border border-line bg-line">
        {COINS.map(([key, label]) => (
          <div key={key} className="flex flex-col items-center gap-1 bg-black/40 px-3 py-3">
            <dt className="text-[0.5rem] font-medium uppercase tracking-[0.22em] text-bone-dim/60">
              {label}
            </dt>
            <dd>
              <EditNumber
                label={label}
                value={coins[key]}
                max={999999}
                format={(value) => value.toLocaleString("en-US")}
                onCommit={(next) => update((draft) => void (draft.inventory.coins[key] = next))}
                className="text-lg font-bold tabular-nums text-brass"
              />
            </dd>
          </div>
        ))}
      </dl>

      {items.length === 0 ? (
        <p className="py-10 text-center font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone-dim/50">
          &gt; footlocker empty
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, index) => {
            const edit = (recipe: (draft: typeof item) => void) =>
              update((draft) => recipe(draft.inventory.items[index]));

            return (
              <li
                key={item.id}
                className={`rounded-[2px] border px-3 py-2.5 transition-colors ${
                  item.equipped ? "border-mil-dim/60 bg-mil-dim/10" : "border-line-soft bg-black/25"
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => edit((i) => void (i.equipped = !i.equipped))}
                    data-sfx="clank"
                    aria-label={`${item.name}: ${
                      item.equipped ? "em uso" : "guardado"
                    }. Clique para alternar`}
                    className="touch-target rounded-[2px] border border-line px-2 py-0.5 text-[0.48rem]
                               uppercase tracking-[0.18em] transition-colors hover:border-mil-dim
                               hover:text-mil-bright"
                  >
                    <span className={item.equipped ? "text-mil-bright" : "text-bone-dim/60"}>
                      {item.equipped ? "carried" : "stowed"}
                    </span>
                  </button>

                  <EditNumber
                    label={`Quantidade de ${item.name}`}
                    value={item.quantity}
                    max={9999}
                    format={(value) => `${value}×`}
                    onCommit={(next) => edit((i) => void (i.quantity = next))}
                    className="text-[0.7rem] tabular-nums text-brass"
                  />
                  <EditText
                    label="Nome do item"
                    value={item.name}
                    onCommit={(next) => edit((i) => void (i.name = next))}
                    className="text-[0.78rem] font-medium uppercase tracking-[0.12em] text-bone"
                  />

                  <button
                    type="button"
                    onClick={() => update((draft) => void draft.inventory.items.splice(index, 1))}
                    data-sfx="clank"
                    className="ml-auto text-[0.5rem] uppercase tracking-[0.2em] text-bone-dim/40
                               transition-colors hover:text-alert"
                  >
                    − Remove
                  </button>
                </div>

                <EditText
                  label={`Notas de ${item.name}`}
                  value={item.notes}
                  placeholder="Sem notas"
                  multiline
                  onCommit={(next) => edit((i) => void (i.notes = next))}
                  className="mt-1 block w-full text-[0.68rem] leading-relaxed text-bone-dim"
                />
              </li>
            );
          })}
        </ul>
      )}
    </SectionPanel>
  );
}
