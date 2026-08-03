/**
 * GitHub Pages プレビュー時のみ設定される basePath を、
 * metadataBase の解決対象外になるパス（favicon など）へ明示的に付与します。
 */
const basePath = process.env.GITHUB_PAGES === "true" ? (process.env.PAGES_BASE_PATH ?? "") : "";

export function withBasePath(path: string): string {
  if (!basePath) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
