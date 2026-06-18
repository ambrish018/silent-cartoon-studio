import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT, SPACE, accentFor } from "../theme";
import { OrbitMotif } from "./OrbitMotif";
import { KineticTitle, Caption } from "./KineticText";
import { EndCard } from "./EndCard";

// Content only — the gradient + starfield live in MarsVideo as a continuous
// layer, so the per-scene content fade no longer flashes the background to black.
export const Scene: React.FC<{
  index: number;
  total: number;
  title?: string;
  narration: string;
  durationInFrames: number;
  isLast?: boolean;
}> = ({ index, total, title, narration, durationInFrames, isLast }) => {
  const frame = useCurrentFrame();
  const accent = accentFor(index);

  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: SPACE.gutter,
        }}
      >
        <div
          style={{
            marginTop: SPACE.lg,
            color: COLORS.inkFaint,
            fontSize: FONT.label,
            fontWeight: FONT.weightMed,
            letterSpacing: 6,
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>

        <div style={{ marginTop: SPACE.lg, marginBottom: SPACE.lg }}>
          <OrbitMotif accent={accent} size={520} variant={index % 3} />
        </div>

        {title ? <KineticTitle text={title} accent={accent} /> : null}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: SPACE.gutter,
          paddingBottom: SPACE.xl,
        }}
      >
        <Caption text={narration} durationInFrames={durationInFrames} />
        {isLast ? <EndCard accent={accent} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
