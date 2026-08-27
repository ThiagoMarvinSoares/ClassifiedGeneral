"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { WingedStar } from "@/components/insignia";

type Phase = "idle" | "verifying" | "granted" | "denied";

const STATUS: Record<Exclude<Phase, "idle">, string> = {
  verifying: "VERIFYING CREDENTIALS...",
  granted: "IDENTITY ACCEPTED — OPENING CHANNEL",
  denied: "ACCESS DENIED",
};

export function LoginPanel() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [reveal, setReveal] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [detail, setDetail] = useState("");
  const [attempts, setAttempts] = useState(0);

  const busy = phase === "verifying" || phase === "granted";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setPhase("verifying");
    setDetail("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data: { ok?: boolean; message?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || !data.ok) {
        setAttempts((n) => n + 1);
        setDetail(data.message ?? "INVALID CREDENTIALS");
        setPhase("denied");
        setPassword("");
        return;
      }

      setPhase("granted");
      // pausa curta antes de entregar o drama para a tela 02
      setTimeout(() => router.push("/authenticating"), 550);
    } catch {
      setAttempts((n) => n + 1);
      setDetail("UPLINK FAILURE — RETRY");
      setPhase("denied");
    }
  }

  return (
    <section
      className="@container relative w-full max-w-[520px] overflow-hidden
                 border border-line bg-panel
                 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(169,212,136,0.06)]"
    >
      {/* iluminação ambiente do CRT */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(130% 70% at 50% -14%, rgba(111,154,82,0.04), transparent 62%), radial-gradient(90% 65% at 50% 112%, rgba(0,0,0,0.75), transparent 58%)",
        }}
      />
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-30" />
      <div
        aria-hidden
        className="grain-layer pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
      />
      {/* varredura descendo pela tela */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 h-24 animate-sweep bg-linear-to-b
                   from-transparent via-mil/6 to-transparent motion-reduce:hidden"
      />
      <CornerTicks />

      <div className="relative animate-flicker px-[9%] py-[10%] motion-reduce:animate-none">
        {/* identificação do sistema */}
        <header className="text-center">
          <h1 className="relative mx-auto w-fit">
            <span className="sr-only">Armada</span>
            <span
              aria-hidden
              className="absolute inset-[-18%] rounded-full blur-2xl"
              style={{
                backgroundImage:
                  "radial-gradient(closest-side, rgba(141,124,66,0.30), rgba(111,154,82,0.12) 55%, transparent 75%)",
              }}
            />
            <Image
              src="/armada-emblem.png"
              alt=""
              width={900}
              height={946}
              priority
              className="relative h-[clamp(7.5rem,42cqw,11rem)] w-auto
                         drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)]"
            />
          </h1>
          <p className="mt-4 text-[clamp(0.6rem,2.4cqw,0.85rem)] font-light uppercase tracking-[0.34em] text-bone-dim">
            Military Personnel System
          </p>
          <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-line to-transparent" />
          <p className="mt-6 text-[clamp(0.85rem,3.2cqw,1.2rem)] font-medium uppercase tracking-[0.32em] text-mil">
            Secure Login
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3" noValidate>
          <Field
            icon={<UserIcon className="h-4 w-4" />}
            label="Username"
            id="armada-user"
          >
            <input
              id="armada-user"
              name="username"
              autoComplete="username"
              spellCheck={false}
              disabled={busy}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="USERNAME"
              className={INPUT_CLASS}
            />
          </Field>

          <Field
            icon={<LockIcon className="h-4 w-4" />}
            label="Password"
            id="armada-pass"
            trailing={
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                aria-label={reveal ? "Hide access code" : "Show access code"}
                aria-pressed={reveal}
                className="pointer-events-auto p-2 text-bone-dim transition-colors hover:text-mil-bright
                           focus-visible:text-mil-bright focus-visible:outline-none"
              >
                {reveal ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            }
          >
            <input
              id="armada-pass"
              name="password"
              type={reveal ? "text" : "password"}
              autoComplete="current-password"
              disabled={busy}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => setCapsLock(e.getModifierState?.("CapsLock") ?? false)}
              placeholder="PASSWORD"
              className={`${INPUT_CLASS} pr-14`}
            />
          </Field>

          {capsLock && (
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-brass">
              ⚠ caps lock engaged
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="group relative mt-5 flex h-14 w-full items-center justify-center overflow-hidden
                       border border-mil-dim/80 bg-mil-dim/25 text-bone
                       transition-[background-color,box-shadow,border-color] duration-200
                       hover:border-mil/90 hover:bg-mil-dim/45 hover:shadow-[0_0_40px_-10px_rgba(111,154,82,0.65)]
                       focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mil-bright
                       disabled:cursor-wait disabled:opacity-70"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 -left-full w-1/2 skew-x-12 bg-linear-to-r from-transparent via-mil-bright/15 to-transparent
                         transition-transform duration-700 group-hover:translate-x-[400%] motion-reduce:hidden"
            />
            <span className="text-[clamp(0.85rem,3cqw,1.1rem)] font-medium uppercase tracking-[0.3em]">
              {phase === "verifying" ? "Verifying" : "Access System"}
            </span>
            <ChevronIcon className="absolute right-6 h-4 w-4 text-bone-dim transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </form>

        {/* console de status */}
        <StatusLine phase={phase} detail={detail} attempts={attempts} />

        {/* aviso legal */}
        <footer className="mt-8 border-t border-line-soft pt-6 text-center">
          <p className="text-[clamp(0.55rem,2cqw,0.72rem)] font-light uppercase leading-[1.9] tracking-[0.22em] text-bone-dim/80">
            Unauthorized access is punishable
            <br />
            under Article 92, UCMJ
          </p>
          <WingedStar className="mx-auto mt-5 h-4 w-auto text-mil-dim/70" />
        </footer>
      </div>
    </section>
  );
}

const INPUT_CLASS =
  "h-14 w-full border border-line bg-black/25 pl-14 pr-4 font-display text-sm uppercase tracking-[0.22em] " +
  "text-bone caret-mil-bright placeholder:text-bone-dim/60 " +
  "transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-line/80 " +
  "focus:border-mil-dim focus:bg-panel-2 focus:outline-none focus:shadow-[0_0_30px_-12px_rgba(111,154,82,0.8)] " +
  "disabled:opacity-60";

function Field({
  icon,
  label,
  id,
  trailing,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-center text-bone-dim"
      >
        {icon}
      </span>
      {trailing && (
        <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
          {trailing}
        </span>
      )}
    </div>
  );
}

function StatusLine({
  phase,
  detail,
  attempts,
}: {
  phase: Phase;
  detail: string;
  attempts: number;
}) {
  const tone =
    phase === "denied"
      ? "text-alert"
      : phase === "granted"
        ? "text-mil-bright"
        : "text-bone-dim";

  return (
    <div
      aria-live="polite"
      className="mt-5 min-h-[2.75rem] border-l border-line-soft pl-4 font-mono text-[0.7rem] leading-relaxed tracking-[0.14em]"
    >
      {phase === "idle" ? (
        <p className="text-bone-dim/50">
          &gt; awaiting input
          <span className="ml-1 inline-block animate-caret motion-reduce:animate-none">_</span>
        </p>
      ) : (
        <>
          <p className={tone}>&gt; {STATUS[phase]}</p>
          {phase === "denied" && (
            <p className="mt-1 text-alert/70">
              &gt; {detail} · attempt {attempts} logged
            </p>
          )}
        </>
      )}
    </div>
  );
}

function CornerTicks() {
  const corner =
    "pointer-events-none absolute h-4 w-4 border-mil-dim/50";
  return (
    <div aria-hidden>
      <span className={`${corner} left-2 top-2 border-l border-t`} />
      <span className={`${corner} right-2 top-2 border-r border-t`} />
      <span className={`${corner} bottom-2 left-2 border-b border-l`} />
      <span className={`${corner} bottom-2 right-2 border-b border-r`} />
    </div>
  );
}

/* ── ícones ─────────────────────────────────────────────── */

type IconProps = React.SVGProps<SVGSVGElement>;

function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="12" cy="7.5" r="4.2" />
      <path d="M3.6 21c0-4.4 3.8-7.4 8.4-7.4s8.4 3 8.4 7.4z" />
    </svg>
  );
}

function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="4" y="10.5" width="16" height="11" rx="1.5" fill="currentColor" stroke="none" />
      <path d="M7.8 10.5V7.2a4.2 4.2 0 018.4 0v3.3" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden {...props}>
      <path d="M1.8 12S5.6 5.4 12 5.4 22.2 12 22.2 12 18.4 18.6 12 18.6 1.8 12 1.8 12z" />
      <circle cx="12" cy="12" r="3.1" />
    </svg>
  );
}

function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden {...props}>
      <path d="M4 4l16 16" />
      <path d="M9.6 5.9A9.6 9.6 0 0112 5.4c6.4 0 10.2 6.6 10.2 6.6a17 17 0 01-3.4 4.1" />
      <path d="M6.5 7.9A17 17 0 001.8 12s3.8 6.6 10.2 6.6c1.5 0 2.9-.4 4.1-.9" />
      <path d="M9.9 9.9a3.1 3.1 0 004.3 4.3" />
    </svg>
  );
}

function ChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
