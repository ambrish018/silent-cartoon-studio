#!/usr/bin/env python3
"""Generates YouTube title, description and hashtags using the Claude API."""
import sys, os, json
import anthropic

GENRE = sys.argv[1] if len(sys.argv) > 1 else "comedy"

with open("jobs/latest.txt") as f:
    sheet_path = f.read().strip()
with open(sheet_path) as f:
    sheet = json.load(f)

concept = sheet.get("title_concept", "silent cartoon")
os.makedirs("out", exist_ok=True)

PROMPT = f"""For a SILENT cartoon short (genre: {GENRE}, concept: {concept})
starring Apple, Banana, Carrot and Mochi the puppy, write YouTube metadata.
The video has NO spoken words — keep it universal and curiosity-driven.

Return ONLY valid JSON, no extra text, no markdown fences:
{{
  "youtube_title": "maximum 55 characters, curiosity-driven, 1 emoji, no false claims",
  "youtube_description": "3 warm sentences describing the story without spoiling the ending. Final sentence must be: Subscribe for a new silent cartoon every single day!",
  "youtube_tags": ["12 to 15 relevant tags mixing specific and broad terms"],
  "category_id": "23"
}}

Tag rules:
- Mix specific tags like FruitFriends MochiPuppy SilentCartoon
- Medium tags like cutecartoon wordlesscomedy animationshorts
- Broad tags like cartoon shorts animation funny puppy
- Use category_id 23 for comedy, 24 for education, 23 for emotional too"""

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

resp = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=800,
    messages=[{"role": "user", "content": PROMPT}]
)

raw = resp.content[0].text.strip()
if raw.startswith("```"):
    raw = raw.split("```")[1].lstrip("json").strip()

meta = json.loads(raw)
OUT  = f"out/{GENRE}_meta.json"

with open(OUT, "w") as f:
    json.dump(meta, f, indent=2)

print(f"Metadata saved to {OUT}")
print(f"Title: {meta.get('youtube_title')}")
