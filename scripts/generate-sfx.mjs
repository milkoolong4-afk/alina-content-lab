#!/usr/bin/env node
/**
 * Synthesizes placeholder SFX into public/sfx/*.wav (44.1 kHz, 16-bit mono).
 * Zero dependencies. Deterministic (seeded noise) so re-runs are identical.
 *
 * These are honest placeholders: good enough to time a cut and render a draft.
 * For final videos, drop real recordings with the same file names into
 * public/sfx/ — existing files are NOT overwritten unless you pass --force.
 */
import fs from "node:fs";
import path from "node:path";

const SR = 44100;
const OUT = path.resolve("public/sfx");
const force = process.argv.includes("--force");

let seed = 1337;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;
const buf = (sec) => new Float32Array(Math.round(sec * SR));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

// One-pole filters
const lowpass = (x, cutoff) => {
  const y = new Float32Array(x.length);
  let prev = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = typeof cutoff === "function" ? cutoff(i / SR) : cutoff;
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    prev += a * (x[i] - prev);
    y[i] = prev;
  }
  return y;
};
const highpass = (x, cutoff) => {
  const lp = lowpass(x, cutoff);
  return x.map((v, i) => v - lp[i]);
};
const mix = (target, src, offsetSec = 0, gain = 1) => {
  const o = Math.round(offsetSec * SR);
  for (let i = 0; i < src.length && o + i < target.length; i++) target[o + i] += src[i] * gain;
  return target;
};
const normalize = (x, peak = 0.89) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return m ? x.map((v) => (v / m) * peak) : x;
};
const softclip = (x, drive = 1.5) => x.map((v) => Math.tanh(v * drive));

const tone = (sec, freqFn, { shape = "sine", a = 0.002, d = 0.1 } = {}) => {
  const b = buf(sec);
  let ph = 0;
  for (let i = 0; i < b.length; i++) {
    const t = i / SR;
    ph += (2 * Math.PI * freqFn(t)) / SR;
    let s = Math.sin(ph);
    if (shape === "square") s = Math.sign(s) * 0.7;
    if (shape === "saw") s = ((ph / Math.PI) % 2) - 1;
    b[i] = s * env(t, a, d);
  }
  return b;
};

const clickBurst = (sec = 0.03, bright = 4000) => {
  const b = buf(sec);
  for (let i = 0; i < b.length; i++) b[i] = noise() * env(i / SR, 0.0005, 0.004);
  return mix(highpass(b, bright), tone(sec, () => 2800, { d: 0.006 }), 0, 0.4);
};

const sounds = {
  click: () => clickBurst(0.05, 3000),

  tick: () => mix(clickBurst(0.03, 6000), tone(0.03, () => 5200, { d: 0.004 }), 0, 0.6),

  keyboard: () => {
    const b = buf(0.6);
    [0, 0.13, 0.22, 0.38].forEach((o) => mix(b, clickBurst(0.06, 1500 + rnd() * 2000), o, 0.7 + rnd() * 0.3));
    return b;
  },

  typing: () => {
    const b = buf(1.6);
    let t = 0;
    while (t < 1.5) {
      mix(b, clickBurst(0.06, 1200 + rnd() * 2500), t, 0.5 + rnd() * 0.5);
      t += 0.05 + rnd() * 0.11;
    }
    return b;
  },

  notification: () => {
    const b = buf(0.7);
    mix(b, tone(0.4, () => 1318, { d: 0.12 }), 0, 0.8);
    mix(b, tone(0.5, () => 1976, { d: 0.18 }), 0.11, 0.7);
    return b;
  },

  ding: () => {
    const b = buf(1.2);
    mix(b, tone(1.2, () => 1568, { d: 0.35 }), 0, 0.7);
    mix(b, tone(1.2, () => 3136, { d: 0.18 }), 0, 0.25);
    mix(b, tone(1.2, () => 4700, { d: 0.08 }), 0, 0.12);
    return b;
  },

  error: () => {
    const b = buf(0.55);
    const beep = () => {
      const x = buf(0.2);
      let ph = 0;
      for (let i = 0; i < x.length; i++) {
        ph += (2 * Math.PI * 180) / SR;
        const s = ((ph / Math.PI) % 2) - 1 + 0.5 * Math.sign(Math.sin(ph * 1.5));
        x[i] = s * (i / SR < 0.18 ? 1 : 0) * Math.min(1, i / 60);
      }
      return lowpass(x, 2500);
    };
    mix(b, beep(), 0);
    mix(b, beep(), 0.26);
    return softclip(b, 1.2);
  },

  pop: () => tone(0.12, (t) => 900 * Math.exp(-t * 30) + 180, { a: 0.001, d: 0.03 }),

  whoosh: () => {
    const L = 0.45;
    const b = buf(L);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      b[i] = noise() * Math.sin((Math.PI * t) / L) ** 2;
    }
    return lowpass(highpass(b, 300), (t) => 400 + 5000 * Math.sin((Math.PI * t) / L));
  },

  impact: () => {
    const b = buf(1.4);
    mix(b, tone(1.4, (t) => 38 + 70 * Math.exp(-t * 18), { a: 0.001, d: 0.35 }), 0, 1);
    const n = buf(0.25);
    for (let i = 0; i < n.length; i++) n[i] = noise() * env(i / SR, 0.0005, 0.03);
    mix(b, lowpass(n, 2200), 0, 0.9);
    return softclip(b, 2.2);
  },

  thud: () => {
    const b = tone(0.35, (t) => 70 + 60 * Math.exp(-t * 25), { a: 0.001, d: 0.07 });
    const n = buf(0.08);
    for (let i = 0; i < n.length; i++) n[i] = noise() * env(i / SR, 0.0005, 0.01);
    return softclip(mix(b, lowpass(n, 900), 0, 0.6), 1.6);
  },

  bonk: () => {
    const b = buf(0.4);
    mix(b, tone(0.4, (t) => 520 * Math.exp(-t * 6) + 160, { a: 0.001, d: 0.08 }), 0, 1);
    mix(b, tone(0.4, (t) => 1250 * Math.exp(-t * 6), { a: 0.001, d: 0.03 }), 0, 0.35);
    mix(b, clickBurst(0.03, 1500), 0, 0.5);
    return b;
  },

  boing: () => tone(0.7, (t) => 300 + 140 * Math.sin(t * 2 * Math.PI * 14) * Math.exp(-t * 4) + t * 260, { a: 0.003, d: 0.25 }),

  scratch: () => {
    // Two "drags" of filtered noise with a pitch-ish sweep — the classic needle drag.
    const L = 0.55;
    const b = buf(L);
    for (let i = 0; i < b.length; i++) {
      const t = i / SR;
      const seg = t < 0.22 ? t / 0.22 : (t - 0.22) / 0.33;
      b[i] = noise() * (t < 0.22 ? Math.sin(Math.PI * seg) : Math.sin(Math.PI * seg) * 0.9);
    }
    const swept = lowpass(highpass(b, 400), (t) => (t < 0.22 ? 600 + 5000 * (t / 0.22) : 5500 - 4800 * ((t - 0.22) / 0.33)));
    const tonal = tone(L, (t) => (t < 0.22 ? 200 + 900 * (t / 0.22) : 1100 - 950 * ((t - 0.22) / 0.33)), { shape: "saw", a: 0.005, d: 0.4 });
    return softclip(mix(swept, lowpass(tonal, 3000), 0, 0.25), 2);
  },

  shutter: () => {
    const b = buf(0.3);
    mix(b, clickBurst(0.05, 1800), 0, 1);
    mix(b, clickBurst(0.07, 900), 0.075, 0.8);
    const n = buf(0.08);
    for (let i = 0; i < n.length; i++) n[i] = noise() * env(i / SR, 0.002, 0.02);
    return mix(b, lowpass(highpass(n, 2000), 7000), 0.02, 0.3);
  },

  glitch: () => {
    const b = buf(0.4);
    let t = 0;
    while (t < 0.36) {
      const len = 0.01 + rnd() * 0.04;
      const f = 80 + rnd() * 1800;
      const chunk = rnd() > 0.5 ? tone(len, () => f, { shape: "square", a: 0.0005, d: 1 }) : buf(len).map(() => noise());
      // Bit crush
      const crushed = chunk.map((v) => Math.round(v * 6) / 6);
      mix(b, crushed, t, 0.6 + rnd() * 0.4);
      t += len + (rnd() > 0.7 ? 0.02 : 0);
    }
    return b;
  },
};

const writeWav = (file, data) => {
  const pcm = Buffer.alloc(data.length * 2);
  for (let i = 0; i < data.length; i++) pcm.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(data[i] * 32767))), i * 2);
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, pcm]));
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, make] of Object.entries(sounds)) {
  const file = path.join(OUT, `${name}.wav`);
  if (fs.existsSync(file) && !force) {
    console.log(`skip  ${name}.wav (exists — use --force to overwrite)`);
    continue;
  }
  // Short fade-out to avoid clicks at the end.
  const data = normalize(make());
  const fade = Math.min(data.length, Math.round(0.01 * SR));
  for (let i = 0; i < fade; i++) data[data.length - 1 - i] *= i / fade;
  writeWav(file, data);
  console.log(`wrote ${name}.wav`);
}
