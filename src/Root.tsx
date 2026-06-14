import React from "react";
import { Composition } from "remotion";
import { Story, BeatSheet } from "./Story";

const FPS = 30;
const W = 1080;
const H = 1920;

const PLACEHOLDER: BeatSheet = {
  title_concept: "placeholder",
  genre: "comedy",
  duration_seconds: 60,
  music_prompt: "",
  beats: [
    {
      start: 0,
      end: 60,
      background: "plain",
      characters: [{ name: "Apple", expression: "happy" }],
    },
  ],
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Comedy"
      component={Story}
      durationInFrames={60 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ beatSheet: PLACEHOLDER }}
    />
    <Composition
      id="Emotional"
      component={Story}
      durationInFrames={60 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ beatSheet: PLACEHOLDER }}
    />
    <Composition
      id="Educational"
      component={Story}
      durationInFrames={60 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ beatSheet: PLACEHOLDER }}
    />
  </>
);
