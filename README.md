# Alina Content Lab

Шаблон-мастерская для коротких вертикальных видео (Reels / TikTok / YouTube Shorts)
для личного блога: AI, создание своего приложения без опыта программирования,
маркетинг, предпринимательство, реальные ошибки — с самоиронией.

**Remotion · 9:16 · 1080×1920 · 30 fps · 30–35 с**

> Отдельный проект со своей визуальной системой. Не связан с Kedice как с дизайном —
> Kedice появляется только как продукт внутри истории.

## Идея

Каждый рилс — это **данные**: файл `src/reels/<slug>/reel.ts` со списком сцен
(видео, экран, скриншот, мем, типографика, пауза), оверлеев, звуков и субтитров.
Один движок (`src/engine/Reel.tsx`) превращает это в видео. Стиль, шрифты, звуки и
компоненты общие — поэтому каждый новый ролик собирается быстро и выглядит как один блог.

## Быстрый старт

```bash
npm install
npm run dev                         # Studio: Lab → style-demo (все компоненты), Lab → template
npm run new -- my-first-reel "Как я сломала прод"
npm run probe -- my-first-reel      # инфо о загруженных файлах
npm run render -- my-first-reel --draft
npm run render -- my-first-reel     # → out/my-first-reel.mp4
```

## Структура

```
src/
  theme/        токены (цвета, safe zones, размеры), шрифты
  spec/         типы ReelSpec, раскладка таймлайна
  engine/       Reel (рендер спеки), сцены, аудио-слой
  components/
    scenes/     video · image · screen · meme · text · split · beat
    overlays/   title · label · stamp · hand · arrow · circle · highlight · counter
                notification · error · sticker · emoji · cursor · progress · flash
    type/       KineticText (slam/words/lines/type), разметка, субтитры
    media/      MediaFill, Camera (punch-in, zoom, shake), рамки телефона/ноутбука
    fx/         переходы, зерно, safe-зоны
  sfx/          библиотека звуков (имя → файл)
  reels/        _template · _style-demo · <твои рилсы>
public/
  fonts/        локальные шрифты (OFL)
  sfx/          звуки (заглушки — заменить на реальные с теми же именами)
  reels/<slug>/ video · screens · photos · memes · audio
docs/           STYLE · SOUND · WORKFLOW · COMPONENTS
reference/      визуальный референс и его разбор
scripts/        new-reel · render · probe-assets · generate-sfx
```

## Документация

- [docs/STYLE.md](docs/STYLE.md) — визуальный язык, монтаж, чего избегать
- [docs/SOUND.md](docs/SOUND.md) — sound design и библиотека звуков
- [docs/WORKFLOW.md](docs/WORKFLOW.md) — что присылать и как из этого получается рилс
- [docs/COMPONENTS.md](docs/COMPONENTS.md) — справочник всех сцен и оверлеев
- [CLAUDE.md](CLAUDE.md) — правила проекта для Claude

## Пример сцены

```ts
{
  type: "video",
  src: a("video/03-laptop.mp4"),
  duration: 3.2,
  zooms: [{ at: 0.8, scale: 1.35, y: 0.4 }],               // punch-in
  freeze: { at: 1.6, label: "она ещё *не знает*", style: "orange" },
  sfx: [{ at: 1.6, sfx: "scratch" }],
}
```
