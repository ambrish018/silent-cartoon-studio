# silent-cartoon-studio

Automated pipeline that generates and publishes one silent cartoon short to YouTube every day.

## What it is

SVG puppet characters (Apple, Banana, Carrot, Mochi) animated with [Remotion](https://remotion.dev/), rendered on AWS Lambda, published to YouTube via GitHub Actions. No AI-generated video — consistent hand-crafted characters every episode.

**Format:** 1080×1920 (portrait), 30fps, 60s  
**Schedule:** Daily at 04:00 UTC (09:30 IST)  
**Genres:** Comedy · Educational · Emotional (rotating by weekday)

## Mars — explainer pipeline (separate)

A second, sheet-driven explainer pipeline (the `Mars` composition, 1080×1920 @ **60fps**). A Google
Sheet row → fal.ai voiceover (multi-language incl. Hindi/Hinglish) → Remotion Lambda render → R2 → YouTube
(unlisted), with status written back. Visuals are deterministic + dynamic across three axes: genre
palette, per-scene visual (`motif`/`bignumber`/`compare`), and layout (`centered`/`split`/`stat-hero`/`text-lead`).

- Setup + operations: [docs/MARS_AUTOMATION.md](docs/MARS_AUTOMATION.md)
- Script-generation prompt: [docs/SCRIPT_PROMPT.md](docs/SCRIPT_PROMPT.md)
- Visual system architecture: [docs/VISUAL_SYSTEM.md](docs/VISUAL_SYSTEM.md)

## Quick start

```bash
npm install && npm install @remotion/lambda@4.0.477
npx remotion preview src/index.ts
```

## Pipeline

```
pick_genre.py → gen_beatsheet.py → Remotion Lambda → gen_music.py → finish.py → upload_r2.py → publish_youtube.py
```

Claude generates a beat sheet JSON → Remotion renders frames → fal.ai MusicGen scores it → ffmpeg mixes audio + SFX → Cloudflare R2 hosts it → YouTube publishes it.

## Animation features

- **5-layer parallax scene** — sky, clouds, trees, characters, particles each respond to camera at different depths
- **Per-expression body physics** — angry tremor, laughing shake, sad lean, surprised spring scale
- **Always-on idle animation** — breathing, blink every 3s, body sway
- **Pose anticipation** — 7-frame wind-up before every jump/wave/point/shrug/fall
- **Cinematic camera** — push_in (quadratic ease), shake (exponential decay), emotional auto-zoom
- **Bright pastel palette** — warm dark-brown outlines, highlight blobs, soft drop shadows
- **Pixar-inspired multi-layer backgrounds** — animated clouds, trees, ground, flowers; theme-specific foreground particles

## Changing the story

Edit `scripts/gen_beatsheet.py` to change the Claude prompt. Beat sheet schema is in `CLAUDE.md`.

## Deploying changes

Any `src/` edit requires a Remotion site redeploy:

```bash
npx remotion lambda sites create src/index.ts --site-name=silent-cartoon-studio
# Update REMOTION_SERVE_URL in GitHub Secrets
```

## Full documentation

See `CLAUDE.md` for architecture details, all commands, and gotchas.  
See `rive_roadmap.md` for the planned Rive animation upgrade path.
