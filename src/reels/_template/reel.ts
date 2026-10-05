import { defineReel, assetsOf } from "../../spec/define";

/**
 * ШАБЛОН РИЛСА — копируется командой `npm run new -- <slug>`.
 *
 * Драматургия по умолчанию (≈32 с):
 *   0–2 с    ХУК        — самый сильный кадр + короткая фраза. Без «привет».
 *   2–9 с    КОНТЕКСТ   — что я пыталась сделать (реальное видео / экран).
 *   9–19 с   ЭСКАЛАЦИЯ  — что пошло не так, 3–4 быстрых бита.
 *   19–26 с  ПОВОРОТ    — freeze / тишина / мем. Главная шутка.
 *   26–32 с  ФИНАЛ      — самоироничный вывод. Не «подписывайтесь!».
 *
 * Все `demo:` — заглушки. Замени их на реальные файлы из
 * public/reels/<slug>/… через helper `a("video/01.mp4")`.
 */

const a = assetsOf("__SLUG__");
void a;

export default defineReel({
  id: "template",
  title: "Template — структура рилса",
  look: { grain: true, guides: false },

  // voiceover: { src: a("audio/vo.m4a") },
  // captions: { style: "box", lines: [{ text: "пример *акцента*", start: 0.2, end: 1.4 }] },
  // audioCuts: [{ from: 19.4, to: 21 }],

  scenes: [
    // ── ХУК ─────────────────────────────────────────────
    {
      type: "video",
      note: "hook: самый странный/сильный кадр",
      src: "demo:хук — лучший кадр",
      duration: 1.8,
      zooms: [{ at: 0.9, scale: 1.3, y: 0.4 }],
      overlays: [{ type: "title", text: "ХУК: одна фраза,\nкоторая *цепляет*", y: 0.3, bg: "paper", size: 76 }],
      sfx: [{ at: 0.9, sfx: "impact", volume: 0.6 }],
    },

    // ── КОНТЕКСТ ────────────────────────────────────────
    {
      type: "text",
      note: "что я пыталась сделать",
      lines: ["Контекст", "в *пять* слов"],
      kicker: "день 1",
      bg: "orange",
      duration: 1.6,
      transition: "flash",
    },
    {
      type: "screen",
      note: "экран / процесс",
      src: "demo:screen recording",
      device: "phone",
      duration: 3.5,
      zooms: [{ at: 1.8, scale: 1.5, y: 0.35, duration: 0.4 }],
      overlays: [{ type: "label", text: "это я думаю, что всё просто", y: 0.12, at: 0.3 }],
      sfx: [{ at: 0.3, sfx: "pop", volume: 0.5 }],
    },

    // ── ЭСКАЛАЦИЯ ───────────────────────────────────────
    {
      type: "video",
      note: "проблема #1",
      src: "demo:я работаю",
      duration: 2.6,
      overlays: [{ type: "error", body: "Ошибка №1:\n*что-то сломалось*", at: 1.0 }],
      sfx: [{ at: 1.0, sfx: "error", volume: 0.6 }],
    },
    {
      type: "image",
      note: "проблема #2 — скриншот",
      src: "demo:скриншот",
      duration: 2.4,
      transition: "glitch",
      overlays: [
        { type: "circle", x: 0.5, y: 0.45, w: 620, h: 260, at: 0.6 },
        { type: "hand", text: "вот это", x: 0.72, y: 0.3, at: 0.8 },
      ],
      sfx: [{ at: 0, sfx: "glitch", volume: 0.4 }],
    },
    {
      type: "text",
      note: "проблема #3 — короткий удар",
      lines: ["И ещё", "[третье]"],
      duration: 1.4,
      animate: "words",
    },
    {
      type: "meme",
      note: "мем-реакция",
      src: "demo:мем",
      caption: "Я после третьей попытки:",
      duration: 2.6,
      transition: "drop",
      sfx: [{ at: 0, sfx: "bonk", volume: 0.6 }],
    },

    // ── ПОВОРОТ ─────────────────────────────────────────
    {
      type: "video",
      note: "freeze frame — главная шутка",
      src: "demo:момент до катастрофы",
      duration: 3.8,
      freeze: { at: 1.2, label: "она ещё не знает,\nчто *всё удалила*", style: "orange" },
      sfx: [
        { at: 1.2, sfx: "scratch", volume: 0.8 },
        { at: 1.2, sfx: "shutter", volume: 0.5 },
      ],
    },
    {
      type: "beat",
      note: "тишина как пауза перед панчлайном",
      text: "...",
      duration: 1.0,
    },
    {
      type: "split",
      note: "ожидание vs реальность",
      a: { src: "demo:ожидание", label: "ожидание" },
      b: { src: "demo:реальность", label: "*реальность*" },
      revealB: 0.8,
      duration: 2.8,
      sfx: [{ at: 0.8, sfx: "thud", volume: 0.7 }],
    },

    // ── ФИНАЛ ───────────────────────────────────────────
    {
      type: "text",
      note: "вывод с самоиронией",
      lines: ["Вывод:", "_я всё ещё_", "*не программист*"],
      animate: "lines",
      duration: 3.0,
      transition: "zoom",
      sfx: [{ at: 0.8, sfx: "tick", volume: 0.5 }],
    },
    {
      type: "video",
      note: "финальный кадр/добивка",
      src: "demo:финальный кадр",
      duration: 3.8,
      overlays: [{ type: "counter", text: "ДЕНЬ 2 / ∞", at: 0.2 }],
    },
  ],
});
