// Deterministic font loading for Lambda. Without this, headless Chrome falls
// back to whatever sans it has and cloud renders won't match the preview — and
// non-Latin scripts (Hindi/Japanese/Arabic) would tofu. We load a clean Latin
// font (Inter) plus the matching Noto font per script, chosen by `language`.

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadDevanagari } from "@remotion/google-fonts/NotoSansDevanagari";
import { loadFont as loadJP } from "@remotion/google-fonts/NotoSansJP";
import { loadFont as loadArabic } from "@remotion/google-fonts/NotoSansArabic";

type Loader = () => { fontFamily: string };

// language (lowercase) -> google-fonts loader. Latin languages use Inter.
const LOADERS: Record<string, Loader> = {
  hindi: loadDevanagari,
  marathi: loadDevanagari,
  // Hinglish may mix Latin + Devanagari; Noto Devanagari covers both.
  hinglish: loadDevanagari,
  japanese: loadJP,
  arabic: loadArabic,
};

const FALLBACK = '"Helvetica Neue", Arial, system-ui, sans-serif';

// Load (idempotent — cached) the right family for the language; return a
// CSS font-family string with a sensible fallback stack.
export function loadMarsFont(language?: string): string {
  const key = (language || "english").trim().toLowerCase();
  const loader = LOADERS[key] || loadInter;
  const { fontFamily } = loader();
  return `${fontFamily}, ${FALLBACK}`;
}
