import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// Subscribe CTA — shown on the final scene. Springs in after a short delay.
export const EndCard: React.FC<{ accent: string; delay?: number }> = ({ accent, delay = 24 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 13, mass: 0.7 } });
  const pop = interpolate(s, [0, 1], [0.8, 1]);
  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // gentle pulse
  const pulse = 1 + Math.sin(frame / 9) * 0.03;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginTop: 36,
        padding: "20px 40px",
        borderRadius: 999,
        background: accent,
        transform: `scale(${pop * pulse})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: "16px solid transparent",
          borderBottom: "16px solid transparent",
          borderLeft: `26px solid ${COLORS.bg0}`,
        }}
      />
      <span style={{ fontSize: FONT.h2, fontWeight: FONT.weightBold, color: COLORS.bg0 }}>
        Subscribe
      </span>
    </div>
  );
};
