import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { WIDTH, HEIGHT, COLORS } from "../theme";

// Deterministic hash → [0,1). No Math.random (must be stable across frames).
const rand = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

type Star = { x: number; y: number; r: number; tw: number; ph: number };

export const Starfield: React.FC<{ count?: number; drift?: number }> = ({
  count = 90,
  drift = 8,
}) => {
  const frame = useCurrentFrame();

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rand(i + 1) * WIDTH,
        y: rand(i + 101) * HEIGHT,
        r: 1 + rand(i + 201) * 2.2,
        tw: 12 + rand(i + 301) * 28, // twinkle period
        ph: rand(i + 401) * Math.PI * 2, // phase
      })),
    [count],
  );

  // slow parallax drift upward
  const dy = -((frame * drift) / 60) % HEIGHT;

  return (
    <AbsoluteFill>
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {stars.map((s, i) => {
          const op = 0.25 + 0.55 * Math.abs(Math.sin(frame / s.tw + s.ph));
          const y = (((s.y + dy) % HEIGHT) + HEIGHT) % HEIGHT;
          return <circle key={i} cx={s.x} cy={y} r={s.r} fill={COLORS.ink} opacity={op} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
