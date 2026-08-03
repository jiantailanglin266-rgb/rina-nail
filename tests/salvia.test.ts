import { describe, expect, it } from "vitest";

import {
  buildSalviaConfigs,
  SECTION_DEFAULTS,
  type SalviaDensity,
  type SalviaSectionVariant,
} from "@/components/animations/salvia/salviaAnimationConfig";
import { salviaPalettes } from "@/components/animations/salvia/salviaColors";

const ALL = {
  showFlowers: true,
  showPetals: true,
  showBranches: true,
  showSparkles: true,
} as const;

function build(density: SalviaDensity, section: SalviaSectionVariant = "hero") {
  return buildSalviaConfigs({ density, section, colorMode: "mixed", ...ALL });
}

describe("サルビアの設定生成", () => {
  it("同じ引数からは必ず同じ結果を返す（Hydration Error 対策）", () => {
    // サーバーとクライアントで結果が一致しないと hydration mismatch になります
    expect(build("high")).toEqual(build("high"));
    expect(build("medium", "cta")).toEqual(build("medium", "cta"));
  });

  it("セクションが違えば配置も変わる", () => {
    const hero = build("medium", "hero");
    const cta = build("medium", "cta");
    expect(hero.map((c) => c.startX)).not.toEqual(cta.map((c) => c.startX));
  });

  it("密度が上がるほど表示数が増える", () => {
    expect(build("low").length).toBeLessThan(build("medium").length);
    expect(build("medium").length).toBeLessThan(build("high").length);
  });

  it("デスクトップの表示数が指定範囲に収まっている", () => {
    const configs = build("high");
    const count = (type: string) => configs.filter((c) => c.type === type).length;
    expect(count("flower")).toBeGreaterThanOrEqual(8);
    expect(count("flower")).toBeLessThanOrEqual(14);
    expect(count("petal")).toBeGreaterThanOrEqual(10);
    expect(count("petal")).toBeLessThanOrEqual(18);
    expect(count("branch")).toBeGreaterThanOrEqual(2);
    expect(count("branch")).toBeLessThanOrEqual(5);
    expect(count("sparkle")).toBeGreaterThanOrEqual(8);
    expect(count("sparkle")).toBeLessThanOrEqual(16);
  });

  it("モバイルで表示される数が指定範囲に収まっている", () => {
    const onMobile = build("high").filter((c) => c.hideAt === undefined);
    const count = (type: string) => onMobile.filter((c) => c.type === type).length;
    expect(count("flower")).toBeGreaterThanOrEqual(3);
    expect(count("flower")).toBeLessThanOrEqual(5);
    expect(count("petal")).toBeGreaterThanOrEqual(3);
    expect(count("petal")).toBeLessThanOrEqual(7);
    expect(count("branch")).toBeLessThanOrEqual(2);
    expect(count("sparkle")).toBeGreaterThanOrEqual(3);
    expect(count("sparkle")).toBeLessThanOrEqual(6);
  });

  it("穂と前景の花は画面端に寄せ、本文やCTAに重ねない", () => {
    for (const c of build("high")) {
      if (c.type === "branch" || c.layer === "front") {
        const nearEdge = c.startX < 16 || c.startX > 80;
        expect(nearEdge).toBe(true);
      }
    }
  });

  it("落下は低速（14〜54秒）で、高速回転もさせない", () => {
    for (const c of build("high")) {
      // 最短は前景レイヤーの花びら（速度係数 0.82）。
      // 画面を1回横切るのに14秒以上かかるため、「高速落下」にはなりません。
      expect(c.duration).toBeGreaterThanOrEqual(14);
      expect(c.duration).toBeLessThanOrEqual(54);
      // 回転は1周させず、角度差だけを付ける
      expect(Math.abs(c.rotationTo - c.rotationFrom)).toBeLessThan(60);
      expect(c.spinSpeed).toBeGreaterThanOrEqual(12);
    }
  });

  it("開始時点で既に降っている（負の遅延）", () => {
    for (const c of build("high")) {
      expect(c.delay).toBeLessThanOrEqual(0);
      expect(c.delay).toBeGreaterThanOrEqual(-c.duration);
    }
  });

  it("ぼかしは最小限に抑える", () => {
    for (const c of build("high")) {
      expect(c.blur).toBeLessThanOrEqual(1.5);
    }
  });

  it("動きを止めたときは2〜4個だけ静止表示として残す", () => {
    for (const density of ["low", "medium", "high"] as SalviaDensity[]) {
      const kept = build(density).filter((c) => !c.staticHidden);
      expect(kept.length).toBeGreaterThanOrEqual(2);
      expect(kept.length).toBeLessThanOrEqual(4);
    }
  });

  it("配色はピンク系が最多で、ゴールドは最少", () => {
    const configs = build("high").filter((c) => c.type !== "sparkle");
    const tally = (v: string) => configs.filter((c) => c.variant === v).length;
    expect(tally("pink")).toBeGreaterThan(tally("gold"));
    expect(tally("gold") / configs.length).toBeLessThanOrEqual(0.15);
  });

  it("光粒は必ずゴールド", () => {
    for (const c of build("high").filter((c) => c.type === "sparkle")) {
      expect(c.variant).toBe("gold");
    }
  });

  it("表示を絞ると該当する種類が生成されない", () => {
    const petalsOnly = buildSalviaConfigs({
      density: "low",
      section: "section",
      colorMode: "brand",
      showFlowers: false,
      showPetals: true,
      showBranches: false,
      showSparkles: false,
    });
    expect(petalsOnly.every((c) => c.type === "petal")).toBe(true);
  });
});

describe("セクション別の既定値", () => {
  it("ヒーローが最も高密度で、穂も表示する", () => {
    expect(SECTION_DEFAULTS.hero.density).toBe("high");
    expect(SECTION_DEFAULTS.hero.showBranches).toBe(true);
  });

  it("すべてのセクションに既定値がある", () => {
    for (const key of ["hero", "section", "gallery", "owner", "cta"] as SalviaSectionVariant[]) {
      expect(SECTION_DEFAULTS[key]).toBeDefined();
    }
  });
});

describe("カラーバリエーション", () => {
  it("5系統すべてに白い縁とゴールドが定義されている", () => {
    for (const palette of Object.values(salviaPalettes)) {
      // カラフルな背景に埋もれないための白い縁
      expect(palette.rim).toMatch(/rgb/);
      expect(palette.gold).toMatch(/^#/);
    }
  });
});
