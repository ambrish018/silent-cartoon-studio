import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Character, Pose, Facing } from "./characters/Character";
import { CharName, Expression } from "./characters/art";
import { EmotionState, EMOTIONS } from "./characters/emotions";
import { BackgroundSky, BackgroundClouds, BackgroundTrees, Theme } from "./components/Background";
import { ParticleLayer } from "./components/ParticleLayer";

export type BeatCharacter = {
  name: CharName;
  expression?: Expression;
  emotion?: EmotionState;
  pose?: Pose;
  facing?: Facing;
  position?: "left" | "center" | "right";
};

export type Beat = {
  start: number;
  end: number;
  background: Theme;
  characters: BeatCharacter[];
  prop?: string | null;
  caption_symbol?: string | null;
  sfx?: string | null;
  camera?: "static" | "push_in" | "shake";
  note?: string;
};

export type BeatSheet = {
  title_concept: string;
  genre: string;
  duration_seconds: number;
  music_prompt: string;
  beats: Beat[];
};

const O = { transformOrigin: "center center" as const };

// Directional cast shadow per lighting environment
function themeShadow(theme: Theme): string {
  if (theme === "park" || theme === "plain")
    return "drop-shadow(-5px 18px 9px rgba(92,61,46,0.42))";
  if (theme === "night")
    return "drop-shadow(-4px 15px 12px rgba(20,20,80,0.55))";
  // kitchen / classroom — overhead artificial light
  return "drop-shadow(0px 15px 7px rgba(92,61,46,0.34))";
}

// Ground contact shadow: shrinks when jumping, spreads when falling
function contactShadow(pose: string, frame: number, fps: number, cw: number) {
  const rx = cw * 0.30, ry = cw * 0.058;
  const EX = 7;
  if (pose === "jump") {
    const ef = Math.max(0, frame - EX);
    const j  = spring({ frame: ef, fps, config: { damping: 8, mass: 0.6 } });
    const sc = Math.max(0.15, 1 - Math.sin(j * Math.PI) * 0.85);
    return { rx: rx * sc, ry: ry * sc, op: sc };
  }
  if (pose === "fall") {
    const ef     = Math.max(0, frame - EX);
    const spread = interpolate(ef, [0, fps * 0.55], [1, 1.6], { extrapolateRight: "clamp" });
    return { rx: rx * spread, ry: ry * 0.80, op: 0.90 };
  }
  return { rx, ry, op: 1 };
}

const PROP_SVGS: Record<string, { vw: number; vh: number; svg: string }> = {
  cookie_jar: { vw: 140, vh: 260, svg:
    `<rect x="0" y="40" width="140" height="220" rx="22" fill="#F0C890" stroke="#5C3D2E" stroke-width="8"/>`
  + `<ellipse cx="70" cy="40" rx="52" ry="22" fill="#D4A860" stroke="#5C3D2E" stroke-width="6"/>`
  + `<ellipse cx="70" cy="22" rx="26" ry="10" fill="#C09050" stroke="#5C3D2E" stroke-width="5"/>`
  + `<circle cx="70" cy="135" r="26" fill="#5C3D2E" opacity="0.13"/>`
  + `<circle cx="48" cy="185" r="20" fill="#5C3D2E" opacity="0.10"/>`
  + `<ellipse cx="34" cy="95" rx="13" ry="26" fill="white" opacity="0.18"/>`,
  },
  trophy: { vw: 200, vh: 260, svg:
    `<path d="M 10 10 L 190 10 L 158 150 L 42 150 Z" fill="#FFD700" stroke="#8B6010" stroke-width="8"/>`
  + `<path d="M 10 10 C -20 10 -30 80 10 100 L 42 90 Z" fill="#FFD700" stroke="#8B6010" stroke-width="6"/>`
  + `<path d="M 190 10 C 220 10 230 80 190 100 L 158 90 Z" fill="#FFD700" stroke="#8B6010" stroke-width="6"/>`
  + `<rect x="80" y="150" width="40" height="66" rx="4" fill="#DAA520" stroke="#8B6010" stroke-width="5"/>`
  + `<rect x="20" y="216" width="160" height="22" rx="6" fill="#DAA520" stroke="#8B6010" stroke-width="5"/>`
  + `<circle cx="100" cy="78" r="28" fill="#FFE566" opacity="0.55"/>`,
  },
  door: { vw: 220, vh: 340, svg:
    `<rect x="0" y="0" width="220" height="340" rx="6" fill="#C89860" stroke="#5C3D2E" stroke-width="8"/>`
  + `<rect x="14" y="14" width="192" height="148" rx="4" fill="#B8844A" opacity="0.35"/>`
  + `<rect x="14" y="178" width="192" height="148" rx="4" fill="#B8844A" opacity="0.35"/>`
  + `<rect x="14" y="14" width="192" height="312" rx="4" fill="none" stroke="#A07838" stroke-width="5"/>`
  + `<circle cx="178" cy="170" r="14" fill="#C09050" stroke="#5C3D2E" stroke-width="5"/>`,
  },
  ball: { vw: 200, vh: 200, svg:
    `<circle cx="100" cy="100" r="92" fill="#FF7A7A" stroke="#5C3D2E" stroke-width="8"/>`
  + `<path d="M 18 100 Q 100 30 182 100" stroke="white" stroke-width="9" fill="none" stroke-linecap="round"/>`
  + `<path d="M 18 100 Q 100 170 182 100" stroke="white" stroke-width="9" fill="none" stroke-linecap="round"/>`
  + `<circle cx="66" cy="58" r="16" fill="white" opacity="0.25"/>`,
  },
  cake: { vw: 220, vh: 280, svg:
    `<rect x="0" y="180" width="220" height="100" rx="10" fill="#FFB0C0" stroke="#5C3D2E" stroke-width="7"/>`
  + `<rect x="22" y="110" width="176" height="80" rx="8" fill="#FF9ED2" stroke="#5C3D2E" stroke-width="7"/>`
  + `<rect x="52" y="58" width="116" height="60" rx="6" fill="#FFD0E0" stroke="#5C3D2E" stroke-width="6"/>`
  + `<line x1="80" y1="58" x2="80" y2="18" stroke="#FF6B6B" stroke-width="5" stroke-linecap="round"/>`
  + `<line x1="110" y1="58" x2="110" y2="12" stroke="#FF6B6B" stroke-width="5" stroke-linecap="round"/>`
  + `<line x1="140" y1="58" x2="140" y2="18" stroke="#FF6B6B" stroke-width="5" stroke-linecap="round"/>`
  + `<circle cx="80" cy="18" r="7" fill="#FFE566"/>`
  + `<circle cx="110" cy="12" r="7" fill="#FF9966"/>`
  + `<circle cx="140" cy="18" r="7" fill="#FFE566"/>`,
  },
  box: { vw: 220, vh: 260, svg:
    `<polygon points="10,80 110,30 210,80 210,230 110,280 10,230" fill="#D4A56A" stroke="#5C3D2E" stroke-width="7"/>`
  + `<polygon points="10,80 110,130 210,80" fill="#C09050" stroke="#5C3D2E" stroke-width="7"/>`
  + `<line x1="110" y1="130" x2="110" y2="280" stroke="#5C3D2E" stroke-width="7"/>`,
  },
};

const PropDisplay: React.FC<{ prop: string }> = ({ prop }) => {
  const p = PROP_SVGS[prop];
  if (!p) return null;
  const w = 200;
  const h = Math.round(w * p.vh / p.vw);
  return (
    <div
      style={{ position: "absolute", right: 100, bottom: 80, width: w, height: h }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 ${p.vw} ${p.vh}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${p.svg}</svg>`,
      }}
    />
  );
};

// Resolve effective expression/pose from either emotion preset or explicit fields.
// Guard the EMOTIONS lookup: a beat sheet may carry an out-of-set emotion string
// (Claude can emit a non-emotion like "surprised"/"neutral") — an unguarded
// `EMOTIONS[bad].x` throws and kills the whole render.
function effectiveExpr(c: BeatCharacter): Expression {
  if (c.expression) return c.expression;
  const p = c.emotion ? EMOTIONS[c.emotion] : undefined;
  return p ? p.expression : "neutral";
}
function effectivePose(c: BeatCharacter): Pose {
  if (c.pose) return c.pose;
  const p = c.emotion ? EMOTIONS[c.emotion] : undefined;
  return p ? p.defaultPose : "idle";
}

function layerTransforms(
  beat: Beat,
  frame: number,
  beatDurationFrames: number,
  fps: number
) {
  const t = frame / beatDurationFrames;
  const ease = t * t;
  const decay = Math.exp(-frame / (fps * 0.35));

  if (beat.camera === "push_in") {
    return {
      sky:    `translate(0, ${-ease * 5}px) scale(${1 + ease * 0.10})`,
      clouds: `translate(0, ${-ease * 9}px) scale(${1 + ease * 0.16})`,
      trees:  `translate(0, ${-ease * 15}px) scale(${1 + ease * 0.24})`,
      chars:  `translate(0, ${-ease * 20}px) scale(${1 + ease * 0.35})`,
      fg:     `translate(0, ${-ease * 28}px) scale(${1 + ease * 0.50})`,
    };
  }

  if (beat.camera === "shake") {
    const sx = Math.sin(frame * 1.9) * 14 * decay;
    const sy = Math.cos(frame * 2.7) * 9  * decay;
    return {
      sky:    `translate(${sx * 0.15}px, ${sy * 0.15}px)`,
      clouds: `translate(${sx * 0.35}px, ${sy * 0.35}px)`,
      trees:  `translate(${sx * 0.65}px, ${sy * 0.65}px)`,
      chars:  `translate(${sx}px, ${sy}px)`,
      fg:     `translate(${sx * 1.6}px, ${sy * 1.6}px)`,
    };
  }

  const isEmotional = beat.characters.some(c =>
    (["sad", "crying", "love"] as Expression[]).includes(effectiveExpr(c))
  );
  if (isEmotional) {
    return {
      sky:    `scale(${1 + t * 0.02})`,
      clouds: `scale(${1 + t * 0.03})`,
      trees:  `scale(${1 + t * 0.04})`,
      chars:  `scale(${1 + t * 0.05})`,
      fg:     `scale(${1 + t * 0.07})`,
    };
  }

  return { sky: "none", clouds: "none", trees: "none", chars: "none", fg: "none" };
}

// ── Beat transitions ────────────────────────────────────────────────────────
// Frame-neutral: the transition is baked into the outgoing beat's own tail frames
// and the incoming beat's own head frames — no extra Sequences, no added duration,
// so total render frames (and Lambda cost) are unchanged. A boundary's exit and the
// next beat's enter share one type → the cut reads as a single coherent move.
type TransType = "whip" | "fade" | "push";
const TRANS = 6; // frames of transition on each side of a cut (0.2s @ 30fps)

// Base scene zoom, anchored at the floor. The 9:16 frame is much taller than the
// characters; without this the subjects sit tiny at the bottom under ~70% empty wall.
// Scaling from bottom-center enlarges the cast + floor and crops the dead upper wall.
const BASE_ZOOM = 1.42;

function beatEmotional(b: Beat): boolean {
  return b.characters.some(c =>
    (["sad", "crying", "love"] as Expression[]).includes(effectiveExpr(c)));
}

function boundaryType(a: Beat, b: Beat): TransType {
  if (a.camera === "shake" || b.camera === "shake") return "whip"; // action → snappy pan
  if (beatEmotional(a) || beatEmotional(b)) return "fade";          // tender → soft dissolve
  return "push";                                                    // default → match-cut
}

const smooth = (p: number) => { const c = Math.max(0, Math.min(1, p)); return c * c * (3 - 2 * c); };

// Wrapper transform/opacity/blur for the scene's enter + exit windows.
function sceneTransition(
  frame: number, dur: number, inType: TransType | null, outType: TransType | null
): { transform: string; opacity: number; filter?: string } {
  // Whip slide kept small (120px) so the opaque scene never exposes a big band of
  // background color mid-cut; the blur carries the speed read instead.
  let tx = 0, sc = 1, op = 1, blur = 0;
  if (inType && frame < TRANS) {
    const p = smooth(frame / TRANS); // 0→1 as the beat enters
    if (inType === "whip") { tx = (1 - p) * 120; blur = (1 - p) * 13; }
    else if (inType === "fade") { op = p; }
    else { sc = 1 + (1 - p) * 0.06; op = 0.45 + 0.55 * p; }
  }
  const exitStart = dur - TRANS;
  if (outType && frame > exitStart) {
    const p = smooth((frame - exitStart) / TRANS); // 0→1 as the beat exits
    if (outType === "whip") { tx = -p * 120; blur = p * 13; }
    else if (outType === "fade") { op = 1 - p; }
    else { sc = 1 - p * 0.04; op = 1 - 0.55 * p; }
  }
  return {
    transform: `translateX(${tx.toFixed(1)}px) scale(${sc.toFixed(4)})`,
    opacity: op,
    filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
  };
}

const Scene: React.FC<{ beat: Beat; inType?: TransType | null; outType?: TransType | null }> = ({
  beat, inType = null, outType = null,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beatDurationFrames = Math.round((beat.end - beat.start) * fps);

  const trans = sceneTransition(frame, beatDurationFrames, inType, outType);

  const { sky, clouds, trees, chars, fg } = layerTransforms(beat, frame, beatDurationFrames, fps);

  const n = beat.characters.length;
  const charWidth = n <= 1 ? 820 : n === 2 ? 640 : n === 3 ? 470 : 360;
  const hasPositions = beat.characters.some(c => c.position);
  const castShadow = themeShadow(beat.background);

  const charCx = (c: BeatCharacter, idx: number): number => {
    if (hasPositions) {
      const p = c.position ?? (idx === 0 ? "left" : "right");
      if (p === "left")  return 80 + charWidth / 2;
      if (p === "right") return 1080 - charWidth - 80 + charWidth / 2;
      return 540;
    }
    if (n === 1) return 120 + charWidth / 2;
    return (1080 / n) * (idx + 0.5);
  };

  return (
    <AbsoluteFill style={{ transform: trans.transform, opacity: trans.opacity, filter: trans.filter, ...O }}>
      {/* Base zoom: enlarge subjects + crop the empty upper wall (anchored at the floor) */}
      <AbsoluteFill style={{ transform: `scale(${BASE_ZOOM})`, transformOrigin: "bottom center" }}>
      {/* Layer 0: sky — least parallax */}
      <AbsoluteFill style={{ transform: sky, ...O }}>
        <BackgroundSky theme={beat.background} />
      </AbsoluteFill>
      {/* Layer 1: clouds */}
      <AbsoluteFill style={{ transform: clouds, ...O }}>
        <BackgroundClouds theme={beat.background} />
      </AbsoluteFill>
      {/* Layer 2: trees / ground */}
      <AbsoluteFill style={{ transform: trees, ...O }}>
        <BackgroundTrees theme={beat.background} />
      </AbsoluteFill>
      {/* Layer 3: contact shadows + prop + characters */}
      <AbsoluteFill style={{ transform: chars, ...O }}>
        {/* Ground contact shadows — behind everything in this layer */}
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="csblur" x="-60%" y="-200%" width="220%" height="500%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            {beat.characters.map((c, i) => {
              const cx = charCx(c, i);
              const cs = contactShadow(effectivePose(c), frame, fps, charWidth);
              return (
                <ellipse key={i} cx={cx} cy={1840} rx={cs.rx} ry={cs.ry}
                  fill="#5C3D2E" opacity={cs.op * 0.38}
                  filter="url(#csblur)"
                />
              );
            })}
          </svg>
        </AbsoluteFill>
        {beat.prop && <PropDisplay prop={beat.prop} />}
        {hasPositions ? (
          <AbsoluteFill style={{ paddingBottom: 80 }}>
            {beat.characters.map((c, i) => {
              const pos = c.position ?? (i === 0 ? "left" : "right");
              const left = pos === "left" ? 80 : pos === "right" ? 1080 - charWidth - 80 : (1080 - charWidth) / 2;
              return (
                <div key={i} style={{ position: "absolute", bottom: 0, left }}>
                  <Character
                    name={c.name}
                    expression={c.expression}
                    emotion={c.emotion}
                    pose={c.pose}
                    facing={c.facing ?? "right"}
                    width={charWidth}
                    shadowStyle={castShadow}
                  />
                </div>
              );
            })}
          </AbsoluteFill>
        ) : (
          <AbsoluteFill
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: n === 1 ? "flex-start" : "space-evenly",
              paddingBottom: 80,
              paddingLeft: n === 1 ? 120 : 0,
            }}
          >
            {beat.characters.map((c, i) => (
              <Character
                key={i}
                name={c.name}
                expression={c.expression}
                emotion={c.emotion}
                pose={c.pose}
                facing={c.facing ?? "right"}
                width={charWidth}
                shadowStyle={castShadow}
              />
            ))}
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      {/* Layer 4: foreground particles — most parallax */}
      <AbsoluteFill style={{ transform: fg, ...O }}>
        <ParticleLayer theme={beat.background} characters={beat.characters} />
      </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Story: React.FC<{ beatSheet: BeatSheet }> = ({ beatSheet }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#fdf6ec" }}>
      {beatSheet.beats.map((beat, i) => {
        const from = Math.round(beat.start * fps);
        const dur = Math.round((beat.end - beat.start) * fps);
        const beats = beatSheet.beats;
        // Enter/exit share the boundary's type so a cut reads as one move.
        // First beat has no enter (preserve the in-medias-res hook); last has no exit.
        const inType = i > 0 ? boundaryType(beats[i - 1], beat) : null;
        const outType = i < beats.length - 1 ? boundaryType(beat, beats[i + 1]) : null;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(dur, 1)}>
            <Scene beat={beat} inType={inType} outType={outType} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
