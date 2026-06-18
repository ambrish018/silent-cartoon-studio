# Mars automation — setup & operations

Google Sheet → fal.ai voiceover → Remotion Lambda render → Cloudflare R2 → YouTube (unlisted),
with status written back to the sheet. No LLM/API key in the render pipeline — scripts and metadata
are pre-filled in the sheet.

Pipeline code: `.github/workflows/mars.yml`, `scripts/gen_voiceover.py`, `scripts/mars_apps_script.gs`,
reused `scripts/upload_r2.py` + `scripts/publish_youtube.py`. The Mars Remotion comp lives in `src/mars/`.

---

## 1. Sheet columns (12)

| col | field | notes |
|-----|-------|-------|
| A | `date` | `YYYY-MM-DD`. Daily trigger runs rows where **date == today**. |
| B | `language` | dropdown. Blank → English. |
| C | `tts_model` | dropdown: gemini (default) / elevenlabs / minimax / kokoro. |
| D | `voice` | optional override. Blank → auto per model+audience. **Must match the chosen model's catalog.** |
| E | `genre` | dropdown: science / education. |
| F | `audience` | dropdown: kids / teen / general / adult. |
| G | `script` | scenes joined by ` \|\| ` on ONE line. Each scene: `[Title] narration`. |
| H | `yt_title` | ≤70 chars. |
| I | `yt_description` | single line; end with a subscribe CTA. |
| J | `yt_tags` | comma-separated. |
| K | `status` | `pending` → (queued) → published / error. Only `pending` rows run. |
| L | `url` | written back automatically. |
| M | `job_id` | auto. Stable UUID written at dispatch; writeback matches on it (not row number), so reordering/inserting rows can't misdirect the result. Leave blank. |

---

## 2. One-time setup

### a. Create the sheet
1. New Google Sheet.
2. `File → Import →` upload `mars_sheet_template.csv` → **Replace spreadsheet** → import.
   (CSV cannot carry dropdowns — added in the next step.)

### b. Apps Script
1. `Extensions → Apps Script`. Delete the stub, paste `scripts/mars_apps_script.gs`. Save.
2. `Project Settings → Script Properties` → add:
   - `GH_PAT` — GitHub fine-grained PAT with **Contents: Read and write** on the repo (this also authorizes `repository_dispatch`).
   - `GH_OWNER` — your GitHub user/org.
   - `GH_REPO` — the repository name.
   - `WEBAPP_TOKEN` — a long random string (e.g. `openssl rand -hex 24`). Secures the writeback
     endpoint (see step b.4 note). Mirror the SAME value in GitHub secret `MARS_WEBAPP_TOKEN`.
3. Reload the sheet → a **Mars** menu appears → `Mars → Setup sheet (header + dropdowns)`. Run once
   (authorize when prompted). This writes the header row + all dropdowns + date format.
4. `Deploy → New deployment → Web app`:
   - Execute as: **Me** (required — the script edits your sheet with your authority).
   - Who has access: **Anyone with the link** (required — GitHub Actions can't do Google OAuth).
     The endpoint is therefore unauthenticated at the Google layer, so it is gated by `WEBAPP_TOKEN`:
     every request must carry the matching token or it's rejected. `doPost` only writes status+url
     to a row, so blast radius is small even before the token check.
   - Deploy → copy the **Web app URL**.
   - If you edit `doPost` later, redeploy: `Manage deployments → edit ✏ → Version: New version → Deploy`.
5. `Triggers` (clock icon) → Add trigger → function `renderDueRows`, event source **Time-driven**,
   **Day timer** at your preferred hour.

### c. GitHub secrets
Add (Settings → Secrets and variables → Actions):
- `MARS_WEBAPP_URL` = the Apps Script Web app URL from step b.4.
- `MARS_WEBAPP_TOKEN` = the SAME random string you set as `WEBAPP_TOKEN` in Script Properties.

Confirm these already exist (used by the existing `daily.yml`):
`FAL_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
`R2_BUCKET_NAME`, `R2_ACCOUNT_ID`, `R2_PUBLIC_URL`, `YOUTUBE_CLIENT_ID`, `YOUTUBE_CLIENT_SECRET`,
`YOUTUBE_REFRESH_TOKEN`.

No `ANTHROPIC_API_KEY` needed. No new AWS/Lambda setup — the existing prod Lambda function
`remotion-render-4-0-477-mem3008mb-disk2048mb-360sec` (us-east-1) is reused; the serve site is
(re)deployed automatically on every run, so code changes are always picked up.

---

## Cost guard

The daily trigger (`renderDueRows`) dispatches at most **`MAX_PER_RUN`** rows per run
(default `10`, set at the top of `mars_apps_script.gs`). Extra due rows stay `pending` and
run on the next trigger. Raise/lower the constant to taste. The manual **Render selected row**
button is not capped. This prevents a bad bulk-fill (e.g. 100 rows dated today) from launching
100 simultaneous Lambda renders + fal calls.

## Background music

`gen_voiceover.py` also generates a subtle instrumental bed (fal MusicGen,
genre-based prompt), mirrors it to R2, and adds `musicUrl` to props; the comp
plays it looped at low volume under the voice. Best-effort — if MusicGen fails
the video still renders. Set env `MUSIC=off` to skip it.

## 3. Daily operation

1. Fill rows (bulk — see §4). Set `date` and `status = pending`.
2. Either wait for the daily trigger, or `Mars → Render selected row` to run one now.
3. The row flips to `queued`, then `published` (with the YouTube URL in `url`) or `error`.

---

## 4. Bulk content generation (no API key)

Paste into Claude.ai or ChatGPT, then paste the output at sheet cell **E2** and run
`Data → Split text to columns → Custom → ~|~`.

```
You generate rows for a 9:16 (60s, 60fps) science-explainer video pipeline.
For EACH topic below, output ONE line of 6 fields joined by the literal separator ~|~
in this exact order, no header, no extra text:

genre ~|~ audience ~|~ script ~|~ yt_title ~|~ yt_description ~|~ yt_tags

Rules:
- genre: science or education.
- audience: kids, teen, general, or adult.
- script: 5-6 scenes, ~150 words total (~60s). Each scene = [Short Title] 1-2 sentences.
  Join scenes with " || " on a SINGLE line (no real line breaks). Vivid, correct, no emojis.
- yt_title: <=70 chars, curiosity-driven, max 1 emoji.
- yt_description: 2-3 sentences on ONE line, last = "Subscribe for a new explainer every day!"
- yt_tags: 12-15 comma-separated tags.

Output one line per topic joined by ~|~, nothing else.
TOPICS:
1. Mars
2. <...>
```

Then set per-row config columns (A date, B language, C tts_model) — blank B/C use defaults
(English / gemini). The Claude co-worker can also fill the whole sheet via the Google Sheets MCP.

---

## 5. Voice catalogs (for the `voice` override column)

Leave `voice` blank to auto-pick by model + audience. To override, use an id from the chosen model:

- **gemini**: Charon, Puck, Zephyr, Rasalgethi, Kore, Aoede, Leda, Orus, … (30 voices)
- **elevenlabs**: Aria, Roger, Sarah, Brian, George, Charlie, Lily, Will, Jessica, … (eleven-v3)
- **minimax**: Wise_Woman, Deep_Voice_Man, Lively_Girl, Casual_Guy, Calm_Woman, …
- **kokoro**: af_heart, af_bella, af_nicole, am_michael, am_adam, … (English-only endpoint)

> kokoro on this endpoint is English-only; non-English `language` is ignored for kokoro.

---

## 6. Local testing

```bash
# put FAL_KEY in .env (gitignored)
python3 scripts/gen_voiceover.py jobs/mars_job.json out/mars_props.json
npx remotion render Mars out/mars_test.mp4 --props=./out/mars_props.json --scale=0.5
```
A manual `workflow_dispatch` of `mars-render` uses `scripts/mars_job.example.json`.

---

## 7. Troubleshooting

- **Row not running on daily trigger** → `date` must equal today (sheet timezone) and `status` = `pending`.
- **`GitHub dispatch failed (403/404)`** → check `GH_PAT` scopes / `GH_OWNER` / `GH_REPO`.
- **No writeback** → `MARS_WEBAPP_URL` secret missing, or Web app not deployed "Anyone with the link".
- **Render: no serve URL / S3 URL** → check AWS secrets + that the Lambda function name still matches
  `.github/workflows/mars.yml` (`--function-name=`).
- **Wrong/!default voice errors** → the `voice` value must belong to the selected `tts_model` catalog (§5).

---

## 8. Adding a TTS model or language

- **Model**: add an adapter fn + entry in `ADAPTERS`, a row in `VOICE_BY_MODEL`, and per-model codes in
  `LANG` inside `scripts/gen_voiceover.py`; add the name to `tts_model` dropdown in `mars_apps_script.gs`.
- **Language**: add a row to `LANG` (with each provider's code) in `gen_voiceover.py`; add it to the
  `language` dropdown in `mars_apps_script.gs`.
