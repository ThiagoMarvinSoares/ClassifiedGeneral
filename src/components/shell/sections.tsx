import {
  DossierIcon,
  FootlockerIcon,
  ChronicleIcon,
  RecordIcon,
  TacticsIcon,
} from "@/components/shell/nav-icons";

/** As cinco seções do sistema, na ordem em que o dossiê é paginado. */
export const SECTIONS = [
  { href: "/dossier", label: "Dossier", nav: "Dossier", Icon: DossierIcon },
  { href: "/war-tactics", label: "War Tactics", nav: "War\nTactics", Icon: TacticsIcon },
  {
    href: "/footlocker",
    label: "Footlocker",
    nav: "Footlocker",
    Icon: FootlockerIcon,
    /** Abrir o baú soa como abrir um baú. */
    sfx: "rummage",
  },
  { href: "/service-record", label: "Service Record", nav: "Service\nRecord", Icon: RecordIcon },
  {
    href: "/chronicles",
    label: "War Chronicles",
    nav: "War\nChronicles",
    Icon: ChronicleIcon,
  },
] as const;

export type Section = (typeof SECTIONS)[number];

/** Índice da seção que contém o caminho atual (−1 se nenhuma). */
export function sectionIndex(pathname: string) {
  return SECTIONS.findIndex((section) => pathname.startsWith(section.href));
}
