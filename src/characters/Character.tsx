import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { characterSVG, CharName, Expression } from "./art";

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

export const Character: React.FC<{
  name: CharName;
  expression: Expression;
  pose?: Pose;
  facing?: Facing;
  width?: number;
}> = ({ name, expression, pose = "idle", facing = "right", width = 360 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const { dx, dy, dr, ds } = expressionMotion(expression, frame, fps);

  const breathe = 1 + Math.sin(frame / 20) * 0.018;
  const sway    = Math.sin(frame / 30) * 3;
  const swayR   = Math.sin(frame / 30) * 1.2;

  const idle = Math.sin(frame / 12) * 6;
  let translateY = idle;
  let rotate = 0;
  let translateX = 0;

  const ANT = 5, HOLD = 2, EX = ANT + HOLD;
  const ef = Math.max(0, frame - EX);

  if (pose === "jump") {
    if (frame < EX) {
      translateY = idle + interpolate(frame, [0, ANT, EX], [0, 20, 20], { extrapolateRight: "clamp" });
    } else {
      const j = spring({ frame: ef, fps, config: { damping: 8, mass: 0.6 } });
      translateY = idle - interpolate(Math.sin(j * Math.PI), [0, 1], [0, 70]);
    }
  } else if (pose === "fall") {
    if (frame < EX) {
      rotate = -interpolate(frame, [0, ANT, EX], [0, 6, 6], { extrapolateRight: "clamp" });
    } else {
      translateY = idle + interpolate(ef, [0, fps], [0, 90], { extrapolateRight: "clamp" });
      rotate = interpolate(ef, [0, fps], [0, 22], { extrapolateRight: "clamp" });
    }
  } else if (pose === "wave") {
    if (frame < EX) {
      rotate = -interpolate(frame, [0, ANT, EX], [0, 10, 10], { extrapolateRight: "clamp" });
    } else {
      rotate = Math.sin(ef / 5) * 6;
    }
  } else if (pose === "shrug") {
    if (frame < EX) {
      translateY = idle + interpolate(frame, [0, ANT, EX], [0, 10, 10], { extrapolateRight: "clamp" });
    } else {
      translateY = idle - 4;
      rotate = Math.sin(ef / 16) * 3;
    }
  } else if (pose === "point") {
    if (frame < EX) {
      translateX = -interpolate(frame, [0, ANT, EX], [0, 10, 10], { extrapolateRight: "clamp" });
    } else {
      translateX = 10;
    }
  }

  const flip = facing === "left" ? -1 : 1;

  return (
    <div
      style={{
        width,
        transform: `translate(${translateX + dx + sway}px, ${translateY + dy}px) rotate(${rotate + dr + swayR}deg) scale(${flip * ds}, ${ds * breathe})`,
        transformOrigin: "center bottom",
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 220 260" width="${width}" xmlns="http://www.w3.org/2000/svg">${characterSVG(name, expression, frame)}</svg>`,
      }}
    />
  );
};
