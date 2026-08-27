import Image from "next/image";

import { SectionPanel } from "@/components/shell/section-panel";

/** Placeholder das seções ainda não construídas — mantém a navegação honesta. */
export function SectionStub({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SectionPanel title={title} subtitle={subtitle}>
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
        <Image
          src="/armada-emblem.png"
          alt=""
          width={900}
          height={946}
          className="h-16 w-auto opacity-20 grayscale"
        />
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone-dim/70">
          &gt; section under construction
        </p>
      </div>
    </SectionPanel>
  );
}
