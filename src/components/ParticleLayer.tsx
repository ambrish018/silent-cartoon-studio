import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Theme } from "./Background";

export const ParticleLayer: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1080 1920"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {theme === "park" && Array.from({ length: 10 }, (_, i) => {
          const speed = 1.2 + (i % 5) * 0.45;
          const y = ((frame * speed + i * 220) % 2200) - 100;
          const x = (80 + i * 97) % 960 + Math.sin(frame / (16 + i * 2) + i) * 40;
          const rot = Math.sin(frame / (10 + i) + i * 1.2) * 35;
          const col = ["#7CB542","#9ED44A","#E8C042","#D4A830","#B8D840"][i % 5];
          return (
            <ellipse key={i} cx={x} cy={y} rx={9} ry={14}
              fill={col} opacity={0.72}
              transform={`rotate(${rot}, ${x}, ${y})`}
            />
          );
        })}

        {theme === "kitchen" && Array.from({ length: 8 }, (_, i) => {
          const speed = 0.28 + (i % 3) * 0.14;
          const y = ((frame * speed + i * 260) % 2100) - 100;
          const x = 100 + (i * 139) % 880 + Math.sin(frame / 60 + i) * 18;
          return (
            <circle key={i} cx={x} cy={y} r={2 + i % 3}
              fill="#C8B890" opacity={0.32}
            />
          );
        })}

        {theme === "classroom" && Array.from({ length: 8 }, (_, i) => {
          const speed = 0.45 + (i % 4) * 0.18;
          const y = ((frame * speed + i * 250) % 2100) - 100;
          const x = 80 + (i * 151) % 920 + Math.sin(frame / 45 + i) * 14;
          return (
            <circle key={i} cx={x} cy={y} r={1.5 + i % 2}
              fill="white" opacity={0.48}
            />
          );
        })}

        {theme === "night" && Array.from({ length: 8 }, (_, i) => {
          const baseY = 480 + (i * 173) % 720;
          const y = baseY + Math.sin(frame / (50 + i * 10) + i) * 55;
          const x = 80 + (i * 137) % 920 + Math.sin(frame / 80 + i * 1.3) * 48;
          const glow = 0.4 + 0.6 * Math.abs(Math.sin(frame / 25 + i * 1.1));
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={8}  fill="#C8FF80" opacity={glow * 0.28} />
              <circle cx={x} cy={y} r={4}  fill="#E8FF90" opacity={glow * 0.55} />
              <circle cx={x} cy={y} r={2}  fill="white"   opacity={glow} />
            </g>
          );
        })}

        {theme === "plain" && Array.from({ length: 10 }, (_, i) => {
          const speed = 0.8 + (i % 4) * 0.28;
          const y = ((frame * speed + i * 210) % 2200) - 100;
          const x = (60 + i * 107) % 980 + Math.sin(frame / (20 + i * 3) + i) * 34;
          const rot = Math.sin(frame / (12 + i) + i) * 28;
          const col = i % 2 === 0 ? "#FFB8D4" : "#FFD4E8";
          return (
            <ellipse key={i} cx={x} cy={y} rx={10} ry={16}
              fill={col} opacity={0.68}
              transform={`rotate(${rot}, ${x}, ${y})`}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
