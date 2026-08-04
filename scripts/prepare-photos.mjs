/**
 * 写真の一括取り込みスクリプト。
 *
 *   npm run photos -- <写真フォルダのパス>
 *   npm run photos -- <写真フォルダのパス> --dry   （書き込まずに割り当てだけ確認）
 *
 * 撮影した写真をまとめたフォルダを渡すと、サイトの各枠に必要な
 * 「正しい縦横比・正しいファイル名」へ変換して `public/images/` へ書き出します。
 *
 * 手作業でトリミングしなくてよいように、切り抜き位置は sharp の
 * attention 戦略（被写体が最も密な領域を残す）に任せています。
 * ネイル写真は指先が画面の一部に寄ることが多く、中央固定で切ると
 * 爪が切れてしまうためです。
 *
 * 割り当ての決め方（上から順に判定）
 *   1. ファイル名に手がかり語が含まれていれば、その枠へ
 *      （例: `hero-01.jpg` → ヒーロー、`office_02.jpg` → ギャラリーのオフィス）
 *   2. 手がかり語が無ければ、縦長＝ギャラリー枠、横長＝サロン枠へ順に充当
 *   3. 埋まりきらずに余った写真は、すべてマーキー（`public/images/marquee/`）へ
 *
 * 元画像が出力サイズより小さい場合は拡大せず、警告を出してそのまま等倍で書き出します
 * （引き伸ばすと粗さが目立つため）。
 */

import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const SOURCE_EXTENSIONS = /\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i;

/**
 * 各枠の出力先と寸法。
 * 既存のプレースホルダー（`scripts/generate-placeholders.mjs`）と同じ寸法にそろえています。
 * ここを変えるとレイアウトの縦横比がずれるので、変更時は表示側も確認してください。
 */
const SLOTS = [
  {
    out: "images/hero/hero-main.jpg",
    width: 1200,
    height: 1500,
    hints: ["hero", "main", "メイン", "トップ"],
  },
  {
    out: "images/owner/owner.jpg",
    width: 800,
    height: 1000,
    hints: ["owner", "profile", "portrait", "オーナー", "プロフィール"],
  },
  {
    out: "images/salon/salon-01.jpg",
    width: 1400,
    height: 933,
    hints: ["salon", "room", "interior", "サロン", "内観", "店内"],
  },
  { out: "images/gallery/simple-01.jpg", width: 1000, height: 1250, hints: ["simple", "シンプル"] },
  { out: "images/gallery/simple-02.jpg", width: 1000, height: 1250, hints: ["simple", "シンプル"] },
  { out: "images/gallery/office-01.jpg", width: 1000, height: 1250, hints: ["office", "オフィス"] },
  { out: "images/gallery/office-02.jpg", width: 1000, height: 1250, hints: ["office", "オフィス"] },
  {
    out: "images/gallery/nuance-01.jpg",
    width: 1200,
    height: 900,
    hints: ["nuance", "ニュアンス"],
  },
  {
    out: "images/gallery/nuance-02.jpg",
    width: 1200,
    height: 900,
    hints: ["nuance", "ニュアンス"],
  },
  {
    out: "images/gallery/glitter-01.jpg",
    width: 1200,
    height: 900,
    hints: ["glitter", "lame", "ラメ", "グリッター"],
  },
  {
    out: "images/gallery/glitter-02.jpg",
    width: 1200,
    height: 900,
    hints: ["glitter", "lame", "ラメ", "グリッター"],
  },
  {
    out: "images/gallery/gorgeous-01.jpg",
    width: 1200,
    height: 900,
    hints: ["gorgeous", "bijou", "ゴージャス", "ビジュー"],
  },
  {
    out: "images/gallery/gorgeous-02.jpg",
    width: 1200,
    height: 900,
    hints: ["gorgeous", "bijou", "ゴージャス", "ビジュー"],
  },
  {
    out: "images/gallery/seasonal-01.jpg",
    width: 1200,
    height: 900,
    hints: ["seasonal", "season", "季節"],
  },
  {
    out: "images/gallery/seasonal-02.jpg",
    width: 1200,
    height: 900,
    hints: ["seasonal", "season", "季節"],
  },
  {
    out: "images/gallery/mens-01.jpg",
    width: 1200,
    height: 900,
    hints: ["mens", "men", "メンズ"],
  },
  {
    out: "images/gallery/mens-02.jpg",
    width: 1200,
    height: 900,
    hints: ["mens", "men", "メンズ"],
  },
];

/** マーキーは横位置のカード（3:2）です。作例写真が横位置で撮られているためです */
const MARQUEE = { dir: "images/marquee", width: 1200, height: 800, hints: ["marquee", "マーキー"] };

/** 縦長スロット（ギャラリー・ヒーロー・オーナー）かどうか */
function isPortraitSlot(slot) {
  return slot.height > slot.width;
}

async function listSourceImages(sourceDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true, recursive: true });
  return (
    entries
      .filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.test(entry.name))
      // macOS/Windows が作る隠しファイル・サムネイルを除外します
      .filter((entry) => !entry.name.startsWith(".") && entry.name !== "Thumbs.db")
      .map((entry) => join(entry.parentPath ?? sourceDir, entry.name))
      .sort((a, b) => a.localeCompare(b))
  );
}

/** ファイル名に手がかり語が含まれるかどうか */
function matchesHint(filePath, hints) {
  const name = filePath.toLowerCase();
  return hints.some((hint) => name.includes(hint.toLowerCase()));
}

/**
 * 写真を各枠へ割り当てます。
 * 手がかり語による指定を先に確定させ、残りを縦横比で埋めます。
 */
function assign(files, metas) {
  const remaining = new Set(files);
  const plan = new Map(); // 出力パス -> 入力パス

  // 1. 手がかり語での指定を優先
  for (const slot of SLOTS) {
    if (plan.has(slot.out)) continue;
    const hit = [...remaining].find((file) => matchesHint(file, slot.hints));
    if (hit) {
      plan.set(slot.out, hit);
      remaining.delete(hit);
    }
  }

  // マーキー指定（明示的に marquee と名付けられたもの）は後段でまとめて扱います
  const explicitMarquee = [...remaining].filter((file) => matchesHint(file, MARQUEE.hints));
  for (const file of explicitMarquee) remaining.delete(file);

  // 2. 残りを向きで充当（縦長→縦枠、横長→横枠）
  const portraits = [...remaining].filter((file) => (metas.get(file)?.ratio ?? 1) < 1);
  const landscapes = [...remaining].filter((file) => (metas.get(file)?.ratio ?? 1) >= 1);

  for (const slot of SLOTS) {
    if (plan.has(slot.out)) continue;
    const pool = isPortraitSlot(slot) ? portraits : landscapes;
    // 向きが合う写真が尽きたら、もう一方から回します（枠を空のままにしない）
    const fallback = isPortraitSlot(slot) ? landscapes : portraits;
    const file = pool.shift() ?? fallback.shift();
    if (!file) continue;
    plan.set(slot.out, file);
    remaining.delete(file);
  }

  // 3. 余りはすべてマーキーへ
  const leftovers = [...explicitMarquee, ...portraits, ...landscapes];
  return { plan, leftovers };
}

async function readMeta(file) {
  try {
    const { width, height } = await sharp(file).metadata();
    if (!width || !height) return null;
    return { width, height, ratio: width / height };
  } catch {
    return null;
  }
}

async function render(source, target, width, height, meta, warnings) {
  // 元が小さいときは引き伸ばさず、入る範囲で書き出します
  const upscaling = meta && (meta.width < width || meta.height < height);
  if (upscaling) {
    warnings.push(
      `${source} は ${meta.width}×${meta.height} で、必要な ${width}×${height} より小さいため拡大していません`,
    );
  }

  const buffer = await sharp(source)
    .rotate() // Exif の向き情報を反映（スマホ撮影で横倒しになるのを防ぐ）
    .resize(width, height, {
      fit: "cover",
      position: sharp.strategy.attention,
      withoutEnlargement: true,
    })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const absolute = join(publicDir, target);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, buffer);
  return buffer.length;
}

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry");
  const sourceArg = args.find((arg) => !arg.startsWith("--"));

  if (!sourceArg) {
    console.error("使い方: npm run photos -- <写真フォルダのパス> [--dry]");
    process.exit(1);
  }

  const sourceDir = resolve(sourceArg);
  if (!existsSync(sourceDir)) {
    console.error(`フォルダが見つかりません: ${sourceDir}`);
    process.exit(1);
  }

  const files = await listSourceImages(sourceDir);
  if (files.length === 0) {
    console.error(`画像が1枚もありません: ${sourceDir}`);
    process.exit(1);
  }

  console.log(`${files.length}枚の画像を読み込みました（${sourceDir}）\n`);

  const metas = new Map();
  const unreadable = [];
  for (const file of files) {
    const meta = await readMeta(file);
    if (meta) metas.set(file, meta);
    else unreadable.push(file);
  }

  const readable = files.filter((file) => metas.has(file));
  const { plan, leftovers } = assign(readable, metas);
  const warnings = [];

  console.log("■ 各枠への割り当て");
  for (const slot of SLOTS) {
    const source = plan.get(slot.out);
    if (!source) {
      console.log(`  － ${slot.out}（写真が足りないため、現在の画像を残します）`);
      continue;
    }
    if (dryRun) {
      console.log(`  ✓ ${slot.out}  ←  ${source}`);
      continue;
    }
    const size = await render(
      source,
      slot.out,
      slot.width,
      slot.height,
      metas.get(source),
      warnings,
    );
    console.log(`  ✓ ${slot.out}  ←  ${source}  (${formatKb(size)})`);
  }

  console.log(`\n■ マーキー（${leftovers.length}枚）`);
  if (leftovers.length > 0 && leftovers.length < 4) {
    console.log("  ※ 4枚未満のためマーキーは表示されません（少なすぎると流れが不自然になるため）");
  }
  for (const [index, source] of leftovers.entries()) {
    // 連番にするのは、マーキー側がファイル名順に並べるためです
    const target = `${MARQUEE.dir}/${String(index + 1).padStart(2, "0")}.jpg`;
    if (dryRun) {
      console.log(`  ✓ ${target}  ←  ${source}`);
      continue;
    }
    const size = await render(
      source,
      target,
      MARQUEE.width,
      MARQUEE.height,
      metas.get(source),
      warnings,
    );
    console.log(`  ✓ ${target}  ←  ${source}  (${formatKb(size)})`);
  }

  if (unreadable.length > 0) {
    console.log(`\n■ 読み込めなかったファイル（${unreadable.length}件）`);
    for (const file of unreadable) console.log(`  × ${file}`);
    console.log("  HEIC形式の場合は、JPEGで書き出してから再実行してください。");
  }

  if (warnings.length > 0) {
    console.log(`\n■ 注意（${warnings.length}件）`);
    for (const warning of warnings) console.log(`  ! ${warning}`);
  }

  console.log(dryRun ? "\n（--dry のため書き込んでいません）" : "\n完了しました。");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
