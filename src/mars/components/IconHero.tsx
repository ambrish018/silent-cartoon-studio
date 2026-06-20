import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS } from "../theme";
import { ICONS, hasIcon } from "../icons";
import { OrbitMotif } from "./OrbitMotif";

// Big topic icon as the scene hero. Spring scale-in + gentle float + a soft
// accent halo. Unknown name → falls back to the abstract motif (safe default).
export const IconHero: React.FC<{ name?: string; accent: string; index: number; size?: number }> = ({
  name,
  accent,
  index,
  size = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!hasIcon(name)) return <OrbitMotif accent={accent} size={520} variant={index % 3} />;
  const Icon = ICONS[name as string];

  const intro = spring({ frame, fps, config: { damping: 13, mass: 0.8 } });
  const scale = interpolate(intro, [0, 1], [0.6, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const float = Math.sin(frame / 22) * 8;
  const ring = size * 1.55;

  return (
    <div
      style={{
        width: ring,
        height: ring,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${float}px) scale(${scale})`,
        opacity,
      }}
    >
      {/* soft accent halo */}
      <div
        style={{
          position: "absolute",
          width: ring,
          height: ring,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}33 0%, ${accent}00 65%)`,
        }}
      />
      <div
        style={{
          width: size * 1.18,
          height: size * 1.18,
          borderRadius: "50%",
          border: `3px solid ${accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: COLORS.bg1,
        }}
      >
        <Icon size={size} color={accent} strokeWidth={1.6} absoluteStrokeWidth />
      </div>
    </div>
  );
};
