"use client";

import { useEffect, useRef } from "react";

import type { TacticLevelOption } from "@/lib/character";

/**
 * Escolha do nível ao usar uma tática. Usa <dialog> nativo: foco preso,
 * Esc para fechar e backdrop sem precisar de biblioteca.
 */
export function UseTacticDialog({
  tacticName,
  options,
  open,
  onPick,
  onClose,
}: {
  tacticName: string;
  options: TacticLevelOption[];
  open: boolean;
  onPick: (tacticLevel: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // clique no backdrop fecha; clique no conteúdo não
        if (event.target === ref.current) onClose();
      }}
      aria-label={`Usar ${tacticName}`}
      // `m-auto` recoloca a centralização que o preflight do Tailwind zera
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-[3px] border border-line bg-panel-2 p-0
                 text-bone shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)] backdrop:bg-black/70"
    >
      <div className="border-b border-line px-5 py-4">
        <p className="text-[0.55rem] uppercase tracking-[0.24em] text-bone-dim/70">Deploy tactic</p>
        <h2 className="mt-1 text-lg font-bold uppercase tracking-[0.18em] text-bone">{tacticName}</h2>
        <p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-bone-dim/80">
          At which War Tactic level?
        </p>
      </div>

      <ul className="max-h-[52vh] space-y-1 overflow-y-auto px-3 py-3">
        {options.map((option) => (
          <li key={option.tacticLevel}>
            <LevelChoice option={option} onPick={onPick} />
          </li>
        ))}
      </ul>

      <div className="flex justify-end border-t border-line px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-[2px] border border-line px-4 py-2 text-[0.58rem] uppercase tracking-[0.2em]
                     text-bone-dim transition-colors hover:border-alert/60 hover:text-alert"
        >
          Cancel
        </button>
      </div>
    </dialog>
  );
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];

function LevelChoice({
  option,
  onPick,
}: {
  option: TacticLevelOption;
  onPick: (tacticLevel: number) => void;
}) {
  const { tacticLevel, total, available, requiredLevel } = option;
  const locked = total === 0;
  const empty = !locked && available === 0;
  const disabled = locked || empty;

  return (
    <button
      type="button"
      disabled={disabled}
      data-sfx={disabled ? "none" : "spend"}
      onClick={() => onPick(tacticLevel)}
      className={`flex w-full items-center gap-3 rounded-[2px] border px-3 py-2.5 text-left transition-colors ${
        disabled
          ? "cursor-not-allowed border-line-soft text-bone-dim/35"
          : "border-line text-bone hover:border-mil-dim hover:bg-mil-dim/20"
      }`}
    >
      <span className="w-10 shrink-0 text-[0.72rem] font-bold uppercase tracking-[0.14em]">
        {ORDINALS[tacticLevel - 1]}
      </span>

      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        {locked ? (
          <span className="text-[0.6rem] uppercase tracking-[0.16em]">
            Locked — requires level {requiredLevel ?? "—"}
          </span>
        ) : (
          Array.from({ length: total }, (_, index) => (
            <Star
              key={index}
              filled={index < available}
              className={`h-3.5 w-3.5 ${index < available ? "text-brass" : "text-bone-dim/30"}`}
            />
          ))
        )}
      </span>

      <span className="shrink-0 text-[0.68rem] tabular-nums">
        {locked ? (
          <LockIcon className="h-3.5 w-3.5" />
        ) : (
          <>
            <span className={available > 0 ? "text-mil-bright" : "text-alert/70"}>{available}</span>
            <span className="text-bone-dim/50">/{total}</span>
          </>
        )}
      </span>
    </button>
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
