/**
 * サイトで使う動画の設定。
 *
 * ファイルは `public/videos/` に置きます。
 * **ファイルが無い場合、そのセクションは描画されません**（ビルド時に確認します）。
 * 空の黒い枠や壊れた再生ボタンが出ることはありません。
 */

export type SiteVideo = {
  /** `public/` からのパス */
  src: string;
  /**
   * 表示する縦横比（CSSの `aspect-ratio` の書式）。
   *
   * **縦向きの動画の場合は `"9 / 16"` に変更してください。**
   * ここを実際の比率に合わせておくと、読み込み前後で高さが変わらず、
   * 表示のガタつき（CLS）が起きません。
   */
  aspectRatio: string;
  /**
   * 最初のコマの代わりに表示する画像（`public/` からのパス）。
   * 未設定なら動画の1コマ目が使われます。
   */
  poster?: string;
};

/** ファーストビューの直下に置くブランド動画 */
export const heroVideo: SiteVideo = {
  src: "/videos/rina-nail-cm.mp4",
  aspectRatio: "16 / 9",
};
