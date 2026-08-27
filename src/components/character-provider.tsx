"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Character } from "@/lib/character";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type CharacterContextValue = {
  character: Character;
  /** Aplica uma mutação sobre uma cópia — o autosave dispara sozinho. */
  update: (recipe: (draft: Character) => void) => void;
  status: SaveStatus;
  /** Motivo da última falha, para a barra dizer o que houve. */
  error: string | null;
};

const CharacterContext = createContext<CharacterContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 700;

export function CharacterProvider({
  initial,
  children,
}: {
  initial: Character;
  children: React.ReactNode;
}) {
  const [character, setCharacter] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const pristine = useRef(true);

  const update = useCallback((recipe: (draft: Character) => void) => {
    setCharacter((previous) => {
      const draft = structuredClone(previous);
      recipe(draft);
      return draft;
    });
  }, []);

  useEffect(() => {
    if (pristine.current) {
      pristine.current = false;
      return;
    }

    setStatus("saving");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/character", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(character),
          signal: controller.signal,
        });
        if (response.ok) {
          setStatus("saved");
          setError(null);
          return;
        }
        const data: { message?: string } = await response.json().catch(() => ({}));
        setError(data.message ?? "SYNC FAILED");
        setStatus("error");
      } catch {
        if (controller.signal.aborted) return;
        setError("NO CONNECTION TO RECORD SERVER");
        setStatus("error");
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [character]);

  // "saved" é confirmação momentânea, não um estado permanente da barra
  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setStatus("idle"), 2200);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <CharacterContext.Provider value={{ character, update, status, error }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) throw new Error("useCharacter precisa estar dentro de <CharacterProvider>");
  return context;
}
