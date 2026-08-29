"use client";

import { useEffect } from "react";

import { useSfx } from "@/components/sfx-provider";

/**
 * Trilha de fundo de uma seção: toca em laço enquanto a seção está montada e
 * para ao sair. Obedece o alto-falante da barra superior, como o resto do som.
 */
export function SectionTheme({ src, volume = 0.5 }: { src: string; volume?: number }) {
  const { enabled } = useSfx();

  useEffect(() => {
    if (!enabled) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;

    let timer = 0;

    /** Entrar e sair cortando seco é agressivo; a rampa dá o mesmo efeito. */
    function fade(to: number, done?: () => void) {
      window.clearTimeout(timer);
      const step = () => {
        const diff = to - audio.volume;
        if (Math.abs(diff) < 0.01) {
          audio.volume = to;
          done?.();
          return;
        }
        audio.volume = Math.max(0, Math.min(1, audio.volume + diff * 0.12));
        timer = window.setTimeout(step, 40);
      };
      step();
    }

    // o navegador recusa áudio sem gesto do usuário; navegar pelo menu conta,
    // mas abrir a URL direto não — nesse caso, tenta de novo no primeiro toque
    let retry: (() => void) | null = null;
    const start = () => {
      audio.play().then(
        () => fade(volume),
        () => {
          retry = () => {
            audio.play().then(() => fade(volume), () => {});
            document.removeEventListener("pointerdown", retry!);
            retry = null;
          };
          document.addEventListener("pointerdown", retry);
        },
      );
    };
    start();

    return () => {
      if (retry) document.removeEventListener("pointerdown", retry);
      fade(0, () => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [enabled, src, volume]);

  return null;
}
