"use client";

import Link from "next/link";

import { useCharacter } from "@/components/character-provider";
import { SectionPanel } from "@/components/shell/section-panel";
import {
  isRowUnlocked,
  MAX_CHARACTER_LEVEL,
  SLOT_TABLE,
  slotCell,
  unlockedSlots,
} from "@/lib/character";

const COLUMNS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

export function WarTacticsPanel() {
  const { character, update } = useCharacter();
  const { available, total, spent } = unlockedSlots(character);
  const unlockedRows = Math.min(character.level, MAX_CHARACTER_LEVEL);

  /** Gasta ou devolve um slot de uma célula específica da tabela. */
  function setSpent(row: number, column: number, next: number) {
    update((draft) => {
      draft.warTactics.spent[row][column] = Math.max(0, next);
    });
  }

  return (
    <SectionPanel
      title="War Tactics Slots"
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
          <p className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.14em] text-bone-dim/70">
            <Star filled className="h-3 w-3 text-brass" />
            Higher level tactics are more powerful but limited in use.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={spent === 0}
              onClick={() =>
                update((draft) => {
                  draft.warTactics.spent = draft.warTactics.spent.map((row) => row.map(() => 0));
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
        Levels 1–{unlockedRows} unlocked · click a star to expend a slot, click again to recover it
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-center">
          <thead>
            <tr className="text-[0.6rem] uppercase tracking-[0.18em] text-brass">
              <th className="border border-line-soft px-2 py-1.5 font-medium">Level</th>
              {COLUMNS.map((column) => (
                <th key={column} className="border border-line-soft px-1 py-1.5 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_TABLE.map((row, rowIndex) => {
              const level = rowIndex + 1;
              const unlocked = isRowUnlocked(character, rowIndex);
              const isCurrent = level === unlockedRows;
              const locked = !unlocked;

              return (
                <tr
                  key={level}
                  className={
                    isCurrent
                      ? "bg-mil-dim/15 outline outline-1 -outline-offset-1 outline-mil-dim/60"
                      : locked
                        ? "opacity-30"
                        : "bg-white/[0.02]"
                  }
                >
                  <th
                    scope="row"
                    className={`border border-line-soft px-2 py-1 text-[0.7rem] font-medium tabular-nums ${
                      isCurrent ? "text-mil-bright" : unlocked ? "text-bone" : "text-bone-dim"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      {level}
                      {locked && <LockIcon className="h-2.5 w-2.5" />}
                    </span>
                  </th>

                  {row.map((count, columnIndex) => (
                    <td key={columnIndex} className="border border-line-soft px-1 py-1 align-middle">
                      {count === 0 ? (
                        <span className="text-bone-dim/40">—</span>
                      ) : unlocked ? (
                        <ActiveCell
                          rowLevel={level}
                          tacticLevel={columnIndex + 1}
                          {...slotCell(character, rowIndex, columnIndex)}
                          onChange={(next) => setSpent(rowIndex, columnIndex, next)}
                        />
                      ) : (
                        <ReferenceCell count={count} />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

/** Célula da linha do personagem: cada estrela é um slot clicável. */
function ActiveCell({
  rowLevel,
  tacticLevel,
  total,
  spent,
  available,
  onChange,
}: {
  rowLevel: number;
  tacticLevel: number;
  total: number;
  spent: number;
  available: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.7rem] font-medium tabular-nums text-mil-bright">
        {available}
        <span className="text-bone-dim/50">/{total}</span>
      </span>
      <span className="flex justify-center gap-px">
        {Array.from({ length: total }, (_, index) => {
          const filled = index < available;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onChange(filled ? spent + 1 : spent - 1)}
              aria-label={`Nível ${rowLevel}, tática de ${tacticLevel}º nível, slot ${index + 1} de ${total}: ${
                filled ? "disponível — clique para gastar" : "gasto — clique para recuperar"
              }`}
              className="slot-star transition-transform hover:scale-125 focus-visible:outline-none
                         focus-visible:ring-1 focus-visible:ring-mil-bright"
            >
              <Star
                filled={filled}
                className={`h-3 w-3 ${filled ? "text-brass" : "text-bone-dim/35"}`}
              />
            </button>
          );
        })}
      </span>
    </div>
  );
}

function ReferenceCell({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.65rem] tabular-nums text-brass/80">{count}</span>
      <span className="flex justify-center gap-px">
        {Array.from({ length: count }, (_, index) => (
          <Star key={index} filled className="h-2 w-2 text-brass/70" />
        ))}
      </span>
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

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M6 10.5V7.5a6 6 0 1112 0v3h1.5v11h-15v-11zm3 0h6V7.5a3 3 0 10-6 0z" />
    </svg>
  );
}
