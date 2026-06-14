import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { characterSVG, CharName, Expression } from "./art";

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

  const idle = Math.sin(frame / 12) * 6;
  let translateY = idle;
  let rotate = 0;
  let translateX = 0;

  if (pose === "jump") {
    const j = spring({ frame, fps, config: { damping: 8, mass: 0.6 } });
    translateY = idle - interpolate(Math.sin(j * Math.PI), [0, 1], [0, 70]);
  } else if (pose === "fall") {
    translateY = idle + interpolate(frame, [0, fps], [0, 90], { extrapolateRight: "clamp" });
    rotate = interpolate(frame, [0, fps], [0, 22], { extrapolateRight: "clamp" });
  } else if (pose === "wave") {
    rotate = Math.sin(frame / 5) * 6;
  } else if (pose === "shrug") {
    translateY = idle - 4;
    rotate = Math.sin(frame / 16) * 3;
  } else if (pose === "point") {
    translateX = 6;
  }

  const flip = facing === "left" ? -1 : 1;

  return (
    <div
      style={{
        width,
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scaleX(${flip})`,
        transformOrigin: "center bottom",
      }}
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 220 260" width="${width}" xmlns="http://www.w3.org/2000/svg">${characterSVG(name, expression)}</svg>`,
      }}
    />
  );
};
