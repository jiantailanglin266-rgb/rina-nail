/**
 * セクション別の背景グラデーション設定。
 *
 * 色・不透明度・ぼかし・オーブ数はすべてここで一元管理します。
 * 「もう少し華やかに」「この色をやめたい」といった調整は、
 * このファイルだけを編集すれば全ページに反映されます。
 *
 * 設計方針:
 *   第1層 base  … ホワイト基調のごく淡いベース（本文の可読性を担保）
 *   第2層 orbs  … 半透明のカラーオーブ（ぼかし＋低速アニメーション）
 *   第3層 光    … ゴールドの光条・虹色の反射（AnimatedGoldBackground と併用）
 */

export type PresetName =
  | "hero"
  | "concept"
  | "fillIn"
  | "menu"
  | "gallery"
  | "coupon"
  | "owner"
  | "flow"
  | "faq"
  | "access"
  | "cta"
  | "plain";

export type Intensity = "low" | "medium" | "high";

/** オーブ1つぶんの定義。位置は % 指定で、レスポンシブでも崩れません。 */
export type OrbConfig = {
  /** CSS の色（rgb / rgba）。2色指定でグラデーションのオーブになります */
  from: string;
  to?: string;
  /** 直径（vw または px）。大きいほど広く柔らかく広がります */
  size: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  /** ぼかし量（px） */
  blur: number;
  opacity: number;
  /** アニメーション1周の秒数（20〜40秒） */
  duration: number;
  /** 開始位置をずらして、複数のオーブが同時に動かないようにします */
  delay: number;
  /** 移動量（%）と拡大率 */
  shiftX: string;
  shiftY: string;
  scale: number;
  /** 画面幅に応じて間引く段階。"tablet" はタブレット以下、"mobile" はモバイルで非表示 */
  hideAt?: "tablet" | "mobile";
};

export type GradientPreset = {
  /** 第1層。セクションの下地 */
  base: string;
  /** 多層メッシュグラデーション（background-image に複数指定） */
  mesh: string;
  /** 第2層のカラーオーブ */
  orbs: OrbConfig[];
  /** ゴールドの光条を出すか */
  goldLight: boolean;
  /** 虹色の反射を出すか */
  rainbow: boolean;
  /**
   * 中央に重ねる白いヴェールの強さ（0〜1）。
   *
   * 「白背景の上に光が乗っている」状態を保つための要です。
   * 色は画面の端に寄り、本文とCTAのある中央は白に近づきます。
   * 文章が多いセクションほど大きめの値にしてください。
   */
  veil: number;
};

const WHITE = "rgb(255 255 255 / 0)";

/**
 * ヒーロー用のメッシュ。
 * 白を残しながら、画面の四隅から色が入り込む構成です。
 */
const heroMesh = [
  "radial-gradient(circle at 15% 20%, rgb(255 47 164 / 0.25), transparent 42%)",
  "radial-gradient(circle at 85% 30%, rgb(139 61 255 / 0.22), transparent 40%)",
  "radial-gradient(circle at 70% 75%, rgb(255 224 138 / 0.22), transparent 38%)",
  "radial-gradient(circle at 50% 85%, rgb(85 199 255 / 0.18), transparent 42%)",
].join(", ");

export const gradientPresets: Record<PresetName, GradientPreset> = {
  /* ヒーロー — サイト内で最も華やか。ネオンピンク／パープル／ゴールド／ラベンダー／アクア */
  hero: {
    base: "linear-gradient(180deg, #ffffff 0%, #fffafd 55%, #fdf7ff 100%)",
    mesh: heroMesh,
    orbs: [
      {
        from: "rgb(255 47 164 / 0.30)",
        to: "rgb(255 123 156 / 0.16)",
        size: "38rem",
        top: "-14%",
        left: "-12%",
        blur: 90,
        opacity: 0.527,
        duration: 30,
        delay: 0,
        shiftX: "6%",
        shiftY: "4%",
        scale: 1.12,
      },
      {
        from: "rgb(217 184 255 / 0.42)",
        to: "rgb(139 61 255 / 0.22)",
        size: "34rem",
        top: "-10%",
        right: "-10%",
        blur: 90,
        opacity: 0.496,
        duration: 34,
        delay: -8,
        shiftX: "-5%",
        shiftY: "6%",
        scale: 1.1,
      },
      {
        from: "rgb(255 224 138 / 0.34)",
        to: "rgb(255 255 255 / 0)",
        size: "30rem",
        top: "26%",
        left: "34%",
        blur: 80,
        opacity: 0.465,
        duration: 26,
        delay: -14,
        shiftX: "4%",
        shiftY: "-5%",
        scale: 1.14,
      },
      {
        from: "rgb(255 123 156 / 0.26)",
        to: "rgb(255 200 182 / 0.18)",
        size: "28rem",
        bottom: "-16%",
        left: "6%",
        blur: 80,
        opacity: 0.434,
        duration: 32,
        delay: -20,
        shiftX: "7%",
        shiftY: "-4%",
        scale: 1.08,
        hideAt: "mobile",
      },
      {
        from: "rgb(85 199 255 / 0.26)",
        to: "rgb(217 184 255 / 0.20)",
        size: "30rem",
        bottom: "-18%",
        right: "-6%",
        blur: 85,
        opacity: 0.446,
        duration: 36,
        delay: -5,
        shiftX: "-6%",
        shiftY: "-5%",
        scale: 1.1,
        hideAt: "mobile",
      },
      {
        from: "rgb(156 236 255 / 0.24)",
        to: "rgb(255 255 255 / 0)",
        size: "22rem",
        top: "52%",
        left: "-8%",
        blur: 70,
        opacity: 0.372,
        duration: 28,
        delay: -11,
        shiftX: "5%",
        shiftY: "5%",
        scale: 1.12,
        hideAt: "tablet",
      },
    ],
    goldLight: true,
    rainbow: true,
    veil: 0.62,
  },

  /* コンセプト — 淡いピンク／ラベンダー／ゴールド。柔らかく上品に */
  concept: {
    base: "linear-gradient(180deg, #ffffff 0%, #fff7fc 100%)",
    mesh: [
      "radial-gradient(circle at 12% 25%, rgb(255 95 200 / 0.14), transparent 45%)",
      "radial-gradient(circle at 88% 70%, rgb(217 184 255 / 0.20), transparent 44%)",
      "radial-gradient(circle at 60% 10%, rgb(255 224 138 / 0.14), transparent 40%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 95 200 / 0.18)",
        to: WHITE,
        size: "30rem",
        top: "-12%",
        left: "-10%",
        blur: 85,
        opacity: 0.465,
        duration: 32,
        delay: 0,
        shiftX: "5%",
        shiftY: "5%",
        scale: 1.1,
      },
      {
        from: "rgb(217 184 255 / 0.28)",
        to: "rgb(255 224 138 / 0.14)",
        size: "28rem",
        bottom: "-14%",
        right: "-8%",
        blur: 80,
        opacity: 0.434,
        duration: 36,
        delay: -12,
        shiftX: "-5%",
        shiftY: "-4%",
        scale: 1.1,
        hideAt: "mobile",
      },
    ],
    goldLight: true,
    rainbow: false,
    veil: 0.72,
  },

  /* フィルイン解説 — アクアブルー／ラベンダー／ホワイト。清潔感と信頼感 */
  fillIn: {
    base: "linear-gradient(180deg, #ffffff 0%, #f5fbff 100%)",
    mesh: [
      "radial-gradient(circle at 18% 20%, rgb(85 199 255 / 0.16), transparent 44%)",
      "radial-gradient(circle at 82% 74%, rgb(217 184 255 / 0.18), transparent 42%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(156 236 255 / 0.30)",
        to: "rgb(85 199 255 / 0.14)",
        size: "32rem",
        top: "-14%",
        right: "-10%",
        blur: 85,
        opacity: 0.465,
        duration: 34,
        delay: 0,
        shiftX: "-5%",
        shiftY: "5%",
        scale: 1.1,
      },
      {
        from: "rgb(217 184 255 / 0.24)",
        to: WHITE,
        size: "26rem",
        bottom: "-12%",
        left: "-8%",
        blur: 75,
        opacity: 0.422,
        duration: 30,
        delay: -15,
        shiftX: "5%",
        shiftY: "-4%",
        scale: 1.08,
        hideAt: "mobile",
      },
    ],
    goldLight: false,
    rainbow: false,
    veil: 0.72,
  },

  /* メニュー — カードを読みやすくするため、最も控えめ */
  menu: {
    base: "linear-gradient(180deg, #ffffff 0%, #fffcfe 100%)",
    mesh: [
      "radial-gradient(circle at 8% 12%, rgb(255 242 250 / 0.72), transparent 40%)",
      "radial-gradient(circle at 92% 82%, rgb(255 224 138 / 0.12), transparent 38%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 95 200 / 0.12)",
        to: WHITE,
        size: "26rem",
        top: "-10%",
        left: "-10%",
        blur: 70,
        opacity: 0.372,
        duration: 34,
        delay: 0,
        shiftX: "4%",
        shiftY: "4%",
        scale: 1.06,
        hideAt: "mobile",
      },
      {
        from: "rgb(255 224 138 / 0.14)",
        to: WHITE,
        size: "24rem",
        bottom: "-12%",
        right: "-8%",
        blur: 70,
        opacity: 0.36,
        duration: 38,
        delay: -16,
        shiftX: "-4%",
        shiftY: "-3%",
        scale: 1.06,
        hideAt: "tablet",
      },
    ],
    goldLight: false,
    rainbow: false,
    veil: 0.8,
  },

  /* ギャラリー — ピンク／パープル／コーラル／ゴールド。写真を引き立てる */
  gallery: {
    base: "linear-gradient(180deg, #fffafd 0%, #fdf6ff 100%)",
    mesh: [
      "radial-gradient(circle at 14% 18%, rgb(255 47 164 / 0.18), transparent 42%)",
      "radial-gradient(circle at 86% 28%, rgb(139 61 255 / 0.16), transparent 40%)",
      "radial-gradient(circle at 50% 92%, rgb(255 123 156 / 0.16), transparent 44%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 47 164 / 0.22)",
        to: "rgb(255 123 156 / 0.14)",
        size: "32rem",
        top: "-12%",
        left: "-12%",
        blur: 85,
        opacity: 0.484,
        duration: 30,
        delay: 0,
        shiftX: "6%",
        shiftY: "4%",
        scale: 1.1,
      },
      {
        from: "rgb(139 61 255 / 0.20)",
        to: "rgb(217 184 255 / 0.14)",
        size: "30rem",
        top: "10%",
        right: "-12%",
        blur: 85,
        opacity: 0.446,
        duration: 36,
        delay: -13,
        shiftX: "-5%",
        shiftY: "5%",
        scale: 1.1,
      },
      {
        from: "rgb(255 224 138 / 0.22)",
        to: "rgb(255 200 182 / 0.14)",
        size: "26rem",
        bottom: "-14%",
        left: "28%",
        blur: 78,
        opacity: 0.409,
        duration: 32,
        delay: -22,
        shiftX: "4%",
        shiftY: "-5%",
        scale: 1.08,
        hideAt: "mobile",
      },
    ],
    goldLight: true,
    rainbow: false,
    veil: 0.66,
  },

  /* クーポン — 予約に近い導線なので、CTAに次ぐ華やかさ */
  coupon: {
    base: "linear-gradient(180deg, #ffffff 0%, #fff7fc 100%)",
    mesh: [
      "radial-gradient(circle at 20% 22%, rgb(255 47 164 / 0.20), transparent 42%)",
      "radial-gradient(circle at 80% 72%, rgb(139 61 255 / 0.18), transparent 42%)",
      "radial-gradient(circle at 55% 8%, rgb(255 224 138 / 0.18), transparent 38%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 47 164 / 0.24)",
        to: "rgb(255 224 138 / 0.14)",
        size: "30rem",
        top: "-14%",
        right: "-8%",
        blur: 85,
        opacity: 0.471,
        duration: 28,
        delay: 0,
        shiftX: "-5%",
        shiftY: "5%",
        scale: 1.12,
      },
      {
        from: "rgb(139 61 255 / 0.20)",
        to: WHITE,
        size: "28rem",
        bottom: "-14%",
        left: "-10%",
        blur: 80,
        opacity: 0.434,
        duration: 34,
        delay: -14,
        shiftX: "5%",
        shiftY: "-4%",
        scale: 1.08,
        hideAt: "mobile",
      },
    ],
    goldLight: true,
    rainbow: false,
    veil: 0.68,
  },

  /* オーナー紹介 — ラベンダー／ピンク／ゴールド。温かさと高級感 */
  owner: {
    base: "linear-gradient(180deg, #ffffff 0%, #fdf8ff 100%)",
    mesh: [
      "radial-gradient(circle at 10% 30%, rgb(217 184 255 / 0.22), transparent 44%)",
      "radial-gradient(circle at 90% 60%, rgb(255 95 200 / 0.14), transparent 42%)",
      "radial-gradient(circle at 45% 5%, rgb(255 224 138 / 0.16), transparent 38%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(217 184 255 / 0.30)",
        to: "rgb(255 95 200 / 0.14)",
        size: "30rem",
        top: "-12%",
        left: "-12%",
        blur: 85,
        opacity: 0.459,
        duration: 32,
        delay: 0,
        shiftX: "5%",
        shiftY: "5%",
        scale: 1.1,
      },
      {
        from: "rgb(255 224 138 / 0.22)",
        to: WHITE,
        size: "26rem",
        bottom: "-12%",
        right: "-8%",
        blur: 78,
        opacity: 0.409,
        duration: 36,
        delay: -18,
        shiftX: "-4%",
        shiftY: "-4%",
        scale: 1.08,
        hideAt: "mobile",
      },
    ],
    goldLight: true,
    rainbow: false,
    veil: 0.72,
  },

  /* 施術の流れ — ゴールド／ピーチ。読みやすさ優先で装飾は控えめ */
  flow: {
    base: "linear-gradient(180deg, #fffdf7 0%, #fffaf5 100%)",
    mesh: [
      "radial-gradient(circle at 16% 20%, rgb(255 224 138 / 0.20), transparent 42%)",
      "radial-gradient(circle at 84% 76%, rgb(255 200 182 / 0.18), transparent 42%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 224 138 / 0.24)",
        to: WHITE,
        size: "28rem",
        top: "-12%",
        left: "-8%",
        blur: 80,
        opacity: 0.434,
        duration: 34,
        delay: 0,
        shiftX: "5%",
        shiftY: "4%",
        scale: 1.08,
      },
      {
        from: "rgb(255 200 182 / 0.22)",
        to: WHITE,
        size: "26rem",
        bottom: "-12%",
        right: "-8%",
        blur: 75,
        opacity: 0.397,
        duration: 30,
        delay: -15,
        shiftX: "-4%",
        shiftY: "-4%",
        scale: 1.08,
        hideAt: "mobile",
      },
    ],
    goldLight: true,
    rainbow: false,
    veil: 0.76,
  },

  /* FAQ — ホワイト／ごく薄いブルー／淡いラベンダー。文章を最優先 */
  faq: {
    base: "linear-gradient(180deg, #ffffff 0%, #fafcff 100%)",
    mesh: [
      "radial-gradient(circle at 12% 18%, rgb(85 199 255 / 0.10), transparent 42%)",
      "radial-gradient(circle at 88% 80%, rgb(217 184 255 / 0.14), transparent 42%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(156 236 255 / 0.18)",
        to: WHITE,
        size: "26rem",
        top: "-10%",
        right: "-10%",
        blur: 70,
        opacity: 0.372,
        duration: 36,
        delay: 0,
        shiftX: "-4%",
        shiftY: "4%",
        scale: 1.06,
        hideAt: "mobile",
      },
      {
        from: "rgb(217 184 255 / 0.18)",
        to: WHITE,
        size: "24rem",
        bottom: "-12%",
        left: "-8%",
        blur: 70,
        opacity: 0.36,
        duration: 32,
        delay: -16,
        shiftX: "4%",
        shiftY: "-3%",
        scale: 1.06,
        hideAt: "tablet",
      },
    ],
    goldLight: false,
    rainbow: false,
    veil: 0.82,
  },

  /* アクセス — ホワイト／淡いゴールド／ごく薄いピンク。情報整理を優先 */
  access: {
    base: "linear-gradient(180deg, #ffffff 0%, #fffdfa 100%)",
    mesh: [
      "radial-gradient(circle at 14% 22%, rgb(255 224 138 / 0.14), transparent 42%)",
      "radial-gradient(circle at 86% 78%, rgb(255 95 200 / 0.10), transparent 42%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 224 138 / 0.18)",
        to: WHITE,
        size: "26rem",
        top: "-10%",
        left: "-10%",
        blur: 70,
        opacity: 0.372,
        duration: 34,
        delay: 0,
        shiftX: "4%",
        shiftY: "4%",
        scale: 1.06,
        hideAt: "mobile",
      },
    ],
    goldLight: false,
    rainbow: false,
    veil: 0.82,
  },

  /* 予約CTA — サイト内で最も印象的。ネオンピンク／パープル／ゴールド／コーラル */
  cta: {
    base: "linear-gradient(180deg, #fff8fc 0%, #fbf3ff 100%)",
    mesh: [
      "radial-gradient(circle at 12% 24%, rgb(255 47 164 / 0.26), transparent 44%)",
      "radial-gradient(circle at 88% 26%, rgb(139 61 255 / 0.24), transparent 42%)",
      "radial-gradient(circle at 68% 88%, rgb(255 224 138 / 0.24), transparent 40%)",
      "radial-gradient(circle at 28% 92%, rgb(255 123 156 / 0.20), transparent 42%)",
    ].join(", "),
    orbs: [
      {
        from: "rgb(255 47 164 / 0.28)",
        to: "rgb(255 123 156 / 0.16)",
        size: "34rem",
        top: "-16%",
        left: "-12%",
        blur: 90,
        opacity: 0.508,
        duration: 28,
        delay: 0,
        shiftX: "6%",
        shiftY: "5%",
        scale: 1.12,
      },
      {
        from: "rgb(139 61 255 / 0.26)",
        to: "rgb(217 184 255 / 0.16)",
        size: "32rem",
        top: "-12%",
        right: "-12%",
        blur: 90,
        opacity: 0.484,
        duration: 32,
        delay: -10,
        shiftX: "-5%",
        shiftY: "6%",
        scale: 1.1,
      },
      {
        from: "rgb(255 224 138 / 0.26)",
        to: WHITE,
        size: "28rem",
        bottom: "-16%",
        right: "12%",
        blur: 82,
        opacity: 0.446,
        duration: 36,
        delay: -20,
        shiftX: "-4%",
        shiftY: "-5%",
        scale: 1.1,
        hideAt: "mobile",
      },
      {
        from: "rgb(255 123 156 / 0.22)",
        to: "rgb(255 200 182 / 0.14)",
        size: "26rem",
        bottom: "-14%",
        left: "10%",
        blur: 78,
        opacity: 0.422,
        duration: 30,
        delay: -25,
        shiftX: "5%",
        shiftY: "-4%",
        scale: 1.08,
        hideAt: "tablet",
      },
    ],
    goldLight: true,
    rainbow: true,
    veil: 0.55,
  },

  /* 装飾なし（規約ページなど、文章だけを読ませたい箇所） */
  plain: {
    base: "#ffffff",
    mesh: "",
    orbs: [],
    goldLight: false,
    rainbow: false,
    veil: 0,
  },
};

/** 強度による倍率。プリセットの不透明度に掛けて使います。 */
export const intensityScale: Record<Intensity, number> = {
  low: 0.55,
  medium: 0.8,
  high: 1,
};

/** 強度に応じて表示するオーブの最大数（多いほど華やか） */
export const intensityOrbLimit: Record<Intensity, number> = {
  low: 2,
  medium: 4,
  high: 7,
};
