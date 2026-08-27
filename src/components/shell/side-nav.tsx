"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutIcon } from "@/components/shell/nav-icons";
import { SECTIONS, sectionIndex } from "@/components/shell/sections";

export function SideNav() {
  const current = sectionIndex(usePathname());

  return (
    <nav
      aria-label="Seções do sistema"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-line bg-panel/70 px-2 py-2
                 lg:w-[104px] lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-0 lg:py-4"
    >
      {SECTIONS.map(({ href, nav, Icon }, index) => {
        const active = index === current;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex shrink-0 flex-col items-center gap-2 px-4 py-3 text-center
                        text-[0.58rem] font-medium uppercase leading-[1.35] tracking-[0.18em]
                        transition-colors lg:px-2 lg:py-5 ${
                          active
                            ? "bg-mil-dim/15 text-mil-bright"
                            : "text-bone-dim/70 hover:bg-white/[0.03] hover:text-bone"
                        }`}
          >
            <span
              aria-hidden
              className={`absolute bottom-0 left-2 right-2 h-px lg:bottom-2 lg:left-0 lg:right-auto lg:top-2 lg:h-auto lg:w-[2px] ${
                active ? "bg-mil" : "bg-transparent"
              }`}
            />
            <Icon className="h-5 w-5" />
            <span className="whitespace-pre-line">{nav}</span>
          </Link>
        );
      })}

      <form action="/api/logout" method="post" className="lg:mt-auto lg:w-full">
        <button
          type="submit"
          className="flex w-full shrink-0 flex-col items-center gap-2 px-4 py-3 text-[0.58rem]
                     font-medium uppercase tracking-[0.18em] text-bone-dim/60
                     transition-colors hover:text-alert lg:px-2 lg:py-5"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </form>
    </nav>
  );
}
