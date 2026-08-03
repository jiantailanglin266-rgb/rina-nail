/**
 * サルビアのカラーバリエーション。
 *
 * 四日市市の花であるサルビアは一般に赤ですが、Rina nail のブランドカラー
 * （ピンク・パープル・ゴールド）と調和させるため、5系統を用意しています。
 *
 * 配色比率の目安（salviaAnimationConfig.ts の VARIANT_WEIGHTS で制御）:
 *   ピンク系 35% / 赤系 25% / 紫系 20% / 白系 15% / ゴールド系 5%
 */

export type SalviaVariant = "red" | "pink" | "purple" | "white" | "gold";

export type SalviaPalette = {
  /** 花びらのグラデーション（明→暗） */
  light: string;
  base: string;
  deep: string;
  /** 花芯。花びらより濃くして立体感を出します */
  core: string;
  /** ゴールドの細線。花全体には使わず、輪郭の一部だけに乗せます */
  gold: string;
  /** カラフルな背景に埋もれないための白い縁 */
  rim: string;
};

export const salviaPalettes: Record<SalviaVariant, SalviaPalette> = {
  red: {
    light: "#ff7b8f",
    base: "#ef315f",
    deep: "#bf1746",
    core: "#9c1038",
    gold: "#ffe08a",
    rim: "rgb(255 255 255 / 0.85)",
  },
  pink: {
    light: "#ffb3d9",
    base: "#ff4fa3",
    deep: "#ff2fa4",
    core: "#d1197a",
    gold: "#ffe08a",
    rim: "rgb(255 255 255 / 0.85)",
  },
  purple: {
    light: "#d9b8ff",
    base: "#a86bff",
    deep: "#8b3dff",
    core: "#5f1fb8",
    gold: "#ffe08a",
    rim: "rgb(255 255 255 / 0.85)",
  },
  white: {
    light: "#ffffff",
    base: "#fff8fc",
    deep: "#ffe1f0",
    core: "#ffb3d9",
    gold: "#d4af37",
    rim: "rgb(255 200 226 / 0.9)",
  },
  gold: {
    light: "#fff3cf",
    base: "#ffe08a",
    deep: "#d4af37",
    core: "#b08a24",
    gold: "#ffffff",
    rim: "rgb(255 255 255 / 0.85)",
  },
};
