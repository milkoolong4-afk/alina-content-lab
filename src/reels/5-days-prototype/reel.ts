import { defineReel, assetsOf } from "../../spec/define";

/**
 * 5 ДНЕЙ: ПРОТОТИП — первый тестовый рилс (35 с, без войсовера).
 *
 * Битшит:
 *   0.0–4.4   ХУК        кофе + «5 дней назад не знала, что такое репозиторий» → заставка приложения
 *   4.4–9.0   КОНТЕКСТ   «не умею программировать» (мем) → «попросила Claude» (реальные скрины чата)
 *   9.0–15.0  ПРОЦЕСС    Claude Code → «через 5 дней» → реальный прототип в телефоне + ироничный LEVEL UP
 *   15.0–18.0 ГЕНИЙ      freeze на мне → «что я гений» (вознесение) + звенящий звук
 *   18.0–27.2 ХАОС       scratch → GITHUB → BUGS (реальный текст про ошибку) → мемы, быстрые склейки
 *   27.2–31.0 ПАУЗА      тишина → я спокойно пью кофе: «это был только первый уровень»
 *   31.0–35.0 ПАНЧЛАЙН   «Я НЕ ПРОГРАММИСТ.» — пауза — «Я ПРОСТО НЕ ЗНАЮ, КОГДА ОСТАНОВИТЬСЯ.»
 *
 * Войсовер: сейчас нет. Когда появится — положить в audio/vo.m4a, раскомментировать
 * `voiceover`, расставить `captions.lines` и подогнать `duration` сцен под фразы
 * (порядок сцен и тексты менять не нужно). SFX под голосом приглушить до 0.3–0.5.
 *
 * Факты: всё показанное — реальные записи и скриншоты. GitHub показан только
 * типографикой (скринов GitHub нет — не рисуем фейковых).
 */

const a = assetsOf("5-days-prototype");
const FACE = a("video/01-face-coffee.mp4");
const APP = a("screens/02-kedice-walkthrough.mp4");

export default defineReel({
  id: "5-days-prototype",
  title: "5 дней: прототип",
  look: { grain: true, guides: false },

  // voiceover: { src: a("audio/vo.m4a") },
  // captions: { style: "box", lines: [] },

  scenes: [
    // ── ХУК ────────────────────────────────────────────────────────────────
    {
      type: "video",
      note: "hook: я пью кофе",
      src: FACE,
      trimStart: 1.5,
      duration: 2.4,
      zooms: [{ at: 1.1, scale: 1.3, x: 0.5, y: 0.3 }],
      overlays: [
        { type: "title", text: "5 ДНЕЙ НАЗАД\nЯ НЕ ЗНАЛА,\nЧТО ТАКОЕ [РЕПОЗИТОРИЙ]", y: 0.7, bg: "paper", size: 82, width: 960, align: "left", rotate: -1.5 },
      ],
      sfx: [{ at: 0, sfx: "thud", volume: 0.7 }],
    },
    {
      type: "video",
      note: "hook: а сейчас — приложение",
      src: APP,
      trimStart: 3.0,
      duration: 2.0,
      focus: "50% 45%",
      overlays: [{ type: "title", text: "А СЕЙЧАС\nУ МЕНЯ ЕСТЬ\n*ПРИЛОЖЕНИЕ*", y: 0.25, bg: "paper", size: 96, width: 860, align: "left", rotate: 1.5 }],
      sfx: [{ at: 0, sfx: "pop", volume: 0.6 }],
    },

    // ── КОНТЕКСТ ───────────────────────────────────────────────────────────
    {
      type: "image",
      note: "не умею программировать (мем-ребёнок)",
      src: a("memes/kid-computer.jpg"),
      duration: 2.0,
      focus: "45% 50%",
      zooms: [{ at: 1.0, scale: 1.45, x: 0.42, y: 0.52 }],
      overlays: [{ type: "title", text: "я вообще\n*не умею*\nпрограммировать", y: 0.2, bg: "paper", size: 80, width: 820, align: "left" }],
    },
    {
      type: "image",
      note: "попросила Claude — реальный чат",
      src: a("screens/03-claude-map.png"),
      duration: 1.3,
      focus: "50% 30%",
      overlays: [{ type: "label", text: "поэтому просто попросила Claude", y: 0.14, rotate: -2, size: 56 }],
      sfx: [{ at: 0, sfx: "typing", volume: 0.35, duration: 1.3 }],
    },
    {
      type: "image",
      note: "…сделать его за меня",
      src: a("screens/04-claude-merhaba.png"),
      duration: 1.3,
      focus: "50% 30%",
      drift: false,
      zooms: [{ at: 0, scale: 1.0 }, { at: 0.2, scale: 1.35, y: 0.32, duration: 0.9 }],
      overlays: [{ type: "label", text: "сделать его *за меня*", y: 0.14, rotate: 2, size: 64 }],
    },

    // ── ПРОЦЕСС ────────────────────────────────────────────────────────────
    {
      type: "video",
      note: "Claude Code",
      src: APP,
      trimStart: 0,
      duration: 1.2,
      focus: "50% 20%",
      overlays: [{ type: "title", text: "и каким-то образом", y: 0.72, bg: "paper", size: 72, width: 860, rotate: -1 }],
      sfx: [{ at: 0, sfx: "keyboard", volume: 0.45 }],
    },
    {
      type: "text",
      note: "через 5 дней",
      kicker: "ДЕНЬ 1 → ДЕНЬ 5",
      lines: ["ЧЕРЕЗ", "*5 ДНЕЙ*"],
      bg: "orange",
      size: 190,
      duration: 1.0,
      sfx: [{ at: 0, sfx: "thud", volume: 0.7 }],
    },
    {
      type: "screen",
      note: "реальный прототип + LEVEL UP",
      src: APP,
      trimStart: 4.0,
      playbackRate: 1.6,
      device: "phone",
      bg: "paper",
      scale: 0.78,
      y: 0.58,
      duration: 3.8,
      overlays: [
        { type: "title", text: "у меня появился\n[рабочий прототип]", y: 0.135, size: 70, width: 900 },
        { type: "stamp", text: "LEVEL UP", color: "orange", size: 120, y: 0.45, x: 0.5, rotate: -8, at: 1.7 },
        { type: "progress", label: "навыки программирования", from: 0, to: 3, y: 0.78, at: 2.2 },
      ],
      sfx: [
        { at: 1.7, sfx: "ding", volume: 0.6 },
        { at: 2.2, sfx: "tick", volume: 0.5 },
      ],
    },

    // ── «Я ГЕНИЙ» ──────────────────────────────────────────────────────────
    {
      type: "video",
      note: "freeze: в этот момент я решила",
      src: FACE,
      trimStart: 2.0,
      duration: 1.2,
      freeze: { at: 0.25, label: "в этот момент\nя решила,", style: "mono", zoom: 1.2 },
      sfx: [{ at: 0.25, sfx: "shutter", volume: 0.6 }],
    },
    {
      type: "image",
      note: "…что я гений (вознесение)",
      src: a("memes/heaven.jpg"),
      duration: 1.8,
      transition: "flash",
      drift: false,
      zooms: [{ at: 0, scale: 1.05, x: 0.48, y: 0.45 }, { at: 0.05, scale: 1.4, x: 0.48, y: 0.45, duration: 1.75 }],
      overlays: [{ type: "title", text: "ЧТО Я *ГЕНИЙ*", y: 0.74, bg: "ink", color: "paper", size: 110, width: 900, at: 0.15 }],
      sfx: [
        { at: 0, sfx: "ding", volume: 0.8 },
        { at: 0.15, sfx: "impact", volume: 0.6 },
      ],
    },

    // ── ХАОС ───────────────────────────────────────────────────────────────
    {
      type: "text",
      note: "scratch → GITHUB",
      kicker: "а потом появился",
      lines: ["[GITHUB]"],
      bg: "ink",
      align: "center",
      size: 200,
      duration: 0.9,
      transition: "glitch",
      sfx: [{ at: 0, sfx: "scratch", volume: 0.9 }],
    },
    {
      type: "video",
      note: "BUGS — реальный текст Claude про красную ошибку",
      src: APP,
      trimStart: 51.9,
      duration: 1.0,
      focus: "50% 20%",
      zooms: [{ at: 0.15, scale: 1.8, x: 0.4, y: 0.55 }],
      overlays: [{ type: "stamp", text: "BUGS", y: 0.25, at: 0.15 }],
      sfx: [{ at: 0.15, sfx: "error", volume: 0.55 }],
    },
    {
      type: "image",
      note: "мем: грызу ноутбук",
      src: a("memes/laptop-bite.jpg"),
      duration: 0.9,
      focus: "40% 50%",
      shakes: [{ at: 0.05, duration: 0.5, intensity: 1.2 }],
      sfx: [{ at: 0.05, sfx: "bonk", volume: 0.6 }],
    },
    {
      type: "meme",
      note: "TESTING — Harold",
      src: a("memes/harold-testing.jpg"),
      caption: "[TESTING]",
      aspect: 500 / 612,
      duration: 1.5,
      transition: "drop",
      sfx: [{ at: 0, sfx: "pop", volume: 0.5 }],
    },
    {
      type: "video",
      note: "мельтешение упражнений x4",
      src: APP,
      trimStart: 15,
      playbackRate: 4,
      duration: 0.9,
      overlays: [{ type: "title", text: "ЧТО\nПРОИСХОДИТ", y: 0.5, bg: "orange", size: 120, width: 860, rotate: -3 }],
      sfx: [
        { at: 0, sfx: "click", volume: 0.6 },
        { at: 0.35, sfx: "click", volume: 0.6 },
      ],
    },
    {
      type: "image",
      note: "мем: много рук",
      src: a("memes/multitask.jpg"),
      duration: 0.9,
      shakes: [{ at: 0, duration: 0.9, intensity: 0.5 }],
      sfx: [{ at: 0, sfx: "typing", volume: 0.5, duration: 0.9 }],
    },
    {
      type: "image",
      note: "мем: PANIC + WHY?",
      src: a("memes/panic.jpg"),
      duration: 0.8,
      zooms: [{ at: 0.3, scale: 1.4, x: 0.5, y: 0.45 }],
      overlays: [{ type: "title", text: "WHY?", y: 0.25, size: 180, color: "ink", at: 0.3 }],
      sfx: [{ at: 0.3, sfx: "click", volume: 0.8 }],
    },
    {
      type: "image",
      note: "мем: шок",
      src: a("memes/shocked.jpg"),
      duration: 1.1,
      drift: false,
      zooms: [{ at: 0, scale: 1.1, x: 0.45, y: 0.35 }, { at: 0.5, scale: 1.6, x: 0.45, y: 0.35 }],
      sfx: [{ at: 0.5, sfx: "impact", volume: 0.55 }],
    },
    {
      type: "text",
      note: "я думала, что сделала приложение",
      lines: ["я думала,", "что сделала", "*приложение*"],
      animate: "words",
      bg: "paper",
      size: 120,
      duration: 1.4,
    },

    // ── ПАУЗА ──────────────────────────────────────────────────────────────
    {
      type: "beat",
      note: "тишина после хаоса",
      duration: 0.5,
    },
    {
      type: "video",
      note: "я спокойно пью кофе — первый уровень",
      src: FACE,
      trimStart: 3.2,
      duration: 3.3,
      zooms: [{ at: 0, scale: 1.0 }, { at: 0.01, scale: 1.18, x: 0.5, y: 0.3, duration: 3.2 }],
      overlays: [
        { type: "title", text: "и вот здесь я поняла:", y: 0.72, bg: "paper", size: 66, width: 860, at: 0.3, duration: 1.6, enter: "pop" },
        { type: "title", text: "это был только\n*первый уровень*", y: 0.72, bg: "paper", size: 80, width: 860, at: 1.9 },
      ],
      sfx: [{ at: 1.9, sfx: "tick", volume: 0.5 }],
    },

    // ── ПАНЧЛАЙН ───────────────────────────────────────────────────────────
    {
      type: "text",
      note: "я не программист",
      lines: ["Я НЕ", "ПРОГРАММИСТ."],
      bg: "ink",
      align: "center",
      size: 150,
      duration: 1.3,
      sfx: [{ at: 0, sfx: "thud", volume: 0.8 }],
    },
    {
      type: "beat",
      note: "пауза перед панчлайном",
      duration: 0.5,
    },
    {
      type: "text",
      note: "панчлайн",
      lines: ["Я ПРОСТО", "НЕ ЗНАЮ,", "КОГДА", "*ОСТАНОВИТЬСЯ.*"],
      bg: "orange",
      size: 130,
      duration: 2.0,
      sfx: [{ at: 0, sfx: "impact", volume: 0.8 }],
    },
  ],
});
