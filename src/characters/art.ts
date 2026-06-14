const STROKE = "#2f2a26";
const SW = 5;

export type Expression =
  | "neutral" | "happy" | "laughing" | "sad" | "crying"
  | "surprised" | "angry" | "love" | "thinking" | "scared";
export type CharName = "Apple" | "Banana" | "Carrot" | "Mochi";

function eyes(expr: Expression, cx: number, cy: number): string {
  const ex = 23, ey = cy - 6, L = cx - ex, R = cx + ex;
  let s = "";
  if (["neutral","sad","crying","angry","thinking","scared"].includes(expr)) {
    const r = expr === "scared" ? 10 : 7;
    s += `<circle cx="${L}" cy="${ey}" r="${r}" fill="${STROKE}"/>`;
    s += `<circle cx="${R}" cy="${ey}" r="${r}" fill="${STROKE}"/>`;
    if (["neutral","sad","crying","scared"].includes(expr)) {
      s += `<circle cx="${L+2}" cy="${ey-2}" r="2.2" fill="#fff"/>`;
      s += `<circle cx="${R+2}" cy="${ey-2}" r="2.2" fill="#fff"/>`;
    }
  }
  if (expr === "happy" || expr === "laughing")
    for (const x of [L, R])
      s += `<path d="M ${x-10},${ey+3} Q ${x},${ey-9} ${x+10},${ey+3}" stroke="${STROKE}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if (expr === "surprised")
    for (const x of [L, R]) {
      s += `<circle cx="${x}" cy="${ey}" r="11" fill="#fff" stroke="${STROKE}" stroke-width="3.5"/>`;
      s += `<circle cx="${x}" cy="${ey+2}" r="5" fill="${STROKE}"/>`;
    }
  if (expr === "love")
    for (const x of [L, R])
      s += `<path d="M ${x},${ey+8} C ${x-13},${ey-6} ${x-2},${ey-12} ${x},${ey-3} C ${x+2},${ey-12} ${x+13},${ey-6} ${x},${ey+8} Z" fill="#ff4d6d"/>`;
  if (expr === "angry") {
    s += `<line x1="${L-10}" y1="${ey-10}" x2="${L+8}" y2="${ey-4}" stroke="${STROKE}" stroke-width="4.5" stroke-linecap="round"/>`;
    s += `<line x1="${R+10}" y1="${ey-10}" x2="${R-8}" y2="${ey-4}" stroke="${STROKE}" stroke-width="4.5" stroke-linecap="round"/>`;
  }
  if (expr === "sad" || expr === "crying") {
    s += `<line x1="${L-9}" y1="${ey-11}" x2="${L+7}" y2="${ey-13}" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>`;
    s += `<line x1="${R+9}" y1="${ey-11}" x2="${R-7}" y2="${ey-13}" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (expr === "crying")
    for (const x of [L, R])
      s += `<path d="M ${x},${ey+9} q -5,9 0,11 q 5,-2 0,-11 Z" fill="#5bc8ff"/>`;
  if (expr === "thinking")
    s += `<line x1="${R+9}" y1="${ey-12}" x2="${R-7}" y2="${ey-9}" stroke="${STROKE}" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}

function mouth(expr: Expression, cx: number, cy: number): string {
  const my = cy + 22;
  switch (expr) {
    case "neutral":
      return `<path d="M ${cx-13},${my} Q ${cx},${my+7} ${cx+13},${my}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    case "happy":
    case "love":
      return `<path d="M ${cx-18},${my-3} Q ${cx},${my+14} ${cx+18},${my-3}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    case "laughing":
      return `<path d="M ${cx-19},${my-4} Q ${cx},${my+20} ${cx+19},${my-4} Z" fill="${STROKE}"/>`
           + `<path d="M ${cx-12},${my+6} Q ${cx},${my+15} ${cx+12},${my+6} Z" fill="#ff7a93"/>`;
    case "surprised":
      return `<ellipse cx="${cx}" cy="${my+2}" rx="8" ry="10" fill="${STROKE}"/>`;
    case "sad":
    case "crying":
      return `<path d="M ${cx-13},${my+6} Q ${cx},${my-6} ${cx+13},${my+6}" stroke="${STROKE}" stroke-width="${SW}" fill="none" stroke-linecap="round"/>`;
    case "angry":
      return `<path d="M ${cx-13},${my+3} L ${cx-4},${my-2} L ${cx+4},${my+3} L ${cx+13},${my-2}" stroke="${STROKE}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    case "thinking":
      return `<line x1="${cx-6}" y1="${my+2}" x2="${cx+12}" y2="${my-1}" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round"/>`;
    case "scared":
      return `<path d="M ${cx-13},${my} q 6,-7 6.5,0 q 0.5,7 6.5,0 q 6,-7 6.5,0" stroke="${STROKE}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    default:
      return "";
  }
}

function cheeks(cx: number, cy: number, col = "#ff9db0"): string {
  return `<circle cx="${cx-34}" cy="${cy+10}" r="7" fill="${col}" opacity="0.55"/>`
       + `<circle cx="${cx+34}" cy="${cy+10}" r="7" fill="${col}" opacity="0.55"/>`;
}

export function faceSVG(expr: Expression, cx: number, cy: number): string {
  return eyes(expr, cx, cy) + mouth(expr, cx, cy);
}

const BODIES: Record<CharName, { face: [number,number]; cheek: [number,number]; svg: string }> = {
  Apple: {
    face: [110, 120], cheek: [110, 120],
    svg:
      `<path d="M110 60 C 70 50,40 80,42 130 C 44 185,80 210,110 210 C 140 210,176 185,178 130 C 180 80,150 50,110 60 Z" fill="#ff5a5f" stroke="${STROKE}" stroke-width="6"/>`
    + `<path d="M110 60 q 4 -22 -6 -30" stroke="#7a4a2b" stroke-width="7" fill="none" stroke-linecap="round"/>`
    + `<path d="M112 38 q 30 -18 40 4 q -28 14 -40 -4 Z" fill="#6dbe5a" stroke="#3f7a33" stroke-width="3"/>`,
  },
  Banana: {
    face: [112, 120], cheek: [112, 120],
    svg:
      `<path d="M60 70 C 40 120,70 195,150 200 C 185 202,196 185,188 178 C 130 188,86 150,92 78 C 92 66,70 56,60 70 Z" fill="#ffd23f" stroke="${STROKE}" stroke-width="6"/>`
    + `<circle cx="62" cy="70" r="6" fill="#5a3b1e"/>`,
  },
  Carrot: {
    face: [110, 116], cheek: [110, 116],
    svg:
      `<path d="M70 86 L150 86 L118 226 Q110 240 102 226 Z" fill="#ff8a3d" stroke="${STROKE}" stroke-width="6" stroke-linejoin="round"/>`
    + [0,1,2,3].map(i => `<line x1="${86+i*16}" y1="120" x2="${88+i*16}" y2="150" stroke="#e0702a" stroke-width="3"/>`).join("")
    + `<path d="M110 86 q -6 -34 -26 -40 q 6 26 18 40 Z" fill="#5cb85c" stroke="#3f7a33" stroke-width="3"/>`
    + `<path d="M110 86 q 0 -40 0 -46 q 10 30 8 46 Z" fill="#6ecb6e" stroke="#3f7a33" stroke-width="3"/>`
    + `<path d="M110 86 q 6 -34 26 -40 q -6 26 -18 40 Z" fill="#5cb85c" stroke="#3f7a33" stroke-width="3"/>`,
  },
  Mochi: {
    face: [110, 124], cheek: [110, 130],
    svg:
      `<ellipse cx="56" cy="96" rx="22" ry="34" fill="#c98a52" stroke="${STROKE}" stroke-width="6" transform="rotate(-18 56 96)"/>`
    + `<ellipse cx="164" cy="96" rx="22" ry="34" fill="#c98a52" stroke="${STROKE}" stroke-width="6" transform="rotate(18 164 96)"/>`
    + `<path d="M178 150 q 30 -6 26 -34 q -16 10 -18 26 Z" fill="#c98a52" stroke="${STROKE}" stroke-width="5"/>`
    + `<circle cx="110" cy="124" r="74" fill="#f2c896" stroke="${STROKE}" stroke-width="6"/>`
    + `<path d="M110 60 a74 74 0 0 1 60 40 a74 74 0 0 1 -60 18 Z" fill="#e0a96b" opacity="0.6"/>`
    + `<ellipse cx="110" cy="150" rx="30" ry="22" fill="#fff3e0" stroke="${STROKE}" stroke-width="4"/>`
    + `<ellipse cx="110" cy="140" rx="9" ry="6.5" fill="${STROKE}"/>`,
  },
};

export function characterSVG(name: CharName, expr: Expression): string {
  const b = BODIES[name];
  const cheekCol = name === "Mochi" ? "#ff8aa0" : "#ff9db0";
  return b.svg + cheeks(b.cheek[0], b.cheek[1], cheekCol) + faceSVG(expr, b.face[0], b.face[1]);
}
