import { redirect } from "next/navigation";

import { ClassifiedFolder } from "@/components/classified-folder";
import { LoginPanel } from "@/components/login-panel";
import { hasClearance } from "@/lib/session";

export default async function AccessPage() {
  if (await hasClearance()) redirect("/dossier");

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
      {/* mesa / superfície */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "var(--color-void)",
          backgroundImage: [
            "radial-gradient(90% 70% at 12% 0%, rgba(88,78,58,0.30), transparent 55%)",
            "radial-gradient(70% 60% at 88% 100%, rgba(20,32,24,0.55), transparent 60%)",
            "linear-gradient(180deg, #0a0d0c 0%, #050706 55%, #030403 100%)",
          ].join(","),
        }}
      />
      <div
        aria-hidden
        className="fiber-layer pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_220px_rgba(0,0,0,0.95)]"
      />

      <div className="relative grid w-full max-w-[1200px] justify-items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:justify-items-stretch">
        <div className="flex w-full justify-center lg:justify-end">
          <ClassifiedFolder />
        </div>
        <div className="flex w-full justify-center lg:justify-start">
          <LoginPanel />
        </div>
      </div>
    </main>
  );
}
