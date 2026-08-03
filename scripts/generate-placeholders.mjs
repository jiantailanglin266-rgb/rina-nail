/**
 * 仮画像の生成スクリプト。
 *
 *   npm run placeholders
 *
 * `public/images/` 以下に、実写と同じ縦横比のプレースホルダー画像を出力します。
 * 実際の写真に差し替えるときは、同じパス・同じ縦横比のファイルで上書きしてください
 * （コード側の変更は不要です）。
 *
 * SVGではなくJPEG/PNGを生成しているのは、next/image の最適化をそのまま
 * 利用できるようにするためです。
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

/** ブランドカラー */
const PALETTE = {
  white: "#FFFFFF",
  softPink: "#FFF4FA",
  softLilac: "#F7F2FF",
  hotPink: "#FF4FC8",
  purple: "#8B3DFF",
  gold: "#D4AF37",
  brightGold: "#FFD76A",
  ink: "#24172B",
};

/** グラデーション＋装飾のSVGを組み立てます */
function placeholderSvg({ width, height, from, via, to, label, sublabel }) {
  const titleSize = Math.round(Math.min(width, height) * 0.062);
  const subSize = Math.round(titleSize * 0.42);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="48%" stop-color="${via}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="24%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PALETTE.brightGold}" stop-opacity="0"/>
      <stop offset="50%" stop-color="${PALETTE.gold}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${PALETTE.hotPink}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>

  <g fill="none" stroke="url(#line)" stroke-width="${Math.max(1, width * 0.0018)}">
    <path d="M${-width * 0.05} ${height * 0.74} C ${width * 0.24} ${height * 0.56}, ${width * 0.42} ${height * 0.86}, ${width * 0.7} ${height * 0.62} S ${width * 1.02} ${height * 0.34}, ${width * 1.05} ${height * 0.46}"/>
    <path d="M${-width * 0.05} ${height * 0.3} C ${width * 0.28} ${height * 0.14}, ${width * 0.46} ${height * 0.42}, ${width * 0.74} ${height * 0.24} S ${width * 1.02} ${height * 0.1}, ${width * 1.05} ${height * 0.2}"/>
  </g>

  <circle cx="${width * 0.82}" cy="${height * 0.18}" r="${Math.min(width, height) * 0.11}" fill="none" stroke="${PALETTE.gold}" stroke-opacity="0.45" stroke-dasharray="6 8" stroke-width="${Math.max(1, width * 0.0016)}"/>
  <circle cx="${width * 0.16}" cy="${height * 0.82}" r="${Math.min(width, height) * 0.06}" fill="none" stroke="${PALETTE.hotPink}" stroke-opacity="0.35" stroke-width="${Math.max(1, width * 0.0016)}"/>

  <circle cx="${width * 0.24}" cy="${height * 0.22}" r="${Math.min(width, height) * 0.007}" fill="${PALETTE.brightGold}"/>
  <circle cx="${width * 0.64}" cy="${height * 0.36}" r="${Math.min(width, height) * 0.005}" fill="${PALETTE.hotPink}"/>
  <circle cx="${width * 0.44}" cy="${height * 0.78}" r="${Math.min(width, height) * 0.006}" fill="${PALETTE.gold}"/>

  <text x="50%" y="${height * 0.5}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" fill="${PALETTE.ink}" fill-opacity="0.72" letter-spacing="${titleSize * 0.08}">${label}</text>
  <text x="50%" y="${height * 0.5 + titleSize * 1.25}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${subSize}" fill="${PALETTE.ink}" fill-opacity="0.45" letter-spacing="${subSize * 0.22}">${sublabel}</text>
</svg>`;
}

const GRADIENTS = [
  [PALETTE.white, PALETTE.softPink, "#FFE4F3"],
  [PALETTE.softLilac, "#F3E9FF", "#EADCFF"],
  ["#FFFAEE", "#FFF1E0", "#FFE7CE"],
  [PALETTE.white, "#FDECF7", "#F0E2FF"],
  ["#FFF7FB", "#FFEAF5", "#F6E6FF"],
];

async function write(relativePath, buffer) {
  const target = join(publicDir, relativePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, buffer);
  console.log(`  ✓ ${relativePath}`);
}

async function renderJpeg(relativePath, options) {
  const svg = placeholderSvg(options);
  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  await write(relativePath, buffer);
}

async function renderPng(relativePath, options) {
  const svg = placeholderSvg(options);
  const buffer = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await write(relativePath, buffer);
}

const GALLERY = [
  ["simple-01", "SIMPLE"],
  ["simple-02", "SIMPLE"],
  ["office-01", "OFFICE"],
  ["office-02", "OFFICE"],
  ["nuance-01", "NUANCE"],
  ["nuance-02", "NUANCE"],
  ["glitter-01", "GLITTER"],
  ["glitter-02", "GLITTER"],
  ["gorgeous-01", "GORGEOUS"],
  ["gorgeous-02", "GORGEOUS"],
  ["seasonal-01", "SEASONAL"],
  ["seasonal-02", "SEASONAL"],
  ["mens-01", "MEN'S"],
  ["mens-02", "MEN'S"],
];

async function main() {
  console.log("プレースホルダー画像を生成します…");

  // ヒーロー（縦位置の大きなネイル写真を想定）
  await renderJpeg("images/hero/hero-main.jpg", {
    width: 1200,
    height: 1500,
    from: GRADIENTS[0][0],
    via: GRADIENTS[0][1],
    to: GRADIENTS[0][2],
    label: "RINA NAIL",
    sublabel: "HERO IMAGE PLACEHOLDER",
  });

  // サロンの雰囲気
  await renderJpeg("images/salon/salon-01.jpg", {
    width: 1400,
    height: 933,
    from: GRADIENTS[1][0],
    via: GRADIENTS[1][1],
    to: GRADIENTS[1][2],
    label: "PRIVATE SALON",
    sublabel: "SALON IMAGE PLACEHOLDER",
  });

  // オーナー
  await renderJpeg("images/owner/owner.jpg", {
    width: 800,
    height: 1000,
    from: GRADIENTS[2][0],
    via: GRADIENTS[2][1],
    to: GRADIENTS[2][2],
    label: "NAILIST",
    sublabel: "PORTRAIT PLACEHOLDER",
  });

  // ギャラリー
  for (const [index, [slug, label]] of GALLERY.entries()) {
    const gradient = GRADIENTS[index % GRADIENTS.length];
    await renderJpeg(`images/gallery/${slug}.jpg`, {
      width: 1000,
      height: 1250,
      from: gradient[0],
      via: gradient[1],
      to: gradient[2],
      label,
      sublabel: "DESIGN PLACEHOLDER",
    });
  }

  // OGP（全言語共通のテンプレート。言語別に差し替える場合は images/common/ogp-<locale>.png を追加）
  await renderPng("images/common/ogp.png", {
    width: 1200,
    height: 630,
    from: GRADIENTS[0][0],
    via: GRADIENTS[0][1],
    to: GRADIENTS[3][2],
    label: "Rina nail",
    sublabel: "PRIVATE NAIL SALON — YOKKAICHI, MIE",
  });

  // アイコン
  await renderPng("icon.png", {
    width: 512,
    height: 512,
    from: PALETTE.white,
    via: PALETTE.softPink,
    to: "#F0E2FF",
    label: "R",
    sublabel: "",
  });
  await renderPng("apple-touch-icon.png", {
    width: 180,
    height: 180,
    from: PALETTE.white,
    via: PALETTE.softPink,
    to: "#F0E2FF",
    label: "R",
    sublabel: "",
  });

  console.log("完了しました。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
