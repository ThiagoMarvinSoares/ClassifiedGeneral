"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { playSound, type SoundName } from "@/lib/sfx";

const STORAGE_KEY = "armada:sfx";

/* ── a preferência mora no localStorage, não no estado do React ───────── */

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // outra aba pode ter mudado a preferência
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readEnabled() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** No servidor não há preferência: assume ligado, como o padrão. */
function serverEnabled() {
  return true;
}

function writeEnabled(next: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // sem storage a escolha vale só nesta sessão
  }
  listeners.forEach((listener) => listener());
}

/* ── provider: só monta o ouvinte global de cliques ───────────────────── */

export function SfxProvider({ children }: { children: React.ReactNode }) {
  const { enabled } = useSfx();

  /**
   * Um ouvinte só no documento em vez de um onClick em cada botão. O elemento
   * escolhe o som pelo atributo `data-sfx`; sem ele, toca o tick padrão.
   */
  useEffect(() => {
    if (!enabled) return;

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const marked = target?.closest<HTMLElement>("[data-sfx]");
      const name = marked?.dataset.sfx;

      if (name === "none") return;
      if (name) {
        playSound(name as SoundName);
        return;
      }
      if (target?.closest("button, summary, a[href]")) playSound("tick");
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [enabled]);

  return children;
}

export function useSfx() {
  const enabled = useSyncExternalStore(subscribe, readEnabled, serverEnabled);

  const play = useCallback(
    (name: SoundName) => {
      if (enabled) playSound(name);
    },
    [enabled],
  );

  const toggle = useCallback(() => {
    const next = !readEnabled();
    writeEnabled(next);
    if (next) playSound("tick");
  }, []);

  return { enabled, play, toggle };
}
