import type { ReelSpec } from "../spec/types";
import template from "./_template/reel";
import styleDemo from "./_style-demo/reel";

/**
 * Registry of reels. `npm run new -- <slug>` adds entries here automatically.
 */
export const reels: ReelSpec[] = [
  // ↓ new reels are inserted below this line
];

/** Internal: template + component showcase. Not for publishing. */
export const lab: ReelSpec[] = [template, styleDemo];
