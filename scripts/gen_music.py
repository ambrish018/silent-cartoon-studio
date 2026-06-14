#!/usr/bin/env python3
"""Generates background music using the fal.ai API."""
import sys, os, json, urllib.request, urllib.error, time

GENRE   = sys.argv[1] if len(sys.argv) > 1 else "comedy"
FAL_KEY = os.environ["FAL_KEY"]

with open("jobs/latest.txt") as f:
    sheet_path = f.read().strip()
with open(sheet_path) as f:
    sheet = json.load(f)

music_prompt = sheet.get("music_prompt", "upbeat cartoon background music, no vocals, cheerful")
duration     = sheet.get("duration_seconds", 60)

os.makedirs("out", exist_ok=True)
OUT = f"out/{GENRE}_music.wav"

print(f"Generating music for: {music_prompt}")

headers = {
    "Authorization": f"Key {FAL_KEY}",
    "Content-Type":  "application/json",
}

# Submit the request
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

try:
    with urllib.request.urlopen(req) as r:
        result = json.loads(r.read())
    print(f"Response keys: {list(result.keys())}")
except urllib.error.HTTPError as e:
    error_body = e.read().decode()
    print(f"HTTP Error {e.code}: {error_body}")

    # Try alternative endpoint
    print("Trying alternative endpoint...")
    payload2 = json.dumps({
        "prompt":          music_prompt,
        "duration":        duration,
        "num_inference_steps": 100,
    }).encode()

    req2 = urllib.request.Request(
        "https://fal.run/fal-ai/stable-audio/audio-to-audio",
        data=payload2,
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req2) as r2:
            result = json.loads(r2.read())
    except urllib.error.HTTPError as e2:
        error_body2 = e2.read().decode()
        print(f"Alternative also failed {e2.code}: {error_body2}")

        # Final fallback - try musicgen
        print("Trying MusicGen fallback...")
        payload3 = json.dumps({
            "prompt":   music_prompt,
            "duration": min(duration, 30),
        }).encode()

        req3 = urllib.request.Request(
            "https://fal.run/fal-ai/musicgen",
            data=payload3,
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req3) as r3:
            result = json.loads(r3.read())

print(f"Full response: {json.dumps(result, indent=2)[:500]}")

# Extract audio URL from various possible response formats
audio_url = (
    result.get("audio_file", {}).get("url")
    or result.get("audio", {}).get("url")
    or result.get("url")
    or result.get("output", {}).get("url")
)

if not audio_url:
    # Print full response to help debug
    print(f"Full response: {json.dumps(result, indent=2)}")
    raise ValueError("Could not find audio URL in response")

print(f"Downloading music from {audio_url}")
urllib.request.urlretrieve(audio_url, OUT)
print(f"Music saved to {OUT}")
