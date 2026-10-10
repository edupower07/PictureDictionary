/**
 * 縦型リール2本(絵カード無料配布 / ポータル紹介)のテーマ。
 * 色はポータル(index.html / cards.html)の実際のCSS変数に合わせている。
 */
import type { Fonts } from "./theme.schema";

export const C = {
  bg: "#f0f4f8",
  ink: "#2d3436",
  sub: "#7f8c9b",
  purple: "#a29bfe",
  purpleDeep: "#6c5ce7",
  teal: "#00cec9",
  yellow: "#fdcb6e",
  red: "#ff7675",
  green: "#55efc4",
  blue: "#74b9ff",

  // テロップの帯・締めの背景
  deep: "#221f3a",
  deepSoft: "rgba(26,23,48,.9)",
  // フォローボタン(Instagramの青に寄せた CTA 色)
  follow: "#0095f6",
} as const;

/** 学年ごとの色(ポータルの学年見出しと同じ並び) */
export const GRADE_COLOR: Record<string, string> = {
  "3年生": "#f9a825",
  "4年生": "#20bf6b",
  "5年生": "#eb4d4b",
  "6年生": "#4a69bd",
};

/** ポータルと同じ書体で通す(動画がサイトの続きに見える) */
export const F: Fonts = {
  display: { family: '"M PLUS Rounded 1c", sans-serif', weights: [700, 800] },
  latin: { family: '"Fredoka One", cursive', weights: [400] },
};

export const V = { fps: 30, width: 1080, height: 1920 } as const;

export const s = (sec: number) => Math.round(sec * V.fps);

/** スクショは幅390pxのビューポートを dsf=3 で撮影。CSSピクセル→動画ピクセルは 1080/390 倍 */
export const K = V.width / 390;

/**
 * Instagram リールの UI と重ならない範囲。
 * 上 ~220px はヘッダー、下 ~420px はキャプションと音源表示、右端 ~140px はいいね等のボタン。
 * 読ませる文字は TEXT_TOP〜TEXT_BOTTOM、x は 60〜940 の中に置く。
 */
export const SAFE = { TEXT_TOP: 250, TEXT_BOTTOM: 1450, BAND: 620 } as const;

/** 絵カード無料配布リール(30秒)のカット割り(秒) */
export const CUTS_CARDS = {
  hook: [0.0, 3.0],
  portal: [3.0, 6.0],
  step1: [6.0, 10.0],
  step2: [10.0, 13.6],
  step3: [13.6, 17.8],
  step4: [17.8, 22.0],
  zip: [22.0, 25.4],
  close: [25.4, 30.0],
} as const;

/** ポータル紹介リール(32秒)のカット割り(秒) */
export const CUTS_PORTAL = {
  hook: [0.0, 3.2],
  portal: [3.2, 6.6],
  grades: [6.6, 11.0],
  play: [11.0, 19.4],
  pair: [19.4, 23.0],
  cards: [23.0, 26.6],
  close: [26.6, 32.0],
} as const;

/** Picture Dictionary 紹介リール(32秒)のカット割り(秒) */
export const CUTS_PD = {
  hook: [0.0, 3.0],
  grade: [3.0, 6.2],
  study: [6.2, 9.8],
  rec: [9.8, 13.0],
  quiz: [13.0, 16.4],
  games: [16.4, 23.6],
  speech: [23.6, 27.0],
  close: [27.0, 32.0],
} as const;

/** BGM のインパクト(フックの着地)。bgm.py の第3引数とそろえる */
export const IMPACT = 1.35;
