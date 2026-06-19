import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT, SPACE, accentFor } from "../theme";
import { SceneViz } from "../script";
import { OrbitMotif } from "./OrbitMotif";
import { BigNumber } from "./BigNumber";
import { Compare } from "./Compare";
import { KineticTitle, Caption } from "./KineticText";
import { EndCard } from "./EndCard";

// Deterministic visual switch — bounded set, safe to render unattended.
const Visual: React.FC<{ viz: SceneViz | undefined; accent: string; index: number }> = ({
  viz,
  accent,
  index,
}) => {
  if (viz?.type === "bignumber") return <BigNumber value={viz.value} unit={viz.unit} accent={accent} />;
  if (viz?.type === "compare") return <Compare a={viz.a} b={viz.b} accent={accent} />;
  return <OrbitMotif accent={accent} size={520} variant={index % 3} />;
};

// Content only — the gradient + starfield live in MarsVideo as a continuous
// layer, so the per-scene content fade no longer flashes the background to black.
export const Scene: React.FC<{
  index: number;
  total: number;
  title?: string;
  narration: string;
  durationInFrames: number;
  isLast?: boolean;
  viz?: SceneViz;
  genre?: string;
}> = ({ index, total, title, narration, durationInFrames, isLast, viz, genre }) => {
  const frame = useCurrentFrame();
  const accent = accentFor(index, genre);

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

        <div
          style={{
            marginTop: SPACE.lg,
            marginBottom: SPACE.lg,
            height: 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Visual viz={viz} accent={accent} index={index} />
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
