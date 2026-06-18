import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONT } from "../theme";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Title: words rise + fade in, staggered. Font auto-shrinks for long titles so
// they don't overflow (heuristic on character count — no DOM measуring needed).
export const KineticTitle: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const stagger = 3;

  const longestWord = words.reduce((m, w) => Math.max(m, w.length), 0);
  // shrink by total length AND by the longest single word (can't wrap mid-word)
  const byTotal = 20 / Math.max(text.length, 20);
  const byWord = 11 / Math.max(longestWord, 11);
  const fontSize = Math.round(FONT.h1 * Math.max(0.5, Math.min(1, Math.min(byTotal, byWord))));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 920 }}>
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
              fontSize,
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

// Caption: words brighten progressively across the scene — a timestamp-free
// approximation of read-along highlighting (even pacing over the scene length).
export const Caption: React.FC<{ text: string; durationInFrames: number; delay?: number }> = ({
  text,
  durationInFrames,
  delay = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  const block = interpolate(frame, [delay, delay + 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  // read progress: 0 at delay -> 1 near the end (leave a tail so it finishes early)
  const readEnd = durationInFrames - 0.6 * fps;
  const progress = interpolate(frame, [delay, readEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spoken = progress * words.length;

  return (
    <div
      style={{
        fontSize: FONT.body,
        fontWeight: FONT.weightReg,
        textAlign: "center",
        lineHeight: 1.35,
        maxWidth: 820,
        transform: `translateY(${(1 - block) * 20}px)`,
        opacity: block,
      }}
    >
      {words.map((w, i) => {
        const lit = interpolate(spoken, [i - 0.5, i + 0.5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              color: lit > 0.5 ? COLORS.ink : COLORS.inkFaint,
              transition: "none",
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};
