import React from "react";
import { useCurrentFrame, useVideoConfig, spring, AbsoluteFill } from "remotion";

export const Caption: React.FC<{ symbol: string }> = ({ symbol }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 9, mass: 0.5 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div
        style={{
          marginTop: 220,
          fontSize: 180,
          transform: `scale(${pop})`,
          filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.15))",
        }}
      >
        {symbol}
      </div>
    </AbsoluteFill>
  );
};
