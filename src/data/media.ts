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
   * 動画そのものの画素数（実寸）。
   *
   * これより大きく表示すると引き伸ばしになり、輪郭がぼやけます。
   * 表示側でこの値を上限に使うため、動画を差し替えたら必ず実寸に合わせてください。
   */
  width: number;
  height: number;
  /**
   * 最初のコマの代わりに表示する画像（`public/` からのパス）。
   * 未設定なら動画の1コマ目が使われます。
   */
  poster?: string;
};

/**
 * 表示する縦横比（CSSの `aspect-ratio` の書式）。
 *
 * 実寸から組み立てるため、`width` / `height` を直せば自動で追従します。
 * 読み込み前から高さが確定するので、表示のガタつき（CLS）が起きません。
 */
export function videoAspectRatio(video: SiteVideo): string {
  return `${video.width} / ${video.height}`;
}

/** ファーストビューの直下に置くブランド動画（CM） */
export const heroVideo: SiteVideo = {
  src: "/videos/rina-nail-cm.mp4",
  /*
   * 実寸は 1728×992 です（16:9 の 1728×972 より少しだけ縦長）。
   * 16 / 9 として扱うと上下がわずかに切れるため、実寸をそのまま使います。
   */
  width: 1728,
  height: 992,
};

/**
 * サイトへアクセスした直後に、**セッション中一度だけ**全画面で流すイントロ動画。
 *
 * 再生が終わるかスキップされると消え、同じタブ内では二度と出ません
 * （ページ移動や言語切り替えで毎回流れると邪魔になるため）。
 * ファイルが無ければイントロ自体が描画されません。
 */
export const introVideo: SiteVideo = {
  src: "/videos/rina-nail-opening.mp4",
  width: 864,
  height: 496,
};
