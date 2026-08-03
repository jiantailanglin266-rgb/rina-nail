import type { SalviaVariant } from "@/components/animations/salvia/salviaColors";

/**
 * サルビア落下アニメーションの設定生成。
 *
 * ## Hydration Error 対策
 * `Math.random()` は使いません。シード付きの疑似乱数（mulberry32）で
 * モジュール読み込み時に一度だけ生成するため、サーバーとクライアントで
 * 必ず同じ値になります。密度・セクションごとにシードを変えることで、
 * 見た目は「ランダム」でありながら結果は決定的です。
 */

export type SalviaType = "flower" | "petal" | "branch" | "sparkle";
export type SalviaLayerName = "back" | "middle" | "front";
export type SalviaDensity = "low" | "medium" | "high";
export type SalviaSectionVariant = "hero" | "section" | "gallery" | "owner" | "cta";
export type SalviaColorMode = "brand" | "red" | "pink" | "purple" | "mixed";

export type FallingSalviaConfig = {
  id: string;
  /** 初期X座標（vw / 0〜100） */
  startX: number;
  size: number;
  /** 落下1周の秒数 */
  duration: number;
  /** 負の値。開始時点で既に降っている状態にします */
  delay: number;
  /** 左右の揺れ幅（vw） */
  swayDistance: number;
  /** 揺れ1往復の秒数 */
  swaySpeed: number;
  rotationFrom: number;
  rotationTo: number;
  /** 回転1往復の秒数 */
  spinSpeed: number;
  opacity: number;
  blur: number;
  /** 落下しながら横へ流れる量（vw） */
  drift: number;
  layer: SalviaLayerName;
  type: SalviaType;
  variant: SalviaVariant;
  direction: "left" | "right";
  /** 画面幅による間引き */
  hideAt?: "tablet" | "mobile";
  /** prefers-reduced-motion 時の固定表示位置（vh） */
  staticY: number;
  /** prefers-reduced-motion 時に非表示にするか（静止時は2〜4輪だけ残します） */
  staticHidden: boolean;
};

/* ------------------------------------------------------------
   シード付き疑似乱数
   ------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 文字列から安定したシード値を作ります */
function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* ------------------------------------------------------------
   表示数
   デスクトップ／タブレット／モバイルの3段階で間引きます。
   ------------------------------------------------------------ */
type CountSet = Record<SalviaType, number>;

const DESKTOP_COUNTS: Record<SalviaDensity, CountSet> = {
  high: { flower: 12, petal: 16, branch: 4, sparkle: 14 },
  medium: { flower: 8, petal: 11, branch: 2, sparkle: 9 },
  low: { flower: 4, petal: 6, branch: 0, sparkle: 5 },
};

const TABLET_COUNTS: Record<SalviaDensity, CountSet> = {
  high: { flower: 8, petal: 11, branch: 2, sparkle: 9 },
  medium: { flower: 6, petal: 8, branch: 1, sparkle: 6 },
  low: { flower: 3, petal: 4, branch: 0, sparkle: 4 },
};

const MOBILE_COUNTS: Record<SalviaDensity, CountSet> = {
  high: { flower: 5, petal: 7, branch: 2, sparkle: 6 },
  medium: { flower: 4, petal: 5, branch: 1, sparkle: 4 },
  low: { flower: 3, petal: 3, branch: 0, sparkle: 3 },
};

/* ------------------------------------------------------------
   配色比率
   ピンク35% / 赤25% / 紫20% / 白15% / ゴールド5%
   ------------------------------------------------------------ */
const VARIANT_WEIGHTS: Record<SalviaColorMode, Array<[SalviaVariant, number]>> = {
  mixed: [
    ["pink", 35],
    ["red", 25],
    ["purple", 20],
    ["white", 15],
    ["gold", 5],
  ],
  brand: [
    ["pink", 40],
    ["purple", 27],
    ["white", 18],
    ["red", 10],
    ["gold", 5],
  ],
  red: [
    ["red", 55],
    ["pink", 25],
    ["white", 15],
    ["gold", 5],
  ],
  pink: [
    ["pink", 55],
    ["red", 20],
    ["white", 20],
    ["gold", 5],
  ],
  purple: [
    ["purple", 50],
    ["pink", 25],
    ["white", 20],
    ["gold", 5],
  ],
};

function pickVariant(rand: () => number, mode: SalviaColorMode): SalviaVariant {
  const table = VARIANT_WEIGHTS[mode].filter(([, weight]) => weight > 0);
  const total = table.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rand() * total;
  for (const [variant, weight] of table) {
    roll -= weight;
    if (roll <= 0) return variant;
  }
  return table[0][0];
}

/* ------------------------------------------------------------
   レイヤーごとの性格
   奥ほど小さく・薄く・ゆっくり、手前ほど大きく・速く。
   ------------------------------------------------------------ */
const LAYER_SPEC: Record<
  SalviaLayerName,
  { sizeScale: number; opacity: [number, number]; blur: number; speed: number }
> = {
  back: { sizeScale: 0.74, opacity: [0.42, 0.58], blur: 1.4, speed: 1.35 },
  middle: { sizeScale: 1, opacity: [0.66, 0.86], blur: 0, speed: 1 },
  front: { sizeScale: 1.3, opacity: [0.56, 0.74], blur: 0.8, speed: 0.82 },
};

/**
 * 種類ごとの基準サイズ（px）と基準時間（秒）。
 * 小さすぎると白背景の中で「ゴミ」に見えてしまうため、
 * サルビアと判別できる大きさを確保しています。
 */
const TYPE_SPEC: Record<SalviaType, { size: [number, number]; duration: [number, number] }> = {
  flower: { size: [34, 54], duration: [24, 34] },
  petal: { size: [15, 25], duration: [18, 26] },
  branch: { size: [96, 148], duration: [30, 40] },
  sparkle: { size: [9, 16], duration: [20, 28] },
};

function lerp(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/**
 * 手前のレイヤーと穂は、本文やCTAに重ならないよう画面端へ寄せます。
 * 奥・中間レイヤーは全幅に散らします。
 */
function pickStartX(rand: () => number, layer: SalviaLayerName, type: SalviaType): number {
  const edgeOnly = layer === "front" || type === "branch";
  if (!edgeOnly) return lerp(rand, -4, 100);
  // 左右それぞれ画面幅の16%程度までに配置（見切れすぎない範囲）
  return rand() < 0.5 ? lerp(rand, -3, 15) : lerp(rand, 82, 97);
}

function buildOne(
  rand: () => number,
  index: number,
  type: SalviaType,
  layer: SalviaLayerName,
  colorMode: SalviaColorMode,
  hideAt: FallingSalviaConfig["hideAt"],
  keepWhenStatic: boolean,
): FallingSalviaConfig {
  const layerSpec = LAYER_SPEC[layer];
  const typeSpec = TYPE_SPEC[type];

  const duration = lerp(rand, typeSpec.duration[0], typeSpec.duration[1]) * layerSpec.speed;

  return {
    id: `${type}-${layer}-${index}`,
    startX: pickStartX(rand, layer, type),
    size: lerp(rand, typeSpec.size[0], typeSpec.size[1]) * layerSpec.sizeScale,
    duration,
    // 負の遅延で、読み込み直後から既に降っている状態にします
    delay: -lerp(rand, 0, duration),
    swayDistance: lerp(rand, 1.2, 4.2) * (layer === "back" ? 0.6 : 1),
    swaySpeed: lerp(rand, 5, 11),
    rotationFrom: lerp(rand, -22, -4),
    rotationTo: lerp(rand, 6, 26),
    spinSpeed: lerp(rand, 12, 24),
    opacity: lerp(rand, layerSpec.opacity[0], layerSpec.opacity[1]),
    blur: layerSpec.blur,
    drift: lerp(rand, -9, 9),
    layer,
    type,
    variant: type === "sparkle" ? "gold" : pickVariant(rand, colorMode),
    direction: rand() < 0.5 ? "left" : "right",
    hideAt,
    staticY: lerp(rand, 8, 74),
    staticHidden: !keepWhenStatic,
  };
}

/**
 * セクション1つぶんの設定を生成します。
 * 同じ引数からは必ず同じ結果が返るため、SSRとクライアントで一致します。
 */
export function buildSalviaConfigs({
  density,
  section,
  colorMode,
  showFlowers,
  showPetals,
  showBranches,
  showSparkles,
}: {
  density: SalviaDensity;
  section: SalviaSectionVariant;
  colorMode: SalviaColorMode;
  showFlowers: boolean;
  showPetals: boolean;
  showBranches: boolean;
  showSparkles: boolean;
}): FallingSalviaConfig[] {
  const rand = mulberry32(hashSeed(`${section}:${density}:${colorMode}`));
  const desktop = DESKTOP_COUNTS[density];
  const tablet = TABLET_COUNTS[density];
  const mobile = MOBILE_COUNTS[density];

  const enabled: Record<SalviaType, boolean> = {
    flower: showFlowers,
    petal: showPetals,
    branch: showBranches,
    sparkle: showSparkles,
  };

  const configs: FallingSalviaConfig[] = [];
  const types: SalviaType[] = ["branch", "flower", "petal", "sparkle"];

  for (const type of types) {
    if (!enabled[type]) continue;

    for (let i = 0; i < desktop[type]; i += 1) {
      // 先頭から順に「モバイルでも出す → タブレットまで → デスクトップのみ」
      const hideAt: FallingSalviaConfig["hideAt"] =
        i < mobile[type] ? undefined : i < tablet[type] ? "mobile" : "tablet";

      // レイヤー配分。穂は主役なので中間〜手前へ、光粒は奥へ寄せます
      const layer: SalviaLayerName =
        type === "branch"
          ? i % 2 === 0
            ? "middle"
            : "front"
          : type === "sparkle"
            ? i % 3 === 0
              ? "middle"
              : "back"
            : i % 3 === 0
              ? "back"
              : i % 3 === 1
                ? "middle"
                : "front";

      // 静止時（reduced motion）に残すのは、花と穂の先頭2つだけ
      const keepWhenStatic = (type === "flower" || type === "branch") && i < 2;

      configs.push(buildOne(rand, i, type, layer, colorMode, hideAt, keepWhenStatic));
    }
  }

  return configs;
}

/** セクション別の既定値。呼び出し側で個別に上書きできます。 */
export const SECTION_DEFAULTS: Record<
  SalviaSectionVariant,
  { density: SalviaDensity; colorMode: SalviaColorMode; showBranches: boolean }
> = {
  hero: { density: "high", colorMode: "mixed", showBranches: true },
  section: { density: "medium", colorMode: "brand", showBranches: false },
  gallery: { density: "medium", colorMode: "mixed", showBranches: false },
  owner: { density: "medium", colorMode: "purple", showBranches: false },
  cta: { density: "medium", colorMode: "mixed", showBranches: true },
};
