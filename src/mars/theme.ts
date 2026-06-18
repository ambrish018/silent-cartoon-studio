// Mars explainer — design system tokens.
// Single source of truth for color, type, spacing, and timing.
// SVG-first, flat + abstract. No external animation libraries.

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// ---- Color ----------------------------------------------------------------
// Deep-space backdrop -> rust/terracotta Mars palette -> warm sand accents.
export const COLORS = {
  // backgrounds (dark, cosmic)
  bg0: "#0B0A12", // near-black space
  bg1: "#15121F", // panel / gradient stop
  bg2: "#241826", // warm shadow

  // Mars surface
  rust: "#C1440E", // deep rust
  red: "#E2613B", // primary red-orange
  ember: "#F2784B", // highlight
  sand: "#E8A977", // warm sand / dunes
  dust: "#D9B08C", // pale dust

  // ink / text
  ink: "#F7F3EC", // off-white primary text
  inkDim: "#B8B0A6", // secondary text
  inkFaint: "#6E665E", // captions / labels

  // accents
  earthBlue: "#3B7BE2", // for Earth comparison
  cyan: "#5BD3D6", // data / highlight accent
} as const;

// Per-scene accent cycle — abstract, topic-agnostic. Scene N uses ACCENTS[N % len].
export const ACCENTS = [
  COLORS.ember,
  COLORS.cyan,
  COLORS.sand,
  COLORS.earthBlue,
  COLORS.red,
  COLORS.dust,
] as const;

export const accentFor = (index: number): string => ACCENTS[index % ACCENTS.length];

// ---- Typography -----------------------------------------------------------
// System sans for Phase 1; a Google font may be wired in a later phase.
export const FONT = {
  family:
    '"Helvetica Neue", Helvetica, Arial, "Segoe UI", system-ui, sans-serif',
  // type scale (px @ 1080-wide canvas)
  display: 132,
  h1: 96,
  h2: 64,
  body: 44,
  label: 32,
  weightBold: 800,
  weightMed: 600,
  weightReg: 400,
} as const;

// ---- Spacing --------------------------------------------------------------
export const SPACE = {
  xs: 12,
  sm: 24,
  md: 48,
  lg: 96,
  xl: 160,
  gutter: 96, // safe horizontal margin
} as const;
