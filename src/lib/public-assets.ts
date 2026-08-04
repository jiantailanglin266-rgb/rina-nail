import "server-only";

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * `public/` にファイルが実在するかを **ビルド時に** 確認します。
 *
 * 動画のように後から差し替えるファイルは、置き忘れると
 * 「空の黒い枠」や「再生できないプレーヤー」が公開されてしまいます。
 * ビルド時に存在を確認し、無ければセクションごと描画しないことで防ぎます。
 *
 * サーバー側（ビルド時）でのみ動くため `server-only` を付けています。
 * クライアントコンポーネントから読み込むとビルドが失敗します。
 */
export function publicFileExists(publicPath: string): boolean {
  const relative = publicPath.replace(/^\//, "");
  return existsSync(path.join(process.cwd(), "public", relative));
}

/**
 * `public/` 配下のディレクトリにある画像ファイルを、**ビルド時に**列挙します。
 *
 * ファイル名を一覧に書き写す方式にすると、写真を追加するたびに
 * コードの編集が必要になります。ディレクトリを読むことで、
 * **画像を置くだけ**で反映されるようにしています。
 *
 * 並び順はファイル名順です（`01-`, `02-` のように付けると順番を決められます）。
 * ディレクトリが存在しない場合は空配列を返すため、未設置でも壊れません。
 */
export function publicImagesIn(publicDir: string): string[] {
  const relative = publicDir.replace(/^\//, "").replace(/\/$/, "");
  const absolute = path.join(process.cwd(), "public", relative);
  if (!existsSync(absolute)) return [];

  return readdirSync(absolute)
    .filter((name) => /\.(jpe?g|png|webp|avif)$/i.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/${relative}/${name}`);
}
