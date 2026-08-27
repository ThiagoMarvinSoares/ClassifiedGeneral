"use client";

import { useCharacter } from "@/components/character-provider";
import { EditNumber, EditText } from "@/components/editable";
import { SectionPanel } from "@/components/shell/section-panel";

/** As features de classe do ARMADA, por nível. */
export function FeaturesPanel() {
  const { character, update } = useCharacter();

  return (
    <SectionPanel title="Class Features" subtitle="ARMADA — o que cada nível libera.">
      <ul className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {character.features.map((feature, index) => {
          const locked = feature.level > character.level;
          const edit = (recipe: (draft: typeof feature) => void) =>
            update((draft) => recipe(draft.features[index]));

          return (
            <li
              key={feature.id}
              className={`rounded-[2px] border bg-black/25 ${
                locked ? "border-line-soft/60 opacity-45" : "border-line-soft"
              }`}
            >
              <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line-soft px-4 py-3">
                <EditNumber
                  label={`Nível de ${feature.name}`}
                  value={feature.level}
                  min={1}
                  format={(value) => `LV${value}`}
                  onCommit={(next) => edit((f) => void (f.level = next))}
                  className="text-[0.55rem] uppercase tracking-[0.2em] text-brass"
                />
                <EditText
                  label="Nome da feature"
                  value={feature.name}
                  onCommit={(next) => edit((f) => void (f.name = next))}
                  className="text-[0.9rem] font-bold uppercase tracking-[0.16em] text-bone"
                />
                {feature.kind && (
                  <EditText
                    label="Tipo da feature"
                    value={feature.kind}
                    onCommit={(next) => edit((f) => void (f.kind = next))}
                    className="text-[0.55rem] uppercase tracking-[0.18em] text-bone-dim/70"
                  />
                )}
                {locked && (
                  <span className="ml-auto text-[0.48rem] uppercase tracking-[0.2em] text-bone-dim/70">
                    Locked
                  </span>
                )}
              </header>

              <div className="space-y-3 px-4 py-3">
                {feature.description.split("\n\n").map((paragrafo, i) => (
                  <EditText
                    key={i}
                    label={`Parágrafo ${i + 1} de ${feature.name}`}
                    value={paragrafo}
                    multiline
                    onCommit={(next) =>
                      edit((f) => {
                        const partes = f.description.split("\n\n");
                        partes[i] = next;
                        f.description = partes.filter(Boolean).join("\n\n");
                      })
                    }
                    className="block w-full text-[0.72rem] leading-relaxed text-bone-dim"
                  />
                ))}

                {feature.units.length > 0 && (
                  <ul className="space-y-2 border-t border-line-soft pt-3">
                    {feature.units.map((unit, unitIndex) => (
                      <li key={unit.id} className="rounded-[2px] border border-line-soft/70 px-3 py-2">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <EditNumber
                            label={`Nível que libera ${unit.name}`}
                            value={unit.level}
                            min={0}
                            format={(value) => (value === 0 ? "—" : `LV${value}`)}
                            onCommit={(next) =>
                              edit((f) => void (f.units[unitIndex].level = next))
                            }
                            className="text-[0.5rem] uppercase tracking-[0.18em] text-brass"
                          />
                          <EditText
                            label="Nome"
                            value={unit.name}
                            onCommit={(next) => edit((f) => void (f.units[unitIndex].name = next))}
                            className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-bone"
                          />
                          <span className="ml-auto flex items-baseline gap-3 text-[0.6rem] text-bone-dim">
                            <span className="flex items-baseline gap-1">
                              <span className="text-[0.48rem] uppercase tracking-[0.18em] text-bone-dim/60">
                                HP
                              </span>
                              <EditText
                                label="HP"
                                value={unit.hp}
                                placeholder="—"
                                onCommit={(next) => edit((f) => void (f.units[unitIndex].hp = next))}
                              />
                            </span>
                            <EditText
                              label="Velocidade"
                              value={unit.action}
                              placeholder="—"
                              onCommit={(next) =>
                                edit((f) => void (f.units[unitIndex].action = next))
                              }
                              className="text-mil-bright"
                            />
                          </span>
                        </div>
                        <EditText
                          label="Descrição"
                          value={unit.description}
                          multiline
                          onCommit={(next) =>
                            edit((f) => void (f.units[unitIndex].description = next))
                          }
                          className="mt-1 block w-full text-[0.68rem] leading-relaxed text-bone-dim"
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </SectionPanel>
  );
}
