#!/usr/bin/env node
/**
 * npm run timings -- <slug> [audio-file] [--model=medium] [--lang=ru]
 *
 * Voice-over → word-level timestamps, fully local (whisper.cpp, no API keys).
 *
 *   in:  public/reels/<slug>/audio/vo.(m4a|mp3|wav|…)   (or the file you pass)
 *        public/reels/<slug>/script.txt                 (optional: the text you read —
 *                                                        used as a hint for spelling)
 *   out: public/reels/<slug>/audio/vo.words.json        [{ text, startMs, endMs }]
 *
 * In the reel:
 *   import words from "../../../public/reels/<slug>/audio/vo.words.json";
 *   captions: { mode: "words", lines: linesFromWords(words, { keys: ["гений"] }) }
 *
 * First run downloads + compiles whisper.cpp and the model into .whisper/ (git-ignored).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { downloadWhisperModel, installWhisperCpp, toCaptions, transcribe } from "@remotion/install-whisper-cpp";

const args = process.argv.slice(2);
const flag = (name, def) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? def;
const [slug, fileArg] = args.filter((a) => !a.startsWith("--"));
if (!slug) {
  console.error("Usage: npm run timings -- <slug> [audio-file] [--model=medium] [--lang=ru]");
  process.exit(1);
}

const MODEL = flag("model", "medium");
const LANG = flag("lang", "ru");
const WHISPER_VERSION = "1.5.5";
const ROOT = path.resolve(".whisper");
const WHISPER_DIR = path.join(ROOT, "whisper.cpp");

const reelDir = path.resolve("public/reels", slug);
const audioDir = path.join(reelDir, "audio");
const input = fileArg
  ? path.resolve(fileArg)
  : fs.existsSync(audioDir) && fs.readdirSync(audioDir).filter((f) => /^vo\.(m4a|mp3|wav|aac|mp4|mov|ogg|flac)$/i.test(f)).map((f) => path.join(audioDir, f))[0];
if (!input || !fs.existsSync(input)) {
  console.error(`No voice-over found. Put it at public/reels/${slug}/audio/vo.m4a (or pass a file path).`);
  process.exit(1);
}

fs.mkdirSync(ROOT, { recursive: true });
fs.mkdirSync(audioDir, { recursive: true });

// whisper.cpp wants 16 kHz mono 16-bit WAV.
const wav = path.join(ROOT, `${slug}.16k.wav`);
const ff = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], { stdio: "inherit" });
if (ff.status !== 0) process.exit(ff.status ?? 1);

await installWhisperCpp({ to: WHISPER_DIR, version: WHISPER_VERSION, printOutput: false });
const modelFile = path.join(WHISPER_DIR, `ggml-${MODEL}.bin`);
const dropBadModel = () => {
  if (fs.existsSync(modelFile) && fs.statSync(modelFile).size < 10_000_000) fs.rmSync(modelFile);
};
dropBadModel();
await downloadWhisperModel({ model: MODEL, folder: WHISPER_DIR, printOutput: false });
if (fs.statSync(modelFile).size < 10_000_000) {
  const head = fs.readFileSync(modelFile, "utf8").slice(0, 200);
  dropBadModel();
  console.error(`\nModel download failed — got an error page instead of the model:\n  ${head}\n` +
    "Models come from huggingface.co. If this runs in a cloud environment, allow that host in the\n" +
    "environment's network settings (Custom → Allowed domains), or put ggml-" + MODEL + ".bin into .whisper/whisper.cpp/ manually.");
  process.exit(1);
}

// The script (if present) is passed as a prompt so names/terms are spelled the way she wrote them.
const scriptPath = path.join(reelDir, "script.txt");
const prompt = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, "utf8").replace(/\s+/g, " ").trim().slice(0, 800) : "";

console.log(`Transcribing ${path.relative(process.cwd(), input)} (model ${MODEL}, ${LANG})…`);
const out = await transcribe({
  inputPath: wav,
  whisperPath: WHISPER_DIR,
  whisperCppVersion: WHISPER_VERSION,
  model: MODEL,
  modelFolder: WHISPER_DIR,
  tokenLevelTimestamps: true,
  language: LANG,
  // Note: no splitOnWord — with whisper.cpp 1.5.5 it passes a stray "true" argument.
  // Token-level timestamps (DTW) already give per-word timing via toCaptions().
  printOutput: false,
  additionalArgs: prompt ? [["--prompt", prompt]] : [],
});

const { captions } = toCaptions({ whisperCppOutput: out });
const words = captions
  .map((c) => ({ text: c.text.trim(), startMs: Math.round(c.startMs), endMs: Math.round(c.endMs) }))
  .filter((w) => w.text && !/^\[.*\]$/.test(w.text));

const dest = path.join(audioDir, "vo.words.json");
fs.writeFileSync(dest, JSON.stringify(words, null, 1) + "\n");
fs.rmSync(wav, { force: true });

console.log(`\n${words.map((w) => w.text).join(" ")}\n`);
console.log(`✓ ${words.length} words → ${path.relative(process.cwd(), dest)}`);
