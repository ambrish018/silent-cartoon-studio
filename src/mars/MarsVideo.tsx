import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { COLORS, accentFor } from "./theme";
import { MarsProps, sceneTimeline, totalFrames } from "./script";
import { Scene } from "./components/Scene";
import { ProgressBar } from "./components/ProgressBar";

// Data-driven Mars explainer. Topic-agnostic kinetic motion graphics:
// each scene = abstract orbit motif + kinetic title + narration caption,
// with remote voiceover audio. Visuals key off scene index, so the same
// system renders any sheet row (Mars, black holes, the Moon, ...).
export const MarsVideo: React.FC<MarsProps> = ({ scenes }) => {
  const timeline = sceneTimeline(scenes);
  const total = totalFrames(scenes);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg0 }}>
      {timeline.map((scene) => (
        <Sequence
          key={scene.id ?? scene.index}
          from={scene.startFrame}
          durationInFrames={Math.max(1, scene.durationInFrames)}
          name={`${scene.index + 1}. ${scene.title ?? scene.narration.slice(0, 24)}`}
        >
          {scene.audioUrl ? <Audio src={scene.audioUrl} /> : null}
          <Scene
            index={scene.index}
            total={timeline.length}
            title={scene.title}
            narration={scene.narration}
            durationInFrames={Math.max(1, scene.durationInFrames)}
          />
        </Sequence>
      ))}

      {/* overall progress — global frame, outside the per-scene sequences */}
      <ProgressBar totalFrames={total} accent={accentFor(0)} />
    </AbsoluteFill>
  );
};
