import React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS, WIDTH } from "../theme";

// Thin overall-progress bar pinned to the top. Uses the GLOBAL frame, so it must
// live outside the per-scene <Sequence>s.
export const ProgressBar: React.FC<{ totalFrames: number; accent: string }> = ({
  totalFrames,
  accent,
}) => {
  const frame = useCurrentFrame();
  const w = Math.max(0, Math.min(1, frame / totalFrames)) * WIDTH;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8 }}>
      <div style={{ position: "absolute", inset: 0, background: COLORS.bg1, opacity: 0.6 }} />
      <div style={{ position: "absolute", top: 0, left: 0, height: 8, width: w, background: accent }} />
    </div>
  );
};
