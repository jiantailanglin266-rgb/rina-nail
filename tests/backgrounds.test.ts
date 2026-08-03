import { describe, expect, it } from "vitest";

import {
  gradientPresets,
  intensityOrbLimit,
  intensityScale,
  type PresetName,
} from "@/components/backgrounds/gradientPresets";

const presetNames = Object.keys(gradientPresets) as PresetName[];
const decorated = presetNames.filter((name) => name !== "plain");

describe("グラデーションプリセット", () => {
  it.each(decorated)("%s は白基調を保つヴェールを持つ", (name) => {
    // ヴェールが無いと色が中央まで回り込み、本文の可読性が落ちます
    expect(gradientPresets[name].veil).toBeGreaterThan(0.5);
    expect(gradientPresets[name].veil).toBeLessThanOrEqual(1);
  });

  it("文章量の多いセクションほどヴェールが強い", () => {
    // FAQ・アクセスは文章中心、ヒーロー・CTAは装飾中心
    expect(gradientPresets.faq.veil).toBeGreaterThan(gradientPresets.hero.veil);
    expect(gradientPresets.access.veil).toBeGreaterThan(gradientPresets.cta.veil);
    expect(gradientPresets.menu.veil).toBeGreaterThan(gradientPresets.gallery.veil);
  });

  it("最も華やかなのはヒーローと予約CTA", () => {
    const orbCounts = Object.fromEntries(
      presetNames.map((name) => [name, gradientPresets[name].orbs.length]),
    );
    expect(orbCounts.hero).toBeGreaterThanOrEqual(orbCounts.menu);
    expect(orbCounts.cta).toBeGreaterThanOrEqual(orbCounts.faq);
    expect(gradientPresets.hero.rainbow).toBe(true);
    expect(gradientPresets.cta.rainbow).toBe(true);
  });

  it("セクションごとに異なる背景になっている", () => {
    const meshes = decorated.map((name) => gradientPresets[name].mesh);
    // 同じメッシュを使い回していないこと（全セクション同じ背景を禁止）
    expect(new Set(meshes).size).toBe(meshes.length);
  });

  it("アニメーションは20〜40秒の低速に収まっている", () => {
    for (const name of presetNames) {
      for (const orb of gradientPresets[name].orbs) {
        expect(orb.duration).toBeGreaterThanOrEqual(20);
        expect(orb.duration).toBeLessThanOrEqual(40);
      }
    }
  });

  it("オーブの不透明度が濃すぎない", () => {
    for (const name of presetNames) {
      for (const orb of gradientPresets[name].orbs) {
        // ベタ塗りにならないよう、単体では 0.6 を超えさせません
        expect(orb.opacity).toBeLessThanOrEqual(0.6);
      }
    }
  });

  it("モバイルで表示されるオーブは各プリセット4個以下", () => {
    for (const name of presetNames) {
      const onMobile = gradientPresets[name].orbs.filter((orb) => orb.hideAt === undefined);
      expect(onMobile.length).toBeLessThanOrEqual(4);
    }
  });

  it("ぼかしが過大になっていない", () => {
    for (const name of presetNames) {
      for (const orb of gradientPresets[name].orbs) {
        expect(orb.blur).toBeLessThanOrEqual(90);
      }
    }
  });
});

describe("強度（intensity）", () => {
  it("low < medium < high の順に強くなる", () => {
    expect(intensityScale.low).toBeLessThan(intensityScale.medium);
    expect(intensityScale.medium).toBeLessThan(intensityScale.high);
    expect(intensityOrbLimit.low).toBeLessThan(intensityOrbLimit.high);
  });

  it("high でもすべてのオーブが表示できる上限になっている", () => {
    const maxOrbs = Math.max(...presetNames.map((name) => gradientPresets[name].orbs.length));
    expect(intensityOrbLimit.high).toBeGreaterThanOrEqual(maxOrbs);
  });
});
