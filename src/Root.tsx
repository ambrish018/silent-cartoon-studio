import React from "react";
import { Composition } from "remotion";
import { Story, BeatSheet } from "./Story";
import { MarsVideo } from "./mars/MarsVideo";
import { FPS as MARS_FPS, WIDTH as MARS_W, HEIGHT as MARS_H } from "./mars/theme";
import { DEFAULT_MARS_PROPS, totalFrames as marsTotalFrames } from "./mars/script";

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
      id="Mars"
      component={MarsVideo}
      durationInFrames={marsTotalFrames(DEFAULT_MARS_PROPS.scenes)}
      fps={MARS_FPS}
      width={MARS_W}
      height={MARS_H}
      defaultProps={DEFAULT_MARS_PROPS}
      calculateMetadata={async ({ props }) => ({
        durationInFrames: marsTotalFrames(props.scenes),
        fps: MARS_FPS,
        width: MARS_W,
        height: MARS_H,
      })}
    />
    <Composition
      id="Comedy"
      component={Story}
      durationInFrames={60 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ beatSheet: PLACEHOLDER }}
      calculateMetadata={async ({ props }) => {
        const sheet = props.beatSheet;
        const frames = Math.round(sheet.duration_seconds * FPS);
        return {
          durationInFrames: frames,
          props,
        };
      }}
    />
    <Composition
      id="Emotional"
      component={Story}
      durationInFrames={60 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ beatSheet: PLACEHOLDER }}
      calculateMetadata={async ({ props }) => {
        const sheet = props.beatSheet;
        const frames = Math.round(sheet.duration_seconds * FPS);
        return {
          durationInFrames: frames,
          props,
        };
      }}
    />
    <Composition
      id="Educational"
      component={Story}
      durationInFrames={60 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ beatSheet: PLACEHOLDER }}
      calculateMetadata={async ({ props }) => {
        const sheet = props.beatSheet;
        const frames = Math.round(sheet.duration_seconds * FPS);
        return {
          durationInFrames: frames,
          props,
        };
      }}
    />
  </>
);
