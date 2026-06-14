#!/usr/bin/env python3
"""Generates background music using the fal.ai MusicGen API."""
import sys, os, json, urllib.request

GENRE   = sys.argv[1] if len(sys.argv) > 1 else "comedy"
FAL_KEY = os.environ["FAL_KEY"]

with open("jobs/latest.txt") as f:
    sheet_path = f.read().strip()
with open(sheet_path) as f:
    sheet = json.load(f)

music_prompt = sheet.get("music_prompt", "upbeat cartoon background music, cheerful, no vocals")

os.makedirs("out", exist_ok=True)
OUT = f"out/{GENRE}_music.wav"

print(f"Generating music for: {music_prompt}")

headers = {
    "Authorization": f"Key {FAL_KEY}",
    "Content-Type":  "application/json",
}

# Use MusicGen — stable and working
payload = json.dumps({
    "prompt":   music_prompt,
    "duration": 30,
}).encode()

req = urllib.request.Request(
    "https://fal.run/fal-ai/musicgen",
    data=payload,
    headers=headers,
    method="POST",
)

with urllib.request.urlopen(req) as r:
    result = json.loads(r.read())

print(f"Response: {json.dumps(result, indent=2)[:300]}")

# Extract audio URL — MusicGen returns audio_url key
audio_url = (
    result.get("audio_url", {}).get("url")
    or result.get("audio_file", {}).get("url")
    or result.get("audio", {}).get("url")
    or result.get("url")
)

if not audio_url:
    raise ValueError(f"Could not find audio URL in response: {result}")

print(f"Downloading music from {audio_url}")
urllib.request.urlretrieve(audio_url, OUT)
print(f"Music saved to {OUT}")
