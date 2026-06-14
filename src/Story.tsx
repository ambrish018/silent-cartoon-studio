import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { Character, Pose, Facing } from "./characters/Character";
import { CharName, Expression } from "./characters/art";
import { Background, Theme } from "./components/Background";
import { Caption } from "./components/Caption";

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

const FPS = 30;

const Scene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  let sceneTransform = "none";
  if (beat.camera === "push_in") {
    const scale = interpolate(
      frame,
      [0, durationInFrames],
      [1, 1.12],
      { extrapolateRight: "clamp" }
    );
    sceneTransform = `scale(${scale})`;
  } else if (beat.camera === "shake") {
    const shakeX = Math.sin(frame * 1.7) * 8;
    const shakeY = Math.cos(frame * 2.3) * 8;
    sceneTransform = `translate(${shakeX}px, ${shakeY}px)`;
  }

  const n = beat.characters.length;
  const charWidth = n <= 1 ? 460 : n === 2 ? 380 : n === 3 ? 300 : 240;

  return (
    <AbsoluteFill>
      <Background theme={beat.background} />
      <AbsoluteFill
        style={{
          transform: sceneTransform,
          transformOrigin: "center center",
        }}
      >
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
        {beat.caption_symbol ? (
          <Caption symbol={beat.caption_symbol} />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Story: React.FC<{ beatSheet: BeatSheet }> = ({ beatSheet }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#fdf6ec" }}>
      {beatSheet.beats.map((beat, i) => {
        const from = Math.round(beat.start * FPS);
        const dur = Math.round((beat.end - beat.start) * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(dur, 1)}>
            <Scene beat={beat} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
