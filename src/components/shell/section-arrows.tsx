"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SECTIONS, sectionIndex } from "@/components/shell/sections";

/** Setas laterais: avança/volta uma página do dossiê. */
export function SectionArrow({ direction }: { direction: "prev" | "next" }) {
  const current = sectionIndex(usePathname());
  const target = SECTIONS[current + (direction === "next" ? 1 : -1)];

  if (current < 0 || !target) {
    return <span aria-hidden className="hidden w-9 shrink-0 xl:block" />;
  }

  return (
    <Link
      href={target.href}
      aria-label={`${direction === "next" ? "Próxima" : "Página anterior"}: ${target.label}`}
      className="hidden w-9 shrink-0 items-center justify-center self-stretch rounded-[3px] border border-line
                 bg-panel/60 text-lg text-bone-dim/50 transition-colors
                 hover:border-mil-dim hover:bg-panel hover:text-mil-bright xl:flex"
    >
      {direction === "next" ? "›" : "‹"}
    </Link>
  );
}
