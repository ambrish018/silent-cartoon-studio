// Mars explainer — props contract + default content.
//
// The Mars composition is DATA-DRIVEN: at render time `props` is supplied
// externally (gen_voiceover.py emits props.json from the Google Sheet row).
// This file owns:
//   1. the prop TYPES that contract (what the render consumes)
//   2. DEFAULT content (used in Studio + as a fallback when no props passed)
//
// DSL parsing + TTS + duration measurement happen OUTSIDE Remotion (python),
// so by the time props arrive every scene already has an authoritative
// `durationInFrames` and (optionally) a fal-hosted `audioUrl`.

import { FPS } from "./theme";
import { LayoutType } from "./layouts";

// Deterministic visual spec per scene. The script DSL / generation prompt
// picks the `type` + data; the renderer switches on it. Bounded set = safe to
// render unattended (no LLM-generated markup/code).
export type SceneViz =
  | { type: "motif" } // default abstract orbit motif
  | { type: "icon"; name: string } // topic icon (lucide), see icons.tsx
  | { type: "bignumber"; value: string; unit?: string } // one big stat
  | { type: "compare"; a: { label: string; value: number }; b: { label: string; value: number } };

export type MarsScene = {
  /** stable id (optional; index used if absent) */
  id?: string;
  /** short on-screen heading (optional) */
  title?: string;
  /** spoken narration — also the TTS source + on-screen caption */
  narration: string;
  /** fal-hosted voiceover URL; absent in script-only mode */
  audioUrl?: string;
  /** authoritative scene length in frames (derived from audio in production) */
  durationInFrames: number;
  /** AI-generated background image (fal flux → R2). When present it's the hero. */
  imageUrl?: string;
  /** deterministic visual; absent → motif */
  viz?: SceneViz;
  /** layout override; absent → auto-selected by index + viz */
  layout?: LayoutType;
};

export type MarsProps = {
  /** overall video title (YouTube meta) */
  title: string;
  scenes: MarsScene[];
  /** optional background music bed (fal MusicGen, mirrored to R2) */
  musicUrl?: string;
  /** spoken language — selects the matching font (Latin / Devanagari / ...) */
  language?: string;
  /** subject genre — selects the accent palette */
  genre?: string;
};

// ---- Default authoring content -------------------------------------------
// Editable here for local dev / Studio preview. Production overrides via props.
type AuthorScene = { id: string; title: string; narration: string; durationSec: number; viz?: SceneViz; layout?: LayoutType };

const DEFAULT_SCENES: AuthorScene[] = [
  {
    id: "intro",
    title: "Mars",
    narration:
      "This is Mars. The fourth planet from the Sun, and the most explored world beyond our own.",
    durationSec: 9,
    viz: { type: "icon", name: "orbit" },
  },
  {
    id: "size",
    title: "Half of Earth",
    narration:
      "Mars is small. About half the width of Earth — closer in size to our Moon than to home.",
    durationSec: 10,
    viz: { type: "compare", a: { label: "Earth", value: 1 }, b: { label: "Mars", value: 0.53 } },
  },
  {
    id: "day",
    title: "A familiar day",
    narration:
      "But a day on Mars feels oddly familiar. It spins once every twenty-four hours and thirty-seven minutes.",
    durationSec: 10,
    viz: { type: "bignumber", value: "24:37", unit: "hours per day" },
  },
  {
    id: "atmosphere",
    title: "A thin sky",
    narration:
      "Its atmosphere is wisp-thin — almost all carbon dioxide — yet thick enough for dust storms that swallow the entire planet.",
    durationSec: 11,
    viz: { type: "icon", name: "wind" },
  },
  {
    id: "red",
    title: "Why it's red",
    narration:
      "And the color? Iron in the soil reacted with oxygen long ago. Mars is, quite literally, rusting.",
    durationSec: 10,
    viz: { type: "icon", name: "flame" },
  },
  {
    id: "exploration",
    title: "We're going",
    narration:
      "Today, robots roam its surface. Tomorrow, the first human footprints may join them.",
    durationSec: 10,
  },
];

export const DEFAULT_MARS_PROPS: MarsProps = {
  title: "Mars — a 60-second explainer",
  language: "English",
  scenes: DEFAULT_SCENES.map((s) => ({
    id: s.id,
    title: s.title,
    narration: s.narration,
    durationInFrames: Math.round(s.durationSec * FPS),
    viz: s.viz,
    layout: s.layout,
  })),
};

// ---- Derived timeline helper ---------------------------------------------
export type SceneTiming = MarsScene & { index: number; startFrame: number };

export function sceneTimeline(scenes: MarsScene[]): SceneTiming[] {
  let acc = 0;
  return scenes.map((s, index) => {
    const startFrame = acc;
    acc += Math.max(1, s.durationInFrames);
    return { ...s, index, startFrame };
  });
}

export function totalFrames(scenes: MarsScene[]): number {
  return Math.max(1, scenes.reduce((a, s) => a + Math.max(1, s.durationInFrames), 0));
}
