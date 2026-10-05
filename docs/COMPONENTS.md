# Справочник: сцены, оверлеи, эффекты

Полные типы — `src/spec/types.ts`. Все времена в **секундах**; внутри сцены — от начала сцены.
Пути к файлам — относительно `public/` (`reels/<slug>/video/01.mp4`), или `demo:<текст>` для заглушки.
Живые примеры всего ниже — `src/reels/_style-demo/reel.ts` (Studio → Lab → style-demo).

## Общие поля любой сцены

| Поле | Что делает |
|---|---|
| `duration` | длина, сек |
| `note` | подпись бита (видна на таймлайне Studio) |
| `transition` | `cut` (по умолч.) · `flash` · `flash-orange` · `whip` · `glitch` · `zoom` · `drop` |
| `zooms` | `[{ at, scale, x?, y?, duration? }]` — `duration: 0` = punch-in; `{ at, scale: 1 }` = назад |
| `shakes` | `[{ at, duration?, intensity? }]` — тряска камеры |
| `overlays` | графика поверх (ниже) |
| `sfx` | `[{ at, sfx, volume?, duration? }]` |
| `bg` | цвет фона: `orange` · `ink` · `paper` · любой CSS |
| `mono` | ч/б: `true` — вся сцена, `{ from?, to? }` — участок (сек). Оверлеи остаются цветными |

## Сцены

- **`video`** — реальное видео. `src, trimStart, playbackRate, volume (0), fit, focus ("50% 30%"), mirror, freeze`.
  `freeze: { at, label?, style?: "flash"|"orange"|"mono"|"plain", zoom? }` — стоп-кадр с подписью.
  `window: { width?, aspect?, x?, y?, growAt?, growDuration?, border?, shadow? }` — видео **в окне**
  на фоне `bg` (по умолч. бумага); в `growAt` окно вырастает до полного кадра за `growDuration`
  (0 = мгновенно). Для talking head: окно → полный кадр на кульминации.
- **`image`** — фото / скриншот на весь кадр, лёгкий дрейф (`drift: false` — выключить).
- **`screen`** — запись экрана / скриншот в рамке. `device: "phone"|"laptop"|"none"`, `y`, `scale`, `tilt`. Фон по умолчанию оранжевый.
- **`meme`** — `layout: "card"` (подпись сверху + карточка, по умолч.) или `"full"`. `caption`, `top`, `bottom`, `aspect` (пропорции карточки = пропорции мема, чтобы не резать его текст), `fit`.
- **`text`** — большая типографика. `lines[]`, `animate: "slam"|"words"|"lines"|"type"|"none"`, `kicker`, `font`, `size`, `align`.
- **`split`** — ожидание/реальность. `a`, `b` (`{ src, label }`), `revealB`, `direction`.
- **`beat`** — пауза/тишина, почти пустой кадр с маленькой подписью.

## Оверлеи (`overlays`)

Общие: `at`, `duration` (по умолч. до конца сцены), `x`, `y` (0…1, центр элемента), `rotate`, `enter: "pop"|"slam"|"slide-up"|"none"|"type"`.

| type | Поля | Для чего |
|---|---|---|
| `title` | `text, size, color, bg, font, width, align` | крупный текст поверх видео |
| `label` | `text, bg, color` | стикер-плашка «это я в 3 ночи» |
| `stamp` | `text, color` | штамп FAIL / DONE |
| `hand` | `text, color, size` | рукописная подпись |
| `arrow` | `x,y → toX,toY, curve, width` | рисованная стрелка |
| `circle` | `w, h` | обвести от руки |
| `highlight` | `w, h, color` | маркер по скриншоту |
| `box` | `w, h` | рамка |
| `counter` | `text` | «ДЕНЬ 47», «попытка №12» |
| `notification` | `app, title, body, time` | пуш-уведомление |
| `error` | `title, body, buttons` | окно ошибки |
| `sticker` | `src, w, h` | PNG-стикер (вырезанное лицо, объект) |
| `emoji` | `char, size` | один эмодзи, крупно |
| `flash` | `color` | вспышка |
| `cursor` | `x,y → toX,toY, click` | курсор с кликом |
| `progress` | `label, from, to` | «загрузка мотивации 12%» |
| `chapter` | `text, size (760), variant: italic\|serif\|outline, aside, color, opacity` | гигантская цифра-глава «1.», вылезает за край и перекрывает кадр; `aside` — ремарка «(и самая главная)» |

Оверлеи на уровне всего рилса (`spec.overlays`) используют абсолютное время.

## Субтитры по слову

- `mode: "words"`: каждая строка `lines[]` — кусок из 1–3 слов; слова появляются по одному,
  место под ещё не сказанные слова зарезервировано (кусок не прыгает).
- `*слово*` — ключевое: в `keyScale` раз крупнее (2.2), оранжевое с толстой обводкой, на своей строке.
- `words: [...]` — время начала каждого слова (сек). Без него слова распределяются по длине.
- Из транскрипции (Whisper, шаг 2 плана): `linesFromWords(words, { keys, maxWords, gap, offset })`
  из `src/lib/captions.ts` превращает пословные тайминги в `lines`.

## Уровень рилса

```ts
defineReel({
  id: "slug",
  look: { grain: true, guides: false },
  voiceover: { src: a("audio/vo.m4a"), volume: 1 },
  music: undefined,                     // по умолчанию музыки нет
  audioCuts: [{ from: 18.2, to: 19.4 }], // тишина (музыка + звук видео)
  captions: {
    mode: "lines" | "words",            // "words" — по слову, *ключевое* крупнее
    style: "box" | "outline" | "orange", y: 0.68, keyScale: 2.2,
    lines: [{ text: "пять *дней* назад", start, end, words?: [t1, t2, t3] }],
  },
  sfx: [...],      // абсолютное время
  overlays: [...], // абсолютное время
  scenes: [...],
});
```

## Добавить новый компонент

1. Тип — в `src/spec/types.ts` (`Overlay` или `Scene`).
2. Рендер — в `src/components/overlays/Overlays.tsx` (`OverlayView`) или `src/components/scenes/Scenes.tsx` + `src/engine/SceneView.tsx`.
3. Пример — в `src/reels/_style-demo/reel.ts`.
4. Строку — в этот файл.
