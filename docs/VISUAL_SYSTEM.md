# Mars visual system

How the Mars composition turns props into a video. All visuals are **deterministic** (pure functions
of the props + frame) — no AI-generated markup/code, safe to render unattended on Lambda.

## Source map (`src/mars/`)
| file | role |
|------|------|
| `Root.tsx` (`src/Root.tsx`) | registers the `Mars` composition (1080×1920, 60fps), defaultProps, `calculateMetadata` (duration = sum of scene frames) |
| `script.ts` | props contract (`MarsProps`, `MarsScene`, `SceneViz`), default content, timeline helpers |
| `theme.ts` | color/type/space tokens; `ACCENTS`, `GENRE_ACCENTS`, `accentFor(index, genre)` |
| `font.ts` | per-language font load (Inter / Noto Devanagari / JP / Arabic) via `@remotion/google-fonts` |
| `layouts.ts` | `LayoutType` + `chooseLayout(index, vizType, override)` |
| `MarsVideo.tsx` | continuous backdrop + starfield + progress; one `<Sequence>` per scene with remote `<Audio>` |
| `components/` | scene pieces + visuals (below) |

## Props shape (what the pipeline emits → what the comp consumes)
```ts
MarsProps = {
  title: string;
  language?: string;          // selects font
  genre?: string;             // selects accent palette + tone
  musicUrl?: string;          // looped bed under the voice
  scenes: MarsScene[];
}
MarsScene = {
  id?, title?, narration,
  audioUrl?,                  // fal voiceover (R2-mirrored)
  durationInFrames,          // measured from the audio
  viz?: SceneViz,            // motif | bignumber | compare
  layout?: LayoutType,       // override; else auto
}
SceneViz =
  | { type: "motif" }
  | { type: "bignumber"; value: string; unit?: string }
  | { type: "compare"; a:{label,value}; b:{label,value} }
```

## The three dynamic axes
1. **Genre palette** — `accentFor(index, genre)` rotates a genre-specific color set (`GENRE_ACCENTS` in
   `theme.ts`). science=rust/cyan, maths=cool blues, arts-and-crafts=warm, language-arts=blue/sand.
2. **Scene visual (`viz`)** — `components/Scene.tsx` `Visual` switches on `viz.type`:
   `OrbitMotif` (3 variants), `BigNumber` (counts up if numeric), `Compare` (proportional discs).
3. **Layout** — `chooseLayout()` → `centered` / `split` / `stat-hero` / `text-lead`; `Scene.tsx`
   arranges the pieces (Counter, Visual, KineticTitle, Caption, EndCard) accordingly.

Each axis is independent and reproducible, so two different scripts/genres look distinct in both
structure and color.

## Pieces (`src/mars/components/`)
`Starfield`, `OrbitMotif`, `BigNumber`, `Compare`, `KineticText` (`KineticTitle` + read-along `Caption`,
both take `align`), `EndCard` (Subscribe CTA on last scene), `ProgressBar`, `Scene` (layout switch).

All animation uses `useCurrentFrame`/`interpolate`/`spring` — no CSS transitions, no external anim libs.

## Driving it from the script
The script DSL (`scripts/gen_voiceover.py` → `parse_script`/`parse_directive`) carries the visual choice
inline; the `{...}` directive is stripped from spoken narration:
```
[Half of Earth]{compare Earth=1 Mars=0.53 layout=split} Mars is about half Earth's width.
[A Day]{bignum value=24:37 unit=hours per day} A Martian day is 24h 37m.
[Intro]{motif} This is Mars.
```
See [SCRIPT_PROMPT.md](SCRIPT_PROMPT.md) for the full prompt + rules.

## Extending (one new scene type = 3 edits)
1. add a variant to `SceneViz` (`script.ts`),
2. add a component + a branch in `Scene.tsx`'s `Visual`,
3. add a branch in `parse_viz` (`gen_voiceover.py`).
Optionally a layout affinity in `layouts.ts`. Candidates: bar-chart, steps/list, quote, icon-grid.
