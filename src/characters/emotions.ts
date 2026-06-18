import { Expression } from "./art";
import type { Pose } from "./Character";

// Emotion state machine.
// A single "emotion" on a beat character drives face (expression), body
// (default pose), per-frame physics (motion), and idle scaling — so the beat
// sheet can say `emotion: "scared"` instead of hand-wiring expression + pose.
//
// Vocabulary is fixed by the generator (scripts/gen_beatsheet.py):
//   happy sad scared excited confused angry
//
// motion(f) returns the same {dx, dy, dr, ds} shape as Character's
// expressionMotion(): pixel offsets (dx/dy), degrees (dr), and a scale
// multiplier (ds). Mirrors the per-expression feel already used there.

export type EmotionState =
  | "happy"
  | "sad"
  | "scared"
  | "excited"
  | "confused"
  | "angry";

export type EmotionMotion = { dx: number; dy: number; dr: number; ds: number };

export type EmotionPreset = {
  expression: Expression;
  defaultPose: Pose;
  /** idle breathing/sway/bob amplitude multiplier (1 = neutral) */
  idleMult: number;
  /** static vertical offset in px: negative lifts, positive sinks/droops */
  baseY: number;
  motion: (f: number) => EmotionMotion;
};

export const EMOTIONS: Record<EmotionState, EmotionPreset> = {
  // big smile + wave + gentle bounce, lifted
  happy: {
    expression: "happy",
    defaultPose: "wave",
    idleMult: 1.2,
    baseY: -10,
    motion: (f) => ({ dx: 0, dy: Math.sin(f / 7) * 4, dr: Math.sin(f / 14) * 2, ds: 1 }),
  },

  // crying face + slow droop + forward lean, heavier
  sad: {
    expression: "crying",
    defaultPose: "idle",
    idleMult: 0.35,
    baseY: 12,
    motion: () => ({ dx: 0, dy: 0, dr: -4, ds: 1 }),
  },

  // wide eyes + shrug + rapid multi-axis trembling + hyperventilating scale
  scared: {
    expression: "scared",
    defaultPose: "shrug",
    idleMult: 1,
    baseY: 0,
    motion: (f) => ({
      dx: Math.sin(f * 3.2) * 5,
      dy: Math.cos(f * 2.8) * 3,
      dr: 0,
      ds: 1 + Math.sin(f * 4) * 0.02,
    }),
  },

  // laughing face + jump + fast big movement, floating
  excited: {
    expression: "laughing",
    defaultPose: "jump",
    idleMult: 2.2,
    baseY: -14,
    motion: (f) => ({
      dx: Math.sin(f / 4) * 5,
      dy: Math.sin(f / 6) * 6,
      dr: Math.sin(f / 8) * 3,
      ds: 1,
    }),
  },

  // thinking face + shrug + constant head tilt + slow uncertain sway
  confused: {
    expression: "thinking",
    defaultPose: "shrug",
    idleMult: 1,
    baseY: 0,
    motion: (f) => ({ dx: Math.sin(f / 40) * 4, dy: 0, dr: 5 + Math.sin(f / 25) * 3, ds: 1 }),
  },

  // angry face + planted rapid tremor, heavier
  angry: {
    expression: "angry",
    defaultPose: "idle",
    idleMult: 0.3,
    baseY: 0,
    motion: (f) => ({ dx: Math.sin(f * 2.1) * 4, dy: 0, dr: Math.sin(f * 2.1) * 1.5, ds: 1 }),
  },
};
