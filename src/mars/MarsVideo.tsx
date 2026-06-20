import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { COLORS, accentFor } from "./theme";
import { MarsProps, sceneTimeline, totalFrames } from "./script";
import { loadMarsFont } from "./font";
import { Scene } from "./components/Scene";
import { Starfield } from "./components/Starfield";
import { ProgressBar } from "./components/ProgressBar";

// Data-driven Mars explainer. Topic-agnostic kinetic motion graphics:
// a continuous starfield/gradient backdrop + per-scene motif + kinetic title +
// read-along caption, with remote voiceover. Visuals key off scene index, so
// the same system renders any sheet row (Mars, black holes, the Moon, ...).
export const MarsVideo: React.FC<MarsProps> = ({ scenes, musicUrl, language, genre }) => {
  const timeline = sceneTimeline(scenes);
  const total = totalFrames(scenes);
  // Load the script-appropriate font once; children inherit via font-family.
  const fontFamily = loadMarsFont(language);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg0, fontFamily }}>
      {/* continuous backdrop — never fades, so scene transitions don't flash black */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 50% 22%, ${COLORS.bg2} 0%, ${COLORS.bg1} 40%, ${COLORS.bg0} 100%)`,
        }}
      />
      <Starfield count={90} />

      {/* low background music bed, looped under the voiceover */}
      {musicUrl ? <Audio src={musicUrl} volume={0.12} loop /> : null}

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
            isLast={scene.index === timeline.length - 1}
            viz={scene.viz}
            genre={genre}
            layout={scene.layout}
            imageUrl={scene.imageUrl}
          />
        </Sequence>
      ))}

      <ProgressBar totalFrames={total} accent={accentFor(0, genre)} />
    </AbsoluteFill>
  );
};
