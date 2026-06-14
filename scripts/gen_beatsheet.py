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
Length: exactly 60 seconds total.

Return ONLY a JSON object. No markdown. No code fences. No explanation.
Every string value must use straight double quotes only.
No trailing commas anywhere.

{{
  "title_concept": "short summary",
  "genre": "{GENRE}",
  "duration_seconds": 60,
  "music_prompt": "mood and tempo description for background music",
  "beats": [
    {{
      "start": 0,
      "end": 6,
      "background": "kitchen",
      "characters": [
        {{"name": "Apple", "expression": "happy", "pose": "idle", "facing": "right"}}
      ],
      "caption_symbol": null,
      "sfx": "pop",
      "camera": "static",
      "note": "Apple stands in kitchen looking happy"
    }},
    {{
      "start": 6,
      "end": 12,
      "background": "kitchen",
      "characters": [
        {{"name": "Mochi", "expression": "surprised", "pose": "idle", "facing": "left"}}
      ],
      "caption_symbol": "❓",
      "sfx": "boing",
      "camera": "static",
      "note": "Mochi appears looking surprised"
    }}
  ]
}}

Rules:
- beats must total exactly 60 seconds
- each beat is 3 to 8 seconds
- use only these expressions: neutral happy laughing sad crying surprised angry love thinking scared
- use only these poses: idle wave jump point shrug fall
- use only these backgrounds: kitchen park classroom night plain
- use only these sfx: pop boing ding crunch sad_trombone rain whoosh
- use only these cameras: static push_in shake
- make it a complete funny or emotional story with 8 to 12 beats"""

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
