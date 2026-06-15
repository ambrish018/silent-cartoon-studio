const STROKE = "#5C3D2E";  // warm dark brown — softer than near-black
const SW = 7;

// Pastel body fills — also used for blink eyelids
const BODY_FILL: Record<string, string> = {
  Apple:  "#FF8C94",
  Banana: "#FFE166",
  Carrot: "#FFAB6E",
  Mochi:  "#F5D9B0",
};

const BLINK_OFFSET: Record<string, number> = {
  Apple: 0, Banana: 22, Carrot: 45, Mochi: 67,
};

export type Expression =
  | "neutral" | "happy" | "laughing" | "sad" | "crying"
  | "surprised" | "angry" | "love" | "thinking" | "scared";
export type CharName = "Apple" | "Banana" | "Carrot" | "Mochi";

function eyes(expr: Expression, cx: number, cy: number): string {
  const ex = 23, ey = cy - 6, L = cx - ex, R = cx + ex;
  let s = "";
  if (["neutral","sad","crying","angry","thinking","scared"].includes(expr)) {
    const r = expr === "scared" ? 15 : 11;
    s += `<circle cx="${L}" cy="${ey}" r="${r}" fill="${STROKE}"/>`;
    s += `<circle cx="${R}" cy="${ey}" r="${r}" fill="${STROKE}"/>`;
    if (["neutral","sad","crying","scared"].includes(expr)) {
      s += `<circle cx="${L+3}" cy="${ey-3}" r="3.5" fill="#fff"/>`;
      s += `<circle cx="${R+3}" cy="${ey-3}" r="3.5" fill="#fff"/>`;
    }
  }
  if (expr === "happy" || expr === "laughing")
    for (const x of [L, R])
      s += `<path d="M ${x-14},${ey+4} Q ${x},${ey-14} ${x+14},${ey+4}" stroke="${STROKE}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  if (expr === "surprised")
    for (const x of [L, R]) {
      s += `<circle cx="${x}" cy="${ey}" r="15" fill="#fff" stroke="${STROKE}" stroke-width="5"/>`;
      s += `<circle cx="${x}" cy="${ey+2}" r="8" fill="${STROKE}"/>`;
    }
  if (expr === "love")
    for (const x of [L, R])
      s += `<path d="M ${x},${ey+10} C ${x-17},${ey-8} ${x-2},${ey-16} ${x},${ey-4} C ${x+2},${ey-16} ${x+17},${ey-8} ${x},${ey+10} Z" fill="#FF7A9E"/>`;
  if (expr === "crying")
    for (const x of [L, R])
      s += `<path d="M ${x},${ey+12} q -7,14 0,16 q 7,-3 0,-16 Z" fill="#A8DCFF"/>`;
  return s;
}

function eyebrows(expr: Expression, cx: number, cy: number): string {
  const ex = 23, ey = cy - 6;
  const L = cx - ex, R = cx + ex;
  const by = ey - 20;
  let s = "";
  switch (expr) {
    case "neutral":
      s += `<line x1="${L-13}" y1="${by}" x2="${L+13}" y2="${by}" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>`;
      s += `<line x1="${R-13}" y1="${by}" x2="${R+13}" y2="${by}" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>`;
      break;
    case "happy": case "laughing": case "love":
      s += `<path d="M ${L-13},${by+6} Q ${L},${by-10} ${L+13},${by+6}" stroke="${STROKE}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M ${R-13},${by+6} Q ${R},${by-10} ${R+13},${by+6}" stroke="${STROKE}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      break;
    case "surprised":
      s += `<path d="M ${L-13},${by-7} Q ${L},${by-22} ${L+13},${by-7}" stroke="${STROKE}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M ${R-13},${by-7} Q ${R},${by-22} ${R+13},${by-7}" stroke="${STROKE}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      break;
    case "sad": case "crying":
      s += `<line x1="${L-13}" y1="${by+4}" x2="${L+13}" y2="${by-10}" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>`;
      s += `<line x1="${R-13}" y1="${by-10}" x2="${R+13}" y2="${by+4}" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>`;
      break;
    case "angry":
      s += `<line x1="${L-13}" y1="${by-7}" x2="${L+13}" y2="${by+10}" stroke="${STROKE}" stroke-width="8" stroke-linecap="round"/>`;
      s += `<line x1="${R-13}" y1="${by+10}" x2="${R+13}" y2="${by-7}" stroke="${STROKE}" stroke-width="8" stroke-linecap="round"/>`;
      break;
    case "thinking":
      s += `<line x1="${L-13}" y1="${by}" x2="${L+13}" y2="${by}" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>`;
      s += `<line x1="${R-13}" y1="${by-10}" x2="${R+13}" y2="${by+4}" stroke="${STROKE}" stroke-width="7" stroke-linecap="round"/>`;
      break;
    case "scared":
      s += `<path d="M ${L-13},${by-3} Q ${L},${by-16} ${L+13},${by-3}" stroke="${STROKE}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M ${R-13},${by-3} Q ${R},${by-16} ${R+13},${by-3}" stroke="${STROKE}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      break;
  }
  return s;
}

function mouth(expr: Expression, cx: number, cy: number): string {
  const my = cy + 22;
  switch (expr) {
    case "neutral":
      return `<path d="M ${cx-19},${my} Q ${cx},${my+11} ${cx+19},${my}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    case "happy":
    case "love":
      return `<path d="M ${cx-24},${my-3} Q ${cx},${my+20} ${cx+24},${my-3}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    case "laughing":
      return `<path d="M ${cx-26},${my-5} Q ${cx},${my+28} ${cx+26},${my-5} Z" fill="${STROKE}"/>`
           + `<path d="M ${cx-17},${my+8} Q ${cx},${my+22} ${cx+17},${my+8} Z" fill="#FFB0C0"/>`;
    case "surprised":
      return `<ellipse cx="${cx}" cy="${my+2}" rx="12" ry="14" fill="${STROKE}"/>`;
    case "sad":
    case "crying":
      return `<path d="M ${cx-19},${my+9} Q ${cx},${my-10} ${cx+19},${my+9}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    case "angry":
      return `<path d="M ${cx-20},${my+5} L ${cx-7},${my-4} L ${cx+7},${my+5} L ${cx+20},${my-4}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "thinking":
      return `<line x1="${cx-8}" y1="${my+2}" x2="${cx+15}" y2="${my-1}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`;
    case "scared":
      return `<path d="M ${cx-21},${my} q 7,-12 14,0 q 7,12 14,0 q 7,-12 14,0" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    default:
      return "";
  }
}

function cheeks(cx: number, cy: number, col = "#FFB8C8"): string {
  return `<circle cx="${cx-34}" cy="${cy+10}" r="11" fill="${col}" opacity="0.65"/>`
       + `<circle cx="${cx+34}" cy="${cy+10}" r="11" fill="${col}" opacity="0.65"/>`;
}

export function faceSVG(expr: Expression, cx: number, cy: number): string {
  return eyebrows(expr, cx, cy) + eyes(expr, cx, cy) + mouth(expr, cx, cy);
}

// Shadow + optional directional motion blur — both live in one <defs> block
function buildDefs(blurX: number, blurY: number): string {
  const hasMB = blurX > 0.4 || blurY > 0.4;
  return `<defs>` +
    `<filter id="cs" x="-30%" y="-15%" width="160%" height="160%">` +
    `<feDropShadow dx="0" dy="4" stdDeviation="11" flood-color="#B06830" flood-opacity="0.10"/>` +
    `</filter>` +
    (hasMB
      ? `<filter id="mb" x="-60%" y="-60%" width="220%" height="220%">` +
        `<feGaussianBlur stdDeviation="${blurX.toFixed(1)} ${blurY.toFixed(1)}"/>` +
        `</filter>`
      : ``) +
    `</defs>`;
}

// Each body is an ordered list of parts. A part may be `flop`: it pivots by the
// secondary-motion angle (Disney follow-through / overlapping action) around its
// own anchor, so light appendages (leaves, stems, ears, tails) drag behind the
// body's main motion and settle late. Parts render in array order → z-order kept.
type Part = { svg: string; flop?: { pivot: [number, number]; gain: number } };

const BODIES: Record<CharName, { face: [number,number]; cheek: [number,number]; parts: Part[] }> = {
  Apple: {
    face: [110, 120], cheek: [110, 120],
    parts: [
      { svg: `<path d="M110 60 C 70 50,40 80,42 130 C 44 185,80 210,110 210 C 140 210,176 185,178 130 C 180 80,150 50,110 60 Z" fill="#FF8C94" stroke="${STROKE}" stroke-width="6"/>` },
      // stem + leaf — top appendage, drags behind body
      { flop: { pivot: [108, 60], gain: 1.0 }, svg:
          `<path d="M110 60 q 4 -22 -6 -30" stroke="#7a4a2b" stroke-width="7" fill="none" stroke-linecap="round"/>`
        + `<path d="M112 38 q 30 -18 40 4 q -28 14 -40 -4 Z" fill="#6dbe5a" stroke="#3f7a33" stroke-width="3"/>` },
      { svg:
          `<ellipse cx="78" cy="100" rx="20" ry="36" fill="white" opacity="0.18"/>`
        + `<circle cx="86" cy="83" r="11" fill="white" opacity="0.24"/>` },
    ],
  },
  Banana: {
    face: [112, 120], cheek: [112, 120],
    parts: [
      { svg: `<path d="M60 70 C 40 120,70 195,150 200 C 185 202,196 185,188 178 C 130 188,86 150,92 78 C 92 66,70 56,60 70 Z" fill="#FFE166" stroke="${STROKE}" stroke-width="6"/>` },
      // stem nub — small floppy tip
      { flop: { pivot: [78, 74], gain: 0.6 }, svg: `<circle cx="62" cy="70" r="6" fill="#5a3b1e"/>` },
      { svg:
          `<ellipse cx="70" cy="110" rx="11" ry="24" fill="white" opacity="0.18" transform="rotate(-22 70 110)"/>`
        + `<circle cx="74" cy="93" r="7" fill="white" opacity="0.24"/>` },
    ],
  },
  Carrot: {
    face: [110, 116], cheek: [110, 116],
    parts: [
      { svg: `<path d="M70 86 L150 86 L118 226 Q110 240 102 226 Z" fill="#FFAB6E" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/>` },
      { svg: [0,1,2,3].map(i => `<line x1="${86+i*16}" y1="120" x2="${88+i*16}" y2="150" stroke="#D07828" stroke-width="3"/>`).join("") },
      // leafy top — drags behind body
      { flop: { pivot: [110, 86], gain: 0.9 }, svg:
          `<path d="M110 86 q -6 -34 -26 -40 q 6 26 18 40 Z" fill="#5cb85c" stroke="#3f7a33" stroke-width="3"/>`
        + `<path d="M110 86 q 0 -40 0 -46 q 10 30 8 46 Z" fill="#6ecb6e" stroke="#3f7a33" stroke-width="3"/>`
        + `<path d="M110 86 q 6 -34 26 -40 q -6 26 -18 40 Z" fill="#5cb85c" stroke="#3f7a33" stroke-width="3"/>` },
      { svg:
          `<ellipse cx="93" cy="122" rx="13" ry="28" fill="white" opacity="0.18"/>`
        + `<circle cx="98" cy="106" r="8" fill="white" opacity="0.22"/>` },
    ],
  },
  Mochi: {
    face: [110, 78], cheek: [110, 90],
    parts: [
      // ears — floppy, anchored near skull top, swing with head motion
      { flop: { pivot: [62, 30], gain: 1.2 }, svg: `<ellipse cx="58" cy="48" rx="22" ry="34" fill="#DEB48E" stroke="${STROKE}" stroke-width="6" transform="rotate(-18 58 48)"/>` },
      { flop: { pivot: [158, 30], gain: 1.2 }, svg: `<ellipse cx="162" cy="48" rx="22" ry="34" fill="#DEB48E" stroke="${STROKE}" stroke-width="6" transform="rotate(18 162 48)"/>` },
      // tail — most floppy
      { flop: { pivot: [168, 168], gain: 1.6 }, svg: `<path d="M168 170 q 30 -6 26 -34 q -16 10 -18 26 Z" fill="#DEB48E" stroke="${STROKE}" stroke-width="5"/>` },
      // body — head bottom (y=134) meets body top (y=134) for seamless connection
      { svg: `<ellipse cx="110" cy="192" rx="62" ry="58" fill="#F5D9B0" stroke="${STROKE}" stroke-width="6"/>` },
      // head
      { svg:
          `<circle cx="110" cy="78" r="56" fill="#F5D9B0" stroke="${STROKE}" stroke-width="6"/>`
        + `<path d="M110 22 a56 56 0 0 1 46 30 a56 56 0 0 1 -46 14 Z" fill="#E8C494" opacity="0.55"/>` },
      // front paws
      { svg:
          `<ellipse cx="70" cy="246" rx="25" ry="14" fill="#F5D9B0" stroke="${STROKE}" stroke-width="5"/>`
        + `<ellipse cx="150" cy="246" rx="25" ry="14" fill="#F5D9B0" stroke="${STROKE}" stroke-width="5"/>` },
      // belly
      { svg: `<ellipse cx="110" cy="198" rx="34" ry="26" fill="#FFF8EE" stroke="${STROKE}" stroke-width="4"/>` },
      // dog nose
      { svg: `<ellipse cx="110" cy="94" rx="9" ry="6.5" fill="${STROKE}"/>` },
      { svg:
          `<ellipse cx="84" cy="56" rx="16" ry="24" fill="white" opacity="0.18"/>`
        + `<circle cx="90" cy="46" r="8" fill="white" opacity="0.22"/>` },
    ],
  },
};

function blinkSVG(name: CharName, frame: number, cx: number, cy: number): string {
  const BLINK_INTERVAL = 90;
  const BLINK_DURATION = 5;
  const phase = (frame + (BLINK_OFFSET[name] ?? 0)) % BLINK_INTERVAL;
  if (phase >= BLINK_DURATION) return "";
  const t = phase / (BLINK_DURATION - 1);
  const progress = 1 - Math.abs(2 * t - 1);
  if (progress <= 0) return "";
  const ex = 23, ey = cy - 6, L = cx - ex, R = cx + ex;
  const r = 12;
  const fill = BODY_FILL[name] ?? STROKE;
  const h = r * 2 * progress;
  let s = "";
  for (const x of [L, R]) {
    s += `<rect x="${x-r}" y="${ey-r}" width="${r*2}" height="${h}" rx="4" fill="${fill}"/>`;
    if (progress > 0.5) {
      const lidY = ey - r + h;
      s += `<line x1="${x-r+2}" y1="${lidY}" x2="${x+r-2}" y2="${lidY}" stroke="${STROKE}" stroke-width="5" stroke-linecap="round"/>`;
    }
  }
  return s;
}

// `floppy` = secondary-motion angle (deg) from the body's velocity, applied to flop parts.
export function characterSVG(
  name: CharName, expr: Expression, frame = 0,
  blurX = 0, blurY = 0, floppy = 0
): string {
  const b = BODIES[name];
  const cheekCol = name === "Mochi" ? "#FFC0C8" : "#FFB8C8";
  const hasMB = blurX > 0.4 || blurY > 0.4;
  const bodyParts = b.parts.map(p =>
    p.flop
      ? `<g transform="rotate(${(floppy * p.flop.gain).toFixed(2)} ${p.flop.pivot[0]} ${p.flop.pivot[1]})">${p.svg}</g>`
      : p.svg
  ).join("");
  const inner =
    `<g filter="url(#cs)">${bodyParts}</g>`
    + cheeks(b.cheek[0], b.cheek[1], cheekCol)
    + faceSVG(expr, b.face[0], b.face[1])
    + blinkSVG(name, frame, b.face[0], b.face[1]);
  return buildDefs(blurX, blurY)
    + (hasMB ? `<g filter="url(#mb)">${inner}</g>` : inner);
}
