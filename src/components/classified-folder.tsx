import Image from "next/image";

import { Paperclip } from "@/components/insignia";
import { PaperSurface } from "@/components/paper";

/**
 * Capa do dossiê físico: papel envelhecido, carimbo CLASSIFIED e
 * caixa de nível de credencial. Puramente decorativo.
 */
export function ClassifiedFolder() {
  return (
    <div className="relative w-full max-w-[560px] select-none">
      {/* pilha de folhas por baixo */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-2 rotate-[1.4deg] rounded-[2px] bg-paper-500/70"
      />
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1 rotate-[0.6deg] rounded-[2px] bg-paper-400/80"
      />

      {/* folha principal */}
      <PaperSurface className="aspect-[3/4] rotate-[-0.5deg] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),0_2px_0_rgba(255,255,255,0.06)]">
        {/* clipe de papel */}
        <Paperclip
          className="absolute -top-6 left-8 h-28 w-11 rotate-[-6deg] text-[#4e5155]
                     drop-shadow-[0_3px_4px_rgba(0,0,0,0.45)]"
        />

        <div className="relative flex h-full flex-col items-center px-[9%] py-[7%]">
          {/* cabeçalho do órgão */}
          <header className="text-center">
            <p className="text-[clamp(0.62rem,1.5cqw,0.9rem)] font-medium uppercase leading-[1.7] tracking-[0.34em]">
              Department of Defense
              <br />
              Military Intelligence
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-ink/45" />
              <Star className="h-2.5 w-2.5 text-ink/70" />
              <span className="h-px w-16 bg-ink/45" />
            </div>
          </header>

          {/* carimbo */}
          <div className="mt-[9%] w-full">
            <div
              className="distress mx-auto w-fit rotate-[-2.2deg] border-[5px] border-double border-stamp
                         px-[0.55em] py-[0.12em] text-stamp opacity-90
                         [animation:stamp-in_.7s_cubic-bezier(.2,1.4,.4,1)_both]"
            >
              <span className="block text-[clamp(2.1rem,7.6cqw,3.6rem)] font-bold uppercase leading-[1.05] tracking-[0.06em]">
                Classified
              </span>
            </div>
            <p className="distress mt-[6%] text-center text-[clamp(0.85rem,2.4cqw,1.25rem)] font-medium uppercase tracking-[0.28em] text-ink/85">
              Access Restricted
            </p>
          </div>

          {/* brasão — tratado como tinta impressa: dessaturado e multiplicado
              contra o papel, para não parecer um adesivo colado */}
          <Image
            src="/armada-emblem.png"
            alt=""
            width={900}
            height={946}
            className="mt-[6%] h-[32%] w-auto opacity-[0.82] mix-blend-multiply
                       [filter:grayscale(1)_contrast(1.3)_brightness(0.96)]"
          />

          {/* nível de credencial */}
          <footer className="mt-auto w-full">
            <div className="mx-auto w-full max-w-[86%] border border-ink/55 p-[0.9em] text-center">
              <p className="text-[clamp(0.55rem,1.45cqw,0.8rem)] font-medium uppercase tracking-[0.26em] text-ink/80">
                Clearance Level Required
              </p>
              <p className="mt-1 text-[clamp(1.05rem,3.4cqw,1.75rem)] font-bold uppercase tracking-[0.1em] text-stamp">
                LV4 — General
              </p>
              <p className="mt-1 text-[clamp(0.5rem,1.35cqw,0.72rem)] font-medium uppercase tracking-[0.3em] text-ink/65">
                Armada Program
              </p>
            </div>
          </footer>
        </div>
      </PaperSurface>
    </div>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 0l3 8.4 8.9.4-7 5.5 2.4 8.6L12 18l-7.3 4.9 2.4-8.6-7-5.5 8.9-.4z" />
    </svg>
  );
}
