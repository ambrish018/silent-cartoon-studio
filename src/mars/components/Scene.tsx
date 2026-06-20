import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT, SPACE, accentFor } from "../theme";
import { SceneViz } from "../script";
import { chooseLayout, LayoutType } from "../layouts";
import { OrbitMotif } from "./OrbitMotif";
import { IconHero } from "./IconHero";
import { SceneBackground } from "./SceneBackground";
import { BigNumber } from "./BigNumber";
import { Compare } from "./Compare";
import { KineticTitle, Caption } from "./KineticText";
import { EndCard } from "./EndCard";

// ---- pieces ---------------------------------------------------------------
const Counter: React.FC<{ index: number; total: number }> = ({ index, total }) => (
  <div
    style={{
      position: "absolute",
      top: SPACE.xl,
      left: 0,
      right: 0,
      textAlign: "center",
      color: COLORS.inkFaint,
      fontSize: FONT.label,
      fontWeight: FONT.weightMed,
      letterSpacing: 6,
    }}
  >
    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
  </div>
);

const Visual: React.FC<{ viz?: SceneViz; accent: string; index: number; scale?: number }> = ({
  viz,
  accent,
  index,
  scale = 1,
}) => {
  let el: React.ReactNode;
  if (viz?.type === "bignumber") el = <BigNumber value={viz.value} unit={viz.unit} accent={accent} />;
  else if (viz?.type === "compare") el = <Compare a={viz.a} b={viz.b} accent={accent} />;
  else if (viz?.type === "icon") el = <IconHero name={viz.name} accent={accent} index={index} />;
  else el = <OrbitMotif accent={accent} size={520} variant={index % 3} />;
  return <div style={{ transform: `scale(${scale})` }}>{el}</div>;
};

// ---- the scene ------------------------------------------------------------
export const Scene: React.FC<{
  index: number;
  total: number;
  title?: string;
  narration: string;
  durationInFrames: number;
  isLast?: boolean;
  viz?: SceneViz;
  genre?: string;
  layout?: LayoutType;
  imageUrl?: string;
}> = ({ index, total, title, narration, durationInFrames, isLast, viz, genre, layout, imageUrl }) => {
  const frame = useCurrentFrame();
  const accent = accentFor(index, genre);
  const lay = chooseLayout(index, viz?.type, layout);

  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const align: "center" | "left" = lay === "centered" ? "center" : "left";
  const titleEl = title ? <KineticTitle text={title} accent={accent} align={align} /> : null;
  const captionEl = <Caption text={narration} durationInFrames={durationInFrames} align={align} />;
  const endEl = isLast ? <EndCard accent={accent} /> : null;

  // Image-hero: AI image is the visual; title + caption sit in a bottom band over
  // a dark scrim, with bignum/compare overlaid (icon/motif suppressed).
  if (imageUrl) {
    const overlay =
      viz?.type === "bignumber" || viz?.type === "compare" ? (
        <div style={{ alignSelf: "center", marginBottom: SPACE.lg, transform: "scale(0.9)" }}>
          <Visual viz={viz} accent={accent} index={index} />
        </div>
      ) : null;
    return (
      <AbsoluteFill style={{ opacity }}>
        <SceneBackground src={imageUrl} durationInFrames={durationInFrames} index={index} />
        <Counter index={index} total={total} />
        <AbsoluteFill
          style={{
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            padding: SPACE.gutter,
            paddingBottom: SPACE.xl,
            gap: SPACE.md,
          }}
        >
          {overlay}
          {title ? <KineticTitle text={title} accent={accent} align="left" /> : null}
          <Caption text={narration} durationInFrames={durationInFrames} align="left" />
          {endEl}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ opacity }}>
      <Counter index={index} total={total} />
      {lay === "centered" && (
        <AbsoluteFill
          style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: SPACE.lg, padding: SPACE.gutter }}
        >
          <Visual viz={viz} accent={accent} index={index} />
          {titleEl}
          {captionEl}
          {endEl}
        </AbsoluteFill>
      )}

      {lay === "stat-hero" && (
        <AbsoluteFill
          style={{ flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", padding: SPACE.gutter, paddingTop: 280, paddingBottom: SPACE.xl }}
        >
          <div style={{ alignSelf: "center" }}>
            <Visual viz={viz} accent={accent} index={index} scale={1.15} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACE.md, alignItems: "flex-start" }}>
            {titleEl}
            {captionEl}
            {endEl}
          </div>
        </AbsoluteFill>
      )}

      {lay === "text-lead" && (
        <AbsoluteFill
          style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", padding: SPACE.gutter, paddingTop: 240, gap: SPACE.md }}
        >
          {titleEl}
          {captionEl}
          <div style={{ alignSelf: "center", marginTop: SPACE.lg }}>
            <Visual viz={viz} accent={accent} index={index} scale={0.8} />
          </div>
        </AbsoluteFill>
      )}

      {lay === "split" && (
        <AbsoluteFill
          style={{
            flexDirection: index % 2 === 0 ? "row" : "row-reverse",
            alignItems: "center",
            justifyContent: "space-between",
            padding: SPACE.gutter,
            gap: SPACE.md,
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: SPACE.md, alignItems: "flex-start" }}>
            {titleEl}
            {captionEl}
            {endEl}
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Visual viz={viz} accent={accent} index={index} scale={0.62} />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
