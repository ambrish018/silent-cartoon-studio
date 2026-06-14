#!/usr/bin/env python3
"""Generates today's cartoon story using the Claude API."""
import sys, os, json, datetime
import anthropic

GENRE = sys.argv[1] if len(sys.argv) > 1 else "comedy"
TODAY = datetime.datetime.utcnow().strftime("%Y%m%d")
OUT   = f"jobs/{TODAY}_{GENRE}.json"
os.makedirs("jobs", exist_ok=True)

PROMPT = f"""You write SILENT, language-free cartoon micro-stories told purely through
facial expressions, body motion, music, and sound effects. Cast: Apple, Banana, Carrot,
and Mochi (a cute puppy). No words — only emoji reaction symbols allowed on screen.

Produce ONE short for genre: {GENRE}
  comedy     = setup -> escalation -> visual punchline
  emotional  = tiny arc with warm or bittersweet turn (4 beats max)
  educational = show ONE simple concept visually, wordless
Length: 60 seconds. Aspect 9:16.

Output ONLY valid JSON, no extra text, no markdown fences:
{{
  "title_concept": "one-line summary",
  "genre": "{GENRE}",
  "duration_seconds": 60,
  "music_prompt": "text prompt describing mood, tempo, instruments for a music model",
  "beats": [
    {{
      "start": 0,
      "end": 5,
      "background": "kitchen",
      "characters": [
        {{"name": "Apple", "expression": "happy", "pose": "wave", "facing": "right"}}
      ],
      "caption_symbol": null,
      "sfx": "pop",
      "camera": "static",
      "note": "what is happening on screen"
    }}
  ]
}}

Beat rules:
- Each beat must be 2 to 6 seconds long
- All beat timings must add up to exactly 60 seconds
- Available expressions: neutral happy laughing sad crying surprised angry love thinking scared
- Available poses: idle wave jump point shrug fall
- Available backgrounds: kitchen park classroom night plain
- Available sfx names: pop boing ding crunch sad_trombone rain whoosh
- camera options: static push_in shake"""

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

resp = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2000,
    messages=[{"role": "user", "content": PROMPT}]
)

raw = resp.content[0].text.strip()
if raw.startswith("```"):
    raw = raw.split("```")[1].lstrip("json").strip()

data = json.loads(raw)

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)

with open("jobs/latest.txt", "w") as f:
    f.write(OUT)

print(f"Beat sheet saved to {OUT}")
