import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { COLORS } from "../theme";

// Abstract hero motif: a flat planet disc with a few orbit rings + orbiting dots.
// Topic-agnostic, reads as "science / space". Accent recolors per scene.
export const OrbitMotif: React.FC<{
  accent: string;
  size?: number;
  rings?: number;
  dots?: number;
}> = ({ accent, size = 460, rings = 2, dots = 3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // entrance: spring scale-in + settle
  const intro = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const scale = interpolate(intro, [0, 1], [0.7, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const R = size / 2;
  const cx = 0;
  const cy = 0;
  const discR = R * 0.42;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <svg width={size} height={size} viewBox={`${-R} ${-R} ${size} ${size}`}>
        <defs>
          <clipPath id="discClip">
            <circle cx={cx} cy={cy} r={discR} />
          </clipPath>
        </defs>

        {/* orbit rings — slow counter-rotation, slight tilt */}
        {Array.from({ length: rings }).map((_, i) => {
          const rr = discR + (i + 1) * (R * 0.22);
          const rot = (frame * (0.12 + i * 0.05)) % 360;
          const dir = i % 2 === 0 ? 1 : -1;
          return (
            <ellipse
              key={`ring-${i}`}
              cx={cx}
              cy={cy}
              rx={rr}
              ry={rr * 0.5}
              fill="none"
              stroke={accent}
              strokeWidth={2}
              opacity={0.3}
              transform={`rotate(${dir * rot})`}
            />
          );
        })}

        {/* orbiting dots on the outer ring */}
        {Array.from({ length: dots }).map((_, i) => {
          const rr = discR + rings * (R * 0.22);
          const a = (frame * 1.2 + (360 / dots) * i) * (Math.PI / 180);
          const x = Math.cos(a) * rr;
          const y = Math.sin(a) * rr * 0.5;
          return <circle key={`dot-${i}`} cx={x} cy={y} r={7} fill={accent} opacity={0.9} />;
        })}

        {/* planet disc — flat base + accent overlay + crescent terminator */}
        <circle cx={cx} cy={cy} r={discR} fill={COLORS.bg1} />
        <g clipPath="url(#discClip)">
          <circle cx={cx} cy={cy} r={discR} fill={accent} opacity={0.92} />
          {/* terminator: darker crescent slid to one side */}
          <circle cx={cx + discR * 0.55} cy={cy} r={discR} fill={COLORS.bg0} opacity={0.28} />
          {/* a couple of flat surface marks */}
          <ellipse cx={cx - discR * 0.3} cy={cy - discR * 0.25} rx={discR * 0.22} ry={discR * 0.12} fill={COLORS.bg0} opacity={0.16} />
          <ellipse cx={cx + discR * 0.1} cy={cy + discR * 0.35} rx={discR * 0.18} ry={discR * 0.1} fill={COLORS.ink} opacity={0.1} />
        </g>
        <circle cx={cx} cy={cy} r={discR} fill="none" stroke={accent} strokeWidth={3} opacity={0.5} />
      </svg>
    </div>
  );
};
