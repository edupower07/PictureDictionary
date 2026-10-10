/**
 * リール②「小学校外国語アプリポータル」紹介(縦型・32秒)
 *
 * フック(33本の壁)→ 入口 → 学年タブ → 遊んでいる画面7本 → 2人組の活動 → 絵カード → フォロー。
 * 「量(33本)」と「中身(実際に動く画面)」を両方見せて、続きをプロフィールで見たくなる構成にしている。
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { C, CUTS_PORTAL as CUTS, F, GRADE_COLOR, IMPACT, K, SAFE, V, s } from "./theme";
import { cl, easeBack, easeInOut, easeOut, lerp, pulse } from "./lib";
import { Box, Chip, CommentEnd, END_SAMPLE, Flash, FollowEnd, Phone, Shot, TopTelop, Wall, shakeAt } from "./parts";
import type { Cta } from "./ReelCards";
import { Fonts } from "./Fonts";
import { Soundtrack } from "./Soundtrack";
import man from "../public/manifest.json";

export const PORTAL_SEC = 32;

export const SAMPLE_PORTAL =
  "外国語の先生、これ知ってますか？小学校外国語アプリ本ぜんぶ無料登録なしインストール不要" +
  "ブラウザでひらくだけ対応個人情報は送信しない年生単元ごとにそろってるたとえばこんなアプリ" +
  "ペアで話したくなるしかけ入りは押したときだけ勝手にしゃべらない絵カード枚もダウンロード" +
  "ワークシート掲示物にそのまま先生向けに無料の授業アプリ教材をシェアしていますフォロー中全力先生保存" +
  "かるた神経衰弱天気服装コーディネート時計レストラン注文季節と行事すごろく食物連鎖クイズビルダー" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./@+✓🔖👀💬🔊✅";

type Tab = { tab: Box; nav: Box; head: Box; count: number };
const M = man as unknown as {
  portal_nav: Box;
  grade_tabs: Record<string, Tab>;
  play_apps: { file: string; grade: string; name: string }[];
  pair_apps: string[];
  wall: string[];
  app_count: number;
  card_total: number;
};

const APP_COUNT = M.app_count - 1; // 学年アプリ33本(+ Small Talk トレーナー)
const TOP_GAP = -(SAFE.BAND - 40) / K;
const wallFiles = M.wall.map((w) => w.replace(/^wall\//, ""));

const useSec = () => useCurrentFrame() / V.fps;

/* 0.0–3.2 フック:問いかけ → アプリ画面が降ってきて「33本 ぜんぶ無料」 */
const Hook: React.FC = () => {
  const t = useSec();
  const q = t < IMPACT ? cl(t / 0.12) : 0;
  const dim = lerp(0.25, 0.7, easeOut(cl((t - IMPACT) / 0.4)));
  const l1 = pulse(t, IMPACT + 0.04, 9, 0.2, 0.01);
  const l2 = pulse(t, IMPACT + 0.14, 9, 0.26, 0.01);
  const l3 = pulse(t, IMPACT + 0.5, 9, 0.24, 0.01);
  const l4 = pulse(t, IMPACT + 0.9, 9, 0.24, 0.01);
  const big = { fontFamily: F.display.family, fontWeight: 800, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.45)" };
  return (
    <AbsoluteFill style={{ background: C.purpleDeep, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: shakeAt(t, IMPACT) }}>
        <Wall files={wallFiles} dir="shots/wall" cols={6} rows={6} t={t - 0.1} bg={C.purpleDeep} fit="cover" gap={12} radius={18} />
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
            <div style={{ ...big, fontSize: 72 }}>外国語の先生、</div>
            <div style={{ ...big, fontSize: 88, color: C.yellow, marginTop: 10 }}>これ知ってますか？</div>
          </div>
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 420 }}>
        <div style={{ ...big, fontSize: 60, opacity: l1 }}>小学校外国語の アプリが</div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            opacity: l2,
            transform: `scale(${lerp(0.8, 1, easeBack(l2))})`,
          }}
        >
          <span style={{ ...big, fontSize: 250, color: C.yellow }}>{APP_COUNT}</span>
          <span style={{ ...big, fontSize: 130 }}>本</span>
        </div>
        <div
          style={{
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
          ぜんぶ無料・登録なし
        </div>
        <div style={{ ...big, marginTop: 34, fontSize: 46, opacity: l4 }}>3〜6年の 授業でそのまま使えます</div>
      </AbsoluteFill>

      <Flash v={t > IMPACT ? (1 - (t - IMPACT) / 0.42) * 0.95 : 0} />
    </AbsoluteFill>
  );
};

/* 3.2–6.6 入口:ブラウザでひらくだけ */
const Portal: React.FC = () => {
  const t = useSec();
  const zoom = lerp(1.08, 1, easeOut(cl(t / 0.8)));
  const feats = ["✅ インストール不要", "✅ Chromebook 対応", "✅ 個人情報は送信しない"];
  return (
    <AbsoluteFill>
      <Shot src="shots/portal_full.png" scrollCss={TOP_GAP} zoom={zoom} bg={C.deep} dim={0.35 * cl((t - 0.6) / 0.3)} />
      <TopTelop t={t} from={0.15} to={3.4} pill="小学校外国語アプリポータル" pillColor={C.purpleDeep} main={"ブラウザで\nひらくだけ"} />
      {feats.map((f, i) => (
        <Chip
          key={i}
          t={t}
          from={0.75 + i * 0.32}
          to={3.4}
          text={f}
          bg="#fff"
          color={C.ink}
          top={760 + i * 150}
          left={i % 2 === 0 ? 90 : 170}
          rot={i % 2 === 0 ? -2 : 2}
          size={50}
        />
      ))}
      <Flash v={(1 - t / 0.16) * 0.55} />
    </AbsoluteFill>
  );
};

/* 6.6–11.0 学年タブ:3→4→5→6年をタップ */
const GRADES: [string, string][] = [
  ["g3", "3年生"],
  ["g4", "4年生"],
  ["g5", "5年生"],
  ["g6", "6年生"],
];
const Grades: React.FC = () => {
  const t = useSec();
  const per = 1.1;
  const i = Math.min(3, Math.floor(t / per));
  const lt = t - i * per;
  const [g, label] = GRADES[i];
  const tab = M.grade_tabs[g];
  // その学年の見出しが、テロップの帯のすぐ下に来るスクロール位置(そこから少し流す)
  const scroll = tab.head.y - (SAFE.BAND + 40) / K;
  const drift = lerp(0, 90, easeInOut(cl((lt - 0.2) / 0.9)));
  return (
    <AbsoluteFill>
      <Shot src={`shots/portal_${g}.png`} scrollCss={scroll + drift} bg={C.deep} />
      <TopTelop
        t={t}
        from={0.12}
        to={4.4}
        pill={`${label}  ${tab.count}本`}
        pillColor={GRADE_COLOR[label]}
        main={"3〜6年生\n単元ごとに そろってる"}
      />
      <Flash v={(1 - lt / 0.12) * 0.35} />
    </AbsoluteFill>
  );
};

/* 11.0–19.4 遊んでいる画面を7本、テンポよく */
const Play: React.FC = () => {
  const t = useSec();
  const per = 1.2;
  const n = M.play_apps.length;
  const i = Math.min(n - 1, Math.floor(t / per));
  const lt = t - i * per;
  const slide = easeOut(cl(lt / 0.24));
  const phone = { x: 105, y: 640, w: 870, h: 1240 };
  const cur = M.play_apps[i];
  const prev = i > 0 ? M.play_apps[i - 1] : null;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, ${C.purpleDeep} 100%)` }}>
      {prev && slide < 1 && (
        <Phone src={`shots/${prev.file}`} {...phone} x={phone.x - 1100 * slide} rot={-3 * slide} />
      )}
      <Phone src={`shots/${cur.file}`} {...phone} x={phone.x + (i > 0 ? 1100 * (1 - slide) : 0)} rot={i > 0 ? 3 * (1 - slide) : 0} />
      <TopTelop
        key={i}
        t={lt}
        from={0.02}
        to={per + 0.3}
        pill={cur.grade}
        pillColor={GRADE_COLOR[cur.grade]}
        main={cur.name}
        mainSize={cur.name.length > 12 ? 66 : 74}
        top={SAFE.TEXT_TOP + 50}
        noBand
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
          fontSize: 34,
          color: "#ffffffaa",
        }}
      >
        たとえば こんなアプリ（{i + 1}/{n}）
      </div>
    </AbsoluteFill>
  );
};

/* 19.4–23.0 2人組の活動 */
const Pair: React.FC = () => {
  const t = useSec();
  const a = easeOut(cl(t / 0.4));
  const b = easeOut(cl((t - 0.2) / 0.4));
  const w = 470;
  const h = Math.round(w * (694 / 390)) + 28;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.deep} 0%, ${C.purpleDeep} 100%)` }}>
      <Phone src={`shots/${M.pair_apps[0]}`} x={40} y={lerp(1900, 720, a)} w={w} h={h} rot={-4} />
      <Phone src={`shots/${M.pair_apps[1]}`} x={570} y={lerp(1900, 760, b)} w={w} h={h} rot={4} />
      <Chip t={t} from={0.9} to={3.6} text="👀 2人組のあてっこ" bg={C.yellow} color={C.deep} top={1230} left={40} rot={-4} size={42} />
      <Chip t={t} from={1.2} to={3.6} text="💬 Small Talk" bg={C.teal} top={1360} right={150} rot={4} size={42} />
      <TopTelop
        t={t}
        from={0.12}
        to={3.6}
        pill="ペア活動"
        pillColor={C.red}
        main={"子どもどうしで\n話したくなる しかけ"}
        sub="🔊は押したときだけ。アプリが勝手にしゃべらない"
        noBand
      />
    </AbsoluteFill>
  );
};

/* 23.0–26.6 絵カードライブラリ */
const Cards: React.FC = () => {
  const t = useSec();
  const scroll = lerp(TOP_GAP, 1400, easeInOut(cl((t - 0.3) / 3.1)));
  const n = Math.round(lerp(0, M.card_total, easeOut(cl((t - 0.3) / 1.3))));
  return (
    <AbsoluteFill>
      <Shot src="shots/library_top.png" scrollCss={scroll} bg={C.deep} />
      <TopTelop
        t={t}
        from={0.12}
        to={3.6}
        pill="おまけ"
        pillColor={C.purpleDeep}
        main={`絵カード${M.card_total}枚も\nダウンロードOK`}
        sub="ワークシートや掲示物に そのまま"
      />
      <Chip t={t} from={0.35} to={3.6} text={`${n} 枚`} bg={C.purpleDeep} top={SAFE.BAND + 30} left={70} size={52} />
      <Flash v={(1 - t / 0.14) * 0.6} />
    </AbsoluteFill>
  );
};

/* 26.6–32.0 締め:フォロー */
const Close: React.FC<{ cta: Cta }> = ({ cta }) => {
  const t = useSec();
  const out = cl((t - 5.05) / 0.35); // 最後に冒頭と同じ紫へ(ループのつなぎ)
  const bg = (
    <Wall files={wallFiles} dir="shots/wall" cols={6} rows={6} t={0} fall={false} blurPx={8} bg={C.purpleDeep} fit="cover" gap={12} radius={18} />
  );
  return (
    <AbsoluteFill>
      {cta === "comment" ? (
        <CommentEnd
          t={t}
          lead={`アプリ${APP_COUNT}本のリンク\nほしい人は…`}
          keyword="アプリ"
          dm="アプリのリンクはこちら！"
          bgLayer={bg}
        />
      ) : (
        <FollowEnd
          t={t}
          lead={"小学校の先生向けに\n無料の授業アプリ・教材を\nシェアしています"}
          save={"🔖 保存して\n次の外国語の授業で使ってみてね"}
          bgLayer={bg}
        />
      )}
      <Flash v={(1 - t / 0.16) * 0.7} />
      <AbsoluteFill style={{ background: C.purpleDeep, opacity: out }} />
    </AbsoluteFill>
  );
};

const cut = (name: keyof typeof CUTS) => {
  const [a, b] = CUTS[name];
  return { from: s(a), durationInFrames: s(b) - s(a) };
};

export const ReelPortal: React.FC<{ cta?: Cta }> = ({ cta = "url" }) => (
  <Fonts fonts={F} sampleText={SAMPLE_PORTAL + END_SAMPLE}>
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence {...cut("hook")}>
        <Hook />
      </Sequence>
      <Sequence {...cut("portal")}>
        <Portal />
      </Sequence>
      <Sequence {...cut("grades")}>
        <Grades />
      </Sequence>
      <Sequence {...cut("play")}>
        <Play />
      </Sequence>
      <Sequence {...cut("pair")}>
        <Pair />
      </Sequence>
      <Sequence {...cut("cards")}>
        <Cards />
      </Sequence>
      <Sequence {...cut("close")}>
        <Close cta={cta} />
      </Sequence>
      <Soundtrack bgmSrc="audio/bgm_portal.mp3" fps={V.fps} fadeInSec={0.05} />
    </AbsoluteFill>
  </Fonts>
);
