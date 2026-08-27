"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SECTIONS, sectionIndex } from "@/components/shell/sections";

/** Paginação do dossiê: uma página por seção. */
export function PageStrip() {
  const current = sectionIndex(usePathname());

  return (
    <nav
      aria-label="Páginas do dossiê"
      className="mx-auto mb-3 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full
                 border border-line bg-panel px-2 py-1.5"
    >
      {SECTIONS.map((section, index) => {
        const active = index === current;
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? "page" : undefined}
            title={section.label}
            className={`flex h-8 min-w-8 items-center justify-center rounded-full px-3 font-mono
                        text-[0.62rem] tracking-[0.14em] transition-colors ${
                          active
                            ? "bg-mil-dim/35 text-mil-bright"
                            : "text-bone-dim/60 hover:bg-white/[0.04] hover:text-bone"
                        }`}
          >
            {String(index + 1).padStart(2, "0")}
          </Link>
        );
      })}
    </nav>
  );
}
