/**
 * リール③「Picture Dictionary(絵じてんアプリ)」紹介(縦型・32秒)
 *
 * フック(問いかけ→絵カードの壁)→ 学年をえらぶ → 学ぶ(発音・録音)→ 練習(クイズ)
 * → ゲーム4種 → My Speech → 締め。
 * アプリの画面はすべてスマホの枠に入れ、上のテロップで「何ができるか」を1カット1つずつ語る。
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { C, CUTS_PD as CUTS, F, IMPACT, SAFE, V, s } from "./theme";
import { cl, easeBack, easeOut, lerp, pulse } from "./lib";
import { Chip, CommentEnd, END_SAMPLE, Flash, FollowEnd, Phone, TapRing, TopTelop, Wall, shakeAt } from "./parts";
import { Fonts } from "./Fonts";
import { Soundtrack } from "./Soundtrack";
import type { Cta } from "./ReelCards";
import man from "../public/manifest.json";
import pd from "../public/shots/pd/manifest.json";

export const PD_SEC = 32;

const SAMPLE_PD =
  "英単語、どうやって覚えさせてますか？小学校外国語の絵じてんアプリぜんぶ無料登録なし年生学年をえらぶだけ" +
  "絵カード枚ぜんぶ音声つきタップで発音が聞けるゆっくり音声単語バンク学ぶじぶんの声を録音してお手本とくらべる" +
  "練習聞いてえらぶクイズ正解ゲームも種類スピードかるた神経衰弱人スペリングビンゴ英文をつくって発表の練習まで" +
  "はプロフィールのリンクからのリンクほしい人は保存しておくと授業でも家庭学習でも" +
  "Picture Dictionary My Speech ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./@+🔊🐢♥🎤✏️🎮";

const M = man as unknown as { hook_cards: string[]; card_total: number };
const STUDY = (pd as unknown as { study_cards: { x: number; y: number; w: number; h: number }[] }).study_cards;

/** アプリ画面を入れるスマホ枠(上にテロップ、下は Instagram のキャプションに少しかかってよい) */
const PHONE = { x: 105, y: 640, w: 870, h: 1260 };
const K_PHONE = (PHONE.w - 28) / 390;
const TEAL = "#00b8b3";

const useSec = () => useCurrentFrame() / V.fps;

/** アプリのロゴ(Picture は濃色、Dictionary はアプリの青緑) */
const Logo: React.FC<{ size: number; dark?: boolean }> = ({ size, dark = false }) => (
  <span style={{ fontFamily: F.latin.family, fontSize: size, letterSpacing: "0.01em" }}>
    <span style={{ color: dark ? C.ink : "#fff" }}>Picture</span>
    <span style={{ color: dark ? TEAL : "#55efc4" }}>Dictionary</span>
  </span>
);

/* 0.0–3.0 フック */
const Hook: React.FC = () => {
  const t = useSec();
  const q = t < IMPACT ? cl(t / 0.12) : 0;
  const dim = lerp(0.25, 0.68, easeOut(cl((t - IMPACT) / 0.4)));
  const l1 = pulse(t, IMPACT + 0.04, 9, 0.2, 0.01);
  const l2 = pulse(t, IMPACT + 0.14, 9, 0.26, 0.01);
  const l3 = pulse(t, IMPACT + 0.5, 9, 0.24, 0.01);
  const l4 = pulse(t, IMPACT + 0.9, 9, 0.24, 0.01);
  const big = { fontFamily: F.display.family, fontWeight: 800, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.45)" };
  return (
    <AbsoluteFill style={{ background: TEAL, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: shakeAt(t, IMPACT) }}>
        <Wall files={M.hook_cards} dir="cards" cols={4} rows={7} t={t - 0.1} bg={TEAL} />
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
            <div style={{ ...big, fontSize: 70 }}>英単語、どうやって</div>
            <div style={{ ...big, fontSize: 84, color: C.yellow, marginTop: 10 }}>覚えさせてますか？</div>
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 440 }}>
        <div style={{ ...big, fontSize: 60, opacity: l1 }}>小学校外国語の 絵じてんアプリ</div>
        <div
          style={{
            marginTop: 30,
            background: "#fff",
            borderRadius: 36,
            padding: "26px 46px",
            opacity: l2,
            transform: `scale(${lerp(0.8, 1, easeBack(l2))})`,
            boxShadow: "0 16px 40px rgba(0,0,0,.35)",
          }}
        >
          <Logo size={104} dark />
        </div>
        <div
          style={{
            marginTop: 34,
            background: C.red,
            color: "#fff",
            fontFamily: F.display.family,
            fontWeight: 800,
            fontSize: 66,
            padding: "14px 54px",
            borderRadius: 999,
            opacity: l3,
            transform: `scale(${lerp(0.8, 1, easeBack(l3))})`,
            boxShadow: "0 12px 30px rgba(0,0,0,.3)",
          }}
        >
          ぜんぶ無料・登録なし
        </div>
        <div style={{ ...big, marginTop: 30, fontSize: 46, opacity: l4 }}>3〜6年の英単語を、まるごと。</div>
      </AbsoluteFill>

      <Flash v={t > IMPACT ? (1 - (t - IMPACT) / 0.42) * 0.95 : 0} />
    </AbsoluteFill>
  );
};

/** スマホ枠のカットの共通部品(背景・すべり込み・テロップ) */
const PhoneCut: React.FC<{
  t: number;
  dur: number;
  src: string;
  pill: string;
  pillColor: string;
  main: string;
  sub?: string;
  offsetCss?: number;
  enter?: boolean;
  children?: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ t, dur, src, pill, pillColor, main, sub, offsetCss = 0, enter = true, children, overlay }) => {
  const p = enter ? easeOut(cl(t / 0.3)) : 1;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, #0f6e6b 100%)` }}>
      <Phone src={src} {...PHONE} y={PHONE.y + (1 - p) * 900} rot={(1 - p) * 4} offsetCss={offsetCss}>
        {children}
      </Phone>
      {overlay}
      <TopTelop t={t} from={0.05} to={dur + 0.3} pill={pill} pillColor={pillColor} main={main} sub={sub} noBand />
    </AbsoluteFill>
  );
};

/* 3.0–6.2 学年をえらぶ */
const Grade: React.FC = () => {
  const t = useSec();
  return (
    <PhoneCut
      t={t}
      dur={3.2}
      src="shots/pd/grade.png"
      pill="3〜6年生"
      pillColor={C.purpleDeep}
      main={"学年をえらぶだけ"}
      sub={`絵カード${M.card_total}枚・ぜんぶ音声つき`}
      overlay={
        <>
          <Chip t={t} from={0.8} to={3.2} text="🔊 音声つき" bg="#fff" color={C.ink} top={1240} left={60} rot={-4} size={46} />
          <Chip t={t} from={1.1} to={3.2} text="✏️ 4線つきUDフォント" bg={C.yellow} color={C.deep} top={1380} right={130} rot={3} size={42} />
        </>
      }
    />
  );
};

/* 6.2–9.8 学ぶ:タップで発音 */
const Study: React.FC = () => {
  const t = useSec();
  const c0 = STUDY[0];
  return (
    <PhoneCut
      t={t}
      dur={3.6}
      src="shots/pd/study.png"
      pill="学ぶ"
      pillColor={TEAL}
      main={"タップで\n発音が聞ける"}
      overlay={
        <>
          <TapRing
            xCss={PHONE.x + 14 + (c0.x + c0.w / 2) * K_PHONE}
            yCss={PHONE.y + 14 + (c0.y + c0.h / 2) * K_PHONE}
            t={t - 0.7}
            px
          />
          <Chip t={t} from={1.2} to={3.6} text="🐢 ゆっくり音声" bg="#fff" color={C.ink} top={1330} left={60} rot={-4} size={46} />
          <Chip t={t} from={1.5} to={3.6} text="♥ 単語バンクに登録" bg={C.red} top={1460} right={130} rot={3} size={42} />
        </>
      }
    />
  );
};

/* 9.8–13.0 学ぶ:録音して聞きくらべ */
const Rec: React.FC = () => {
  const t = useSec();
  return (
    <PhoneCut
      t={t}
      dur={3.2}
      src="shots/pd/rec.png"
      pill="🎤 発音練習"
      pillColor={C.red}
      main={"じぶんの声を録音して\nお手本とくらべる"}
      offsetCss={150}
    />
  );
};

/* 13.0–16.4 練習:クイズ(途中で正解の画面に切りかわる) */
const Quiz: React.FC = () => {
  const t = useSec();
  const ok = t > 1.7;
  return (
    <>
      <PhoneCut
        t={t}
        dur={3.4}
        src={ok ? "shots/pd/quiz_ok.png" : "shots/pd/quiz.png"}
        pill="練習"
        pillColor="#0984e3"
        main={"聞いてえらぶ\nクイズ"}
        sub="Easy(4たく)/ Hard(6たく)"
      />
      {ok && <Flash v={(1 - (t - 1.7) / 0.2) * 0.5} />}
    </>
  );
};

/* 16.4–23.6 ゲーム4種(1.8秒ずつ、横にすべって切りかわる) */
const GAMES = [
  { file: "shots/pd/karuta.png", name: "スピードかるた" },
  { file: "shots/pd/memory.png", name: "神経衰弱(2〜4人)" },
  { file: "shots/pd/spelling.png", name: "スペリング" },
  { file: "shots/pd/bingo.png", name: "ビンゴ" },
];
const Games: React.FC = () => {
  const t = useSec();
  const per = 1.8;
  const i = Math.min(GAMES.length - 1, Math.floor(t / per));
  const lt = t - i * per;
  const slide = easeOut(cl(lt / 0.24));
  const cur = GAMES[i];
  const prev = i > 0 ? GAMES[i - 1] : null;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, ${C.purpleDeep} 100%)` }}>
      {prev && slide < 1 && <Phone src={prev.file} {...PHONE} x={PHONE.x - 1100 * slide} rot={-3 * slide} />}
      <Phone
        src={cur.file}
        {...PHONE}
        x={PHONE.x + (i > 0 ? 1100 * (1 - slide) : 0)}
        y={i === 0 ? PHONE.y + (1 - easeOut(cl(lt / 0.3))) * 900 : PHONE.y}
        rot={i > 0 ? 3 * (1 - slide) : 0}
      />
      <div
        style={{
          position: "absolute",
          top: SAFE.TEXT_TOP - 10,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.display.family,
          fontWeight: 800,
          fontSize: 36,
          color: "#ffffffbb",
        }}
      >
        ゲームも4種類({i + 1}/4)
      </div>
      <TopTelop key={i} t={lt} from={0.02} to={per + 0.3} pill="🎮 ゲーム" pillColor={C.purpleDeep} main={cur.name} top={SAFE.TEXT_TOP + 50} noBand />
    </AbsoluteFill>
  );
};

/* 23.6–27.0 My Speech(文づくり → 発表モード) */
const Speech: React.FC = () => {
  const t = useSec();
  const present = t > 1.6;
  return (
    <>
      <PhoneCut
        t={t}
        dur={3.4}
        src={present ? "shots/pd/speech_present.png" : "shots/pd/speech_build.png"}
        pill="🎤 My Speech"
        pillColor={C.purpleDeep}
        main={"英文をつくって\n発表の練習まで"}
        offsetCss={present ? 0 : 120}
      />
      {present && <Flash v={(1 - (t - 1.6) / 0.2) * 0.45} />}
    </>
  );
};

/* 27.0–32.0 締め */
const Close: React.FC<{ cta: Cta }> = ({ cta }) => {
  const t = useSec();
  const out = cl((t - 4.65) / 0.35); // 冒頭の青緑へ(ループのつなぎ)
  const bg = <Wall files={M.hook_cards} dir="cards" cols={4} rows={7} t={0} fall={false} blurPx={8} bg={TEAL} />;
  return (
    <AbsoluteFill>
      {cta === "comment" ? (
        <CommentEnd
          t={t}
          lead={"Picture Dictionary の\nリンクほしい人は…"}
          keyword="絵じてん"
          dm="Picture Dictionary はこちら！"
          bgLayer={bg}
        />
      ) : (
        <FollowEnd
          t={t}
          lead={"小学校の先生向けに\n無料の授業アプリ・教材を\nシェアしています"}
          save={"🔖 保存しておくと\n授業でも家庭学習でも すぐ使えます"}
          linkLabel="Picture Dictionary は プロフィールのリンクから"
          linkUrl="edupower07.github.io/PictureDictionary"
          bgLayer={bg}
        />
      )}
      <Flash v={(1 - t / 0.16) * 0.7} />
      <AbsoluteFill style={{ background: TEAL, opacity: out }} />
    </AbsoluteFill>
  );
};

const cut = (name: keyof typeof CUTS) => {
  const [a, b] = CUTS[name];
  return { from: s(a), durationInFrames: s(b) - s(a) };
};

export const ReelPD: React.FC<{ cta?: Cta }> = ({ cta = "url" }) => (
  <Fonts fonts={F} sampleText={SAMPLE_PD + END_SAMPLE}>
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence {...cut("hook")}>
        <Hook />
      </Sequence>
      <Sequence {...cut("grade")}>
        <Grade />
      </Sequence>
      <Sequence {...cut("study")}>
        <Study />
      </Sequence>
      <Sequence {...cut("rec")}>
        <Rec />
      </Sequence>
      <Sequence {...cut("quiz")}>
        <Quiz />
      </Sequence>
      <Sequence {...cut("games")}>
        <Games />
      </Sequence>
      <Sequence {...cut("speech")}>
        <Speech />
      </Sequence>
      <Sequence {...cut("close")}>
        <Close cta={cta} />
      </Sequence>
      <Soundtrack bgmSrc="audio/bgm_pd.mp3" fps={V.fps} fadeInSec={0.05} />
    </AbsoluteFill>
  </Fonts>
);
