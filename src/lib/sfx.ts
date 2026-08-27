/**
 * Sons sintetizados na hora com Web Audio — nenhum arquivo de áudio, pelo mesmo
 * motivo das texturas: o projeto não carrega binário que dá para gerar.
 */

export type SoundName = "tick" | "spend" | "restore" | "confirm" | "deny" | "rest";

type Note = {
  /** Hz no início e no fim; iguais para nota parada. */
  from: number;
  to?: number;
  type?: OscillatorType;
  /** Segundos. */
  duration: number;
  gain: number;
  /** Atraso em segundos a partir do início do som. */
  at?: number;
};

/** Seco e curto: som de interface que se repete não pode ter cauda. */
const SOUNDS: Record<SoundName, Note[]> = {
  tick: [{ from: 1500, to: 900, type: "square", duration: 0.025, gain: 0.03 }],
  spend: [{ from: 420, to: 190, type: "triangle", duration: 0.11, gain: 0.07 }],
  restore: [{ from: 220, to: 470, type: "triangle", duration: 0.11, gain: 0.06 }],
  confirm: [
    { from: 620, type: "sine", duration: 0.09, gain: 0.07 },
    { from: 930, type: "sine", duration: 0.16, gain: 0.07, at: 0.08 },
  ],
  deny: [
    { from: 150, to: 110, type: "sawtooth", duration: 0.22, gain: 0.06 },
    { from: 96, type: "square", duration: 0.22, gain: 0.03 },
  ],
  rest: [
    { from: 392, type: "sine", duration: 0.16, gain: 0.05 },
    { from: 523, type: "sine", duration: 0.16, gain: 0.05, at: 0.1 },
    { from: 659, type: "sine", duration: 0.3, gain: 0.05, at: 0.2 },
  ],
};

let context: AudioContext | null = null;

function audioContext() {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  // o navegador suspende o contexto até um gesto do usuário
  if (context.state === "suspended") void context.resume();
  return context;
}

export function playSound(name: SoundName) {
  const ctx = audioContext();
  if (!ctx) return;

  for (const note of SOUNDS[name]) {
    const start = ctx.currentTime + (note.at ?? 0);
    const end = start + note.duration;

    const osc = ctx.createOscillator();
    osc.type = note.type ?? "sine";
    osc.frequency.setValueAtTime(note.from, start);
    if (note.to) osc.frequency.exponentialRampToValueAtTime(note.to, end);

    // ataque muito curto evita o estalo de ligar o oscilador no zero
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}
