import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type Theme = "kitchen" | "park" | "classroom" | "night" | "plain";

const SKY: Record<Theme, string> = {
  kitchen: "#ffe9c7",
  park: "#bfe8ff",
  classroom: "#eef3d8",
  night: "#1d2440",
  plain: "#fdf6ec",
};

export const Background: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: SKY[theme] }}>
      {theme === "kitchen" && (
        <>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: 520, background: "#e8b07a" }} />
          <div style={{ position: "absolute", bottom: 520, width: "100%", height: 26, background: "#caa06a" }} />
        </>
      )}
      {theme === "park" && (
        <>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: 480, background: "#8fd06a" }} />
          <div style={{ position: "absolute", top: 120, right: 120, width: 160, height: 160, borderRadius: "50%", background: "#ffe26b" }} />
        </>
      )}
      {theme === "classroom" && (
        <>
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: 460, background: "#d9c39c" }} />
          <div style={{ position: "absolute", top: 160, left: "10%", width: "80%", height: 520, background: "#2f5d4f", border: "16px solid #8a5a33", borderRadius: 10 }} />
        </>
      )}
      {theme === "night" && (
        <>
          {[...Array(40)].map((_, i) => {
            const x = (i * 137) % 1080;
            const y = (i * 251) % 1100;
            const tw = 0.5 + 0.5 * Math.sin(frame / 20 + i);
            return <div key={i} style={{ position: "absolute", left: x, top: y, width: 4, height: 4, borderRadius: "50%", background: "#fff", opacity: tw }} />;
          })}
          <div style={{ position: "absolute", bottom: 0, width: "100%", height: 420, background: "#121830" }} />
        </>
      )}
    </AbsoluteFill>
  );
};
