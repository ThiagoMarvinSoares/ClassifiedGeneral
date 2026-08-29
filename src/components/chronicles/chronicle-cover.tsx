import Image from "next/image";

/** A capa do livro: couro escuro, brasão dourado e o carimbo de sigilo. */
export function ChronicleCover() {
  return (
    <article
      className="grain relative flex aspect-[3/4] flex-col items-center justify-between overflow-hidden
                 rounded-[3px] px-8 py-10 text-center
                 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{
        backgroundColor: "#171310",
        backgroundImage: [
          "radial-gradient(90% 70% at 30% 12%, rgba(120,96,60,0.22), transparent 58%)",
          "radial-gradient(70% 60% at 80% 95%, rgba(0,0,0,0.65), transparent 60%)",
          "linear-gradient(160deg, #241d17 0%, #14100d 55%, #0b0908 100%)",
        ].join(","),
      }}
    >
      {/* grão do couro */}
      <div
        aria-hidden
        className="fiber-layer pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
      />
      {/* cantoneiras de metal */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          "left-2 top-2 border-l-2 border-t-2",
          "right-2 top-2 border-r-2 border-t-2",
          "bottom-2 left-2 border-b-2 border-l-2",
          "bottom-2 right-2 border-b-2 border-r-2",
        ].map((corner) => (
          <span key={corner} className={`absolute h-8 w-8 border-brass/60 ${corner}`} />
        ))}
      </div>

      <Image
        src="/armada-emblem.png"
        alt=""
        width={900}
        height={946}
        className="relative h-[34%] w-auto opacity-90 drop-shadow-[0_8px_18px_rgba(0,0,0,0.7)]"
      />

      <div className="relative">
        <h2 className="text-[clamp(1.6rem,7cqw,2.6rem)] font-bold uppercase leading-[1.05] tracking-[0.12em] text-brass">
          War
          <br />
          Chronicles
        </h2>
        <p className="mt-3 text-[0.6rem] font-medium uppercase tracking-[0.28em] text-bone-dim">
          The history of a legend
        </p>
        <div className="mx-auto mt-4 h-px w-24 bg-brass/40" />
      </div>

      <div
        aria-hidden
        className="distress relative rotate-[-1.5deg] border-2 border-stamp px-4 py-2 text-stamp opacity-85"
      >
        <p className="text-[0.95rem] font-bold uppercase leading-none tracking-[0.1em]">Classified</p>
        <p className="mt-1 text-[0.45rem] font-medium uppercase tracking-[0.24em]">
          Authorized personnel only
        </p>
      </div>
    </article>
  );
}
