"use client";

import Image from "next/image";

import { useCharacter } from "@/components/character-provider";
import { useSfx } from "@/components/sfx-provider";
import { ShieldIcon } from "@/components/shell/nav-icons";

const SAVE_COPY = {
  idle: null,
  saving: { text: "syncing record", tone: "text-brass" },
  saved: { text: "record saved", tone: "text-mil" },
  error: { text: "sync failed", tone: "text-alert" },
} as const;

export function TopBar() {
  const { character, status, error } = useCharacter();
  const { enabled, toggle } = useSfx();
  const base = SAVE_COPY[status];
  const save = base && status === "error" ? { ...base, text: error ?? base.text } : base;

  return (
    <>
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-line bg-panel px-4 py-2.5 sm:px-6">
        {/* identidade do sistema */}
        <div className="flex items-center gap-3">
          <Image
            src="/armada-emblem.png"
            alt=""
            width={900}
            height={946}
            className="h-9 w-auto sm:h-11"
          />
          <div className="leading-tight">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-bone sm:text-base">
              Armada
            </p>
            <p className="hidden text-[0.55rem] font-light uppercase tracking-[0.26em] text-bone-dim sm:block">
              Military Personnel System
            </p>
          </div>
        </div>

        {/* aviso central + estado do autosave */}
        <div className="hidden flex-col items-center md:flex">
          <p className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-alert/85">
            <ShieldIcon className="h-3.5 w-3.5" />
            Classified // Eyes Only
          </p>
          <p
            aria-live="polite"
            className={`h-4 font-mono text-[0.55rem] uppercase tracking-[0.24em] ${save?.tone ?? ""}`}
          >
            {save ? `· ${save.text} ·` : ""}
          </p>
        </div>

        {/* credencial do operador */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-[0.55rem] uppercase tracking-[0.24em] text-bone-dim/70">
              Clearance Level
            </p>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-mil">
              {character.identity.clearance}
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            data-sfx="none"
            aria-pressed={enabled}
            aria-label={enabled ? "Desligar sons do sistema" : "Ligar sons do sistema"}
            className={`touch-target rounded-[2px] border border-line p-2 transition-colors
                        hover:border-mil-dim hover:text-mil-bright ${
                          enabled ? "text-mil" : "text-bone-dim/50"
                        }`}
          >
            {enabled ? <SpeakerIcon className="h-4 w-4" /> : <SpeakerOffIcon className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2.5 border-l border-line pl-3">
            <Image
              src="/armada-portrait.png"
              alt=""
              width={820}
              height={1122}
              className="h-9 w-9 rounded-full border border-line object-cover object-[50%_18%]"
            />
            <div className="hidden leading-tight sm:block">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-bone">
                {character.identity.rank}
              </p>
              <p className="text-[0.55rem] uppercase tracking-[0.22em] text-bone-dim/70">
                {character.identity.className}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* o bloco central some no celular: sem esta faixa o autosave ficaria mudo */}
      {save && (
        <p
          aria-live="polite"
          className={`flex items-center justify-center gap-2 border-b border-line bg-panel/80 py-1
                      font-mono text-[0.55rem] uppercase tracking-[0.24em] md:hidden ${save.tone}`}
        >
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {save.text}
        </p>
      )}
    </>
  );
}

type IconProps = React.SVGProps<SVGSVGElement>;

function SpeakerIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M3 9h4l5-4v14l-5-4H3z" />
      <path
        d="M16 8.5a5 5 0 010 7M18.6 6a8.6 8.6 0 010 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M3 9h4l5-4v14l-5-4H3z" />
      <path
        d="M16 9.5l5 5M21 9.5l-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
