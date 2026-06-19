import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

// One big animated stat. If the value is purely numeric it counts up;
// otherwise it springs in (e.g. "24:37", "1/2").
export const BigNumber: React.FC<{ value: string; unit?: string; accent: string }> = ({
  value,
  unit,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isNumeric = /^[0-9]+(\.[0-9]+)?$/.test(value.trim());
  const s = spring({ frame, fps, config: { damping: 13, mass: 0.8 } });

  let display = value;
  if (isNumeric) {
    const target = parseFloat(value);
    const p = interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" });
    const decimals = value.includes(".") ? value.split(".")[1].length : 0;
    display = (target * p).toFixed(decimals);
  }

  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity }}>
      <div
        style={{
          fontSize: 280,
          fontWeight: FONT.weightBold,
          color: accent,
          lineHeight: 1,
          transform: `scale(${scale})`,
          letterSpacing: -4,
        }}
      >
        {display}
      </div>
      {unit ? (
        <div
          style={{
            marginTop: 12,
            fontSize: FONT.h2,
            fontWeight: FONT.weightMed,
            color: COLORS.inkDim,
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          {unit}
        </div>
      ) : null}
    </div>
  );
};
