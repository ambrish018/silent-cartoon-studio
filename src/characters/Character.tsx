import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { characterSVG, CharName, Expression } from "./art";
import { EmotionState, EMOTIONS } from "./emotions";

function expressionMotion(expr: Expression, frame: number, fps: number) {
  switch (expr) {
    case "angry":
      return { dx: Math.sin(frame * 2.1) * 4, dy: 0, dr: Math.sin(frame * 2.1) * 1.5, ds: 1 };
    case "scared":
      return { dx: Math.sin(frame * 3.2) * 5, dy: Math.cos(frame * 2.8) * 3, dr: 0, ds: 1 };
    case "happy":
      return { dx: 0, dy: Math.sin(frame / 7) * 4, dr: Math.sin(frame / 14) * 2, ds: 1 };
    case "laughing":
      return { dx: Math.sin(frame / 4) * 5, dy: Math.sin(frame / 6) * 6, dr: Math.sin(frame / 8) * 3, ds: 1 };
    case "sad": case "crying":
      return { dx: 0, dy: 0, dr: -4, ds: 1 };
    case "love":
      return { dx: 0, dy: Math.sin(frame / 18) * 4, dr: Math.sin(frame / 18) * 2, ds: 1 };
    case "thinking":
      return { dx: 0, dy: 0, dr: 5, ds: 1 };
    case "surprised": {
      const pulse = spring({ frame, fps, config: { damping: 6, mass: 0.5 } });
      return { dx: 0, dy: 0, dr: 0, ds: interpolate(pulse, [0, 1], [1.18, 1]) };
    }
    default:
      return { dx: 0, dy: 0, dr: 0, ds: 1 };
  }
}

export type Pose = "idle" | "wave" | "jump" | "point" | "shrug" | "fall";
export type Facing = "left" | "right";

const ANT = 5, HOLD = 2, EX = ANT + HOLD; // anticipation wind-up before every pose

type FrameState = {
  translateX: number; translateY: number; rotate: number;
  squashX: number; squashY: number;
  dx: number; dy: number; sway: number; swayR: number;
  breathe: number; ds: number;
  tyFinal: number; rotFinal: number; // final vertical + angular value, for velocity
};

export const Character: React.FC<{
  name: CharName;
  expression?: Expression;
  emotion?: EmotionState;
  pose?: Pose;
  facing?: Facing;
  width?: number;
  shadowStyle?: string;
}> = ({ name, expression, emotion, pose, facing = "right", width = 360, shadowStyle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Resolve emotion preset → expression, pose, motion, idle scaling.
  // Guard against an out-of-set emotion string from the beat sheet (would otherwise
  // be undefined and slip past the truthy check below).
  const preset = (emotion && EMOTIONS[emotion]) ? EMOTIONS[emotion] : null;
  const activeExpression: Expression = expression ?? preset?.expression ?? "neutral";
  const activePose: Pose = pose ?? preset?.defaultPose ?? "idle";
  const idleMult = preset?.idleMult ?? 1;
  const baseY = preset?.baseY ?? 0;

  // Pure per-frame body transform — sampled at frame and frame-1 to derive velocity
  // for secondary motion (appendage drag) without storing any state.
  const frameState = (f: number): FrameState => {
    const m = preset ? preset.motion(f) : expressionMotion(activeExpression, f, fps);
    const breathe = 1 + Math.sin(f / 20) * 0.018 * idleMult;
    const sway    = Math.sin(f / 30) * 3 * idleMult;
    const swayR   = Math.sin(f / 30) * 1.2 * idleMult;
    const idle    = Math.sin(f / 12) * 6 * idleMult;
    const ef = Math.max(0, f - EX);

    let translateY = idle + baseY;
    let rotate = 0;
    let translateX = 0;
    let squashX = 1, squashY = 1;

    if (activePose === "jump") {
      if (f < EX) {
        // anticipation: crouch down + squash before launch
        translateY = idle + baseY + interpolate(f, [0, ANT, EX], [0, 20, 20], { extrapolateRight: "clamp" });
        squashX = interpolate(f, [0, ANT], [1, 1.18], { extrapolateRight: "clamp" });
        squashY = interpolate(f, [0, ANT], [1, 0.82], { extrapolateRight: "clamp" });
      } else {
        const j = spring({ frame: ef, fps, config: { damping: 8, mass: 0.6 } });
        translateY = idle + baseY - interpolate(Math.sin(j * Math.PI), [0, 1], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        // stretch on rise, squash on landing impact
        squashX = interpolate(ef, [0, fps * 0.15, fps * 0.6, fps * 0.85, fps * 1.3], [0.82, 0.82, 0.88, 1.26, 1.0], { extrapolateRight: "clamp" });
        squashY = interpolate(ef, [0, fps * 0.15, fps * 0.6, fps * 0.85, fps * 1.3], [1.18, 1.18, 1.10, 0.76, 1.0], { extrapolateRight: "clamp" });
      }
    } else if (activePose === "fall") {
      if (f < EX) {
        rotate = -interpolate(f, [0, ANT, EX], [0, 6, 6], { extrapolateRight: "clamp" });
      } else {
        translateY = idle + baseY + interpolate(ef, [0, fps], [0, 220], { extrapolateRight: "clamp" });
        rotate = interpolate(ef, [0, fps], [0, 35], { extrapolateRight: "clamp" });
        // landing impact: squash flat then settle (follow-through bounce)
        squashX = interpolate(ef, [fps, fps * 1.12, fps * 1.4], [1, 1.32, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        squashY = interpolate(ef, [fps, fps * 1.12, fps * 1.4], [1, 0.70, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      }
    } else if (activePose === "wave") {
      if (f < EX) {
        rotate = -interpolate(f, [0, ANT, EX], [0, 10, 10], { extrapolateRight: "clamp" });
      } else {
        rotate = Math.sin(ef / 5) * 6;
      }
    } else if (activePose === "shrug") {
      if (f < EX) {
        translateY = idle + baseY + interpolate(f, [0, ANT, EX], [0, 10, 10], { extrapolateRight: "clamp" });
      } else {
        translateY = idle + baseY - 4;
        rotate = Math.sin(ef / 16) * 3;
      }
    } else if (activePose === "point") {
      if (f < EX) {
        // anticipation: pull back opposite the point
        translateX = -interpolate(f, [0, ANT, EX], [0, 22, 22], { extrapolateRight: "clamp" });
      } else {
        // spring with overshoot = follow-through; vertical dip = natural arc
        const ps = spring({ frame: ef, fps, config: { damping: 9, mass: 0.9, stiffness: 120 } });
        translateX = interpolate(ps, [0, 1], [0, 70]);
        translateY = idle + baseY - Math.sin(Math.min(ps, 1) * Math.PI) * 12;
      }
    }

    const tyFinal = translateY + m.dy;
    const rotFinal = rotate + m.dr + swayR;
    return { translateX, translateY, rotate, squashX, squashY, dx: m.dx, dy: m.dy, sway, swayR, breathe, ds: m.ds, tyFinal, rotFinal };
  };

  const cur  = frameState(frame);
  const prev = frameState(Math.max(0, frame - 1));

  // Secondary motion / follow-through: light appendages drag behind the body.
  // Angle tracks vertical + angular velocity; clamped so it reads as flop, not spin.
  const vy = cur.tyFinal - prev.tyFinal;   // +down
  const vr = cur.rotFinal - prev.rotFinal; // +cw
  const floppy = Math.max(-30, Math.min(30, -vy * 0.85 + vr * 0.9));

  const flip = facing === "left" ? -1 : 1;
  const ef = Math.max(0, frame - EX);

  // Motion blur — velocity-proportional directional feGaussianBlur
  let blurX = 0, blurY = 0;
  if (activePose === "jump" && frame >= EX) {
    const jNow  = spring({ frame: ef,                  fps, config: { damping: 8, mass: 0.6 } });
    const jPrev = spring({ frame: Math.max(0, ef - 1), fps, config: { damping: 8, mass: 0.6 } });
    const dSin  = Math.abs(Math.PI * Math.cos(jNow * Math.PI) * (jNow - jPrev));
    blurY = Math.min(16, dSin * 200 * 0.55);
  }
  if (activePose === "fall" && frame >= EX) {
    blurY = Math.min(10, interpolate(ef, [0, fps * 0.5], [4, 10], { extrapolateRight: "clamp" }));
  }
  if (activePose === "point" && frame >= EX) {
    blurX = Math.max(0, interpolate(ef, [0, 8], [15, 0], { extrapolateRight: "clamp" }));
  }
  // NOTE: blur only on transient fast motion (jump launch/land, fall, point thrust).
  // `wave` is a sustained gesture — a per-frame blur there just smears the character
  // the whole beat. angry/scared are emotions, not motion — their tremble reads through
  // the dx/dy/dr in the motion presets, no blur needed.

  return (
    <div
      style={{
        width,
        transform: `translate(${cur.translateX + cur.dx + cur.sway}px, ${cur.tyFinal}px) rotate(${cur.rotFinal}deg) scale(${flip * cur.ds * cur.squashX}, ${cur.ds * cur.breathe * cur.squashY})`,
        transformOrigin: "center bottom",
        filter: shadowStyle,
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 220 260" width="${width}" xmlns="http://www.w3.org/2000/svg">${characterSVG(name, activeExpression, frame, blurX, blurY, floppy)}</svg>`,
      }}
    />
  );
};
