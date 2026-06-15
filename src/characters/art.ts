const STROKE = "#2f2a26";
const SW = 7;

const BODY_FILL: Record<string, string> = {
  Apple:  "#ff5a5f",
  Banana: "#ffd23f",
  Carrot: "#ff8a3d",
  Mochi:  "#f2c896",
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
      s += `<path d="M ${x},${ey+10} C ${x-17},${ey-8} ${x-2},${ey-16} ${x},${ey-4} C ${x+2},${ey-16} ${x+17},${ey-8} ${x},${ey+10} Z" fill="#ff4d6d"/>`;
  if (expr === "crying")
    for (const x of [L, R])
      s += `<path d="M ${x},${ey+12} q -7,14 0,16 q 7,-3 0,-16 Z" fill="#5bc8ff"/>`;
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
           + `<path d="M ${cx-17},${my+8} Q ${cx},${my+22} ${cx+17},${my+8} Z" fill="#ff7a93"/>`;
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

function cheeks(cx: number, cy: number, col = "#ff9db0"): string {
  return `<circle cx="${cx-34}" cy="${cy+10}" r="11" fill="${col}" opacity="0.65"/>`
       + `<circle cx="${cx+34}" cy="${cy+10}" r="11" fill="${col}" opacity="0.65"/>`;
}

export function faceSVG(expr: Expression, cx: number, cy: number): string {
  return eyebrows(expr, cx, cy) + eyes(expr, cx, cy) + mouth(expr, cx, cy);
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

export function characterSVG(name: CharName, expr: Expression, frame = 0): string {
  const b = BODIES[name];
  const cheekCol = name === "Mochi" ? "#ff8aa0" : "#ff9db0";
  return b.svg + cheeks(b.cheek[0], b.cheek[1], cheekCol)
       + faceSVG(expr, b.face[0], b.face[1])
       + blinkSVG(name, frame, b.face[0], b.face[1]);
}
