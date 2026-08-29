"use client";

import Image from "next/image";

import { useCharacter } from "@/components/character-provider";
import { PortraitBlock } from "@/components/dossier/portrait-block";
import { EditText } from "@/components/editable";
import { LongForm } from "@/components/long-form";
import { Paperclip } from "@/components/insignia";
import { PaperSurface } from "@/components/paper";

/**
 * Página do dossiê dedicada à história. Mesma folha das outras páginas, só que
 * do bloco de identidade até PROFICIENCIES nada aparece: retrato, assinatura e
 * daí para baixo a narrativa, escrita no papel.
 */
export function ServiceRecordSheet() {
  const { character, update } = useCharacter();
  const { title, paragraphs } = character.serviceRecord;

  return (
    <PaperSurface
      crease={false}
      className="mx-auto max-w-[760px] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9),0_2px_0_rgba(255,255,255,0.05)]"
    >
      <Paperclip className="absolute -top-5 left-6 z-10 h-24 w-9 rotate-[-5deg] text-[#4e5155] drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]" />

      <div className="relative space-y-6 px-5 py-7 @xl:px-8 @xl:py-9 @4xl:px-10">
        <header className="flex items-start justify-between gap-4">
          <p className="pl-12 text-[0.6rem] font-medium uppercase leading-tight tracking-[0.2em] text-ink-soft @xl:tracking-[0.26em]">
            Military Personnel Dossier
          </p>
          <div className="flex items-start gap-3">
            <div className="text-right leading-tight">
              <p className="whitespace-nowrap text-[0.55rem] font-medium uppercase tracking-[0.24em] text-ink-soft">
                Document ID
              </p>
              <p className="whitespace-nowrap text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink">
                {character.identity.idCode}
              </p>
            </div>
            <Image
              src="/armada-emblem.png"
              alt=""
              width={900}
              height={946}
              className="h-9 w-auto opacity-70 mix-blend-multiply [filter:grayscale(1)_contrast(1.25)]"
            />
          </div>
        </header>

        {/* retrato à esquerda, título ao lado — a história começa abaixo */}
        <div className="flex flex-col gap-6 @xl:flex-row @xl:gap-8">
          <PortraitBlock className="mx-auto w-full max-w-[200px] shrink-0 @xl:mx-0" />

          <div className="min-w-0 flex-1">
            <p className="text-[0.5rem] font-medium uppercase tracking-[0.3em] text-ink-soft">
              Personnel file · narrative
            </p>
            <EditText
              label="Título da história"
              value={title}
              onCommit={(next) => update((draft) => void (draft.serviceRecord.title = next))}
              className="mt-2 text-2xl font-bold uppercase tracking-[0.14em] text-ink @3xl:text-3xl"
            />
            <div className="mt-4 h-px w-full bg-ink/25" />
          </div>
        </div>

        {/* a história */}
        <div className="pt-1">
          <LongForm
            label="História do personagem"
            blocks={paragraphs}
            onCommit={(next) => update((draft) => void (draft.serviceRecord.paragraphs = next))}
            empty="História ainda não escrita."
          />
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-ink/20 pt-4">
          <span className="w-24" />
          <div className="flex items-center gap-3 text-center">
            <Image
              src="/armada-emblem.png"
              alt=""
              width={900}
              height={946}
              className="h-7 w-auto opacity-60 mix-blend-multiply [filter:grayscale(1)_contrast(1.25)]"
            />
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-ink">
                Armada Command
              </p>
              <p className="text-[0.5rem] uppercase tracking-[0.22em] text-ink-soft">
                For glory, for duty, for freedom.
              </p>
            </div>
          </div>
          <p className="w-24 text-right text-[0.55rem] uppercase tracking-[0.2em] text-ink/75">
            Page 4 of 4
          </p>
        </footer>
      </div>
    </PaperSurface>
  );
}
