import type { ReelSpec } from "./types";

/** Identity helper — gives autocomplete + type-checking for reel files. */
export const defineReel = (spec: ReelSpec): ReelSpec => spec;

/** Sugar: path to a file of a reel's asset folder in /public/reels/<slug>/. */
export const assetsOf = (slug: string) => (file: string) => `reels/${slug}/${file}`;
