import { defineReel, assetsOf } from "../../spec/define";

/**
 * DAY 25 — building an app. Эпизод 1 потенциальной серии. 30 с.
 *
 * Монтаж построен на реальной озвучке (audio/vo.m4a). Пословные тайминги —
 * audio/vo.words.json (офлайн-распознавание). Время в комментариях ниже — время
 * в ролике. Голос не изменён; единственное вмешательство — пауза перед
 * «Приложение всё ещё не готово» удлинена на 0.4 с (файл разрезан в тишине).
 *
 * Что реально звучит (сверено с записью):
 *   0.28  «Двадцать пять дней назад я начала делать приложение.»
 *   3.84  «Я вообще не программист.»
 *   5.24  «Я просто решила проверить, смогу ли я собрать его с помощью Claude.»
 *   9.60  «За эти дни я узнала, что такое GitHub (11.28), репозиторий (12.00),
 *          баги (13.00), тестирование (13.48) и ещё миллион (15.08) вещей,
 *          о которых раньше не слышала.» — до 17.35
 *  18.32  «Приложение всё ещё не готово.»            (тишина 17.35–18.32)
 *  19.92  «Но оно уже работает.»                     (работает — 20.60)
 *  21.52  «И теперь мне почему-то очень интересно, чем это закончится.» (закончится — 25.16)
 *
 * Битшит:
 *   0.00–3.75   ХУК        DAY 25 → я + ноутбук → реальное приложение
 *   3.75–5.25   НЕ ПРОГРАММИСТ — скептическое лицо
 *   5.25–9.55   ЭКСПЕРИМЕНТ   я → ноутбук → код → Claude
 *   9.55–17.60  ХАОС        GitHub / репозиторий / баги / тестирование / миллион вещей
 *  17.60–19.92  ТИШИНА      «ещё не готово» — deadpan
 *  19.92–22.30  PAYOFF      реальное приложение работает
 *  22.30–26.60  ФИНАЛ       я + ноутбук + кот + «?»
 *  26.60–30.00  DAY 25 / BUILDING AN APP
 */

const a = assetsOf("day-25");
const st = (f: string) => `stickers/${f}`;

const APP = a("screens/03-kedice-walkthrough.mp4"); // реальные записи экрана приложения + Claude Code
const COFFEE = a("video/01-coffee.mp4");
const ME_IDEA = st("alina-idea.png");
const ME_SIDE_EYE = st("alina-side-eye.png");
const LAPTOP = st("laptop.png");
const CAT = st("cat-hands.png");

export default defineReel({
  id: "day-25",
  title: "Day 25 — building an app",
  look: { grain: true, guides: false },

  voiceover: [
    // файл 2.6–20.2 с → ролик 0.0–17.6
    { src: a("audio/vo.m4a"), at: 0, trimStart: 2.6, duration: 17.6 },
    // файл 20.2–28.2 с → ролик 18.0–26.0 (пауза перед «Приложение…» +0.4 с)
    { src: a("audio/vo.m4a"), at: 18.0, trimStart: 20.2, duration: 8.0 },
  ],

  scenes: [
    // ── 1. ХУК ────────────────────────────────────────────────────────────
    {
      type: "beat",
      note: "DAY 25 → я → ноутбук",
      bg: "ink",
      duration: 2.45,
      overlays: [
        { type: "title", text: "DAY", x: 0.3, y: 0.16, size: 170, color: "paper", width: 520, align: "left", enter: "slam" },
        { type: "chapter", text: "25", x: 0.42, y: 0.38, size: 720, color: "orange", enter: "slam" },
        { type: "sticker", src: ME_IDEA, x: 0.66, y: 0.6, w: 560, rotate: 3, at: 0.62, enter: "drop", shadow: false },
        { type: "sticker", src: LAPTOP, x: 0.3, y: 0.76, w: 540, rotate: -7, at: 1.22, enter: "pop" },
      ],
      sfx: [{ at: 0, sfx: "impact", volume: 0.2 }],
    },
    {
      type: "video",
      note: "…делать приложение — реальное приложение",
      src: APP,
      trimStart: 3.0,
      duration: 1.3,
      focus: "50% 40%",
      zooms: [{ at: 0.75, scale: 1.12, y: 0.45 }],
      overlays: [{ type: "label", text: "BUILDING AN APP", y: 0.14, rotate: -2, size: 56 }],
    },

    // ── 2. НЕ ПРОГРАММИСТ ─────────────────────────────────────────────────
    {
      type: "beat",
      note: "я вообще не программист",
      bg: "paper",
      duration: 1.5,
      zooms: [{ at: 0.8, scale: 1.12, x: 0.5, y: 0.7 }],
      overlays: [
        { type: "sticker", src: ME_SIDE_EYE, x: 0.5, y: 0.68, w: 820, rotate: 0, enter: "none" },
        { type: "title", text: "НЕ\nПРОГРАММИСТ", y: 0.24, size: 132, width: 940, at: 0.55, enter: "slam" },
      ],
    },

    // ── 3. ЭКСПЕРИМЕНТ: я → ноутбук → код → Claude ────────────────────────
    {
      type: "beat",
      note: "я просто решила проверить → ноутбук",
      bg: "orange",
      duration: 2.0,
      overlays: [
        { type: "sticker", src: ME_IDEA, x: 0.3, y: 0.56, w: 500, rotate: -3, enter: "pop", shadow: false },
        { type: "hand", text: "я", x: 0.17, y: 0.2, size: 130, color: "ink", at: 0.1 },
        { type: "arrow", x: 0.5, y: 0.42, toX: 0.68, toY: 0.55, color: "ink", at: 0.6 },
        { type: "sticker", src: LAPTOP, x: 0.72, y: 0.66, w: 470, rotate: 5, at: 0.83, enter: "pop" },
      ],
      sfx: [{ at: 0.83, sfx: "click", volume: 0.3 }],
    },
    {
      type: "video",
      note: "смогу ли я собрать — Claude Code (код)",
      src: APP,
      trimStart: 0,
      duration: 1.3,
      focus: "50% 0%",
      zooms: [{ at: 0.1, scale: 1.55, x: 0.5, y: 0.1 }],
      overlays: [{ type: "title", text: "КОД", y: 0.55, size: 200, bg: "paper", width: 560, at: 0.07, rotate: -3 }],
      sfx: [{ at: 0, sfx: "keyboard", volume: 0.4 }],
    },
    {
      type: "beat",
      note: "с помощью Claude — реальный документ из Claude",
      bg: "ink",
      duration: 1.0,
      overlays: [
        { type: "sticker", src: a("screens/01-claude-app-plan.png"), frame: "card", x: 0.5, y: 0.56, w: 660, h: 1040, rotate: -3, enter: "drop", zoomTo: 1.04 },
        { type: "title", text: "CLAUDE", y: 0.15, size: 130, color: "paper", width: 900, at: 0.05, enter: "slam" },
      ],
    },

    // ── 4. ХАОС ───────────────────────────────────────────────────────────
    {
      type: "video",
      note: "за эти дни я узнала, что такое",
      src: COFFEE,
      trimStart: 1.5,
      duration: 1.7,
      zooms: [{ at: 0.93, scale: 1.28, x: 0.5, y: 0.3 }],
      overlays: [{ type: "counter", text: "ДЕНЬ 1 → 25", x: 0.3, y: 0.14 }],
    },
    {
      type: "text",
      note: "GitHub",
      lines: ["GITHUB"],
      bg: "ink",
      align: "center",
      size: 230,
      duration: 0.75,
      sfx: [{ at: 0, sfx: "pop", volume: 0.45 }],
    },
    {
      type: "video",
      note: "репозиторий — реальная шапка репозитория в Claude Code",
      src: APP,
      trimStart: 51.9,
      duration: 1.0,
      focus: "50% 0%",
      zooms: [{ at: 0, scale: 1.7, x: 0.5, y: 0.06 }],
      overlays: [{ type: "title", text: "РЕПОЗИТОРИЙ", y: 0.5, size: 120, bg: "orange", width: 980, rotate: 2 }],
    },
    {
      type: "image",
      note: "баги",
      src: a("memes/laptop-bite.jpg"),
      duration: 0.48,
      focus: "40% 50%",
      drift: false,
      shakes: [{ at: 0, duration: 0.45, intensity: 1.1 }],
      overlays: [{ type: "title", text: "БАГИ", y: 0.24, size: 200, color: "white", bg: "alert", width: 640, rotate: -4 }],
      sfx: [{ at: 0, sfx: "error", volume: 0.18 }],
    },
    {
      type: "meme",
      note: "тестирование",
      src: a("memes/harold-testing.jpg"),
      caption: "[ТЕСТИРОВАНИЕ]",
      aspect: 500 / 612,
      bg: "paper",
      duration: 1.12,
    },
    {
      type: "video",
      note: "и ещё миллион — реальное приложение ×4",
      src: APP,
      trimStart: 15,
      playbackRate: 4,
      duration: 0.9,
      mono: true,
      overlays: [{ type: "title", text: "+ МИЛЛИОН", y: 0.5, size: 150, bg: "orange", width: 960, rotate: -3, at: 0.45 }],
    },
    {
      type: "beat",
      note: "…вещей, о которых раньше — объекты",
      bg: "ink",
      duration: 1.2,
      overlays: [
        { type: "error", title: "error", body: "*???*", buttons: ["OK"], x: 0.5, y: 0.3, at: 0 },
        { type: "sticker", src: LAPTOP, x: 0.27, y: 0.62, w: 400, rotate: -12, flip: true, at: 0.25, enter: "drop" },
        { type: "loading", variant: "spinner", x: 0.73, y: 0.58, color: "orange", at: 0.45 },
        { type: "sticker", src: ME_SIDE_EYE, x: 0.66, y: 0.77, w: 330, rotate: 8, at: 0.7, enter: "pop" },
      ],
      sfx: [{ at: 0, sfx: "notification", volume: 0.4 }],
    },
    {
      type: "video",
      note: "не слышала — freeze на мне",
      src: COFFEE,
      trimStart: 3.4,
      duration: 0.9,
      freeze: { at: 0, style: "mono", zoom: 1.3 },
      overlays: [{ type: "hand", text: "???", x: 0.68, y: 0.22, size: 170, color: "orange", rotate: -8 }],
    },

    // ── 5. ТИШИНА: ЕЩЁ НЕ ГОТОВО ──────────────────────────────────────────
    {
      type: "beat",
      note: "приложение всё ещё не готово — deadpan, без SFX",
      bg: "paper",
      duration: 2.32,
      overlays: [
        { type: "sticker", src: ME_SIDE_EYE, x: 0.5, y: 0.72, w: 780, rotate: -2, enter: "none" },
        { type: "loading", variant: "dots", x: 0.5, y: 0.42, color: "ink", size: 1.2 },
        { type: "title", text: "ЕЩЁ\nНЕ ГОТОВО", y: 0.22, size: 150, width: 940, at: 1.36, enter: "none" },
      ],
    },

    // ── 6. PAYOFF: НО ОНО УЖЕ РАБОТАЕТ ────────────────────────────────────
    {
      type: "video",
      note: "но оно уже — карта уроков",
      src: APP,
      trimStart: 4.2,
      duration: 0.63,
      focus: "50% 35%",
    },
    {
      type: "video",
      note: "работает — правильный ответ",
      src: APP,
      trimStart: 28.8,
      duration: 0.8,
      focus: "50% 0%",
      
      overlays: [
        { type: "check", x: 0.84, y: 0.27, size: 190, at: 0.05 },
        { type: "title", text: "РАБОТАЕТ", y: 0.64, size: 130, bg: "orange", width: 860, at: 0.05, rotate: -2 },
      ],
      sfx: [{ at: 0.05, sfx: "ding", volume: 0.35 }],
    },
    {
      type: "video",
      note: "карточки слов листаются",
      src: APP,
      trimStart: 43.4,
      duration: 0.95,
      focus: "50% 35%",
    },

    // ── 7. ФИНАЛ: …ЧЕМ ЭТО ЗАКОНЧИТСЯ ─────────────────────────────────────
    {
      type: "beat",
      note: "мне почему-то очень интересно, чем это закончится",
      bg: "paper",
      duration: 4.3,
      overlays: [
        { type: "sticker", src: ME_IDEA, x: 0.36, y: 0.56, w: 620, rotate: -2, enter: "none", shadow: false, float: true },
        { type: "sticker", src: CAT, x: 0.77, y: 0.6, w: 330, rotate: 6, at: 0.9, enter: "drop" },
        { type: "sticker", src: LAPTOP, x: 0.72, y: 0.79, w: 470, rotate: 4, enter: "none" },
        { type: "chapter", text: "?", variant: "serif", x: 0.7, y: 0.27, size: 520, color: "orange", at: 2.86, enter: "slam" },
      ],
      sfx: [{ at: 2.86, sfx: "pop", volume: 0.5 }],
    },

    // ── 8. КАРТОЧКА ЭПИЗОДА ───────────────────────────────────────────────
    {
      type: "beat",
      note: "DAY 25 / BUILDING AN APP",
      bg: "ink",
      duration: 3.4,
      overlays: [
        { type: "title", text: "DAY 25", y: 0.42, size: 230, color: "orange", width: 980, enter: "none" },
        { type: "title", text: "BUILDING AN APP", y: 0.54, size: 70, color: "paper", font: "mono", width: 900, at: 0.35, enter: "type" },
      ],
    },
  ],
});
