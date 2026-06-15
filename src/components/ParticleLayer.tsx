import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { Theme } from "./Background";
import { EMOTIONS } from "../characters/emotions";

type CharInfo = {
  pose?: string;
  expression?: string;
  emotion?: string;
  position?: "left" | "center" | "right";
  facing?: string;
};

function charPose(c: CharInfo): string {
  if (c.pose) return c.pose;
  if (c.emotion && c.emotion in EMOTIONS) return EMOTIONS[c.emotion as keyof typeof EMOTIONS].defaultPose;
  return "idle";
}

function charExpr(c: CharInfo): string {
  if (c.expression) return c.expression;
  if (c.emotion && c.emotion in EMOTIONS) return EMOTIONS[c.emotion as keyof typeof EMOTIONS].expression;
  return "neutral";
}

function approxCharX(c: CharInfo, idx: number, total: number): number {
  const cw = total <= 1 ? 640 : total === 2 ? 480 : total === 3 ? 340 : 260;
  if (c.position === "left")   return 80 + cw / 2;
  if (c.position === "right")  return 1080 - 80 - cw / 2;
  if (c.position === "center") return 540;
  if (total === 1) return 120 + cw / 2;
  return (1080 / total) * (idx + 0.5);
}

function starPts(cx: number, cy: number, r: number, rot = 0): string {
  return [0, 1, 2, 3].map(j => {
    const a = (j / 4) * Math.PI * 2 + rot;
    const ra = j % 2 === 0 ? r : r * 0.38;
    return `${(cx + Math.cos(a) * ra).toFixed(1)},${(cy + Math.sin(a) * ra).toFixed(1)}`;
  }).join(" ");
}

const GROUND_Y = 1840;
const HEAD_Y   = GROUND_Y - 750;

export const ParticleLayer: React.FC<{ theme: Theme; characters?: CharInfo[] }> = ({
  theme,
  characters = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const total = characters.length;
  const cw = total <= 1 ? 640 : total === 2 ? 480 : total === 3 ? 340 : 260;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%" height="100%"
        viewBox="0 0 1080 1920"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── THEME AMBIENT ─────────────────────────────────────────────── */}

        {/* PARK: falling leaves */}
        {theme === "park" && Array.from({ length: 12 }, (_, i) => {
          const speed = 1.2 + (i % 5) * 0.45;
          const y = ((frame * speed + i * 190) % 2200) - 100;
          const x = (80 + i * 87) % 960 + Math.sin(frame / (16 + i * 2) + i) * 44;
          const rot = Math.sin(frame / (10 + i) + i * 1.2) * 40;
          const col = ["#7CB542","#9ED44A","#E8C042","#D4A830","#B8D840","#A8C030"][i % 6];
          return <ellipse key={`leaf-${i}`} cx={x} cy={y} rx={9} ry={14} fill={col} opacity={0.72} transform={`rotate(${rot},${x},${y})`} />;
        })}
        {theme === "park" && Array.from({ length: 5 }, (_, i) => {
          const y = ((frame * 0.55 + i * 380) % 2100) - 60;
          const x = 120 + (i * 193) % 840 + Math.sin(frame / 30 + i) * 24;
          const pulse = 0.35 + 0.65 * Math.abs(Math.sin(frame / 22 + i * 1.8));
          return <polygon key={`sp-${i}`} points={starPts(x, y, 7 + i % 3, frame * 0.04 + i)} fill="#FFE566" opacity={pulse * 0.52} />;
        })}

        {/* KITCHEN: dust motes */}
        {theme === "kitchen" && Array.from({ length: 10 }, (_, i) => {
          const y = ((frame * (0.22 + (i % 4) * 0.10) + i * 210) % 2100) - 80;
          const x = 100 + (i * 139) % 880 + Math.sin(frame / 60 + i) * 20;
          return <circle key={`dm-${i}`} cx={x} cy={y} r={2 + i % 3} fill="#C8B890" opacity={0.27} />;
        })}
        {/* KITCHEN: steam puffs from stove/jars */}
        {theme === "kitchen" && Array.from({ length: 4 }, (_, i) => {
          const prog = ((frame * 0.5 + i * 55) % 160) / 160;
          const x = [160, 300, 430, 900][i] + Math.sin(frame / 18 + i) * 10;
          const y = 420 - prog * 200;
          return <circle key={`st-${i}`} cx={x} cy={y} r={14 + prog * 24} fill="white" opacity={(1 - prog) * 0.15} />;
        })}
        {/* KITCHEN: soap bubbles rising from sink */}
        {theme === "kitchen" && Array.from({ length: 5 }, (_, i) => {
          const prog = ((frame * 0.55 + i * 230) % 1900) / 1900;
          const x = 840 + (i % 3) * 30 + Math.sin(frame / 22 + i) * 28;
          const y = 1360 - prog * 1500;
          const r = 8 + (i % 3) * 6;
          return (
            <g key={`kb-${i}`}>
              <circle cx={x} cy={y} r={r}           fill="none"  stroke="#A8D4E8" strokeWidth={2}   opacity={0.38} />
              <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.22} fill="white"            opacity={0.30} />
            </g>
          );
        })}

        {/* CLASSROOM: chalk dust */}
        {theme === "classroom" && Array.from({ length: 10 }, (_, i) => {
          const y = ((frame * (0.35 + (i % 4) * 0.15) + i * 200) % 2000) - 60;
          const x = 80 + (i * 151) % 920 + Math.sin(frame / 45 + i) * 16;
          return <circle key={`cd-${i}`} cx={x} cy={y} r={2 + i % 2} fill="white" opacity={0.42} />;
        })}
        {/* CLASSROOM: blackboard sparkles */}
        {theme === "classroom" && Array.from({ length: 4 }, (_, i) => {
          const pulse = 0.25 + 0.75 * Math.abs(Math.sin(frame / 35 + i * 2.1));
          const x = 200 + i * 160 + Math.sin(frame / 22 + i) * 18;
          const y = 380 + Math.cos(frame / 28 + i) * 40;
          return <polygon key={`cs-${i}`} points={starPts(x, y, 8, frame * 0.03 + i)} fill="#FFE566" opacity={pulse * 0.44} />;
        })}

        {/* NIGHT: fireflies */}
        {theme === "night" && Array.from({ length: 10 }, (_, i) => {
          const baseY = 480 + (i * 163) % 720;
          const y = baseY + Math.sin(frame / (50 + i * 10) + i) * 60;
          const x = 80 + (i * 137) % 920 + Math.sin(frame / 80 + i * 1.3) * 52;
          const glow = 0.4 + 0.6 * Math.abs(Math.sin(frame / 25 + i * 1.1));
          return (
            <g key={`ff-${i}`}>
              <circle cx={x} cy={y} r={9} fill="#C8FF80" opacity={glow * 0.23} />
              <circle cx={x} cy={y} r={4} fill="#E8FF90" opacity={glow * 0.50} />
              <circle cx={x} cy={y} r={2} fill="white"   opacity={glow} />
            </g>
          );
        })}
        {/* NIGHT: drifting star sparkles */}
        {theme === "night" && Array.from({ length: 6 }, (_, i) => {
          const pulse = 0.2 + 0.8 * Math.abs(Math.sin(frame / 40 + i * 1.9));
          const x = 60 + (i * 193) % 960 + Math.sin(frame / 55 + i) * 30;
          const y = 550 + (i * 137) % 860;
          return <polygon key={`ns-${i}`} points={starPts(x, y, 9, frame * 0.02 + i)} fill="#FFFADC" opacity={pulse * 0.52} />;
        })}

        {/* PLAIN: petals */}
        {theme === "plain" && Array.from({ length: 10 }, (_, i) => {
          const speed = 0.8 + (i % 4) * 0.28;
          const y = ((frame * speed + i * 210) % 2200) - 100;
          const x = (60 + i * 107) % 980 + Math.sin(frame / (20 + i * 3) + i) * 36;
          const rot = Math.sin(frame / (12 + i) + i) * 30;
          const col = i % 2 === 0 ? "#FFB8D4" : "#FFD4E8";
          return <ellipse key={`pt-${i}`} cx={x} cy={y} rx={10} ry={16} fill={col} opacity={0.68} transform={`rotate(${rot},${x},${y})`} />;
        })}
        {/* PLAIN: rising bubbles */}
        {theme === "plain" && Array.from({ length: 6 }, (_, i) => {
          const prog = ((frame * 0.65 + i * 280) % 2200) / 2200;
          const x = 100 + (i * 181) % 880 + Math.sin(frame / 25 + i) * 30;
          const y = 1920 - prog * 2200;
          const r = 10 + (i % 3) * 8;
          return (
            <g key={`pb-${i}`}>
              <circle cx={x} cy={y} r={r} fill="none" stroke="#B8D8FF" strokeWidth={2.5} opacity={0.42} />
              <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.2} fill="white" opacity={0.30} />
            </g>
          );
        })}
        {/* PLAIN: sparkles */}
        {theme === "plain" && Array.from({ length: 5 }, (_, i) => {
          const y = ((frame * 0.45 + i * 420) % 2100) - 50;
          const x = 80 + (i * 211) % 920 + Math.sin(frame / 28 + i) * 22;
          const pulse = 0.3 + 0.7 * Math.abs(Math.sin(frame / 25 + i * 1.6));
          return <polygon key={`pls-${i}`} points={starPts(x, y, 7 + i % 4, frame * 0.035 + i)} fill="#FFE566" opacity={pulse * 0.48} />;
        })}

        {/* ── MOVEMENT-REACTIVE ─────────────────────────────────────────── */}
        {characters.flatMap((c, idx) => {
          const cx = approxCharX(c, idx, total);
          const out: React.ReactNode[] = [];

          // JUMP → dust burst + sparkle launch trail + speed lines
          if (charPose(c) === "jump") {
            for (let i = 0; i < 7; i++) {
              const t = (frame * (0.75 + i * 0.12) + i * 37) % 72;
              const side = (i % 2 === 0 ? 1 : -1) * (1 + Math.floor(i / 2));
              const px = cx + side * (18 + t * 2.6);
              const py = GROUND_Y - t * 0.45;
              out.push(<circle key={`jd-${idx}-${i}`} cx={px} cy={py} r={9 + i % 5} fill="#D4C0A0" opacity={Math.max(0, 0.48 - t / 72)} />);
            }
            for (let i = 0; i < 4; i++) {
              const t = (frame * 1.1 + i * 22) % 52;
              const px = cx + (i % 2 === 0 ? 1 : -1) * t * 0.7;
              const py = GROUND_Y - t * 3.0;
              out.push(<polygon key={`js-${idx}-${i}`} points={starPts(px, py, 5 + i % 3, t * 0.1)} fill="#FFE566" opacity={Math.max(0, 0.55 - t / 52)} />);
            }
            // horizontal speed lines — intensity tracks vertical velocity
            {
              const EX = 7;
              const ef = Math.max(0, frame - EX);
              const jNow  = spring({ frame: ef,              fps, config: { damping: 8, mass: 0.6 } });
              const jPrev = spring({ frame: Math.max(0, ef - 1), fps, config: { damping: 8, mass: 0.6 } });
              const speed = Math.min(1, Math.abs(Math.PI * Math.cos(jNow * Math.PI) * (jNow - jPrev)) * 12);
              if (speed > 0.08) {
                const half = cw * 0.52;
                for (let i = 0; i < 4; i++) {
                  const y  = HEAD_Y + 80 + i * 160;
                  const len = speed * (55 + i * 18);
                  const op  = speed * (0.24 - i * 0.04);
                  const sw  = 2.2 - i * 0.4;
                  out.push(<line key={`sll-${idx}-${i}`} x1={cx - half - len} y1={y} x2={cx - half} y2={y} stroke="#4A3020" strokeWidth={sw} opacity={op} strokeLinecap="round" />);
                  out.push(<line key={`slr-${idx}-${i}`} x1={cx + half} y1={y} x2={cx + half + len} y2={y} stroke="#4A3020" strokeWidth={sw} opacity={op} strokeLinecap="round" />);
                }
              }
            }
          }

          // FALL → spreading impact cloud + converging vertical speed lines
          if (charPose(c) === "fall") {
            for (let i = 0; i < 8; i++) {
              const side = i % 2 === 0 ? 1 : -1;
              const t = (frame * 0.7 + i * 25) % 58;
              const px = cx + side * (22 + i * 14 + t * 2.0);
              const py = GROUND_Y - t * 0.65;
              out.push(<circle key={`fd-${idx}-${i}`} cx={px} cy={py} r={13 + (i % 3) * 5} fill="#C8B090" opacity={Math.max(0, 0.44 - t / 58)} />);
            }
            {
              const EX = 7;
              const ef = Math.max(0, frame - EX);
              const spd = Math.min(1, ef / (fps * 0.4));
              for (let i = 0; i < 5; i++) {
                const x   = cx - cw * 0.35 + i * cw * 0.175;
                const len = spd * (70 + i * 12);
                const op  = spd * (0.20 - i * 0.02);
                out.push(<line key={`fsl-${idx}-${i}`} x1={x} y1={HEAD_Y - len} x2={x + (i - 2) * 8} y2={HEAD_Y} stroke="#4A3020" strokeWidth={1.8} opacity={op} strokeLinecap="round" />);
              }
            }
          }

          // WAVE → sparkle trail off waving hand
          if (charPose(c) === "wave") {
            const dir = c.facing === "left" ? -1 : 1;
            for (let i = 0; i < 5; i++) {
              const t = (frame * 1.0 + i * 42) % 58;
              const px = cx + dir * (90 + t * 1.4) + Math.sin(frame / 8 + i) * 16;
              const py = HEAD_Y + 90 + Math.cos(frame / 10 + i * 1.5) * 38 - t * 0.75;
              out.push(<polygon key={`wv-${idx}-${i}`} points={starPts(px, py, 5 + i % 3, frame * 0.05 + i)} fill="#FFE566" opacity={Math.max(0, 0.60 - t / 58)} />);
            }
          }

          // POINT → directional dust puff + horizontal speed burst
          if (charPose(c) === "point") {
            const dir = c.facing === "left" ? -1 : 1;
            for (let i = 0; i < 4; i++) {
              const t = (frame * 0.9 + i * 32) % 62;
              const px = cx + dir * (100 + t * 3.2 + i * 14);
              const py = HEAD_Y + 120 + (i % 2) * 18 + Math.sin(frame / 12 + i) * 12;
              out.push(<circle key={`pt-${idx}-${i}`} cx={px} cy={py} r={8 + i % 3} fill="#E0D8C0" opacity={Math.max(0, 0.36 - t / 62)} />);
            }
            {
              const EX = 7;
              const ef = Math.max(0, frame - EX);
              const spd = Math.max(0, 1 - ef / 10);
              if (spd > 0.05) {
                const midY = HEAD_Y + 110;
                const xBase = cx + dir * (cw * 0.42);
                for (let i = 0; i < 4; i++) {
                  const y   = midY - 40 + i * 28;
                  const len = spd * (50 + i * 14);
                  const op  = spd * (0.28 - i * 0.05);
                  out.push(<line key={`psl-${idx}-${i}`} x1={xBase} y1={y} x2={xBase + dir * len} y2={y} stroke="#4A3020" strokeWidth={2 - i * 0.3} opacity={op} strokeLinecap="round" />);
                }
              }
            }
          }

          // LOVE → floating hearts above head
          if (charExpr(c) === "love") {
            for (let i = 0; i < 4; i++) {
              const t = (frame * 0.6 + i * 52) % 130;
              const px = cx - 36 + i * 26 + Math.sin(frame / 15 + i) * 14;
              const py = HEAD_Y - t * 0.9;
              const op = Math.max(0, 0.65 - t / 130);
              const hs = 9 + i % 3;
              out.push(
                <g key={`hrt-${idx}-${i}`} opacity={op}>
                  <circle cx={px - hs * 0.35} cy={py} r={hs * 0.52} fill="#FF7A9E" />
                  <circle cx={px + hs * 0.35} cy={py} r={hs * 0.52} fill="#FF7A9E" />
                  <polygon points={`${px - hs * 0.85},${py + hs * 0.22} ${px + hs * 0.85},${py + hs * 0.22} ${px},${py + hs * 1.12}`} fill="#FF7A9E" />
                </g>
              );
            }
          }

          // LAUGHING → orbiting sparkle burst
          if (charExpr(c) === "laughing") {
            for (let i = 0; i < 7; i++) {
              const angle = (i / 7) * Math.PI * 2 + frame * 0.025;
              const t = (frame * 1.1 + i * 26) % 65;
              const px = cx + Math.cos(angle) * (26 + t * 1.4);
              const py = HEAD_Y + Math.sin(angle) * (18 + t * 0.9);
              out.push(<polygon key={`lg-${idx}-${i}`} points={starPts(px, py, 6 + i % 4, frame * 0.06 + i)} fill="#FFE566" opacity={Math.max(0, 0.60 - t / 65)} />);
            }
          }

          // ANGRY → steam vents above head
          if (charExpr(c) === "angry") {
            for (let i = 0; i < 3; i++) {
              const t = (frame * 0.8 + i * 44) % 78;
              const px = cx - 26 + i * 26 + Math.sin(frame / 8 + i) * 9;
              const py = HEAD_Y - 20 - t * 1.4;
              out.push(<circle key={`ag-${idx}-${i}`} cx={px} cy={py} r={10 + t * 0.5} fill="#D0D0D0" opacity={Math.max(0, 0.44 - t / 78)} />);
            }
          }

          // SURPRISED → white pop burst
          if (charExpr(c) === "surprised") {
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2;
              const t = (frame * 1.4 + i * 18) % 45;
              const px = cx + Math.cos(angle) * (20 + t * 1.8);
              const py = HEAD_Y + Math.sin(angle) * (14 + t * 1.2);
              out.push(<polygon key={`sp-${idx}-${i}`} points={starPts(px, py, 7, frame * 0.08 + i)} fill="white" opacity={Math.max(0, 0.68 - t / 45)} />);
            }
          }

          return out;
        })}
      </svg>
    </AbsoluteFill>
  );
};
