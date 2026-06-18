#!/usr/bin/env python3
"""
Mars explainer — voiceover + props builder.

Reads a job (script DSL + genre + audience + language + tts_model + optional
voice override), generates per-scene narration via a fal.ai TTS model, measures
each clip with ffprobe, and writes a Remotion props.json the `Mars` composition
consumes directly.

Job input (default: jobs/mars_job.json):
    {
      "title":     "Mars in 60s",
      "script":    "[Mars] ... || [Half of Earth] ...",   # newline OR ' || '
      "genre":     "science",       # science | education
      "audience":  "general",       # kids | teen | general | adult
      "language":  "English",       # blank -> English
      "tts_model": "gemini",        # gemini(default) | elevenlabs | minimax | kokoro
      "voice":     ""               # blank -> auto per model+audience
    }

Output (default: out/mars_props.json):
    { "title": ..., "scenes":[ {"id","title","narration","audioUrl","durationInFrames"} ] }

Env: FAL_KEY (required).
"""
import sys, os, re, json, ssl, subprocess, tempfile, urllib.request

# Must match src/mars/theme.ts FPS.
FPS = 60
# Silent tail per scene so narration never clips into the next scene.
TAIL_PAD_SEC = 0.6

JOB_PATH = sys.argv[1] if len(sys.argv) > 1 else "jobs/mars_job.json"
OUT_PATH = sys.argv[2] if len(sys.argv) > 2 else "out/mars_props.json"


def install_ssl():
    """Verifying SSL context for all urllib calls. Prefers certifi (fixes macOS
    python.org installs lacking system CAs); falls back to system default (CI)."""
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except Exception:
        ctx = ssl.create_default_context()
    urllib.request.install_opener(
        urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
    )


def load_dotenv(path=".env"):
    """Minimal no-dep .env loader. Skips if absent; never overrides real env."""
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


# ===========================================================================
# Style (Gemini/MiniMax expressiveness). Tone by audience, flavour by genre.
# ===========================================================================
STYLE_BY_AUDIENCE = {
    "kids":    "Speak warmly and playfully, a little slower and very clear, like reading an exciting story to young children.",
    "teen":    "Speak with bright, casual energy and momentum, like an engaging YouTube explainer.",
    "general": "Speak in a calm, clear, confident documentary-narrator tone.",
    "adult":   "Speak in a measured, authoritative documentary-narrator tone.",
}
STYLE_BY_GENRE = {
    "science":   " Convey curiosity and a sense of wonder about the subject.",
    "education": " Emphasize clarity and gentle emphasis on key facts.",
    "comedy":    " Add a light, wry, slightly mischievous edge.",
    "emotional": " Add warmth and a reflective, heartfelt quality.",
}
# MiniMax has no free-text style — map audience to its emotion enum.
MINIMAX_EMOTION = {"kids": "happy", "teen": "happy", "general": "neutral", "adult": "neutral"}


def resolve_style(genre, audience):
    return STYLE_BY_AUDIENCE.get(audience, STYLE_BY_AUDIENCE["general"]) + STYLE_BY_GENRE.get(genre, "")


# ===========================================================================
# Per-model default voices (by audience) + language code mapping.
# ===========================================================================
VOICE_BY_MODEL = {
    "gemini":     {"kids": "Puck",        "teen": "Zephyr",   "general": "Charon",      "adult": "Rasalgethi"},
    "elevenlabs": {"kids": "Lily",        "teen": "Charlie",  "general": "Brian",       "adult": "George"},
    "minimax":    {"kids": "Lively_Girl", "teen": "Casual_Guy", "general": "Wise_Woman","adult": "Deep_Voice_Man"},
    "kokoro":     {"kids": "af_bella",    "teen": "af_nicole","general": "af_heart",    "adult": "am_michael"},
}

# canonical language (lower) -> per-provider code
LANG = {
    "english":    {"gemini": "English (US)",       "elevenlabs": "en", "minimax": "English"},
    "hindi":      {"gemini": "Hindi (India)",      "elevenlabs": "hi", "minimax": "Hindi"},
    "spanish":    {"gemini": "Spanish (Spain)",    "elevenlabs": "es", "minimax": "Spanish"},
    "french":     {"gemini": "French (France)",    "elevenlabs": "fr", "minimax": "French"},
    "german":     {"gemini": "German (Germany)",   "elevenlabs": "de", "minimax": "German"},
    "japanese":   {"gemini": "Japanese (Japan)",   "elevenlabs": "ja", "minimax": "Japanese"},
    "portuguese": {"gemini": "Portuguese (Brazil)","elevenlabs": "pt", "minimax": "Portuguese"},
    "arabic":     {"gemini": "Arabic (Egypt)",     "elevenlabs": "ar", "minimax": "Arabic"},
}


def lang_code(model, language):
    canon = (language or "english").strip().lower()
    entry = LANG.get(canon, LANG["english"])
    return entry.get(model, entry.get("gemini"))


def resolve_voice(model, audience, override):
    if override and override.strip():
        return override.strip()
    table = VOICE_BY_MODEL.get(model, VOICE_BY_MODEL["gemini"])
    return table.get(audience, table["general"])


# ===========================================================================
# TTS adapters — each returns (endpoint, payload). Output url at audio.url.
# ===========================================================================
def _gemini(text, voice, style, language, audience):
    return ("https://fal.run/fal-ai/gemini-tts", {
        "prompt": text, "voice": voice, "style_instructions": style,
        "language_code": lang_code("gemini", language), "output_format": "mp3",
    })


def _elevenlabs(text, voice, style, language, audience):
    return ("https://fal.run/fal-ai/elevenlabs/tts/eleven-v3", {
        "text": text, "voice": voice,
        "language_code": lang_code("elevenlabs", language),
        "output_format": "mp3_44100_128",
    })


def _minimax(text, voice, style, language, audience):
    return ("https://fal.run/fal-ai/minimax/speech-02-hd", {
        "text": text,
        "voice_setting": {"voice_id": voice, "emotion": MINIMAX_EMOTION.get(audience, "neutral")},
        "audio_setting": {"format": "mp3"},
        "language_boost": lang_code("minimax", language),
    })


def _kokoro(text, voice, style, language, audience):
    # Kokoro is English-only on this endpoint (separate endpoints per language).
    if (language or "english").strip().lower() != "english":
        print(f"  WARN: kokoro endpoint is English-only; ignoring language={language}")
    return ("https://fal.run/fal-ai/kokoro/american-english", {
        "prompt": text, "voice": voice,
    })


ADAPTERS = {
    "gemini": _gemini, "elevenlabs": _elevenlabs, "minimax": _minimax, "kokoro": _kokoro,
}


def synth(model, text, voice, style, language, audience, fal_key):
    adapter = ADAPTERS.get(model)
    if adapter is None:
        print(f"  WARN: unknown tts_model '{model}', falling back to gemini")
        adapter = ADAPTERS["gemini"]
    endpoint, payload = adapter(text, voice, style, language, audience)
    req = urllib.request.Request(
        endpoint, data=json.dumps(payload).encode(),
        headers={"Authorization": f"Key {fal_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        result = json.loads(r.read())
    url = (
        (result.get("audio") or {}).get("url")
        or (result.get("audio_url") or {}).get("url")
        or result.get("url")
    )
    if not url:
        raise ValueError(f"No audio URL in fal response: {json.dumps(result)[:400]}")
    return url


# ===========================================================================
# Script DSL parser — one scene per line OR per ' || ' segment.
# "[Title] narration" or just "narration".
# ===========================================================================
SCENE_RE = re.compile(r"^\s*(?:\[(?P<title>[^\]]*)\]\s*)?(?P<narration>.+?)\s*$")


def parse_script(script):
    scenes = []
    for i, raw in enumerate(re.split(r"\n|\|\|", script)):
        if not raw.strip():
            continue
        m = SCENE_RE.match(raw)
        if not m:
            continue
        title = (m.group("title") or "").strip()
        narration = m.group("narration").strip()
        if not narration:
            continue
        scenes.append({
            "id": (title.lower().replace(" ", "-") or f"scene-{i}"),
            "title": title,
            "narration": narration,
        })
    if not scenes:
        raise ValueError("Script parsed to zero scenes. Check the DSL format.")
    return scenes


def audio_seconds(url):
    suffix = ".wav" if url.lower().endswith(".wav") else ".mp3"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        path = tmp.name
    try:
        urllib.request.urlretrieve(url, path)
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", path],
            check=True, capture_output=True, text=True,
        )
        return float(out.stdout.strip())
    finally:
        if os.path.exists(path):
            os.remove(path)


def main():
    load_dotenv()
    install_ssl()
    fal_key = os.environ.get("FAL_KEY")
    if not fal_key:
        raise SystemExit("FAL_KEY env var is required.")

    with open(JOB_PATH) as f:
        job = json.load(f)

    genre = (job.get("genre") or "science").strip().lower()
    audience = (job.get("audience") or "general").strip().lower()
    language = (job.get("language") or "english").strip()
    model = (job.get("tts_model") or "gemini").strip().lower()
    if model not in ADAPTERS:
        print(f"WARN: unknown tts_model '{model}' -> gemini")
        model = "gemini"
    voice = resolve_voice(model, audience, job.get("voice"))
    style = resolve_style(genre, audience)

    print(f"model={model} genre={genre} audience={audience} language={language} voice={voice}")

    scenes = parse_script(job["script"])
    print(f"Parsed {len(scenes)} scenes")

    out_scenes = []
    for idx, sc in enumerate(scenes):
        print(f"[{idx + 1}/{len(scenes)}] TTS: {sc['narration'][:60]}...")
        url = synth(model, sc["narration"], voice, style, language, audience, fal_key)
        secs = audio_seconds(url)
        frames = int(round((secs + TAIL_PAD_SEC) * FPS))
        print(f"    -> {secs:.2f}s (+{TAIL_PAD_SEC}s) = {frames} frames")
        out_scenes.append({
            "id": sc["id"], "title": sc["title"], "narration": sc["narration"],
            "audioUrl": url, "durationInFrames": frames,
        })

    props = {"title": job.get("title", "Mars"), "scenes": out_scenes}
    os.makedirs(os.path.dirname(OUT_PATH) or ".", exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(props, f, indent=2)

    total = sum(s["durationInFrames"] for s in out_scenes)
    print(f"Wrote {OUT_PATH} — {len(out_scenes)} scenes, {total} frames ({total / FPS:.1f}s @ {FPS}fps)")


if __name__ == "__main__":
    main()
