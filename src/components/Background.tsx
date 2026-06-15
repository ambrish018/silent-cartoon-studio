import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export type Theme = "kitchen" | "park" | "classroom" | "night" | "plain";

// ── shared primitives ─────────────────────────────────────────────────────────

const Cloud: React.FC<{ x: number; y: number; s?: number; op?: number }> = ({ x, y, s = 1, op = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}>
    <ellipse cx={0} cy={18} rx={110} ry={52} fill="white" />
    <circle cx={-58} cy={-2} r={54} fill="white" />
    <circle cx={0} cy={-28} r={64} fill="white" />
    <circle cx={64} cy={-6} r={54} fill="white" />
    <ellipse cx={-20} cy={-20} rx={44} ry={30} fill="#EFF8FF" opacity={0.6} />
  </g>
);

const Tree: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-20} y={0} width={40} height={130} rx={10} fill="#8B5E3C" />
    <rect x={-10} y={15} width={7} height={55} rx={4} fill="#7A5230" opacity={0.45} />
    <circle cx={0} cy={-80} r={108} fill="#4A8A2A" />
    <circle cx={-52} cy={-42} r={84} fill="#4A8A2A" />
    <circle cx={56} cy={-42} r={84} fill="#4A8A2A" />
    <circle cx={0} cy={-92} r={98} fill="#6ABB3A" />
    <circle cx={-48} cy={-54} r={76} fill="#6ABB3A" />
    <circle cx={52} cy={-54} r={76} fill="#6ABB3A" />
    <circle cx={-18} cy={-120} r={46} fill="#88D44A" opacity={0.65} />
    <circle cx={22} cy={-124} r={38} fill="#98E050" opacity={0.45} />
  </g>
);

const PETAL_ANGLES = [0, 72, 144, 216, 288];
const Flower: React.FC<{ x: number; y: number; col?: string; s?: number }> = ({ x, y, col = "#FF9ED2", s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {PETAL_ANGLES.map((a, i) => (
      <circle
        key={i}
        cx={Math.round(Math.cos((a * Math.PI) / 180) * 17)}
        cy={Math.round(Math.sin((a * Math.PI) / 180) * 17)}
        r={15}
        fill={col}
      />
    ))}
    <circle cx={0} cy={0} r={12} fill="#FFE566" />
    <circle cx={-3} cy={-3} r={4} fill="#FFF5A0" opacity={0.65} />
  </g>
);

// ── constants ─────────────────────────────────────────────────────────────────

const PARK_FX  = [50, 160, 270, 380, 490, 610, 720, 840, 950, 1030];
const PARK_COL = ["#FF9ED2","#FF7BAC","#FFB347","#FF9ED2","#FFCA78","#FF7BAC","#FF9ED2","#FFB347","#FF7BAC","#FFCA78"];
const PARK_SC  = [1.0, 1.15, 0.9, 1.1, 1.0, 1.15, 0.95, 1.1, 1.0, 1.05];

const PLAIN_FX  = [70, 190, 320, 450, 570, 700, 830, 950, 1010];
const PLAIN_COL = ["#FF9ED2","#FFB347","#FF7BAC","#FFCA78","#FF9ED2","#FFB347","#FF7BAC","#FFCA78","#FF9ED2"];

const STARS = Array.from({ length: 48 }, (_, i) => ({
  x: (i * 137.5 + 50) % 1060,
  y: (i * 251.3 + 30) % 720,
  r: 2 + (i % 3),
  phase: i * 0.7,
}));

const BOOK_COLS = ["#FF7A7A","#7AAEFF","#7ACA7A","#FFD07A","#D07AFF"];

// ── SVG wrapper ───────────────────────────────────────────────────────────────

const LayerSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width="100%" height="100%"
    viewBox="0 0 1080 1920"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

// ── Layer 0: sky / wall + sun / moon / stars ──────────────────────────────────

export const BackgroundSky: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <LayerSVG>
        {theme === "park" && <>
          <defs>
            <linearGradient id="parkSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#5BBCF8" />
              <stop offset="55%"  stopColor="#9FDEFF" />
              <stop offset="100%" stopColor="#D4F0FF" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFF0A0" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#FFE566" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#parkSky)" />
          <circle cx={900} cy={180} r={160} fill="url(#sunGlow)" />
          <circle cx={900} cy={180} r={88} fill="#FFE566" />
          <circle cx={900} cy={180} r={70} fill="#FFF0A0" />
        </>}

        {theme === "kitchen" && <>
          <defs>
            <linearGradient id="kitchenWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFF5E0" />
              <stop offset="100%" stopColor="#FFE8C4" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#kitchenWall)" />
          {/* Window — sky + clouds live here so they move with the frame */}
          <rect x={360} y={160} width={360} height={280} rx={16} fill="#B8E4FF" />
          <Cloud x={395} y={255} s={0.28} op={0.65} />
          <Cloud x={495} y={330} s={0.22} op={0.55} />
          <rect x={360} y={160} width={360} height={280} rx={16} fill="none" stroke="#E8C890" strokeWidth={18} />
          <rect x={536} y={162} width={8}   height={276} fill="#E8C890" />
          <rect x={362} y={296} width={356} height={8}   fill="#E8C890" />
        </>}

        {theme === "classroom" && <>
          <defs>
            <linearGradient id="classWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFFBE8" />
              <stop offset="100%" stopColor="#FFF0C8" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#classWall)" />
        </>}

        {theme === "night" && <>
          <defs>
            <radialGradient id="nightSky" cx="50%" cy="0%" r="100%">
              <stop offset="0%"   stopColor="#2A2A6E" />
              <stop offset="100%" stopColor="#0D0D2A" />
            </radialGradient>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFFADC" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#FFE888" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#nightSky)" />
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r}
              fill="white"
              opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + s.phase))}
            />
          ))}
          <circle cx={820} cy={200} r={190} fill="url(#moonGlow)" />
          <circle cx={820} cy={200} r={100} fill="#FFF8DC" />
          <circle cx={800} cy={180} r={96}  fill="#FFF5C8" />
          <circle cx={800} cy={218} r={14}  fill="#F0E8A0" opacity={0.55} />
          <circle cx={848} cy={172} r={10}  fill="#F0E8A0" opacity={0.45} />
          <circle cx={776} cy={158} r={8}   fill="#F0E8A0" opacity={0.40} />
        </>}

        {theme === "plain" && <>
          <defs>
            <linearGradient id="plainBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#FFF5EC" />
              <stop offset="60%"  stopColor="#FFE8D8" />
              <stop offset="100%" stopColor="#FFD8C0" />
            </linearGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#plainBg)" />
          <circle cx={180}  cy={400}  r={200} fill="#FFD0B0" opacity={0.18} />
          <circle cx={900}  cy={600}  r={260} fill="#FFE0C8" opacity={0.14} />
          <circle cx={540}  cy={1000} r={300} fill="#FFD8C0" opacity={0.11} />
          <circle cx={100}  cy={1400} r={220} fill="#FFCCA8" opacity={0.16} />
          <circle cx={980}  cy={1300} r={200} fill="#FFD8C0" opacity={0.13} />
        </>}
      </LayerSVG>
    </AbsoluteFill>
  );
};

// ── Layer 1: drifting clouds ──────────────────────────────────────────────────

export const BackgroundClouds: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const c1x = (frame * 0.18) % 1600 - 320;
  const c2x = (frame * 0.11) % 1800 - 450;
  const c3x = (frame * 0.14) % 1700 - 250;

  if (theme === "kitchen" || theme === "classroom") return null;

  return (
    <AbsoluteFill>
      <LayerSVG>
        {theme === "park" && <>
          <Cloud x={c1x}       y={260} s={1.1} />
          <Cloud x={c2x + 500} y={400} s={0.82} op={0.88} />
          <Cloud x={c3x + 800} y={220} s={0.95} op={0.92} />
        </>}
        {theme === "night" && <>
          <Cloud x={100} y={370} s={0.9}  op={0.28} />
          <Cloud x={680} y={310} s={0.75} op={0.20} />
        </>}
        {theme === "plain" && <>
          <Cloud x={c1x}       y={280} s={1.0}  op={0.55} />
          <Cloud x={c1x + 620} y={430} s={0.78} op={0.45} />
        </>}
      </LayerSVG>
    </AbsoluteFill>
  );
};

// ── Layer 2: trees / ground / floors ─────────────────────────────────────────

export const BackgroundTrees: React.FC<{ theme: Theme }> = ({ theme }) => (
  <AbsoluteFill>
    <LayerSVG>
      {theme === "park" && <>
        <defs>
          <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7ABF54" />
            <stop offset="100%" stopColor="#4A9E2A" />
          </linearGradient>
        </defs>
        <path d="M -80 990 Q 160 875 370 945 Q 590 870 780 945 Q 970 865 1160 925 L 1160 1920 L -80 1920 Z" fill="#9ED66A" />
        <Tree x={90}   y={900} s={0.72} />
        <Tree x={320}  y={860} s={0.80} />
        <Tree x={780}  y={870} s={0.84} />
        <Tree x={1000} y={890} s={0.70} />
        <path d="M -80 1090 Q 200 1025 410 1065 Q 630 1015 840 1060 Q 1010 1015 1160 1050 L 1160 1920 L -80 1920 Z" fill="url(#grassGrad)" />
        {PARK_FX.map((fx, i) => (
          <Flower key={i} x={fx} y={1080} col={PARK_COL[i]} s={PARK_SC[i]} />
        ))}
      </>}

      {theme === "kitchen" && <>
        <defs>
          <linearGradient id="counterWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#D4A56A" />
            <stop offset="100%" stopColor="#B87840" />
          </linearGradient>
          <pattern id="tilePat" x="0" y="0" width="90" height="60" patternUnits="userSpaceOnUse">
            <rect width={84} height={54} rx={5} fill="white" stroke="#E8D4B8" strokeWidth={2} />
          </pattern>
        </defs>
        <rect x={0} y={500} width={1080} height={860} fill="url(#tilePat)" />
        <rect x={60} y={480} width={960} height={22} rx={6} fill="#C89860" />
        <ellipse cx={160} cy={462} rx={40} ry={48} fill="#E87040" />
        <ellipse cx={160} cy={424} rx={38} ry={16} fill="#F08050" />
        <ellipse cx={300} cy={466} rx={36} ry={44} fill="#6BA0D0" />
        <ellipse cx={300} cy={430} rx={34} ry={15} fill="#7BB0E0" />
        <ellipse cx={430} cy={460} rx={32} ry={40} fill="#74B86A" />
        <ellipse cx={430} cy={428} rx={30} ry={14} fill="#84C87A" />
        <ellipse cx={900} cy={460} rx={42} ry={50} fill="#D0607A" />
        <ellipse cx={900} cy={420} rx={40} ry={17} fill="#E0708A" />
        <rect x={0} y={1350} width={1080} height={28} rx={6} fill="#E8C890" />
        <rect x={0} y={1378} width={1080} height={220} fill="url(#counterWood)" />
        {[20, 65, 120, 185, 250].map((gy, i) => (
          <line key={i} x1={0} y1={1378 + gy} x2={1080} y2={1378 + gy + 12}
            stroke="#A06830" strokeWidth={2} opacity={0.25} />
        ))}
        <rect x={0} y={1598} width={1080} height={322} fill="#C09050" />
      </>}

      {theme === "classroom" && <>
        <defs>
          <pattern id="floorPlank" x="0" y="0" width="216" height="400" patternUnits="userSpaceOnUse">
            <rect width={210} height={400} rx={2} fill="#D4A86A" />
            <line x1={0} y1={0} x2={210} y2={0} stroke="#A07838" strokeWidth={1.5} opacity={0.35} />
          </pattern>
        </defs>
        <rect x={80} y={280} width={920} height={560} rx={14} fill="#2E5D4B" />
        <rect x={80} y={280} width={920} height={560} rx={14} fill="none" stroke="#9A6A3A" strokeWidth={20} />
        <line x1={180} y1={420} x2={600} y2={420} stroke="white" strokeWidth={4.5} opacity={0.32} />
        <line x1={180} y1={470} x2={780} y2={470} stroke="white" strokeWidth={4.5} opacity={0.26} />
        <line x1={180} y1={520} x2={700} y2={520} stroke="white" strokeWidth={4.5} opacity={0.30} />
        <line x1={180} y1={570} x2={640} y2={570} stroke="white" strokeWidth={4.5} opacity={0.22} />
        <rect x={80} y={836} width={920} height={18} rx={4} fill="#9A6A3A" />
        <rect x={180} y={838} width={44} height={12} rx={3} fill="white"   opacity={0.85} />
        <rect x={244} y={838} width={44} height={12} rx={3} fill="#FFD0A0" opacity={0.80} />
        <rect x={308} y={838} width={44} height={12} rx={3} fill="#C0E0FF" opacity={0.80} />
        <rect x={70} y={920} width={240} height={280} rx={12} fill="#B8E4FF" stroke="#C8A860" strokeWidth={14} />
        <rect x={186} y={920} width={6}   height={280} fill="#C8A860" />
        <rect x={70}  y={1055} width={240} height={6} fill="#C8A860" />
        <rect x={780} y={300} width={210} height={210} rx={8} fill="#E8A858" stroke="#9A6A3A" strokeWidth={10} />
        <rect x={808} y={322} width={70} height={70} rx={4} fill="#FF7A7A" />
        <rect x={892} y={322} width={70} height={70} rx={4} fill="#7A9BFF" />
        <rect x={808} y={406} width={70} height={70} rx={4} fill="#7ACA7A" />
        <rect x={892} y={406} width={70} height={70} rx={4} fill="#FFD07A" />
        <rect x={0} y={1504} width={1080} height={22} rx={4} fill="#B88448" />
        <rect x={0} y={1526} width={1080} height={394} fill="url(#floorPlank)" />
        <rect x={0} y={1390} width={190} height={116} fill="#C89860" />
        {BOOK_COLS.map((col, i) => (
          <rect key={i} x={8 + i * 36} y={1400} width={28} height={88} rx={3} fill={col} />
        ))}
        <rect x={0} y={1386} width={190} height={10} rx={3} fill="#B08040" />
      </>}

      {theme === "night" && <>
        <path d="M -80 1110 Q 220 990 470 1050 Q 720 970 930 1030 Q 1060 990 1160 1020 L 1160 1920 L -80 1920 Z" fill="#141428" />
        <path d="M 80 1085  L 112 890 L 144 1085 Z" fill="#0D0D20" />
        <path d="M 95 970   L 112 908 L 128 970 Z"  fill="#0D0D20" />
        <path d="M 910 1060 L 942 860 L 974 1060 Z" fill="#0D0D20" />
        <path d="M 925 940  L 942 876 L 958 940 Z"  fill="#0D0D20" />
        <path d="M 200 1072 L 228 904 L 256 1072 Z" fill="#0D0D20" />
        <path d="M 213 960  L 228 910 L 242 960 Z"  fill="#0D0D20" />
        <path d="M -80 1140 Q 300 1080 600 1110 Q 900 1068 1160 1100 L 1160 1920 L -80 1920 Z" fill="#121828" />
      </>}

      {theme === "plain" && <>
        <path d="M -80 1400 Q 300 1330 600 1365 Q 900 1325 1160 1360 L 1160 1920 L -80 1920 Z" fill="#F0D8B0" />
        {PLAIN_FX.map((fx, i) => (
          <Flower key={i} x={fx} y={1395} col={PLAIN_COL[i]} s={0.9 + (i % 3) * 0.1} />
        ))}
      </>}
    </LayerSVG>
  </AbsoluteFill>
);

// ── Backward-compat wrapper (unused in parallax mode) ─────────────────────────

export const Background: React.FC<{ theme: Theme }> = ({ theme }) => (
  <AbsoluteFill>
    <BackgroundSky    theme={theme} />
    <BackgroundClouds theme={theme} />
    <BackgroundTrees  theme={theme} />
  </AbsoluteFill>
);
