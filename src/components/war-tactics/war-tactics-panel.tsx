"use client";

import Link from "next/link";

import { useCharacter } from "@/components/character-provider";
import { SectionPanel } from "@/components/shell/section-panel";
import {
  levelRequiredFor,
  MAX_TACTIC_LEVEL,
  SLOT_TABLE,
  slotCell,
  unlockedSlots,
} from "@/lib/character";

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

export function WarTacticsPanel() {
  const { character, update } = useCharacter();
  const { available, total, spent } = unlockedSlots(character);

  return (
    <SectionPanel
      title="Star Slots"
      subtitle="Use your tactical expertise to command the battlefield."
      trailing={
        <div className="text-right">
          <p className="text-[0.55rem] uppercase tracking-[0.22em] text-bone-dim/70">
            Total available
          </p>
          <p className="text-xl font-bold tabular-nums text-mil-bright sm:text-2xl">
            {available} <span className="text-bone-dim/50">/</span> {total}
          </p>
        </div>
      }
      footer={
        <>
          <p className="text-[0.58rem] uppercase tracking-[0.14em] text-bone-dim/70">
            Todos os star slots são recuperados numa long rest.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={spent === 0}
              onClick={() =>
                update((draft) => {
                  draft.warTactics.spent = draft.warTactics.spent.map(() => 0);
                })
              }
              className="rounded-[2px] border border-line px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em]
                         text-bone-dim transition-colors hover:border-mil-dim hover:text-mil-bright
                         disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line
                         disabled:hover:text-bone-dim"
            >
              Long rest
            </button>
            <Link
              href="/war-tactics/database"
              className="group flex items-center gap-3 rounded-[2px] border border-mil-dim/70 bg-mil-dim/20 px-4 py-2
                         text-[0.58rem] uppercase tracking-[0.2em] text-bone transition-colors
                         hover:border-mil hover:bg-mil-dim/40"
            >
              Tactics database
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                ›
              </span>
            </Link>
          </div>
        </>
      }
    >
      <p className="mb-3 text-[0.6rem] uppercase tracking-[0.16em] text-bone-dim/60">
        Level {character.level} · click a star to expend a slot, click again to recover it
      </p>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: MAX_TACTIC_LEVEL }, (_, index) => (
          <li key={index}>
            <StarSlot character={character} starLevel={index + 1} onChange={update} />
          </li>
        ))}
      </ul>

      <details className="group/table mt-5">
        <summary
          className="flex cursor-pointer list-none items-center gap-2 border-t border-line-soft pt-3
                     text-[0.55rem] uppercase tracking-[0.22em] text-bone-dim/60 transition-colors
                     hover:text-bone [&::-webkit-details-marker]:hidden"
        >
          <span aria-hidden className="text-brass transition-transform group-open/table:rotate-90">
            ▶
          </span>
          Progression table
        </summary>
        <ProgressionTable level={character.level} />
      </details>
    </SectionPanel>
  );
}

/** Uma célula do quadro de Star Slots: cada estrela é um slot clicável. */
function StarSlot({
  character,
  starLevel,
  onChange,
}: {
  character: Parameters<typeof slotCell>[0];
  starLevel: number;
  onChange: (recipe: (draft: Parameters<typeof slotCell>[0]) => void) => void;
}) {
  const { total, spent, available } = slotCell(character, starLevel);
  const locked = total === 0;
  const required = levelRequiredFor(starLevel);

  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-1.5 rounded-[2px] border px-3 py-3 ${
        locked ? "border-line-soft/60 opacity-40" : "border-line bg-white/[0.02]"
      }`}
    >
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-brass">
        {starLevel}★
      </p>

      {locked ? (
        <p className="text-[0.52rem] uppercase tracking-[0.16em] text-bone-dim">
          Requires level {required ?? "—"}
        </p>
      ) : (
        <>
          <span className="flex flex-wrap justify-center gap-px">
            {Array.from({ length: total }, (_, index) => {
              const filled = index < available;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    onChange((draft) => {
                      draft.warTactics.spent[starLevel - 1] = Math.max(
                        0,
                        filled ? spent + 1 : spent - 1,
                      );
                    })
                  }
                  aria-label={`Slot ${index + 1} de ${total} do ${starLevel}º nível: ${
                    filled ? "disponível — clique para gastar" : "gasto — clique para recuperar"
                  }`}
                  className="slot-star transition-transform hover:scale-125 focus-visible:outline-none
                             focus-visible:ring-1 focus-visible:ring-mil-bright"
                >
                  <Star
                    filled={filled}
                    className={`h-4 w-4 ${filled ? "text-brass" : "text-bone-dim/30"}`}
                  />
                </button>
              );
            })}
          </span>
          <p className="text-[0.72rem] font-medium tabular-nums text-mil-bright">
            {available}
            <span className="text-bone-dim/50">/{total}</span>
          </p>
        </>
      )}
    </div>
  );
}

/** A tabela de progressão, como referência — o documento não a traz na ficha. */
function ProgressionTable({ level }: { level: number }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-center text-[0.6rem]">
        <thead>
          <tr className="uppercase tracking-[0.16em] text-brass/80">
            <th className="border border-line-soft px-2 py-1 font-medium">Lv</th>
            {ORDINALS.map((column) => (
              <th key={column} className="border border-line-soft px-1 py-1 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOT_TABLE.map((row, index) => {
            const current = index + 1 === Math.min(level, SLOT_TABLE.length);
            return (
              <tr
                key={index}
                className={
                  current
                    ? "bg-mil-dim/20 text-mil-bright outline outline-1 -outline-offset-1 outline-mil-dim/60"
                    : "text-bone-dim/50"
                }
              >
                <th scope="row" className="border border-line-soft px-2 py-1 tabular-nums">
                  {index + 1}
                </th>
                {row.map((count, column) => (
                  <td key={column} className="border border-line-soft px-1 py-1 tabular-nums">
                    {count || "—"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Star({ filled, ...props }: { filled: boolean } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2.2}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 1.6l3.1 6.6 7.1.7-5.4 4.8 1.6 7-6.4-3.6-6.4 3.6 1.6-7L1.8 8.9l7.1-.7z" />
    </svg>
  );
}
