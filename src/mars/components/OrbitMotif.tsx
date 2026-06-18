import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS } from "../theme";

// Abstract hero motif, topic-agnostic ("science / space"). Accent recolors per
// scene. `variant` (0..2) cycles the geometry so 6 scenes don't look identical.
//   0 — tilted orbit rings + orbiting dots (a "planet")
//   1 — concentric pulsing rings (a "signal / wave")
//   2 — crossed elliptical orbits + dot cluster (an "atom / system")
export const OrbitMotif: React.FC<{ accent: string; size?: number; variant?: number }> = ({
  accent,
  size = 520,
  variant = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const scale = interpolate(intro, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const R = size / 2;
  const discR = R * 0.42;

  const disc = (
    <>
      <circle cx={0} cy={0} r={discR} fill={COLORS.bg1} />
      <g clipPath="url(#discClip)">
        <circle cx={0} cy={0} r={discR} fill={accent} opacity={0.92} />
        <circle cx={discR * 0.55} cy={0} r={discR} fill={COLORS.bg0} opacity={0.28} />
        <ellipse cx={-discR * 0.3} cy={-discR * 0.25} rx={discR * 0.22} ry={discR * 0.12} fill={COLORS.bg0} opacity={0.16} />
        <ellipse cx={discR * 0.1} cy={discR * 0.35} rx={discR * 0.18} ry={discR * 0.1} fill={COLORS.ink} opacity={0.1} />
      </g>
      <circle cx={0} cy={0} r={discR} fill="none" stroke={accent} strokeWidth={3} opacity={0.5} />
    </>
  );

  const v = ((variant % 3) + 3) % 3;

  return (
    <div style={{ width: size, height: size, transform: `scale(${scale})`, opacity }}>
      <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`}>
        <defs>
          <clipPath id="discClip">
            <circle cx={0} cy={0} r={discR} />
          </clipPath>
        </defs>

        {/* variant 0: tilted rings + orbiting dots */}
        {v === 0 && (
          <>
            {[0, 1].map((i) => {
              const rr = discR + (i + 1) * (R * 0.22);
              const rot = (frame * (0.12 + i * 0.05)) % 360;
              return (
                <ellipse key={i} cx={0} cy={0} rx={rr} ry={rr * 0.5} fill="none"
                  stroke={accent} strokeWidth={2} opacity={0.3}
                  transform={`rotate(${(i % 2 ? -1 : 1) * rot})`} />
              );
            })}
            {[0, 1, 2].map((i) => {
              const rr = discR + 2 * (R * 0.22);
              const a = (frame * 1.2 + 120 * i) * (Math.PI / 180);
              return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr * 0.5} r={7} fill={accent} opacity={0.9} />;
            })}
            {disc}
          </>
        )}

        {/* variant 1: concentric pulsing rings */}
        {v === 1 && (
          <>
            {[0, 1, 2, 3].map((i) => {
              const phase = (frame / fps + i * 0.5) % 2; // 0..2s loop
              const rr = discR + interpolate(phase, [0, 2], [R * 0.12, R * 0.62]);
              const op = interpolate(phase, [0, 0.2, 2], [0, 0.45, 0], { extrapolateRight: "clamp" });
              return <circle key={i} cx={0} cy={0} r={rr} fill="none" stroke={accent} strokeWidth={3} opacity={op} />;
            })}
            {disc}
          </>
        )}

        {/* variant 2: crossed elliptical orbits + dot cluster */}
        {v === 2 && (
          <>
            {[0, 60, 120].map((tilt, i) => {
              const rot = tilt + (frame * 0.25) % 360;
              return (
                <ellipse key={i} cx={0} cy={0} rx={discR + R * 0.34} ry={(discR + R * 0.34) * 0.32}
                  fill="none" stroke={accent} strokeWidth={2} opacity={0.28}
                  transform={`rotate(${rot})`} />
              );
            })}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const rr = discR + R * 0.34;
              const a = (frame * 1.6 + 60 * i) * (Math.PI / 180);
              return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr * 0.32} r={6} fill={accent} opacity={0.85} />;
            })}
            {disc}
          </>
        )}
      </svg>
    </div>
  );
};
