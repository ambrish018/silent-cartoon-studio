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
Length: exactly 40 seconds total, 8 to 10 beats.

PROTAGONIST: Banana. Banana drives the story — Banana attempts, Banana fails, Banana nearly breaks, Banana succeeds.
Other characters (Apple, Carrot, Mochi) react, help, mock, or witness — but Banana is the emotional center.

MANDATORY NARRATIVE ARC — follow exactly in this order (40s total, target 9 beats):

ACT 1 — HOOK (beat 1, ~5s)
  Drop viewer in MID-ACTION. Banana is already mid-attempt at something urgent.
  The goal is visible but the stakes are unclear. Creates immediate question.
  Camera: shake or push_in. Banana expression: surprised or scared or angry.
  Emotional level: 6/10.

ACT 2 — PROBLEM (beat 2, ~4s)
  The obstacle is fully revealed. Stakes are clear and high.
  Banana squares up, determined. Brief optimism before the fall.
  Camera: push_in. Banana expression: thinking or happy (false confidence).
  Emotional level: 5/10 — calm before the storm.

ACT 3 — FAIL 1 (beat 3, ~4s)
  Banana tries. Fails. Surprising but recoverable.
  Shakes it off — still confident enough to retry.
  Camera: shake. Banana expression: sad or surprised. SFX: sad_trombone or crunch.
  Emotional level: 6/10 — stings but not fatal.

ACT 4 — FAIL 2 (beat 4, ~5s)
  Banana tries harder. Fails WORSE. Something goes more wrong than before.
  Banana is visibly rattled. Others react with concern or nervous laughter.
  Camera: shake (more intense than Act 3). Banana expression: crying or scared. SFX: sad_trombone.
  Emotional level: 8/10 — doubt sets in.

ACT 5 — FAIL 3 + NEAR QUIT (beats 5-6, ~9s)
  Third attempt. The worst failure yet — feels devastating.
  Banana sits alone, head down, about to walk away. Lowest point.
  First beat: the failure. Second beat: Banana nearly gives up (idle, sad or crying, alone).
  Camera: static (stillness = defeat). SFX: sad_trombone or rain. No other characters in the near-quit beat.
  Emotional level: 10/10 — viewer must feel the weight of giving up.

ACT 6 — SUCCESS (beats 7-8, ~8s)
  Something shifts — inner will, a small nudge from a friend, or a sudden idea.
  Banana tries ONE MORE TIME with everything left.
  It WORKS. The breakthrough is explosive — pure shock then joy.
  Camera: push_in. Banana expression: surprised → laughing. SFX: ding then pop.
  Emotional level: spikes to 10/10 release after the 10/10 despair.

ACT 7 — CELEBRATION (beat 9, ~5s)
  All characters together. The victory feels EARNED by three failures and a near-quit.
  Warmth, relief, shared joy. Audience exhales.
  Camera: push_in or static. All expressions: laughing or love. SFX: ding or pop.
  Emotional level: 10/10 — warmth and release.

ESCALATION RULES:
- Fail 1 < Fail 2 < Fail 3 in severity — expressions deepen, camera shakes harder each time
- The near-quit beat must be visually quieter than all failure beats — stillness is more devastating than chaos
- The success payoff is proportional to the depth of Act 5 despair — do not rush it
- Music prompt must arc: playful → tense → desperate → triumphant swell
- Banana must appear in EVERY beat

CRAFT RULES — what separates a written story from a generated one (follow all three):
- CALLBACK: In beat 1, plant a specific visible detail or gesture (a wobble, a stray object, a
  particular way Banana holds the prop). That exact detail RETURNS TRANSFORMED in Act 6 or 7 —
  the thing that looked trivial or doomed at the start becomes the winning touch. State the plant
  in beat 1's note and the payoff in the Act 6/7 note.
- THREE DISTINCT FAILURES: the three fails must fail by THREE DIFFERENT MECHANISMS, never the same
  gag louder. Use: (1) too weak/timid, (2) too much/overcorrected force, (3) right effort but wrong
  approach. Name the mechanism in each fail beat's note.
- REVERSAL: Act 6 success must come from INVERTING an earlier weakness — the very thing that caused
  a failure, applied differently, becomes the key. Not luck, not a random new idea. Name which earlier
  failure it inverts in the Act 6 note.

PROP SYSTEM — use a single goal object that persists across multiple beats to create visual story continuity:
- Pick ONE prop in beat 1 that Banana wants/fears/needs. Keep it in the scene through Act 6.
- prop gives viewers instant context: a cookie jar = Banana wants a snack, trophy = competition, door = escape/entry.
- Characters with pose "point" should face TOWARD the prop (facing matches prop side).
- Remove prop in Act 7 celebration (it has been achieved or is no longer relevant).

POSITION SYSTEM — use left/center/right to create spatial storytelling:
- Two characters facing off: one "left" facing "right", one "right" facing "left" (confrontation framing).
- Solo Banana in despair: "center" (isolated, nowhere to go).
- Character pointing at prop: position them on opposite side from prop (prop is at right, so character at "left").
- Celebration: mix positions so characters are spread across frame.

EMOTION SYSTEM — use "emotion" instead of "expression" + "pose" for richer, automatic body acting:
Each emotion drives face, pose, body physics, and idle motion automatically:
  happy   → big smile + wave pose + gentle bounce (idleMult 1.2×, lifted)
  sad     → crying face + idle pose + slow droop, forward lean (idleMult 0.35×, heavier)
  scared  → wide eyes + shrug pose + rapid multi-axis trembling (hyperventilating scale)
  excited → laughing face + jump pose + fast big movement (idleMult 2.2×, floating)
  confused→ thinking face + shrug pose + constant head tilt + slow uncertain sway
  angry   → angry face + idle pose + rapid planted tremor (idleMult 0.3×)
You may still add "pose" alongside "emotion" to override the default pose (e.g., emotion:"excited", pose:"fall" = laughing face but falling body).
You may still add "expression" alongside "emotion" to override the default face.

Return ONLY a JSON object. No markdown. No code fences. No explanation.
Every string value must use straight double quotes only.
No trailing commas anywhere.

{{
  "title_concept": "short summary",
  "genre": "{GENRE}",
  "duration_seconds": 40,
  "music_prompt": "mood and tempo description reflecting tension buildup and triumphant release",
  "beats": [
    {{
      "start": 0,
      "end": 5,
      "background": "kitchen",
      "prop": "cookie_jar",
      "characters": [
        {{"name": "Banana", "emotion": "scared", "pose": "jump", "facing": "left", "position": "left"}},
        {{"name": "Mochi", "emotion": "excited", "pose": "point", "facing": "left", "position": "right"}}
      ],
      "caption_symbol": null,
      "sfx": "boing",
      "camera": "shake",
      "note": "ACT 1 HOOK — Banana mid-leap toward cookie jar — Mochi points — immediate tension"
    }},
    {{
      "start": 5,
      "end": 10,
      "background": "kitchen",
      "prop": "cookie_jar",
      "characters": [
        {{"name": "Banana", "emotion": "confused", "pose": "point", "facing": "right", "position": "left"}},
        {{"name": "Apple", "expression": "surprised", "pose": "idle", "facing": "left", "position": "right"}}
      ],
      "caption_symbol": null,
      "sfx": null,
      "camera": "push_in",
      "note": "ACT 2 PROBLEM — Banana points at cookie jar — Apple reacts — false confidence"
    }}
  ]
}}

Hard rules:
- beats must total exactly 40 seconds
- each beat is 3 to 8 seconds
- 8 to 10 beats total (target 9)
- follow the 7-act arc above — label each beat note with its ACT number and name
- Banana must appear in every single beat
- use "emotion" field OR "expression"+"pose" fields per character — not required to use both
- use only these emotions: happy sad scared excited confused angry
- use only these expressions: neutral happy laughing sad crying surprised angry love thinking scared
- use only these poses: idle wave jump point shrug fall
- use only these backgrounds: kitchen park classroom night plain
- use only these sfx: pop boing ding crunch sad_trombone rain whoosh
- use only these cameras: static push_in shake
- use only these props: null cookie_jar trophy door ball cake box
- use only these positions: left center right
- EVERY character must have a position field
- prop must be the same object across all beats where it appears — do not switch props mid-story
- prop is null in Act 7 celebration (goal achieved)
- Act 3 fail: sad_trombone or crunch
- Act 4 fail: sad_trombone, camera shake harder than Act 3
- Act 5 fail+quit: sad_trombone or rain; the near-quit beat camera must be static
- Act 5 near-quit beat: Banana alone, expression crying or sad, pose idle — no other characters
- Act 6 success: ding then pop across two beats
- Act 7 celebration: love or laughing for all characters, ding or pop
- CALLBACK: beat 1 note states a planted detail; an Act 6/7 note states its transformed payoff
- the three fails name three different failure mechanisms; Act 6 note names which failure it inverts"""

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

def generate_one(label):
    """One candidate beat sheet. Retries up to 3× on JSON parse failure. Returns dict or None."""
    last_error = None
    for attempt in range(3):
        print(f"[{label}] attempt {attempt + 1} of 3...")
        try:
            resp = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=3000,
                messages=[{"role": "user", "content": PROMPT}]
            )
            raw = resp.content[0].text.strip()
            cleaned = clean_json(raw)
            data = json.loads(cleaned)
            print(f"[{label}] parsed OK — {len(data.get('beats', []))} beats, "
                  f"{data.get('duration_seconds')}s")
            return data
        except json.JSONDecodeError as e:
            print(f"[{label}] JSON error: {e}")
            print(f"[{label}] raw around error: {raw[max(0,e.pos-50):e.pos+50]}")
            last_error = e
            continue
    print(f"[{label}] failed after 3 attempts. Last error: {last_error}")
    return None

JUDGE_PROMPT = """You are a story editor for silent cartoon micro-shorts (protagonist: Banana,
7-act fail-fail-fail-quit-succeed arc). Below are {n} candidate beat sheets as JSON. Judge them
ONLY on storytelling craft and pick the single best:

Score each on (each 0-10, then sum):
1. ESCALATION — do the three failures clearly worsen, each failing by a DIFFERENT mechanism (not the
   same gag louder)?
2. CALLBACK — is a specific detail planted in beat 1 and paid off transformed in Act 6/7?
3. EMOTIONAL SWING — real 10/10 despair at the near-quit, real release at success?
4. REVERSAL — does success come from inverting an earlier weakness (not luck/random new idea)?
5. ARC COMPLIANCE — Banana in every beat, near-quit beat static & alone, total exactly 40s, 8-10 beats.

Return ONLY a JSON object, no markdown, no prose:
{{"best_index": <0-based integer>, "reason": "<one short sentence>"}}

CANDIDATES:
{candidates}"""

def judge(cands):
    """Pick best candidate index via a single Claude call. Falls back to 0 on any failure."""
    if len(cands) == 1:
        return 0
    blocks = "\n\n".join(
        f"=== CANDIDATE {i} ===\n{json.dumps(c, indent=0)}" for i, c in enumerate(cands)
    )
    try:
        resp = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            messages=[{"role": "user", "content": JUDGE_PROMPT.format(
                n=len(cands), candidates=blocks)}]
        )
        verdict = json.loads(clean_json(resp.content[0].text.strip()))
        idx = int(verdict.get("best_index", 0))
        if not (0 <= idx < len(cands)):
            idx = 0
        print(f"Judge picked candidate {idx}: {verdict.get('reason', '')}")
        return idx
    except Exception as e:
        print(f"Judge failed ({e}); falling back to candidate 0")
        return 0

# Best-of-N: generate 3 candidates, keep the valid ones, judge picks the strongest story.
candidates = [c for c in (generate_one(f"cand {i+1}") for i in range(3)) if c is not None]
if not candidates:
    raise ValueError("All 3 candidate generations failed to produce valid JSON.")
print(f"{len(candidates)} valid candidate(s) generated.")
data = candidates[judge(candidates)]

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)

with open("jobs/latest.txt", "w") as f:
    f.write(OUT)

print(f"Beat sheet saved to {OUT}")
print(f"Title: {data.get('title_concept')}")
print(f"Beats: {len(data.get('beats', []))}")
