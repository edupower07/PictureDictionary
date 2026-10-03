import React from "react";
import { Composition } from "remotion";
import { V } from "./theme";
import { CARDS_SEC, ReelCards } from "./ReelCards";
import { PORTAL_SEC, ReelPortal } from "./ReelPortal";

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
  </>
);
