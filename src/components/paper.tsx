/**
 * Superfície de papel envelhecido — o documento físico do sistema.
 * Só camadas de fundo; o conteúdo entra como children.
 */
export function PaperSurface({
  className = "",
  crease = true,
  children,
}: {
  className?: string;
  crease?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`@container grain relative overflow-hidden rounded-[2px] text-ink ${className}`}
      style={{
        backgroundColor: "var(--color-paper-200)",
        backgroundImage: [
          "radial-gradient(110% 80% at 16% 6%, rgba(255,242,213,0.42), transparent 52%)",
          "radial-gradient(95% 70% at 88% 96%, rgba(58,42,24,0.55), transparent 62%)",
          "radial-gradient(38% 30% at 74% 20%, rgba(104,78,44,0.34), transparent 72%)",
          "radial-gradient(30% 24% at 22% 62%, rgba(112,88,52,0.26), transparent 74%)",
          "linear-gradient(158deg, rgba(255,248,228,0.14), rgba(58,44,26,0.42))",
        ].join(","),
      }}
    >
      <div
        aria-hidden
        className="fiber-layer pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-multiply"
      />
      <div
        aria-hidden
        className="grain-layer pointer-events-none absolute inset-0 opacity-[0.20] mix-blend-overlay"
      />
      {crease && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[46%] h-px bg-linear-to-r from-transparent via-paper-500/15 to-transparent"
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(48,34,18,0.6)]"
      />
      {children}
    </div>
  );
}
