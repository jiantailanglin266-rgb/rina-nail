import "server-only";

import { existsSync } from "node:fs";
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
