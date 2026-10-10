/**
 * リール①「外国語の絵カード862枚、ぜんぶ無料」(縦型・30秒)
 *
 * 8/16 投稿の横型CM(Englishapp/promo/cards_movie.mp4)と同じ流れ
 * (フック → ポータル → 手順①〜④ → ZIP → 締め)を、スマホ幅の実画面で撮り直して縦型にしたもの。
 * フォロワーを増やすために変えたところ:
 *   - 1コマ目から問いかけの文字を出す(無音・静止のサムネでも止まってもらう)
 *   - 文字はすべて上半分(Instagram のキャプションに隠れない位置)
 *   - 途中で「保存推奨」、最後は「フォロー」を押すエンドカード
 *   - 最後の白フラッシュから冒頭の紫につながるので、ループしても切れ目が目立たない
 */
import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, CUTS_CARDS as CUTS, F, IMPACT, K, SAFE, V, s } from "./theme";
import { cl, easeBack, easeInOut, easeOut, lerp, pulse } from "./lib";
import { Box, Chip, CommentEnd, END_SAMPLE, Flash, FollowEnd, Highlight, Shot, TapRing, TopTelop, Wall, shakeAt } from "./parts";
import { Fonts } from "./Fonts";
import { Soundtrack } from "./Soundtrack";
import man from "../public/manifest.json";

export const CARDS_SEC = 30;

export const SAMPLE =
  "外国語の絵カード、まだ手作りしてますか？小学校枚ぜんぶ無料でもらえますかんたんステップ解説" +
  "このポータルからアプリトップを下までスクロールライブラリをひらくタップずらり英語でけんさく曜日" +
  "ヒット長押し右クリック保存画像ダウンロード新しいタブで開くコピーまとめてならZIP一括" +
  "授業準備のときすぐ見返せます先生向けに無料の教材を毎日シェアしていますフォロー中全力先生" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./@①②③④✓🔖";

const M = man as unknown as {
  vh: number;
  portal_h: number;
  portal_btn: Box;
  lib_search: Box;
  lib_zip: Box;
  lib_scroll: number;
  lib_tap_card: Box;
  hook_cards: string[];
  search_term: string;
  tap_card: string;
  card_total: number;
};

const TOTAL = M.card_total; // 862
/** テロップの帯の下から画面を見せるためのスクロール位置(負=画像を下げる) */
const TOP_GAP = -(SAFE.BAND - 40) / K;
const PORTAL_MAX = M.portal_h - M.vh;
/** 「ライブラリをひらく」ボタンを画面の y=1000 あたりに持ってくるスクロール量 */
const BTN_SCROLL = Math.min(PORTAL_MAX, M.portal_btn.y + M.portal_btn.h / 2 - 1000 / K);
const BTN_VIEW: Box = { ...M.portal_btn, y: M.portal_btn.y - BTN_SCROLL };
const SEARCH_VIEW: Box = { ...M.lib_search, y: M.lib_search.y - M.lib_scroll };
const ZIP_VIEW: Box = { ...M.lib_zip, y: M.lib_zip.y - TOP_GAP };
const TAP = M.lib_tap_card;

const useSec = () => useCurrentFrame() / V.fps;

/* 0.0–3.0 フック:問いかけ → 絵カードが降って「862枚 ぜんぶ無料」 */
const Hook: React.FC = () => {
  const t = useSec();
  const q = t < IMPACT ? cl(t / 0.12) : 0; // 1コマ目から見える
  const dim = lerp(0.25, 0.66, easeOut(cl((t - IMPACT) / 0.4)));
  const l1 = pulse(t, IMPACT + 0.04, 9, 0.2, 0.01);
  const l2 = pulse(t, IMPACT + 0.14, 9, 0.26, 0.01);
  const l3 = pulse(t, IMPACT + 0.5, 9, 0.24, 0.01);
  const l4 = pulse(t, IMPACT + 0.95, 9, 0.24, 0.01);
  const big = { fontFamily: F.display.family, fontWeight: 800, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.45)" };
  return (
    <AbsoluteFill style={{ background: C.purple, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: shakeAt(t, IMPACT) }}>
        <Wall files={M.hook_cards} dir="cards" cols={4} rows={7} t={t - 0.1} />
        <AbsoluteFill style={{ background: C.deep, opacity: dim }} />
      </AbsoluteFill>

      {q > 0 && (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 520 }}>
          <div
            style={{
              background: C.deepSoft,
              borderRadius: 40,
              padding: "40px 54px",
              textAlign: "center",
              opacity: q,
              transform: `scale(${lerp(0.92, 1, q)})`,
              boxShadow: "0 20px 50px rgba(0,0,0,.35)",
            }}
          >
            <div style={{ ...big, fontSize: 70 }}>外国語の絵カード、</div>
            <div style={{ ...big, fontSize: 84, color: C.yellow, marginTop: 10 }}>まだ手作りしてますか？</div>
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 430 }}>
        <div style={{ ...big, fontSize: 58, opacity: l1, letterSpacing: "0.1em" }}>小学校の外国語</div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            opacity: l2,
            transform: `scale(${lerp(0.8, 1, easeBack(l2))})`,
            marginTop: 6,
          }}
        >
          <span style={{ ...big, fontSize: 116 }}>絵カード</span>
          <span style={{ ...big, fontSize: 200, color: C.yellow }}>{TOTAL}</span>
          <span style={{ ...big, fontSize: 100 }}>枚</span>
        </div>
        <div
          style={{
            marginTop: 20,
            background: C.teal,
            color: "#fff",
            fontFamily: F.display.family,
            fontWeight: 800,
            fontSize: 70,
            padding: "14px 54px",
            borderRadius: 999,
            opacity: l3,
            transform: `scale(${lerp(0.8, 1, easeBack(l3))})`,
            boxShadow: "0 12px 30px rgba(0,0,0,.3)",
          }}
        >
          ぜんぶ無料でもらえます
        </div>
        <div style={{ ...big, marginTop: 34, fontSize: 46, opacity: l4 }}>もらい方を 4ステップで ↓</div>
      </AbsoluteFill>

      <Flash v={t > IMPACT ? (1 - (t - IMPACT) / 0.42) * 0.95 : 0} />
    </AbsoluteFill>
  );
};

/* 3.0–6.0 ポータルの入口 */
const Portal: React.FC = () => {
  const t = useSec();
  const zoom = lerp(1.08, 1, easeOut(cl(t / 0.8)));
  return (
    <AbsoluteFill>
      <Shot src="shots/portal_full.png" scrollCss={TOP_GAP} zoom={zoom} bg={C.deep} />
      <TopTelop
        t={t}
        from={0.15}
        to={3.0}
        pill="小学校外国語アプリポータル"
        pillColor={C.purpleDeep}
        main={"このサイトから\nぜんぶ無料でもらえます"}
      />
      <Flash v={(1 - t / 0.16) * 0.55} />
    </AbsoluteFill>
  );
};

/* 6.0–10.0 手順① トップを下までスクロール → ライブラリをひらく */
const Step1: React.FC = () => {
  const t = useSec();
  const p = easeInOut(cl((t - 0.35) / 1.15));
  const scroll = lerp(TOP_GAP, BTN_SCROLL, p);
  const speed = Math.abs(p - easeInOut(cl((t - 0.35 - 1 / V.fps) / 1.15)));
  const blur = cl(speed * 90) * 8;
  const zoom = lerp(1, 1.45, easeOut(cl((t - 1.75) / 0.9)));
  const cx = BTN_VIEW.x + BTN_VIEW.w / 2;
  const cy = BTN_VIEW.y + BTN_VIEW.h / 2;
  return (
    <AbsoluteFill>
      <Shot src="shots/portal_full.png" scrollCss={scroll} zoom={zoom} originCss={{ x: cx, y: cy }} blurPx={blur} bg={C.deep}>
        <Highlight box={BTN_VIEW} t={t - 2.0} />
        <TapRing xCss={cx} yCss={cy} t={t - 2.7} />
      </Shot>
      <TopTelop t={t} from={0.1} to={1.95} pill="STEP ①" main={"トップページを\nいちばん下まで"} />
      <TopTelop t={t} from={2.05} to={4.0} pill="STEP ①" pillColor={C.red} main={"「ライブラリをひらく」\nをタップ"} />
    </AbsoluteFill>
  );
};

/* 10.0–13.6 手順② 絵カードがずらり */
const Step2: React.FC = () => {
  const t = useSec();
  const scroll = lerp(TOP_GAP, 1500, easeInOut(cl((t - 0.3) / 3.2)));
  const n = Math.round(lerp(0, TOTAL, easeOut(cl((t - 0.3) / 1.4))));
  return (
    <AbsoluteFill>
      <Shot src="shots/library_top.png" scrollCss={scroll} bg={C.deep} />
      <TopTelop
        t={t}
        from={0.12}
        to={3.6}
        pill="STEP ②"
        pillColor={C.purpleDeep}
        main={"絵カードが ずらり"}
        sub="Picture Dictionary の絵カード ぜんぶ"
      />
      <Chip t={t} from={0.35} to={3.6} text={`${n} 枚`} bg={C.purpleDeep} top={SAFE.BAND + 10} left={70} size={52} />
      <Chip t={t} from={1.3} to={3.6} text="🔖 保存推奨" bg={C.yellow} color={C.deep} top={SAFE.BAND + 14} right={80} rot={4} />
      <Flash v={(1 - t / 0.14) * 0.6} />
    </AbsoluteFill>
  );
};

/* 13.6–17.8 手順③ 英語でけんさく */
const TypeBox: React.FC<{ t: number; text: string }> = ({ t, text }) => {
  const shown = text.slice(0, Math.max(0, Math.floor((t - 0.5) / 0.26) + 1));
  const caret = Math.floor(t * 2.4) % 2 === 0;
  return (
    <div
      style={{
        position: "absolute",
        left: (SEARCH_VIEW.x + 3) * K,
        top: (SEARCH_VIEW.y + 3) * K,
        width: (SEARCH_VIEW.w - 6) * K,
        height: (SEARCH_VIEW.h - 6) * K,
        background: "#fff",
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        paddingLeft: 18 * K,
        boxSizing: "border-box",
      }}
    >
      <span style={{ fontFamily: F.display.family, fontWeight: 800, fontSize: 17 * K, color: C.ink }}>{shown}</span>
      {t > 0.25 && caret && (
        <span style={{ display: "inline-block", width: 3 * K, height: 22 * K, background: C.ink, marginLeft: 3 * K }} />
      )}
    </div>
  );
};

const Step3: React.FC = () => {
  const t = useSec();
  const typed = 0.5 + 0.26 * M.search_term.length + 0.25;
  const done = t >= typed;
  return (
    <AbsoluteFill>
      {done ? (
        <Shot src="shots/library_search.png" />
      ) : (
        <Shot src="shots/library_pre.png">
          <Highlight box={SEARCH_VIEW} t={t - 0.1} color={C.teal} padCss={4} />
          <TypeBox t={t} text={M.search_term} />
        </Shot>
      )}
      {done && <Flash v={(1 - (t - typed) / 0.18) * 0.5} />}
      <TopTelop t={t} from={0.12} to={typed} pill="STEP ③" main={"英語で けんさく"} sub={`「${M.search_term}」と入れると…`} />
      <TopTelop
        t={t}
        from={typed + 0.1}
        to={4.2}
        pill="STEP ③"
        pillColor={C.teal}
        main={"曜日カードが\nぜんぶ出た！"}
      />
    </AbsoluteFill>
  );
};

/* 17.8–22.0 手順④ タップ → 長押し(右クリック)で保存 */
const ContextMenu: React.FC<{ t: number }> = ({ t }) => {
  if (t < 0) return null;
  const p = easeBack(cl(t / 0.34));
  const rows = ["画像を新しいタブで開く", "画像をダウンロード", "画像をコピー"];
  const hot = t > 0.75;
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        top: 1080,
        width: 800,
        background: "#fff",
        borderRadius: 26,
        padding: "16px 0",
        boxShadow: "0 22px 50px rgba(0,0,0,.45)",
        transform: `scale(${lerp(0.8, 1, p)})`,
        transformOrigin: "20% 0%",
        opacity: cl(p),
      }}
    >
      {rows.map((r, i) => {
        const on = hot && i === 1;
        return (
          <div
            key={i}
            style={{
              padding: "22px 40px",
              fontFamily: F.display.family,
              fontWeight: on ? 800 : 700,
              fontSize: 44,
              color: on ? "#fff" : i === 1 ? C.ink : "#9aa3ad",
              background: on ? C.purpleDeep : "transparent",
            }}
          >
            {r}
          </div>
        );
      })}
    </div>
  );
};

const Step4: React.FC = () => {
  const t = useSec();
  // タップするカードは画面の下のほう(キャプションに隠れる位置)にあるので、画面ごと持ち上げる
  const lift = -380 * easeOut(cl(t / 0.35));
  const open = 1.0;
  const p = easeOut(cl((t - open) / 0.45));
  const cardCx = (TAP.x + TAP.w / 2) * K;
  const cardCy = (TAP.y + TAP.h / 2) * K + lift;
  const cx = lerp(cardCx, V.width / 2, p);
  const cy = lerp(cardCy, V.height / 2 + 60, p);
  const sc = lerp((TAP.w * K) / V.width, 1, p);
  const saved = t > 2.8;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Shot src="shots/library_search.png" dim={p * 0.5} dy={lift}>
        <TapRing xCss={TAP.x + TAP.w / 2} yCss={TAP.y + TAP.h / 2} t={t - 0.4} />
      </Shot>
      {t >= open && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: V.width,
            height: V.height,
            transform: `translate(${cx - V.width / 2}px, ${cy - V.height / 2}px) scale(${sc})`,
            borderRadius: lerp(30, 0, p),
            overflow: "hidden",
            background: "#000",
          }}
        >
          <Img src={staticFile("shots/card_big.png")} style={{ width: V.width, display: "block" }} />
        </div>
      )}
      <ContextMenu t={t - 1.8} />
      {saved && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: SAFE.BAND + 10,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              transform: `scale(${lerp(0.7, 1, easeBack(cl((t - 2.8) / 0.4)))})`,
              background: "#fff",
              borderRadius: 999,
              padding: "18px 44px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 16px 40px rgba(0,0,0,.4)",
              fontFamily: F.display.family,
              fontWeight: 800,
              fontSize: 44,
              color: C.ink,
            }}
          >
            <span style={{ color: C.teal, fontSize: 48 }}>✓</span>
            {M.tap_card}.jpg を保存しました
          </div>
        </div>
      )}
      <TopTelop t={t} from={0.12} to={1.6} pill="STEP ④" main={"カードをタップすると\n大きく開く"} />
      <TopTelop
        t={t}
        from={1.7}
        to={4.2}
        pill="STEP ④"
        pillColor={C.purpleDeep}
        main={"長押しで保存"}
        sub="パソコンなら 右クリック → 保存"
      />
    </AbsoluteFill>
  );
};

/* 22.0–25.4 まとめてなら ZIP */
const Zip: React.FC = () => {
  const t = useSec();
  const zoom = lerp(1, 1.5, easeOut(cl(t / 1.0)));
  const cx = ZIP_VIEW.x + ZIP_VIEW.w / 2;
  const cy = ZIP_VIEW.y + ZIP_VIEW.h / 2;
  return (
    <AbsoluteFill>
      <Shot src="shots/library_top.png" scrollCss={TOP_GAP} zoom={zoom} originCss={{ x: cx, y: cy }} bg={C.deep}>
        <Highlight box={ZIP_VIEW} t={t - 0.5} padCss={4} />
        <TapRing xCss={cx} yCss={cy} t={t - 1.1} />
      </Shot>
      <TopTelop
        t={t}
        from={0.12}
        to={3.4}
        pill="まとめて ほしいなら"
        pillColor={C.red}
        main={"ZIPで\n一括ダウンロード"}
        sub={`${TOTAL}枚が まるごと手に入ります`}
      />
      <Flash v={(1 - t / 0.14) * 0.6} />
    </AbsoluteFill>
  );
};

/** 締めの形: url = ポータルの URL を出す / comment = フォロー+コメントで DM 配布 */
export type Cta = "url" | "comment";

/* 25.4–30.0 締め:フォロー */
const Close: React.FC<{ cta: Cta }> = ({ cta }) => {
  const t = useSec();
  const out = cl((t - 4.25) / 0.35); // 最後に白→紫へ(冒頭につながる)
  const bg = <Wall files={M.hook_cards} dir="cards" cols={4} rows={7} t={0} fall={false} blurPx={8} />;
  return (
    <AbsoluteFill>
      {cta === "comment" ? (
        <CommentEnd
          t={t}
          lead={`絵カード${TOTAL}枚のリンク\nほしい人は…`}
          keyword="絵カード"
          dm="絵カードのリンクはこちら！"
          bgLayer={bg}
        />
      ) : (
        <FollowEnd
          t={t}
          lead={"小学校の先生向けに\n無料の授業アプリ・教材を\nシェアしています"}
          save={"🔖 保存しておくと\n授業準備のとき すぐ見返せます"}
          bgLayer={bg}
        />
      )}
      <Flash v={(1 - t / 0.16) * 0.7} />
      <AbsoluteFill style={{ background: C.purple, opacity: out }} />
    </AbsoluteFill>
  );
};

const cut = (name: keyof typeof CUTS) => {
  const [a, b] = CUTS[name];
  return { from: s(a), durationInFrames: s(b) - s(a) };
};

export const ReelCards: React.FC<{ cta?: Cta }> = ({ cta = "url" }) => (
  <Fonts fonts={F} sampleText={SAMPLE + END_SAMPLE}>
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence {...cut("hook")}>
        <Hook />
      </Sequence>
      <Sequence {...cut("portal")}>
        <Portal />
      </Sequence>
      <Sequence {...cut("step1")}>
        <Step1 />
      </Sequence>
      <Sequence {...cut("step2")}>
        <Step2 />
      </Sequence>
      <Sequence {...cut("step3")}>
        <Step3 />
      </Sequence>
      <Sequence {...cut("step4")}>
        <Step4 />
      </Sequence>
      <Sequence {...cut("zip")}>
        <Zip />
      </Sequence>
      <Sequence {...cut("close")}>
        <Close cta={cta} />
      </Sequence>
      <Soundtrack bgmSrc="audio/bgm_cards.mp3" fps={V.fps} fadeInSec={0.05} />
    </AbsoluteFill>
  </Fonts>
);
