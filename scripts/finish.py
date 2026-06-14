#!/usr/bin/env python3
"""Mixes silent video + music + sound effects into the final MP4."""
import sys, os, json, subprocess

GENRE = sys.argv[1] if len(sys.argv) > 1 else "comedy"

with open("jobs/latest.txt") as f:
    sheet_path = f.read().strip()
with open(sheet_path) as f:
    sheet = json.load(f)

video = f"out/{GENRE}_silent.mp4"
music = f"out/{GENRE}_music.wav"
out   = f"out/{GENRE}_final.mp4"
os.makedirs("out", exist_ok=True)
if not os.path.exists(video): raise FileNotFoundError(f"Silent video not found: {video}. Check Step 2 completed successfully.")
inputs   = ["-i", video]
filt     = []
mix_lbs  = []
idx      = 1

# Add music bed
if os.path.exists(music):
    inputs += ["-i", music]
    filt.append(f"[{idx}:a]volume=0.42,aresample=48000[music]")
    mix_lbs.append("[music]")
    idx += 1
else:
    print(f"Warning: no music file found at {music}, continuing without it")

# Add each beat's sound effect at the correct timestamp
for beat in sheet.get("beats", []):
    name = beat.get("sfx")
    if not name:
        continue
    sfx_path = f"assets/sfx/{name}.mp3" if not os.path.exists(f"assets/sfx/{name}.wav") else f"assets/sfx/{name}.wav"
    if not os.path.exists(sfx_path):
        print(f"Warning: SFX not found: {sfx_path}, skipping")
        continue
    delay_ms = int(round(float(beat["start"]) * 1000))
    lbl = f"s{idx}"
    inputs += ["-i", sfx_path]
    filt.append(f"[{idx}:a]adelay={delay_ms}:all=1,volume=1.0[{lbl}]")
    mix_lbs.append(f"[{lbl}]")
    idx += 1

# Build the ffmpeg command
if mix_lbs:
    n = len(mix_lbs)
    filt.append("".join(mix_lbs) + f"amix=inputs={n}:duration=longest:normalize=0[mixraw]")
    filt.append("[mixraw]loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
    audio_args = [
        "-filter_complex", ";".join(filt),
        "-map", "0:v",
        "-map", "[aout]",
        "-c:a", "aac",
        "-b:a", "192k",
    ]
else:
    audio_args = ["-map", "0:v", "-an"]

cmd = ["ffmpeg", "-y"] + inputs + audio_args + ["-c:v", "copy", "-shortest", out]
print("Running ffmpeg mix...")
subprocess.run(cmd, check=True)
print(f"Final video saved to {out}")
