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
    case
