# Handoff — Animation Quality Sprint

**Branch:** `develop`  
**Date:** 2026-06-15  
**Commits:** `c8a5f63` → `bdf2550` (6 commits)

---

## What was built

Complete overhaul of the Remotion renderer from a static SVG-on-background approach to a fully animated, cinematically composed scene. Every frame is now alive.

---

## Changes by commit

### `c8a5f63` — Expression + body language overhaul
**File:** `src/characters/art.ts`, `src/characters/Character.tsx`

- Removed floating caption/emoji system — emotion conveyed through face and body only
- Enlarged eyes (`r=11`, scared `r=15`), thick eyebrow strokes (`SW=7`), wide mouth shapes
- New `eyebrows()` function — 8 expression variants with distinct brow geometry
- New `expressionMotion()` — per-expression body physics (angry tremor, laughing shake, surprised spring scale, sad lean, love sway, etc.)

### `1f89ba2` — Cinematic camera
**File:** `src/Story.tsx`

- `push_in`: quadratic ease `t²` scale + vertical drift
- `shake`: exponential decay `Math.exp(-frame/(fps*0.35))` with sinusoidal x/y
- Emotional auto-zoom: slow scale on `sad`, `crying`, `love` beats

### `26f9641` — Backgrounds + pose anticipation
**Files:** `src/components/Background.tsx`, `src/characters/Character.tsx`

- Full Background.tsx rewrite — 5 themes (park, kitchen, classroom, night, plain), each with layered SVG gradients, animated clouds, trees, flowers, tile patterns, chalkboards, stars
- Idle always-on: breathing `sin(frame/20)*0.018`, sway `sin(frame/30)*3`, bob `sin(frame/12)*6`
- Blink system: 90-frame interval, 5-frame triangle-wave eyelid, body-colored per character, staggered via `BLINK_OFFSET`
- Pose anticipation: 7-frame window (ANT=5 ramp + HOLD=2) before every jump/wave/point/shrug/fall

### `14e64f8` — Parallax depth layers
**Files:** `src/components/Background.tsx` (split), `src/components/ParticleLayer.tsx` (new), `src/Story.tsx`

Background split into three separately renderable layer components:
- `BackgroundSky` — sky/wall gradient, sun, moon, stars, window
- `BackgroundClouds` — animated drifting clouds only
- `BackgroundTrees` — hills, trees, ground, floors, tile backsplash

New `ParticleLayer` component — theme-specific foreground particles:
- park: falling leaves (looping vertical, wobble)
- kitchen: dust motes
- classroom: chalk dust
- night: glowing fireflies (triple-circle glow, oscillating)
- plain: drifting petals

`Scene` in `Story.tsx` now renders all 5 layers with `layerTransforms()` applying depth-scaled camera:
- `push_in`: sky 1.06× → particles 1.26× scale
- `shake`: sky 0.15× → particles 1.6× amplitude
- Emotional zoom: sky 0.02× → particles 0.07× per frame

### `bdf2550` — Bright pastel palette + warm style
**File:** `src/characters/art.ts`

- Stroke: near-black `#2f2a26` → warm dark brown `#5C3D2E`
- Body fills pastalized: Apple `#FF8C94`, Banana `#FFE166`, Carrot `#FFAB6E`, Mochi `#F5D9B0`
- Mochi ear/tail: `#c98a52` → `#DEB48E`
- Warm drop shadow: SVG `feDropShadow` (`flood-color #B06830`, opacity 0.18) on body layer only
- Highlight blobs: white ellipse + bright spot on upper-left of each body
- Accent colors softened: love hearts, laugh inner, tears, cheeks all shifted to pastel range

---

## File map (current state)

```
src/
  index.ts                    — Remotion entry, unchanged
  Root.tsx                    — Composition registrations, unchanged
  Story.tsx                   — 5-layer Scene with layerTransforms()
  characters/
    art.ts                    — SVG generation, pastel palette, SHADOW_DEFS, highlight blobs
    Character.tsx             — expressionMotion(), idle motion, blink, pose anticipation
  components/
    Background.tsx            — BackgroundSky / BackgroundClouds / BackgroundTrees exports
    ParticleLayer.tsx         — NEW: foreground particles per theme
    Caption.tsx               — UNUSED (kept, not imported anywhere)
```

---

## What still needs doing before production

1. **Redeploy Remotion site** — all `src/` changes are local only until redeployed:
   ```bash
   npx remotion lambda sites create src/index.ts --site-name=silent-cartoon-studio
   # Update REMOTION_SERVE_URL in GitHub Secrets
   ```

2. **Preview check** — run `npx remotion preview src/index.ts` and scrub through all 5 backgrounds, all expressions, all camera types

3. **Merge develop → main** — triggers Cloud Build if CI is wired; otherwise manual deploy

---

## Next logical improvements (not done)

- Beat transitions (fade/wipe between beats instead of hard cut)
- Sound-reactive elements (character jumps on SFX beat)
- Rive migration for richer pose rigs (see `rive_roadmap.md`)
- Character interaction poses (hug, high-five, chase) — currently characters stand side-by-side only
