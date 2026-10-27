export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const C = {
  bg: "#16131C",
  band: "#1E1A26",
  stage: "#E9E6EE",
  text: "#FFFFFF",
  muted: "#A39BB0",
  odoo: "#714B67",
  accent: "#FF6B2C",
  ok: "#2FB37A",
};

export const FONT = "Inter, 'Noto Sans', system-ui, sans-serif";

// Normaliza palabras para comparar texto con los tiempos de la voz.
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

export type Word = { w: string; t: number };
export type Timing = Record<string, { text: string; dur: number; words: Word[] }>;

// Segundo en que se pronuncia `word` (primera aparición, o la siguiente a `after`).
export const wordTime = (words: Word[], word: string, after = 0) => {
  const n = norm(word);
  const hit = words.find((x) => x.t >= after && norm(x.w).startsWith(n));
  return hit?.t;
};

// Asigna a cada palabra del texto el momento en que se pronuncia.
export const tokenTimes = (text: string, words: Word[]) => {
  const tokens = text.split(/\s+/);
  let wi = 0;
  let last = 0;
  return tokens.map((tok) => {
    const n = norm(tok);
    if (n) {
      for (let k = wi; k < Math.min(words.length, wi + 3); k++) {
        if (norm(words[k].w) === n || norm(words[k].w).startsWith(n) || n.startsWith(norm(words[k].w))) {
          last = words[k].t;
          wi = k + 1;
          break;
        }
      }
    }
    return { tok, t: last };
  });
};
