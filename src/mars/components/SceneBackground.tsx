import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

// Full-bleed AI image with a slow Ken Burns move + top/bottom dark scrims so the
// counter (top) and title/caption (bottom) stay legible over any image.
export const SceneBackground: React.FC<{ src: string; durationInFrames: number; index: number }> = ({
  src,
  durationInFrames,
  index,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationInFrames], [1.06, 1.16], { extrapolateRight: "clamp" });
  // alternate pan direction by scene
  const dir = index % 2 === 0 ? 1 : -1;
  const pan = interpolate(frame, [0, durationInFrames], [0, dir * 30], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg0, overflow: "hidden" }}>
      <Img
        src={src}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translateX(${pan}px)`,
        }}
      />
      {/* legibility scrims: darken top + bottom, keep middle clear */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.bg0}E6 0%, ${COLORS.bg0}00 22%, ${COLORS.bg0}00 50%, ${COLORS.bg0}CC 78%, ${COLORS.bg0}F2 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
