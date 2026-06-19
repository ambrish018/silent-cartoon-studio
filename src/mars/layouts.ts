// Deterministic scene layouts — rearrange the same scene pieces (counter,
// visual, title, caption) into visibly different compositions so videos don't
// all share one skeleton. Pure selection: same inputs → same layout.

export type LayoutType = "centered" | "split" | "stat-hero" | "text-lead";

export const LAYOUTS: LayoutType[] = ["centered", "split", "stat-hero", "text-lead"];

const isLayout = (s?: string): s is LayoutType =>
  !!s && (LAYOUTS as string[]).includes(s);

// Cycle used when there's no explicit override or viz affinity. Excludes
// stat-hero (reserved for big-number) so neighbours differ.
const CYCLE: LayoutType[] = ["centered", "text-lead", "split"];

export function chooseLayout(
  index: number,
  vizType?: string,
  override?: string,
): LayoutType {
  if (isLayout(override)) return override; // 1. explicit (prompt/DSL) wins
  if (vizType === "bignumber") return "stat-hero"; // 2. viz affinity
  if (vizType === "compare") return "split";
  return CYCLE[index % CYCLE.length]; // 3. cycle so consecutive scenes differ
}
