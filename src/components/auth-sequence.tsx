"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   Roteiro do boot. Cada passo ocupa uma fatia da linha do tempo;
   o que aparece na tela é derivado do tempo decorrido, então
   "pular" é só saltar o relógio para o fim.
   ───────────────────────────────────────────────────────────── */

type Step =
  | { kind: "task"; label: string; status: string; ms: number }
  | { kind: "record"; ms: number }
  | { kind: "decrypt"; ms: number }
  | { kind: "grant"; ms: number };

const SCRIPT: Step[] = [
  { kind: "task", label: "ESTABLISHING SECURE CHANNEL", status: "LINKED", ms: 420 },
  { kind: "task", label: "HANDSHAKE — AES-256 / DoD-NET", status: "OK", ms: 380 },
  { kind: "task", label: "VERIFYING CREDENTIALS", status: "OK", ms: 560 },
  { kind: "task", label: "BIOMETRIC CROSS-REFERENCE", status: "MATCH", ms: 480 },
  { kind: "record", ms: 820 },
  { kind: "decrypt", ms: 900 },
  { kind: "grant", ms: 1100 },
];

const RECORD: Array<[string, string]> = [
  ["SUBJECT", "ARMADA"],
  ["RANK", "GENERAL"],
  ["CLEARANCE", "LV4 — GENERAL"],
  ["PROGRAM", "ARMADA"],
  ["STATUS", "ACTIVE DUTY"],
];

const LEAD_IN = 220;
const TIMELINE = SCRIPT.reduce<Array<Step & { start: number }>>((acc, step) => {
  const previous = acc.at(-1);
  const start = previous ? previous.start + previous.ms : LEAD_IN;
  return [...acc, { ...step, start }];
}, []);
const TOTAL = TIMELINE.at(-1)!.start + TIMELINE.at(-1)!.ms;

export function AuthSequence() {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);
  const skipped = useRef(false);
  const done = useRef(false);

  const skip = useCallback(() => {
    skipped.current = true;
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) skipped.current = true;

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const value = skipped.current ? TOTAL : Math.min(TOTAL, now - started);
      setElapsed(value);
      if (value < TOTAL) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!done.current) {
        done.current = true;
        // replace: o botão voltar não deve reproduzir a sequência de novo
        setTimeout(() => router.replace("/dossier"), skipped.current ? 450 : 750);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [router]);

  useEffect(() => {
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [skip]);

  const granted = elapsed >= TIMELINE.at(-1)!.start;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-3 py-12 sm:px-6">
      <Backdrop granted={granted} />

      <h1 className="sr-only">Sequência de autenticação</h1>

      <div className="@container relative w-full max-w-[760px]">
        <div className="animate-flicker border border-line bg-panel/80 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.95)] motion-reduce:animate-none">
          {/* barra do terminal */}
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-bone-dim/70">
            <span>DoD // Military Intelligence</span>
            <span className="hidden sm:inline">Secure Terminal · CH.04</span>
          </header>

          <div
            aria-live="polite"
            className="space-y-2 px-4 py-6 font-mono text-[clamp(0.58rem,2.4cqw,0.85rem)] leading-relaxed tracking-[0.06em] sm:px-8 sm:py-8 sm:tracking-[0.12em]"
          >
            {TIMELINE.map((step) => {
              const progress = clamp((elapsed - step.start) / step.ms);
              if (elapsed < step.start) return null;

              switch (step.kind) {
                case "task":
                  return <TaskLine key={step.label} step={step} progress={progress} />;
                case "record":
                  return <RecordBlock key="record" progress={progress} />;
                case "decrypt":
                  return <DecryptBar key="decrypt" progress={progress} />;
                case "grant":
                  return <Granted key="grant" />;
              }
            })}
          </div>
        </div>

        <p className="mt-5 text-center font-mono text-[0.6rem] uppercase tracking-[0.28em] text-bone-dim/40">
          {granted ? "rerouting to dossier" : "press any key to skip"}
        </p>
      </div>
    </main>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

/** Digita o rótulo na primeira metade do passo e crava o status no fim. */
function TaskLine({
  step,
  progress,
}: {
  step: Extract<Step, { kind: "task" }>;
  progress: number;
}) {
  const chars = Math.ceil(step.label.length * clamp(progress * 2.2));
  const settled = progress >= 0.75;

  return (
    <p className="flex items-baseline gap-3 text-bone-dim">
      <span className="text-mil-dim">&gt;</span>
      <span className="whitespace-pre">{step.label.slice(0, chars)}</span>
      {!settled && <Caret />}
      <span className="min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-bone-dim/20" />
      <span className={`whitespace-nowrap ${settled ? "text-mil" : "text-bone-dim/30"}`}>
        [ {settled ? step.status : "····"} ]
      </span>
    </p>
  );
}

function RecordBlock({ progress }: { progress: number }) {
  const shown = Math.ceil(RECORD.length * clamp(progress / 0.85));

  return (
    <div className="pt-2">
      <p className="flex items-baseline gap-3 text-mil">
        <span className="text-mil-dim">&gt;</span>
        <span>IDENTITY CONFIRMED</span>
      </p>
      <dl className="mt-2 ml-5 border-l border-line-soft pl-4 sm:ml-6">
        {RECORD.slice(0, shown).map(([term, value]) => (
          <div key={term} className="flex items-baseline gap-3">
            <dt className="whitespace-nowrap text-bone-dim/70">{term}</dt>
            <dd className="min-w-4 flex-1 -translate-y-[0.3em] border-b border-dotted border-bone-dim/20" />
            <dd className="whitespace-nowrap text-bone">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const BAR_CELLS = 28;

function DecryptBar({ progress }: { progress: number }) {
  const filled = Math.round(BAR_CELLS * progress);

  return (
    <div className="pt-2">
      <p className="flex items-baseline gap-3 text-bone-dim">
        <span className="text-mil-dim">&gt;</span>
        <span>DECRYPTING DOSSIER</span>
      </p>
      <p className="mt-2 ml-5 flex items-center gap-3 sm:ml-6">
        <span className="flex min-w-0 shrink gap-[2px]" aria-hidden>
          {Array.from({ length: BAR_CELLS }, (_, i) => (
            <span
              key={i}
              className={`h-3 w-[6px] ${i < filled ? "bg-mil" : "bg-line"}`}
            />
          ))}
        </span>
        <span className="tabular-nums text-mil">{Math.round(progress * 100)}%</span>
      </p>
    </div>
  );
}

function Granted() {
  return (
    <div className="relative pt-6 text-center">
      <p
        className="font-display text-[clamp(1.6rem,7cqw,2.6rem)] font-bold uppercase text-mil-bright
                   [animation:grant-in_.6s_cubic-bezier(.2,.9,.3,1)_both]
                   [text-shadow:0_0_40px_rgba(169,212,136,0.45)]"
      >
        Access Granted
      </p>
      <p className="mt-2 text-[0.65rem] uppercase tracking-[0.3em] text-mil-dim">
        clearance level: general
      </p>
      <Image
        src="/armada-emblem.png"
        alt=""
        width={900}
        height={946}
        className="mx-auto mt-5 h-24 w-auto opacity-90 drop-shadow-[0_0_28px_rgba(169,212,136,0.35)]"
      />
    </div>
  );
}

function Caret() {
  return (
    <span className="animate-caret text-mil-bright motion-reduce:animate-none" aria-hidden>
      _
    </span>
  );
}

function Backdrop({ granted }: { granted: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "var(--color-void)",
          backgroundImage:
            "radial-gradient(80% 60% at 50% 40%, rgba(111,154,82,0.07), transparent 65%), linear-gradient(180deg, #080b09, #030403)",
        }}
      />
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-25" />
      <div
        aria-hidden
        className="grain-layer pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
          granted ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(60% 45% at 50% 55%, rgba(169,212,136,0.16), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.95)]"
      />
    </>
  );
}
