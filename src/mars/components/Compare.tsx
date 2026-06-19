import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS, FONT } from "../theme";

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

// Two-item comparison as proportional discs + bars. Values are relative; the
// larger one fills the row. Good for "Earth vs Mars size", "A vs B" stats.
export const Compare: React.FC<{
  a: { label: string; value: number };
  b: { label: string; value: number };
  accent: string;
}> = ({ a, b, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(a.value, b.value) || 1;

  const grow = interpolate(frame, [4, 4 + 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE,
  });

  const rows = [
    { ...a, color: accent },
    { ...b, color: COLORS.earthBlue },
  ];
  const MAXD = 240; // max disc diameter (px)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 56, width: 760 }}>
      {rows.map((r, i) => {
        const ratio = r.value / max;
        const d = MAXD * ratio * grow;
        const op = interpolate(frame, [4 + i * 4, 4 + i * 4 + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 36, opacity: op }}>
            {/* proportional disc */}
            <div style={{ width: MAXD, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: d,
                  height: d,
                  borderRadius: "50%",
                  background: r.color,
                  boxShadow: `0 0 0 2px ${r.color}55`,
                }}
              />
            </div>
            {/* label + value */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: FONT.h2, fontWeight: FONT.weightBold, color: COLORS.ink }}>
                {r.label}
              </div>
              <div style={{ fontSize: FONT.body, fontWeight: FONT.weightMed, color: r.color }}>
                {(r.value).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
