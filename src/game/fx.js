// Sound effects synthesized with WebAudio (no audio files) and the reduced-motion check.
// Everything is a no-op when audio is unavailable (tests, old browsers) or muted.

const KEY = "th-sound";
let ctx = null;

export const soundPref = {
  get() { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } },
  set(on) { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ } },
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(a, freq, dur, { type = "sine", vol = 0.12, at = 0, to } = {}) {
  const t = a.currentTime + at;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(a, dur, vol = 0.08) {
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  const g = a.createGain();
  const f = a.createBiquadFilter();
  f.type = "lowpass"; f.frequency.value = 1400;
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(f).connect(g).connect(a.destination);
  src.start();
}

const SFX = {
  start: (a) => { tone(a, 196, 0.35, { type: "triangle", vol: 0.1 }); tone(a, 294, 0.45, { type: "triangle", vol: 0.08, at: 0.12 }); },
  mark: (a) => { noise(a, 0.12, 0.09); tone(a, 140, 0.14, { type: "sine", vol: 0.16, to: 70 }); },
  unmark: (a) => tone(a, 620, 0.09, { type: "triangle", vol: 0.05, to: 420 }),
  locked: (a) => { tone(a, 660, 0.12, { vol: 0.06 }); tone(a, 880, 0.18, { vol: 0.06, at: 0.1 }); },
  tick: (a) => tone(a, 1250, 0.035, { type: "square", vol: 0.025 }),
  dig: (a) => { noise(a, 0.35, 0.12); tone(a, 90, 0.3, { vol: 0.14, to: 50 }); },
  chest: (a) => tone(a, 988, 0.12, { type: "triangle", vol: 0.05 }),
  win: (a) => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(a, f, 0.22, { type: "triangle", vol: 0.08, at: i * 0.09 })),
  lose: (a) => { tone(a, 330, 0.55, { type: "sawtooth", vol: 0.035, to: 150 }); },
  coin: (a) => { tone(a, 1568, 0.08, { type: "square", vol: 0.03 }); tone(a, 2093, 0.12, { type: "square", vol: 0.025, at: 0.06 }); },
};

export function play(name, enabled) {
  if (!enabled) return;
  try { const a = audio(); if (a && SFX[name]) SFX[name](a); } catch { /* audio is a nice-to-have */ }
}
