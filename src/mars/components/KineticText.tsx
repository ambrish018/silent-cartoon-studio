import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONT } from "../theme";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Title: words rise + fade in, staggered. Kinetic but clean.
export const KineticTitle: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const stagger = 3; // frames between words

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: 900,
      }}
    >
      {words.map((w, i) => {
        const start = i * stagger;
        const p = interpolate(frame, [start, start + 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE,
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT.family,
              fontSize: FONT.h1,
              fontWeight: FONT.weightBold,
              color: COLORS.ink,
              lineHeight: 1.04,
              marginRight: i < words.length - 1 ? "0.28em" : 0,
              transform: `translateY(${(1 - p) * 40}px)`,
              opacity: p,
            }}
          >
            {w}
          </span>
        );
      })}
      {/* accent underline sweeps in under the title */}
      <div style={{ flexBasis: "100%", height: 0 }} />
      <div
        style={{
          marginTop: 18,
          height: 6,
          borderRadius: 3,
          background: accent,
          width: interpolate(frame, [words.length * stagger, words.length * stagger + 0.5 * fps], [0, 160], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE,
          }),
        }}
      />
    </div>
  );
};

// Caption: narration, fade + slight rise, lower third.
export const Caption: React.FC<{ text: string; delay?: number }> = ({ text, delay = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [delay, delay + 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });
  return (
    <div
      style={{
        fontFamily: FONT.family,
        fontSize: FONT.body,
        fontWeight: FONT.weightReg,
        color: COLORS.inkDim,
        textAlign: "center",
        lineHeight: 1.35,
        maxWidth: 820,
        transform: `translateY(${(1 - p) * 20}px)`,
        opacity: p,
      }}
    >
      {text}
    </div>
  );
};
