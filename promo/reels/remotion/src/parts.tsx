import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, F, K, SAFE, V } from "./theme";
import { cl, easeBack, easeOut, lerp, makeRnd, pulse } from "./lib";

export type Box = { x: number; y: number; w: number; h: number };

/* ------------------------------------------------------------------ *
 * 実画面のスクリーンショットを敷く部品(縦型・全面)
 *
 * スクショは幅390pxを dsf=3 で撮ってあり、幅1080で表示する。
 * scrollCss を負にすると画像が下にずれ、上にテロップ用の余白ができる。
 * children はビューポート基準のCSS座標で置く(ズームに追従する)。
 * ------------------------------------------------------------------ */
export const Shot: React.FC<{
  src: string;
  scrollCss?: number;
  zoom?: number;
  originCss?: { x: number; y: number };
  blurPx?: number;
  dim?: number;
  /** 全体を縦にずらす(動画ピクセル)。下の UI に隠れる要素を持ち上げるときに使う */
  dy?: number;
  bg?: string;
  children?: React.ReactNode;
}> = ({ src, scrollCss = 0, zoom = 1, originCss, blurPx = 0, dim = 0, dy = 0, bg = C.bg, children }) => {
  const ox = (originCss?.x ?? 195) * K;
  const oy = (originCss?.y ?? 347) * K;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: bg }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: dy,
          width: V.width,
          height: V.height,
          transform: `scale(${zoom})`,
          transformOrigin: `${ox}px ${oy}px`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            left: 0,
            top: -scrollCss * K,
            width: V.width,
            display: "block",
            filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
          }}
        />
        {children}
      </div>
      {dim > 0 && <AbsoluteFill style={{ background: C.deep, opacity: dim }} />}
    </AbsoluteFill>
  );
};

/** スマホの枠に入れて見せる(アプリの画面用) */
export const Phone: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  scale?: number;
  opacity?: number;
  /** 画面を上にずらす量(CSSピクセル)。枠の下にはみ出す要素を見せたいとき */
  offsetCss?: number;
  children?: React.ReactNode;
}> = ({ src, x, y, w, h, rot = 0, scale = 1, opacity = 1, offsetCss = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 56,
      border: `14px solid ${C.deep}`,
      background: "#fff",
      overflow: "hidden",
      boxShadow: "0 40px 90px rgba(0,0,0,.45)",
      transform: `rotate(${rot}deg) scale(${scale})`,
      opacity,
    }}
  >
    <Img
      src={staticFile(src)}
      style={{ width: "100%", display: "block", marginTop: -offsetCss * ((w - 28) / 390) }}
    />
    {children}
  </div>
);

/** タップの輪。CSS座標で置くと、ズームにくっついて動く */
export const TapRing: React.FC<{ xCss: number; yCss: number; t: number; color?: string; px?: boolean }> = ({
  xCss,
  yCss,
  t,
  color = C.red,
  px = false,
}) => {
  if (t < 0) return null;
  const rings = [0, 0.42].map((d) => {
    const p = cl((t - d) / 0.75);
    return { r: lerp(26, 130, easeOut(p)), o: (1 - p) * 0.9 };
  });
  const dot = easeBack(cl(t / 0.28));
  const k = px ? 1 : K;
  return (
    <div style={{ position: "absolute", left: xCss * k, top: yCss * k }}>
      {rings.map((r, i) =>
        r.o <= 0 ? null : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -r.r,
              top: -r.r,
              width: r.r * 2,
              height: r.r * 2,
              borderRadius: "50%",
              border: `${9 - i * 2}px solid ${color}`,
              opacity: r.o,
            }}
          />
        )
      )}
      <div
        style={{
          position: "absolute",
          left: -28 * dot,
          top: -28 * dot,
          width: 56 * dot,
          height: 56 * dot,
          borderRadius: "50%",
          background: color,
          border: "6px solid #fff",
          boxShadow: "0 6px 20px rgba(0,0,0,.35)",
          opacity: cl(1 - (t - 1.5) / 0.4),
        }}
      />
    </div>
  );
};

/** 対象を四角く囲んで目立たせる(リンクやボタン向け) */
export const Highlight: React.FC<{ box: Box; t: number; color?: string; padCss?: number }> = ({
  box,
  t,
  color = C.red,
  padCss = 6,
}) => {
  if (t < 0) return null;
  const p = easeBack(cl(t / 0.42));
  const blink = 0.72 + 0.28 * Math.sin(t * 7.5);
  return (
    <div
      style={{
        position: "absolute",
        left: (box.x - padCss) * K,
        top: (box.y - padCss) * K,
        width: (box.w + padCss * 2) * K,
        height: (box.h + padCss * 2) * K,
        border: `8px solid ${color}`,
        borderRadius: 22,
        opacity: p * blink,
        transform: `scale(${lerp(1.35, 1, p)})`,
        boxShadow: "0 0 0 6px rgba(255,255,255,.6)",
      }}
    />
  );
};

/* ------------------------------------------------------------------ *
 * 上テロップ
 * 縦型では下に Instagram のキャプションが重なるので、読ませる文字は上に置く。
 * 上から濃い帯を敷き、その上にラベル(STEP など)+本文+補足を中央ぞろえで出す。
 * ------------------------------------------------------------------ */
export const TopTelop: React.FC<{
  t: number;
  from: number;
  to: number;
  pill?: string;
  pillColor?: string;
  main: string;
  sub?: string;
  /** 帯を出さない(背景がすでに暗いカット用) */
  noBand?: boolean;
  mainSize?: number;
  top?: number;
}> = ({ t, from, to, pill, pillColor = C.teal, main, sub, noBand = false, mainSize = 78, top = SAFE.TEXT_TOP }) => {
  const p = pulse(t, from, to, 0.22, 0.2);
  const band = pulse(t, from - 0.05, to + 0.3, 0.15, 0.2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {!noBand && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: SAFE.BAND + 120,
            opacity: band,
            background: `linear-gradient(to bottom, ${C.deepSoft} 0%, rgba(26,23,48,.88) 74%, rgba(26,23,48,0) 100%)`,
          }}
        />
      )}
      {p > 0 && (
        <div
          style={{
            position: "absolute",
            left: 60,
            right: 60,
            top,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: p,
            transform: `translateY(${lerp(-34, 0, easeOut(p))}px)`,
          }}
        >
          {pill && (
            <div
              style={{
                background: pillColor,
                color: "#fff",
                fontFamily: F.display.family,
                fontWeight: 800,
                fontSize: 40,
                padding: "8px 30px",
                borderRadius: 999,
                marginBottom: 18,
                boxShadow: "0 8px 20px rgba(0,0,0,.3)",
                transform: `scale(${lerp(0.7, 1, easeBack(cl((t - from) / 0.3)))})`,
              }}
            >
              {pill}
            </div>
          )}
          <div
            style={{
              fontFamily: F.display.family,
              fontWeight: 800,
              fontSize: mainSize,
              lineHeight: 1.22,
              color: "#fff",
              textAlign: "center",
              whiteSpace: "pre-line",
              textShadow: "0 4px 18px rgba(0,0,0,.5)",
            }}
          >
            {main}
          </div>
          {sub && (
            <div
              style={{
                marginTop: 14,
                fontFamily: F.display.family,
                fontWeight: 700,
                fontSize: 38,
                lineHeight: 1.4,
                color: "#ffffffd9",
                textAlign: "center",
                whiteSpace: "pre-line",
                opacity: pulse(t, from + 0.18, to, 0.25, 0.2),
              }}
            >
              {sub}
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** 小さいチップ(枚数カウンタ・ヒット件数など) */
export const Chip: React.FC<{
  t: number;
  from: number;
  to: number;
  text: string;
  bg?: string;
  top: number;
  left?: number;
  right?: number;
  rot?: number;
  color?: string;
  size?: number;
}> = ({ t, from, to, text, bg = C.purpleDeep, top, left, right, rot = 0, color = "#fff", size = 44 }) => {
  const p = pulse(t, from, to, 0.3, 0.22);
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        right,
        background: bg,
        color,
        fontFamily: F.display.family,
        fontWeight: 800,
        fontSize: size,
        padding: "16px 34px",
        borderRadius: 999,
        boxShadow: "0 12px 28px rgba(0,0,0,.3)",
        opacity: p,
        transform: `rotate(${rot}deg) scale(${lerp(0.7, 1, easeBack(p))})`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * 敷き詰めの壁(フックと締め)
 * 絵カードやアプリ画面が上から降ってきて、画面いっぱいに敷き詰まる。
 * ------------------------------------------------------------------ */
export const Wall: React.FC<{
  files: string[];
  dir: string;
  cols: number;
  rows: number;
  t: number;
  fall?: boolean;
  blurPx?: number;
  bg?: string;
  fit?: "contain" | "cover";
  gap?: number;
  radius?: number;
}> = ({ files, dir, cols, rows, t, fall = true, blurPx = 0, bg = C.purple, fit = "contain", gap = 14, radius = 20 }) => {
  const cw = (V.width - gap * (cols + 1)) / cols;
  const ch = (V.height - gap * (rows + 1)) / rows;
  const items: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const file = files[i % files.length];
      // 落ちる順番をばらけさせる(列ごとにずらし、下の行ほど少し遅く)
      const delay = fall ? 0.05 * ((c * 5 + r * 3) % 11) + r * 0.04 : -1;
      const p = fall ? easeOut(cl((t - delay) / 0.55)) : 1;
      const y = gap + r * (ch + gap) + (1 - p) * -1300;
      const rot = fall ? (1 - p) * (c % 2 === 0 ? -14 : 12) : 0;
      items.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: gap + c * (cw + gap),
            top: y,
            width: cw,
            height: ch,
            background: "#fff",
            borderRadius: radius,
            boxShadow: "0 8px 20px rgba(20,18,50,.22)",
            transform: `rotate(${rot}deg)`,
            overflow: "hidden",
            opacity: p > 0 ? 1 : 0,
          }}
        >
          <Img
            src={staticFile(`${dir}/${file}`)}
            style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: "50% 0%" }}
          />
        </div>
      );
    }
  }
  return (
    <AbsoluteFill style={{ background: bg, filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined }}>
      {items}
    </AbsoluteFill>
  );
};

/** 白フラッシュ */
export const Flash: React.FC<{ v: number }> = ({ v }) =>
  v <= 0 ? null : <AbsoluteFill style={{ background: "#fff", opacity: cl(v) }} />;

/** 画面シェイクの量(着地の瞬間から減衰) */
export const shakeAt = (t: number, impact: number) => {
  const k = cl(1 - (t - impact) / 0.55);
  const a = t > impact ? k * k : 0;
  return `translate(${Math.sin(t * 95) * 26 * a}px, ${Math.cos(t * 78) * 19 * a}px)`;
};

/** 紙吹雪(締めの「フォロー」タップに合わせて) */
export const Confetti: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  if (t < 0 || t > 1.6) return null;
  const rnd = makeRnd(7);
  const colors = [C.yellow, C.teal, C.red, C.purple, C.green, C.blue];
  const parts = Array.from({ length: 34 }, (_, i) => {
    const ang = rnd() * Math.PI * 2;
    const sp = 420 + rnd() * 520;
    return { ang, sp, rot: rnd() * 720, c: colors[i % colors.length], w: 14 + rnd() * 12 };
  });
  return (
    <>
      {parts.map((q, i) => {
        const px = x + Math.cos(q.ang) * q.sp * t;
        const py = y + Math.sin(q.ang) * q.sp * t + 900 * t * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: q.w,
              height: q.w * 0.55,
              background: q.c,
              borderRadius: 3,
              transform: `rotate(${q.rot * t}deg)`,
              opacity: cl(1 - (t - 1.0) / 0.6),
            }}
          />
        );
      })}
    </>
  );
};

/* ------------------------------------------------------------------ *
 * 締めのエンドカード(2本で共通)
 *   FollowEnd  … フォローをうながす+ポータルの URL(最初の版)
 *   CommentEnd … URL は出さず「フォロー+キーワードをコメント → DMでリンク」(コメント配布版)
 * どちらもプロフィール風のカードの「フォロー」が押されて「フォロー中」に変わる。
 * ------------------------------------------------------------------ */

/** エンドカードで使う文字(フォントの読み込み待ちに足す) */
export const END_SAMPLE =
  "小学校の先生向けに無料の授業アプリ・教材をシェアしていますフォロー中全力先生保存しておくと授業準備のときすぐ見返せます" +
  "ポータルはプロフィールのリンクから次の外国語の授業で使ってみてね配布リンクほしい人へ欲しい方はコメントに" +
  "と書くとDMで届きますこの投稿にコメントを追加送信さんがあなたのリンクはこちら絵カード枚アプリ本①②③📩💬🎁🔖";

/** プロフィール風カード。tap 秒に「フォロー」が押される */
const ProfileCard: React.FC<{ t: number; top: number; tap: number; appear: number; scale?: number }> = ({
  t,
  top,
  tap,
  appear,
  scale = 1,
}) => {
  const b = pulse(t, appear, 99, 0.3, 0.01);
  const followed = t > tap + 0.12;
  const press = t > tap && t < tap + 0.18 ? 0.92 : 1;
  const btn = { x: 650, y: top + 78 * scale, w: 240, h: 92 * scale };
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 90,
          top,
          width: 900,
          height: 248 * scale,
          background: "#fff",
          borderRadius: 40,
          boxShadow: "0 24px 60px rgba(0,0,0,.4)",
          opacity: b,
          transform: `scale(${lerp(0.85, 1, easeBack(b))})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 44 * scale,
            width: 160 * scale,
            height: 160 * scale,
            borderRadius: "50%",
            padding: 6,
            background: "linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "6px solid #fff",
              background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDeep})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: F.display.family,
              fontWeight: 800,
              fontSize: 72 * scale,
              color: "#fff",
              boxSizing: "border-box",
            }}
          >
            全
          </div>
        </div>
        <div style={{ position: "absolute", left: 40 + 196 * scale, top: 62 * scale }}>
          <div style={{ fontFamily: F.display.family, fontWeight: 800, fontSize: 50 * scale, color: C.ink }}>
            全力先生
          </div>
          <div style={{ fontFamily: F.latin.family, fontSize: 40 * scale, color: C.sub, marginTop: 6 }}>@edupower07</div>
        </div>
        <div
          style={{
            position: "absolute",
            left: btn.x - 90,
            top: btn.y - top,
            width: btn.w,
            height: btn.h,
            borderRadius: 22,
            background: followed ? "#efefef" : C.follow,
            color: followed ? C.ink : "#fff",
            fontFamily: F.display.family,
            fontWeight: 800,
            fontSize: followed ? 38 : 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${press})`,
          }}
        >
          {followed ? "フォロー中 ✓" : "フォロー"}
        </div>
      </div>
      <TapRing xCss={btn.x + btn.w / 2} yCss={btn.y + btn.h / 2} t={t - tap + 0.25} color={C.yellow} px />
      <Confetti t={t - tap - 0.1} x={btn.x + btn.w / 2} y={btn.y + btn.h / 2} />
    </>
  );
};

/** 上に載せる見出し(2〜3行) */
const Lead: React.FC<{ t: number; text: string; top: number; size?: number }> = ({ t, text, top, size = 66 }) => {
  const a = pulse(t, 0.12, 99, 0.3, 0.01);
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top,
        textAlign: "center",
        fontFamily: F.display.family,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.3,
        color: "#fff",
        whiteSpace: "pre-line",
        opacity: a,
        transform: `translateY(${lerp(30, 0, easeOut(a))}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const FollowEnd: React.FC<{
  t: number;
  lead: string;
  bgLayer: React.ReactNode;
  save: string;
  linkLabel?: string;
  linkUrl?: string;
}> = ({
  t,
  lead,
  bgLayer,
  save,
  linkLabel = "ポータルは プロフィールのリンクから",
  linkUrl = "edupower07.github.io/Englishapp",
}) => {
  const c = pulse(t, 2.1, 99, 0.3, 0.01);
  const d = pulse(t, 2.5, 99, 0.3, 0.01);
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {bgLayer}
      <AbsoluteFill style={{ background: C.deep, opacity: 0.84 }} />
      <Lead t={t} text={lead} top={330} />
      <ProfileCard t={t} top={760} tap={1.45} appear={0.45} />
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1080,
          textAlign: "center",
          opacity: c,
          transform: `scale(${lerp(0.85, 1, easeBack(c))})`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            background: C.yellow,
            color: C.deep,
            fontFamily: F.display.family,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: 1.35,
            padding: "18px 38px",
            borderRadius: 28,
            whiteSpace: "pre-line",
          }}
        >
          {save}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          top: 1330,
          textAlign: "center",
          fontFamily: F.display.family,
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1.6,
          color: "#ffffffcc",
          opacity: d,
        }}
      >
        {linkLabel}
        <br />
        <span style={{ fontFamily: F.latin.family, fontSize: 36 }}>{linkUrl}</span>
      </div>
    </AbsoluteFill>
  );
};

/** ステップ番号つきの小見出し */
const StepLabel: React.FC<{ t: number; at: number; top: number; n: string; text: React.ReactNode }> = ({
  t,
  at,
  top,
  n,
  text,
}) => {
  const p = pulse(t, at, 99, 0.25, 0.01);
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 90,
        top,
        display: "flex",
        alignItems: "center",
        gap: 18,
        opacity: p,
        transform: `translateX(${lerp(-40, 0, easeOut(p))}px)`,
      }}
    >
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: C.yellow,
          color: C.deep,
          fontFamily: F.display.family,
          fontWeight: 800,
          fontSize: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {n}
      </span>
      <span style={{ fontFamily: F.display.family, fontWeight: 800, fontSize: 50, color: "#fff" }}>{text}</span>
    </div>
  );
};

/**
 * コメント配布版のエンドカード。URL は出さず、
 *   ① フォロー → ② キーワードをコメント → ③ DMでリンクが届く
 * の3ステップを、Instagram の画面に似せた部品で見せる。
 */
export const CommentEnd: React.FC<{
  t: number;
  /** 見出し(何がもらえるか) */
  lead: string;
  /** コメントしてもらう言葉 */
  keyword: string;
  /** DM の1行目に出す文言 */
  dm: string;
  bgLayer: React.ReactNode;
}> = ({ t, lead, keyword, dm, bgLayer }) => {
  const s1 = 0.4; // ① フォロー
  const s2 = 1.65; // ② コメント
  const s3 = 2.75; // ③ DM
  // コメント欄に1文字ずつ入る
  const typeAt = s2 + 0.3;
  const shown = keyword.slice(0, Math.max(0, Math.min(keyword.length, Math.floor((t - typeAt) / 0.12) + 1)));
  const sent = t > typeAt + keyword.length * 0.12 + 0.25;
  const box = pulse(t, s2 + 0.05, 99, 0.25, 0.01);
  const dmP = pulse(t, s3 + 0.15, 99, 0.3, 0.01);
  const caret = Math.floor(t * 2.6) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: C.deep }}>
      {bgLayer}
      <AbsoluteFill style={{ background: C.deep, opacity: 0.86 }} />
      <Lead t={t} text={lead} top={262} size={62} />

      <StepLabel t={t} at={s1} top={470} n="①" text="フォローして" />
      <ProfileCard t={t} top={560} tap={s1 + 0.75} appear={s1 + 0.05} scale={0.82} />

      <StepLabel
        t={t}
        at={s2}
        top={810}
        n="②"
        text={
          <>
            「<span style={{ color: C.yellow }}>{keyword}</span>」とコメント
          </>
        }
      />
      {/* コメント入力欄(送信すると自分のコメントとして表示される) */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 900,
          width: 900,
          height: 128,
          background: "#fff",
          borderRadius: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          boxSizing: "border-box",
          gap: 20,
          opacity: box,
          transform: `scale(${lerp(0.9, 1, easeBack(box))})`,
          boxShadow: "0 18px 44px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#ffeaa7,#fab1a0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 46,
            flex: "none",
          }}
        >
          🧑‍🏫
        </div>
        <div style={{ flex: 1, fontFamily: F.display.family, fontWeight: 800, fontSize: 52, color: C.ink }}>
          {shown.length === 0 && !sent ? (
            <span style={{ color: "#b2bec3", fontWeight: 700, fontSize: 40 }}>コメントを追加…</span>
          ) : (
            <>
              {shown}
              {!sent && caret && (
                <span style={{ display: "inline-block", width: 4, height: 50, background: C.ink, marginLeft: 4, verticalAlign: "middle" }} />
              )}
            </>
          )}
        </div>
        <div
          style={{
            fontFamily: F.display.family,
            fontWeight: 800,
            fontSize: 40,
            color: sent ? "#fff" : C.follow,
            background: sent ? C.follow : "transparent",
            padding: "14px 28px",
            borderRadius: 999,
            flex: "none",
          }}
        >
          {sent ? "送信 ✓" : "送信"}
        </div>
      </div>
      {sent && <TapRing xCss={900} yCss={964} t={t - (typeAt + keyword.length * 0.12 + 0.25) + 0.2} color={C.yellow} px />}

      <StepLabel t={t} at={s3} top={1080} n="③" text="DMでリンクが届きます" />
      {/* DM の通知(上からすべり込む) */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 1170,
          width: 900,
          background: "#fff",
          borderRadius: 34,
          padding: "22px 30px",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: dmP,
          transform: `translateY(${lerp(-40, 0, easeOut(dmP))}px) scale(${lerp(0.92, 1, easeBack(dmP))})`,
          boxShadow: "0 18px 44px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDeep})`,
            color: "#fff",
            fontFamily: F.display.family,
            fontWeight: 800,
            fontSize: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
          }}
        >
          全
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F.display.family, fontWeight: 800, fontSize: 36, color: C.ink }}>
            全力先生 <span style={{ color: C.sub, fontWeight: 700, fontSize: 30 }}>・今</span>
          </div>
          <div style={{ fontFamily: F.display.family, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 4 }}>
            📩 {dm}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
