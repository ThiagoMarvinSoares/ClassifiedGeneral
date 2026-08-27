import { PageStrip } from "@/components/shell/page-strip";
import { SectionArrow } from "@/components/shell/section-arrows";
import { SideNav } from "@/components/shell/side-nav";
import { TopBar } from "@/components/shell/top-bar";

/**
 * Duas colunas: a ficha em papel fica fixa à esquerda em todas as seções,
 * e só o painel da direita muda.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: "var(--color-void)",
          backgroundImage: [
            "radial-gradient(70% 50% at 20% 0%, rgba(88,78,58,0.22), transparent 60%)",
            "radial-gradient(60% 50% at 90% 100%, rgba(20,32,24,0.5), transparent 62%)",
            "linear-gradient(180deg, #0a0d0c 0%, #050706 60%, #030403 100%)",
          ].join(","),
        }}
      />
      <div
        aria-hidden
        className="fiber-layer pointer-events-none fixed inset-0 -z-10 opacity-[0.05] mix-blend-overlay"
      />

      <TopBar />

      <div className="flex flex-1 flex-col lg:flex-row">
        <SideNav />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 flex-1 items-stretch gap-3 px-3 py-4 sm:px-4">
            <SectionArrow direction="prev" />
            <main className="min-w-0 flex-1">{children}</main>
            <SectionArrow direction="next" />
          </div>

          <PageStrip />
        </div>
      </div>
    </div>
  );
}
