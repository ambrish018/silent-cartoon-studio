import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";
import { COLORS, FONT, SPACE } from "./theme";
import { MarsProps, SceneTiming, sceneTimeline } from "./script";

// ---------------------------------------------------------------------------
// Data-driven Mars composition.
// Consumes MarsProps (scenes already parsed + timed + voiced upstream).
// Phase 2: placeholder scene cards + remote voiceover audio wired.
// Real SVG scenes replace ScenePlaceholder in Phase 5.
// ---------------------------------------------------------------------------

const ScenePlaceholder: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const seconds = (scene.durationInFrames / fps).toFixed(1);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: SPACE.gutter,
        opacity,
      }}
    >
      <div
        style={{
          color: COLORS.inkFaint,
          fontFamily: FONT.family,
          fontSize: FONT.label,
          fontWeight: FONT.weightMed,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: SPACE.sm,
        }}
      >
        Scene {scene.index + 1} · {seconds}s
      </div>

      {scene.title ? (
        <div
          style={{
            color: COLORS.ink,
            fontFamily: FONT.family,
            fontSize: FONT.h1,
            fontWeight: FONT.weightBold,
            textAlign: "center",
            lineHeight: 1.05,
            marginBottom: SPACE.lg,
          }}
        >
          {scene.title}
        </div>
      ) : null}

      <div
        style={{
          color: COLORS.inkDim,
          fontFamily: FONT.family,
          fontSize: FONT.body,
          fontWeight: FONT.weightReg,
          textAlign: "center",
          lineHeight: 1.35,
          maxWidth: 820,
        }}
      >
        {scene.narration}
      </div>
    </AbsoluteFill>
  );
};

const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 80% at 50% 18%, ${COLORS.bg2} 0%, ${COLORS.bg1} 38%, ${COLORS.bg0} 100%)`,
    }}
  />
);

export const MarsVideo: React.FC<MarsProps> = ({ scenes }) => {
  const timeline = sceneTimeline(scenes);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg0 }}>
      <Backdrop />
      {timeline.map((scene) => (
        <Sequence
          key={scene.id ?? scene.index}
          from={scene.startFrame}
          durationInFrames={Math.max(1, scene.durationInFrames)}
          name={`${scene.index + 1}. ${scene.title ?? scene.narration.slice(0, 24)}`}
        >
          {scene.audioUrl ? <Audio src={scene.audioUrl} /> : null}
          <ScenePlaceholder scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
