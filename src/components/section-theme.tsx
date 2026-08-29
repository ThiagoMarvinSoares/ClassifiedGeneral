"use client";

import { useEffect } from "react";

import { useSfx } from "@/components/sfx-provider";

/**
 * Trilha de fundo de uma seção: as faixas se revezam enquanto a seção está
 * montada e param ao sair. Obedece o alto-falante da barra superior, como o
 * resto do som.
 */
export function SectionTheme({
  tracks,
  /** Fundo de interface: alto o bastante para dar clima, baixo para não competir com a leitura. */
  volume = 0.2,
}: {
  tracks: string[];
  volume?: number;
}) {
  const { enabled } = useSfx();
  const list = tracks.join("|");

  useEffect(() => {
    if (!enabled) return;

    const sources = list.split("|");
    // começa numa faixa qualquer: entrar na seção sempre pela mesma música
    // faria o revezamento sumir para quem só passa rápido
    let index = Math.floor(Math.random() * sources.length);

    const audio = new Audio(sources[index]);
    audio.volume = 0;

    // ao acabar, entra a próxima — o laço é da lista, não da faixa
    const next = () => {
      index = (index + 1) % sources.length;
      audio.src = sources[index];
      void audio.play().catch(() => {});
    };
    audio.addEventListener("ended", next);

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
    audio.play().then(
      () => fade(volume),
      () => {
        retry = () => {
          void audio.play().then(() => fade(volume), () => {});
          document.removeEventListener("pointerdown", retry!);
          retry = null;
        };
        document.addEventListener("pointerdown", retry);
      },
    );

    return () => {
      if (retry) document.removeEventListener("pointerdown", retry);
      audio.removeEventListener("ended", next);
      fade(0, () => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [enabled, list, volume]);

  return null;
}
