import type { NextConfig } from "next";

/**
 * GitHub Pages へのプレビュー公開時のみ静的エクスポートへ切り替えます。
 * （GitHub Actions 側で GITHUB_PAGES=true / PAGES_BASE_PATH を設定）
 *
 * 本番（Vercel など Node ランタイム）では通常ビルドとなり、
 * next/image の最適化・proxy.ts によるロケール判定リダイレクトが有効になります。
 */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath || undefined,
        // 静的エクスポートでは画像最適化APIが使えないため無効化します
        images: { unoptimized: true },
        // 各ページを <path>/index.html として出力します
        trailingSlash: true,
      }
    : {
        images: {
          // 画像を差し替えても軽量に配信できるよう AVIF / WebP を優先します
          formats: ["image/avif" as const, "image/webp" as const],
          deviceSizes: [375, 390, 640, 768, 1024, 1280, 1440, 1920],
          imageSizes: [96, 128, 256, 384],
        },
      }),
  /*
   * basePath をブラウザ用バンドルにも焼き込みます。
   * GITHUB_PAGES / PAGES_BASE_PATH はサーバー側でしか読めないため、
   * クライアントコンポーネント（イントロ動画など）が withBasePath を使うと
   * 本番でだけ basePath が欠けて404になります。env で渡すと両方に埋め込まれます。
   */
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  poweredByHeader: false,
  compress: true,
  experimental: {
    /**
     * ルートレイアウトが `app/[locale]/layout.tsx` にあるため、
     * どのルートにも一致しないURL用の404を app/global-not-found.tsx で定義します。
     */
    globalNotFound: true,
  },
};

export default nextConfig;
