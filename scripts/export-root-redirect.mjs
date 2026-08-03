/**
 * 静的エクスポート（GitHub Pages プレビュー）用の後処理。
 *
 *   GITHUB_PAGES=true npm run build && node scripts/export-root-redirect.mjs
 *
 * 静的ホスティングでは proxy.ts が動かないため、`/` にアクセスしたときの
 * 言語振り分けができません。代わりに `out/index.html` を生成し、
 * ブラウザの言語設定を見て各言語のトップページへ転送します。
 * JavaScript が無効な環境向けに meta refresh と言語リンクも用意しています。
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const basePath = process.env.PAGES_BASE_PATH ?? "";

const LOCALES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh-cn", label: "简体中文" },
  { code: "zh-tw", label: "繁體中文" },
  { code: "ko", label: "한국어" },
];

const DEFAULT_LOCALE = "ja";

const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rina nail</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${basePath}/${DEFAULT_LOCALE}/" />
    <meta http-equiv="refresh" content="0; url=${basePath}/${DEFAULT_LOCALE}/" />
    <script>
      (function () {
        var locales = ${JSON.stringify(LOCALES.map((l) => l.code))};
        var tag = (navigator.language || "${DEFAULT_LOCALE}").toLowerCase();
        var target = "${DEFAULT_LOCALE}";
        if (tag.indexOf("ko") === 0) target = "ko";
        else if (tag.indexOf("zh") === 0)
          target = /(^|-)(tw|hk|mo|hant)(-|$)/.test(tag) ? "zh-tw" : "zh-cn";
        else if (tag.indexOf("en") === 0) target = "en";
        else if (tag.indexOf("ja") === 0) target = "ja";
        if (locales.indexOf(target) === -1) target = "${DEFAULT_LOCALE}";
        location.replace("${basePath}/" + target + "/");
      })();
    </script>
  </head>
  <body>
    <p>Rina nail</p>
    <ul>
${LOCALES.map((l) => `      <li><a href="${basePath}/${l.code}/">${l.label}</a></li>`).join("\n")}
    </ul>
  </body>
</html>
`;

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "index.html"), html, "utf8");
console.log("✓ out/index.html（言語振り分け用のリダイレクトページ）を生成しました");
