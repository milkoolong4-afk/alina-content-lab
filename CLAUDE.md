# Alina Content Lab — instructions for Claude

Personal-blog short videos (Reels / TikTok / Shorts), 9:16, 1080×1920, 30 fps,
30–35 s by default. Built with Remotion. Every reel is **data** (a `ReelSpec`
in `src/reels/<slug>/reel.ts`) rendered by one engine (`src/engine/Reel.tsx`).

## Hard rules

- **This project is NOT Kedice's visual system.** Never pull Kedice colours,
  fonts, characters, components, sound design or visual decisions. Kedice may
  appear only *as a product inside the story* (her screen recordings as-is).
- **Visual style v1 (orange `#FF5A1F` / navy ink / heavy grotesk / dark meme look) is ARCHIVED**
  (`docs/_archive/STYLE-v1-orange.md`, commit `7d79175` (last v1 state)). Do not use it as the
  direction for new reels. Style v2 is being defined from the three editing references
  (`reference/editing/ref-a|b|c`) — see `docs/STYLE.md`. Until v2 is approved, propose
  style probes instead of applying a look on your own.
- Use only the tokens in `src/theme/` and fonts in `src/theme/fonts.ts` (they will switch to v2).
- The main character is Alina, but this is **not a talking-head blog**: face in
  doses; lean on her real footage, work shots, laptop/phone, screen recordings,
  screenshots, photos, memes, big typography, visual jokes.
- Never make it look like: startup ad, corporate, educational app promo,
  motivational video, cinematic vlog, generic TikTok template, cute lifestyle reel.
- Tone: personal, a bit cheeky, funny, self-ironic.

## Priorities (in this order)

1. Story 2. Hook 3. Editing rhythm 4. Visual joke 5. Typography 6. Sound design 7. Music

Music never defines a reel. Default: no music at all.

## When Alina sends material (video / screenshots / memes / VO / script)

1. `npm run new -- <slug> "Title"` → spec + asset folders.
2. Put files into `public/reels/<slug>/{video,screens,photos,memes,audio}`.
   Rename to short ordered names (`01-desk.mp4`), never spaces.
   Convert HEVC/.MOV if Chromium can't decode it:
   `ffmpeg -i in.MOV -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4`.
3. `npm run probe -- <slug>` → durations / orientation of everything.
4. If there is VO: transcribe or align to the script, put timings into
   `captions.lines` (2–5 words per line). Scene cuts follow the VO, not vice versa.
5. Write the beat sheet as comments first (hook / context / escalation / twist /
   ending — see `src/reels/_template/reel.ts`), then the scenes.
6. Check with stills at key frames (`npx remotion still <id> out/x.png --frame=N`),
   then `npm run render -- <id> --draft`, then final `npm run render -- <id>`.

**`docs/EDITING.md` is the binding editing style guide** (pacing, face, typography,
memes, interruptions, transitions, sound, pre-render checklist). Follow it for every reel
and run its checklist before rendering. **Editing style is uniform; the narrative format is
chosen per reel** (voice-over, talking head, text-only, memes/screenshots, or a mix) —
voice-over + word-by-word captions is one option, never a mandatory default.

Read `docs/EDITING.md`, `docs/STYLE.md`, `docs/SOUND.md`, `docs/WORKFLOW.md`,
`docs/COMPONENTS.md` before writing a new reel. Editing references and their analysis
live in `reference/editing/` (`ANALYSIS.md`) — principles only, never copy frames,
texts, characters, content or design. `reference/_archive/` holds retired references
(the orange carousel) — not a direction anymore.

## Editing defaults

- First 1.5 s must hook: strongest frame + short statement. No "привет".
- Average shot 0.8–2.5 s. Vary it: a 0.4 s stab next to a 3 s hold.
- Hard cuts by default. `transition` is seasoning, ≤ 1 per 4 scenes.
- Text on screen: ≤ 6 words per card, markup `*orange*`, `[boxed]`, `~strike~`, `_serif_`.
- Keep text inside safe zones (`safe` in tokens). Turn on `look.guides` to check.
- SFX serve a joke or a cut — NOT every cut. Silence is a tool (`beat` scene, `audioCuts`).
- Footage audio is muted by default (`volume: 0`); enable only when the real sound is the joke.

## Commands

- `npm run dev` — Remotion Studio
- `npm run new -- <slug> ["Title"]` — new reel from template
- `npm run probe -- <slug>` — asset info
- `npm run render -- <id> [--draft]` — render to `out/`
- `npm run timings -- <slug>` — voice-over → word timestamps (`audio/vo.words.json`, local whisper.cpp)
- `npm run sfx [-- --force]` — (re)generate placeholder SFX
- `npm run typecheck`

In the cloud container Chromium for Remotion lives at
`/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`
(pass via `BROWSER_EXECUTABLE=` or `--browser-executable=`).
