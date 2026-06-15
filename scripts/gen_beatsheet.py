#!/usr/bin/env python3
"""Generates today's cartoon story using the Claude API."""
import sys, os, json, datetime, re
import anthropic

GENRE = sys.argv[1] if len(sys.argv) > 1 else "comedy"
TODAY = datetime.datetime.utcnow().strftime("%Y%m%d")
OUT   = f"jobs/{TODAY}_{GENRE}.json"
os.makedirs("jobs", exist_ok=True)

PROMPT = f"""You write SILENT, language-free cartoon micro-stories.
Cast: Apple, Banana, Carrot, Mochi (puppy). No words, no text on screen.
Genre: {GENRE}
Length: exactly 60 seconds total, 8 to 12 beats.

PROTAGONIST: Banana. Banana drives the story — Banana attempts, Banana fails, Banana nearly breaks, Banana succeeds.
Other characters (Apple, Carrot, Mochi) react, help, mock, or witness — but Banana is the emotional center.

MANDATORY NARRATIVE ARC — follow exactly in this order:

ACT 1 — HOOK (beats 1-2, ~8s)
  Drop viewer in MID-ACTION. Banana is already mid-attempt at something urgent.
  The goal is visible but the stakes are unclear. Creates immediate question.
  Camera: shake or push_in. Banana expression: surprised or scared or angry.
  Emotional level: 6/10.

ACT 2 — PROBLEM (beats 3-4, ~8s)
  The obstacle is fully revealed. Stakes are clear and high.
  Banana squares up, determined. Brief optimism before the fall.
  Camera: push_in. Banana expression: thinking or happy (false confidence).
  Emotional level: 5/10 — calm before the storm.

ACT 3 — FAIL 1 (beat 5, ~6s)
  Banana tries. Fails. Surprising but recoverable.
  Shakes it off — still confident enough to retry.
  Camera: shake. Banana expression: sad or surprised. SFX: sad_trombone or crunch.
  Emotional level: 6/10 — stings but not fatal.

ACT 4 — FAIL 2 (beats 6-7, ~8s)
  Banana tries harder. Fails WORSE. Something goes more wrong than before.
  Banana is visibly rattled. Others react with concern or nervous laughter.
  Camera: shake (more intense than Act 3). Banana expression: crying or scared. SFX: sad_trombone.
  Emotional level: 8/10 — doubt sets in.

ACT 5 — FAIL 3 + NEAR QUIT (beats 8-9, ~10s)
  Third attempt. The worst failure yet — feels devastating.
  Banana sits alone, head down, about to walk away. Lowest point.
  Beat 8: the failure. Beat 9: Banana nearly gives up (idle, sad or crying, alone).
  Camera: static (stillness = defeat). SFX: sad_trombone or rain. No other characters in beat 9.
  Emotional level: 10/10 — viewer must feel the weight of giving up.

ACT 6 — SUCCESS (beats 10-11, ~10s)
  Something shifts — inner will, a small nudge from a friend, or a sudden idea.
  Banana tries ONE MORE TIME with everything left.
  It WORKS. The breakthrough is explosive — pure shock then joy.
  Camera: push_in. Banana expression: surprised → laughing. SFX: ding then pop.
  Emotional level: spikes to 10/10 release after the 10/10 despair.

ACT 7 — CELEBRATION (beat 12, ~10s)
  All characters together. The victory feels EARNED by three failures and a near-quit.
  Warmth, relief, shared joy. Audience exhales.
  Camera: push_in or static. All expressions: laughing or love. SFX: ding or pop.
  Emotional level: 10/10 — warmth and release.

ESCALATION RULES:
- Fail 1 < Fail 2 < Fail 3 in severity — expressions deepen, camera shakes harder each time
- Beat 9 (near-quit) must be visually quieter than all failure beats — stillness is more devastating than chaos
- The success payoff is proportional to the depth of Act 5 despair — do not rush it
- Music prompt must arc: playful → tense → desperate → triumphant swell
- Banana must appear in EVERY beat

Return ONLY a JSON object. No markdown. No code fences. No explanation.
Every string value must use straight double quotes only.
No trailing commas anywhere.

{{
  "title_concept": "short summary",
  "genre": "{GENRE}",
  "duration_seconds": 60,
  "music_prompt": "mood and tempo description reflecting tension buildup and triumphant release",
  "beats": [
    {{
      "start": 0,
      "end": 5,
      "background": "kitchen",
      "characters": [
        {{"name": "Apple", "expression": "scared", "pose": "jump", "facing": "left"}},
        {{"name": "Mochi", "expression": "laughing", "pose": "point", "facing": "right"}}
      ],
      "caption_symbol": null,
      "sfx": "boing",
      "camera": "shake",
      "note": "ACT 1 HOOK — Banana mid-attempt at something urgent — cause unknown — immediate tension"
    }},
    {{
      "start": 5,
      "end": 10,
      "background": "kitchen",
      "characters": [
        {{"name": "Banana", "expression": "thinking", "pose": "idle", "facing": "right"}},
        {{"name": "Apple", "expression": "surprised", "pose": "point", "facing": "left"}}
      ],
      "caption_symbol": null,
      "sfx": "null",
      "camera": "push_in",
      "note": "ACT 2 PROBLEM — stakes clear — Banana commits to solving it — false confidence"
    }}
  ]
}}

Hard rules:
- beats must total exactly 60 seconds
- each beat is 3 to 8 seconds
- 10 to 12 beats total (7-act arc needs room)
- follow the 7-act arc above — label each beat note with its ACT number and name
- Banana must appear in every single beat
- use only these expressions: neutral happy laughing sad crying surprised angry love thinking scared
- use only these poses: idle wave jump point shrug fall
- use only these backgrounds: kitchen park classroom night plain
- use only these sfx: pop boing ding crunch sad_trombone rain whoosh
- use only these cameras: static push_in shake
- Act 3 fail: sad_trombone or crunch
- Act 4 fail: sad_trombone, camera shake harder than Act 3
- Act 5 fail+quit: sad_trombone or rain, beat 9 camera must be static
- Act 5 beat 9: Banana alone, expression crying or sad, pose idle — no other characters
- Act 6 success: ding then pop across two beats
- Act 7 celebration: love or laughing for all characters, ding or pop"""

def clean_json(text):
    # Remove markdown fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    # Remove trailing commas before closing bracket or brace
    text = re.sub(r",\s*\}", "}", text)
    text = re.sub(r",\s*\]", "]", text)
    # Extract just the JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        text = match.group(0)
    return text.strip()

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

data = None
last_error = None

for attempt in range(3):
    print(f"Attempt {attempt + 1} of 3...")
    try:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=3000,
            messages=[{"role": "user", "content": PROMPT}]
        )
        raw = resp.content[0].text.strip()
        print(f"Raw response length: {len(raw)} characters")
        cleaned = clean_json(raw)
        print(f"Cleaned JSON length: {len(cleaned)} characters")
        data = json.loads(cleaned)
        print(f"JSON parsed successfully on attempt {attempt + 1}")
        break
    except json.JSONDecodeError as e:
        print(f"JSON error on attempt {attempt + 1}: {e}")
        print(f"Raw text around error: {raw[max(0,e.pos-50):e.pos+50]}")
        last_error = e
        continue

if data is None:
    raise ValueError(f"Failed to get valid JSON after 3 attempts. Last error: {last_error}")

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)

with open("jobs/latest.txt", "w") as f:
    f.write(OUT)

print(f"Beat sheet saved to {OUT}")
print(f"Title: {data.get('title_concept')}")
print(f"Beats: {len(data.get('beats', []))}")
