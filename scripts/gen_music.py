#!/usr/bin/env python3
"""Generates background music using the Stable Audio API via fal.ai."""
import sys, os, json, urllib.request, urllib.error

GENRE   = sys.argv[1] if len(sys.argv) > 1 else "comedy"
FAL_KEY = os.environ["FAL_KEY"]

with open("jobs/latest.txt") as f:
    sheet_path = f.read().strip()
with open(sheet_path) as f:
    sheet = json.load(f)

music_prompt = sheet.get("music_prompt", "upbeat cartoon background music, no vocals")
duration     = sheet.get("duration_seconds", 60)

os.makedirs("out", exist_ok=True)
OUT = f"out/{GENRE}_music.wav"

print(f"Generating music for: {music_prompt}")

headers = {
    "Authorization": f"Key {FAL_KEY}",
    "Content-Type":  "application/json",
}

payload = json.dumps({
    "prompt":        music_prompt,
    "seconds_total": duration,
    "steps":         100,
}).encode()

req = urllib.request.Request(
    "https://fal.run/fal-ai/stable-audio",
    data=payload,
    headers=headers,
    method="POST",
)

with urllib.request.urlopen(req) as r:
    result = json.loads(r.read())

audio_url = (
    result.get("audio_file", {}).get("url")
    or result.get("audio", {}).get("url")
    or result.get("url")
)

if not audio_url:
    raise ValueError(f"No audio URL in response: {result}")

print(f"Downloading music from {audio_url}")
urllib.request.urlretrieve(audio_url, OUT)
print(f"Music saved to {OUT}")
