/**
 * GitHub Pages プレビュー時のみ設定される basePath を、
 * metadataBase の解決対象外になるパス（favicon など）へ明示的に付与します。
 *
 * 必ず NEXT_PUBLIC_BASE_PATH（next.config.ts の env で焼き込み）を読みます。
 * 以前は GITHUB_PAGES / PAGES_BASE_PATH を直接読んでいましたが、
 * この2つは **ブラウザ用バンドルでは undefined** になるため、
 * クライアントコンポーネントだけで描画されるURL（イントロ動画など）に
 * basePath が付かず、本番のGitHub Pagesでのみ404になっていました。
 * サーバー側の描画では正しく付くので、ローカル検証では気付けません。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  if (!basePath) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
