"use client";

import { useEffect, useRef, useState } from "react";

import { PROSE } from "@/components/long-form";

/**
 * Caracteres por segundo. Leitura confortável fica perto de 20 c/s, então este
 * ritmo vai bem à frente de quem lê — dá para acompanhar sem esperar, e ainda
 * se vê a página sendo escrita. Quem não quiser esperar, pula.
 */
const SPEED = 220;

/**
 * Revela o capítulo como se estivesse sendo datilografado. A linha do tempo
 * inteira sai de um `elapsed` só num rAF — assim "pular" é cravar o relógio no
 * fim, sem precisar cancelar um temporizador por parágrafo.
 */
export function useTypewriter(blocks: string[], active: boolean) {
  const total = blocks.reduce((sum, block) => sum + block.length, 0);

  // O progresso é guardado junto do estado que o gerou. Assim reabrir o
  // capítulo zera a datilografia na própria renderização, sem um efeito que
  // corrija o valor depois — que causaria um piscar do texto pronto.
  const [session, setSession] = useState({ active, revealed: 0 });
  if (session.active !== active) setSession({ active, revealed: 0 });
  const revealed = session.active === active ? session.revealed : 0;

  const skipped = useRef(false);

  useEffect(() => {
    if (!active) return;

    // quem pediu menos movimento recebe o texto pronto, como se tivesse pulado
    skipped.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const value = skipped.current ? total : Math.min(total, ((now - started) / 1000) * SPEED);
      setSession({ active: true, revealed: value });
      if (value < total) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, total]);

  return {
    done: !active || revealed >= total,
    skip: () => {
      skipped.current = true;
    },
    /** Quantos caracteres deste bloco já saíram. */
    lengthOf(index: number) {
      let before = 0;
      for (let i = 0; i < index; i++) before += blocks[i].length;
      return Math.max(0, Math.min(blocks[index].length, revealed - before));
    },
  };
}

/** O texto ainda saindo da máquina: sem edição, com o cursor no fim. */
export function TypedBlocks({
  blocks,
  lengthOf,
  onSkip,
}: {
  blocks: string[];
  lengthOf: (index: number) => number;
  onSkip: () => void;
}) {
  return (
    <div className="relative">
      {blocks.map((block, index) => {
        const shown = lengthOf(index);
        if (shown === 0) return null;

        const text = block.slice(0, shown);
        const typing = shown < block.length;
        const caret = typing ? (
          <span className="ml-px inline-block w-[0.5ch] animate-caret bg-ink/70 align-baseline">
            &nbsp;
          </span>
        ) : null;

        if (block.startsWith("## ")) {
          return (
            <p
              key={index}
              className={`${PROSE.gapHeading} ${PROSE.heading} text-ink first:mt-0`}
            >
              {text.replace(/^##\s?/, "")}
              {caret}
            </p>
          );
        }

        if (block.trim() === "---") {
          return (
            <p key={index} className={`my-7 text-center ${PROSE.rule} text-ink-soft/50`}>
              ★
            </p>
          );
        }

        return (
          <p key={index} className={`${PROSE.gapBody} ${PROSE.body} text-ink/90 first:mt-0`}>
            {text}
            {caret}
          </p>
        );
      })}

      <button
        type="button"
        onClick={onSkip}
        data-sfx="none"
        className="sticky bottom-2 mt-6 block w-full rounded-[2px] border border-ink/25 bg-paper-100/70 py-2
                   text-[0.55rem] uppercase tracking-[0.24em] text-ink-soft backdrop-blur-sm
                   transition-colors hover:border-ink/50 hover:text-ink"
      >
        Pular a datilografia
      </button>
    </div>
  );
}
