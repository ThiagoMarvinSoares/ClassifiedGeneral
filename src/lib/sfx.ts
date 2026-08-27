/**
 * Sons sintetizados na hora com Web Audio — nenhum arquivo de áudio, pelo mesmo
 * motivo das texturas: o projeto não carrega binário que dá para gerar.
 */

export type SoundName =
  | "tick"
  | "spend"
  | "restore"
  | "confirm"
  | "deny"
  | "rest"
  | "clank"
  | "rummage";

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
  // sintetizados à parte, em playMetal
  clank: [],
  rummage: [],
};

/**
 * Metal soa inarmônico: as parciais não são múltiplos inteiros da fundamental.
 * Estas razões são o que separa "sino" de "nota".
 */
const METAL_PARTIALS = [1, 1.41, 1.87, 2.34, 2.98, 3.53];

/** Uma batida em metal: parciais inarmônicas por um bandpass, decaindo rápido. */
function metalHit(ctx: AudioContext, at: number, base: number, gain: number, duration: number) {
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.setValueAtTime(base * 2.4, at);
  band.Q.setValueAtTime(2.2, at);

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, at);
  out.gain.exponentialRampToValueAtTime(gain, at + 0.002);
  out.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  band.connect(out).connect(ctx.destination);

  for (const ratio of METAL_PARTIALS) {
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(base * ratio, at);
    osc.connect(band);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }
}

/**
 * Remexer no baú: três a cinco batidas em tempos e alturas sorteados. O sorteio
 * é o que faz não soar igual duas vezes — som repetido idêntico vira ruído.
 */
function playMetal(ctx: AudioContext, hits: number) {
  let at = ctx.currentTime;
  for (let i = 0; i < hits; i++) {
    metalHit(ctx, at, 240 + Math.random() * 380, 0.03 + Math.random() * 0.02, 0.07 + Math.random() * 0.06);
    at += 0.045 + Math.random() * 0.07;
  }
}

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

  if (name === "clank" || name === "rummage") {
    playMetal(ctx, name === "clank" ? 1 : 3 + Math.floor(Math.random() * 3));
    return;
  }

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
