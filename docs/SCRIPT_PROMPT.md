# Script-generation prompt (for Claude / ChatGPT)

Bulk-generate the **content columns** of the Mars sheet from a list of topics, so
filling 100 rows is a few prompts instead of hand-writing each one. No API key in
the pipeline — generation happens here, the pipeline only reads the sheet.

## What it generates
Six tab-of-the-sheet columns, in order, joined by the literal separator `~|~`:

```
genre ~|~ audience ~|~ script ~|~ yt_title ~|~ yt_description ~|~ yt_tags
```

These map to sheet columns **E–J**. The other columns you set yourself:
`date` (A), `language` (B), `tts_model` (C, blank=gemini), `voice` (D, blank=auto),
`status` (K, set `pending`). `url` (L) + `job_id` (M) are filled by the pipeline.

## Field rules
| field | rule |
|-------|------|
| `genre` | `science` or `education` |
| `audience` | `kids`, `teen`, `general`, or `adult` |
| `script` | **the DSL** — 5–6 scenes, ~150 words total (~60s). Each scene = `[Short Title] one or two narration sentences`. Scenes joined by ` \|\| ` on a **single line** (no real line breaks). No emojis. |
| `yt_title` | ≤ 70 chars, curiosity-driven, ≤ 1 emoji |
| `yt_description` | 2–3 sentences on ONE line; last sentence a subscribe CTA |
| `yt_tags` | 12–15 comma-separated tags |

### The `script` DSL
- One scene per ` || ` segment: `[Title] narration`.
- Title is optional (`narration only` works) but recommended — it's the on-screen heading.
- Keep numbers spelled where it helps TTS (e.g. "twenty-four" reads better than "24" in some languages).
- The pipeline measures each scene's real voice length, so don't worry about exact timing.

#### Optional visual directive `{...}`
After the title, a `{...}` block picks a **deterministic visual** for that scene. It is
stripped from the spoken narration (not read aloud). Omit it → default abstract motif.

| directive | renders |
|-----------|---------|
| `{compare LabelA=NUM LabelB=NUM}` | two proportional discs (e.g. size/stat comparison) |
| `{bignum value=VALUE unit=UNIT}` | one big animated stat; `value` numeric counts up. `unit` may have spaces |
| `{motif}` | the default orbit motif (same as omitting) |

Examples (one scene each):
```
[Half of Earth]{compare Earth=1 Mars=0.53} Mars is about half the width of Earth.
[A Familiar Day]{bignum value=24:37 unit=hours per day} A day on Mars is oddly familiar.
[Pi]{bignum value=3.14159 unit=pi} Pi relates a circle's circumference to its diameter.
```

### Genres
`genre` (column E) picks tone + music + the accent palette:
`science`, `maths`, `arts-and-crafts`, `language-arts`, `education`. Each renders in a
distinct color palette.

## Master prompt (copy-paste)

```
You generate rows for a 9:16 (60s, 60fps) explainer-video pipeline.
For EACH topic below, output ONE line of 6 fields joined by the literal
separator ~|~ in this exact order, no header, no extra text:

genre ~|~ audience ~|~ script ~|~ yt_title ~|~ yt_description ~|~ yt_tags

Rules:
- genre: science, maths, arts-and-crafts, language-arts, or education.
- audience: kids, teen, general, or adult (choose what fits the topic).
- script: 5-6 scenes, ~150 words total (~60s narration). Each scene =
  [Short Title] 1-2 sentences. Join scenes with " || " on a SINGLE line
  (no real line breaks). Vivid, factually correct, no emojis.
  Where a scene states a key number or a two-thing comparison, add a visual
  directive right after the title: {bignum value=NUM unit=UNIT} or
  {compare LabelA=NUM LabelB=NUM}. Otherwise omit it.
- yt_title: <=70 chars, curiosity-driven, at most 1 emoji.
- yt_description: 2-3 sentences on ONE line, last sentence exactly
  "Subscribe for a new explainer every day!"
- yt_tags: 12-15 comma-separated tags (mix specific + broad).

Output one line per topic, fields joined by ~|~, nothing else.

TOPICS:
1. The Pythagorean theorem
2. Why the sky is blue
3. Black holes
```

## Sample output (what Claude returns)
One line per topic, e.g. for topic 1:

```
education ~|~ teen ~|~ [Right Angle] Every right triangle has one angle of exactly ninety degrees. || [The Sides] The two short sides are the legs; the long side opposite the right angle is the hypotenuse. || [The Theorem] Pythagoras found the squares of the legs always add up to the square of the hypotenuse. || [The Formula] In symbols: a squared plus b squared equals c squared. || [Try It] A triangle with legs three and four has a hypotenuse of five. ~|~ The Pythagorean Theorem in 60 Seconds 📐 ~|~ A quick, clear look at the most famous rule in geometry and why it always works. Subscribe for a new explainer every day! ~|~ pythagorean theorem,geometry,math,right triangle,hypotenuse,education,explainer,shorts,maths,learning,study,school,triangles,stem
```

## Paste into the sheet
1. Copy Claude's output (all lines).
2. Click cell **E2**, paste.
3. **Data → Split text to columns → Separator: Custom → `~|~`**. Fills E–J.
4. Set per row: `date` (A), `status` = `pending`; optionally `language` (B, blank=English),
   `tts_model` (C, blank=gemini), `voice` (D, blank=auto).

## Other languages
Write the `script`, `yt_title`, `yt_description` in the target language/script — e.g. Hindi
(Devanagari) or Hinglish (Latin). Set column B accordingly. The pipeline picks the matching
voice + font automatically. Tell the model: *"Write script/title/description in Hindi"* (or
Hinglish), keep the `~|~` format.

> `~|~` is used (not comma/tab) because descriptions and tags contain commas, and tabs paste
> unreliably from chat. A rare custom separator splits cleanly every time.
