import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT, SPACE, accentFor } from "../theme";
import { Starfield } from "./Starfield";
import { OrbitMotif } from "./OrbitMotif";
import { KineticTitle, Caption } from "./KineticText";

export const Scene: React.FC<{
  index: number;
  total: number;
  title?: string;
  narration: string;
  durationInFrames: number;
}> = ({ index, total, title, narration, durationInFrames }) => {
  const frame = useCurrentFrame();
  const accent = accentFor(index);

  // whole-scene fade in/out (transitions between scenes)
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* background gradient + stars */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 50% 22%, ${COLORS.bg2} 0%, ${COLORS.bg1} 40%, ${COLORS.bg0} 100%)`,
        }}
      />
      <Starfield count={80} />

      {/* content stack */}
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: SPACE.gutter,
        }}
      >
        {/* scene counter */}
        <div
          style={{
            marginTop: SPACE.lg,
            color: COLORS.inkFaint,
            fontFamily: FONT.family,
            fontSize: FONT.label,
            fontWeight: FONT.weightMed,
            letterSpacing: 6,
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>

        {/* hero motif */}
        <div style={{ marginTop: SPACE.lg, marginBottom: SPACE.lg }}>
          <OrbitMotif accent={accent} size={520} rings={2 + (index % 2)} dots={3 + (index % 3)} />
        </div>

        {/* title */}
        {title ? <KineticTitle text={title} accent={accent} /> : null}
      </AbsoluteFill>

      {/* caption — lower third */}
      <AbsoluteFill
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: SPACE.gutter,
          paddingBottom: SPACE.xl,
        }}
      >
        <Caption text={narration} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
