import React from "react";
import { Composition } from "remotion";
import { V } from "./theme";
import { CARDS_SEC, ReelCards } from "./ReelCards";
import { PORTAL_SEC, ReelPortal } from "./ReelPortal";
import { PD_SEC, ReelPD } from "./ReelPD";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ReelCards"
      component={ReelCards}
      durationInFrames={CARDS_SEC * V.fps}
      fps={V.fps}
      width={V.width}
      height={V.height}
    />
    <Composition
      id="ReelPortal"
      component={ReelPortal}
      durationInFrames={PORTAL_SEC * V.fps}
      fps={V.fps}
      width={V.width}
      height={V.height}
    />
    {/* コメント配布版(締めに URL を出さず、フォロー+コメントで DM 配布) */}
    <Composition
      id="ReelCardsComment"
      component={ReelCards}
      durationInFrames={CARDS_SEC * V.fps}
      fps={V.fps}
      width={V.width}
      height={V.height}
      defaultProps={{ cta: "comment" as const }}
    />
    <Composition
      id="ReelPortalComment"
      component={ReelPortal}
      durationInFrames={PORTAL_SEC * V.fps}
      fps={V.fps}
      width={V.width}
      height={V.height}
      defaultProps={{ cta: "comment" as const }}
    />
    {/* リール③ Picture Dictionary 紹介(URL 版 / コメント配布版) */}
    <Composition
      id="ReelPD"
      component={ReelPD}
      durationInFrames={PD_SEC * V.fps}
      fps={V.fps}
      width={V.width}
      height={V.height}
    />
    <Composition
      id="ReelPDComment"
      component={ReelPD}
      durationInFrames={PD_SEC * V.fps}
      fps={V.fps}
      width={V.width}
      height={V.height}
      defaultProps={{ cta: "comment" as const }}
    />
  </>
);
