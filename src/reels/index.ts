import type { ReelSpec } from "../spec/types";
import template from "./_template/reel";
import styleDemo from "./_style-demo/reel";
import _5DaysPrototype from "./5-days-prototype/reel";

/**
 * Registry of reels. `npm run new -- <slug>` adds entries here automatically.
 */
export const reels: ReelSpec[] = [
  // ↓ new reels are inserted below this line
  _5DaysPrototype,
];

/** Internal: template + component showcase. Not for publishing. */
export const lab: ReelSpec[] = [template, styleDemo];
