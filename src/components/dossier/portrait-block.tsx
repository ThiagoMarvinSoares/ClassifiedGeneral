"use client";

import Image from "next/image";

import { useCharacter } from "@/components/character-provider";
import { EditText } from "@/components/editable";

/** Retrato emoldurado com a assinatura abaixo — usado nas páginas do dossiê. */
export function PortraitBlock({ className = "" }: { className?: string }) {
  const { character, update } = useCharacter();

  return (
    <div className={className}>
      <div className="border-[3px] border-ink/25 bg-ink/10 p-1 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.6)]">
        <Image
          src="/armada-portrait.png"
          alt="Retrato do General Armada"
          width={820}
          height={1122}
          priority
          className="aspect-[4/5] w-full object-cover object-[50%_16%] [filter:sepia(0.28)_contrast(1.05)]"
        />
      </div>
      <div className="mt-4 text-center">
        <EditText
          label="Assinatura"
          value={character.identity.signature}
          onCommit={(next) => update((draft) => void (draft.identity.signature = next))}
          className="font-signature text-[2.4rem] leading-[1.1] text-ink"
        />
        <div className="mx-auto mt-1 h-px w-4/5 bg-ink/30" />
        <p className="mt-1 text-[0.5rem] font-medium uppercase tracking-[0.3em] text-ink-soft">
          Signature
        </p>
      </div>
    </div>
  );
}
