import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
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

  let transform = "none";
  if (beat.camera === "push_in") {
    const s = interpolate(frame, [0, durationInFrames], [1, 1.12], { extrapolateRight: "clamp" });
    transform = `scale(${s})`;
  } else if (beat.camera === "shake") {
    transform = `translate(${Math.sin(frame * 1.7) * 6}px, ${Math.cos(frame * 2.1) * 6}px)`;
  }

  const n = beat.characters.length;
  const width = n <= 1 ? 460 : n === 2 ? 380 : n === 3 ? 300 : 240;

  return (
    <AbsoluteFill>
      <Background theme={beat.background} />
      <AbsoluteFill style={{ transform, transformOrigin: "center center" }}>
        <AbsoluteFill
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 40,
            paddingBottom: 360,
          }}
        >
          {beat.characters.map((c, i) => (
            <Character
              key={i}
              name={c.name}
              expression={c.expression}
              pose={c.pose ?? "idle"}
              facing={c.facing ?? "right"}
              width={width}
            />
          ))}
        </AbsoluteFill>
        {beat.caption_symbol ? <Caption symbol={beat.caption_symbol} /> : null}
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
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Scene beat={beat} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
