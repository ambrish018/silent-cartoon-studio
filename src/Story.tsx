import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Character, Pose, Facing } from "./characters/Character";
import { CharName, Expression } from "./characters/art";
import { BackgroundSky, BackgroundClouds, BackgroundTrees, Theme } from "./components/Background";
import { ParticleLayer } from "./components/ParticleLayer";

export type BeatCharacter = {
  name: CharName;
  expression: Expression;
  pose?: Pose;
  facing?: Facing;
};

export type Beat = {
  start: number;
  end: number;
  background: Theme;
  characters: BeatCharacter[];
  caption_symbol?: string | null;
  sfx?: string | null;
  camera?: "static" | "push_in" | "shake";
  note?: string;
};

export type BeatSheet = {
  title_concept: string;
  genre: string;
  duration_seconds: number;
  music_prompt: string;
  beats: Beat[];
};

const O = { transformOrigin: "center center" as const };

function layerTransforms(
  beat: Beat,
  frame: number,
  beatDurationFrames: number,
  fps: number
) {
  const t = frame / beatDurationFrames;
  const ease = t * t;
  const decay = Math.exp(-frame / (fps * 0.35));

  if (beat.camera === "push_in") {
    return {
      sky:    `translate(0, ${-ease * 3}px) scale(${1 + ease * 0.06})`,
      clouds: `translate(0, ${-ease * 6}px) scale(${1 + ease * 0.10})`,
      trees:  `translate(0, ${-ease * 10}px) scale(${1 + ease * 0.14})`,
      chars:  `translate(0, ${-ease * 12}px) scale(${1 + ease * 0.18})`,
      fg:     `translate(0, ${-ease * 18}px) scale(${1 + ease * 0.26})`,
    };
  }

  if (beat.camera === "shake") {
    const sx = Math.sin(frame * 1.9) * 14 * decay;
    const sy = Math.cos(frame * 2.7) * 9  * decay;
    return {
      sky:    `translate(${sx * 0.15}px, ${sy * 0.15}px)`,
      clouds: `translate(${sx * 0.35}px, ${sy * 0.35}px)`,
      trees:  `translate(${sx * 0.65}px, ${sy * 0.65}px)`,
      chars:  `translate(${sx}px, ${sy}px)`,
      fg:     `translate(${sx * 1.6}px, ${sy * 1.6}px)`,
    };
  }

  const isEmotional = beat.characters.some(c =>
    (["sad", "crying", "love"] as Expression[]).includes(c.expression)
  );
  if (isEmotional) {
    return {
      sky:    `scale(${1 + t * 0.02})`,
      clouds: `scale(${1 + t * 0.03})`,
      trees:  `scale(${1 + t * 0.04})`,
      chars:  `scale(${1 + t * 0.05})`,
      fg:     `scale(${1 + t * 0.07})`,
    };
  }

  return { sky: "none", clouds: "none", trees: "none", chars: "none", fg: "none" };
}

const Scene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beatDurationFrames = Math.round((beat.end - beat.start) * fps);

  const { sky, clouds, trees, chars, fg } = layerTransforms(beat, frame, beatDurationFrames, fps);

  const n = beat.characters.length;
  const charWidth = n <= 1 ? 460 : n === 2 ? 380 : n === 3 ? 300 : 240;

  return (
    <AbsoluteFill>
      {/* Layer 0: sky — least parallax */}
      <AbsoluteFill style={{ transform: sky, ...O }}>
        <BackgroundSky theme={beat.background} />
      </AbsoluteFill>
      {/* Layer 1: clouds */}
      <AbsoluteFill style={{ transform: clouds, ...O }}>
        <BackgroundClouds theme={beat.background} />
      </AbsoluteFill>
      {/* Layer 2: trees / ground */}
      <AbsoluteFill style={{ transform: trees, ...O }}>
        <BackgroundTrees theme={beat.background} />
      </AbsoluteFill>
      {/* Layer 3: characters */}
      <AbsoluteFill style={{ transform: chars, ...O }}>
        <AbsoluteFill
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 40,
            paddingBottom: 320,
          }}
        >
          {beat.characters.map((c, i) => (
            <Character
              key={i}
              name={c.name}
              expression={c.expression}
              pose={c.pose ?? "idle"}
              facing={c.facing ?? "right"}
              width={charWidth}
            />
          ))}
        </AbsoluteFill>
      </AbsoluteFill>
      {/* Layer 4: foreground particles — most parallax */}
      <AbsoluteFill style={{ transform: fg, ...O }}>
        <ParticleLayer theme={beat.background} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Story: React.FC<{ beatSheet: BeatSheet }> = ({ beatSheet }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#fdf6ec" }}>
      {beatSheet.beats.map((beat, i) => {
        const from = Math.round(beat.start * fps);
        const dur = Math.round((beat.end - beat.start) * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(dur, 1)}>
            <Scene beat={beat} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
