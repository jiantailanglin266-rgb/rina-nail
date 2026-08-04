# ⑯ 今回変更したファイル一覧

すべてビルド・型検査・Lint・テスト（80件）を通過し、
静的エクスポートの出力を実際に検証したうえで反映しています。

## 新規追加

| ファイル | 内容 |
|---|---|
| `src/lib/booking.ts` | **予約リンクの解決を一元化。** 予約URLが未設定のとき、行き止まりにせずアクセスページへ誘導する |
| `src/app/manifest.ts` | Web App Manifest（`/manifest.webmanifest` を生成）。basePath対応済み |
| `docs/seo/*.md`（本ドキュメント群11本） | 診断・KW設計・競合・構造・記事100本・FAQ100問・LLMO・MEO・GBP・E-E-A-T・CVR・外部SEO・ロードマップ |

## 変更

| ファイル | 変更内容 | 目的 |
|---|---|---|
| `src/lib/structured-data.ts` | `compact()` で未確定項目を省略／`geoCoordinates()` `reserveAction()` を条件付き出力に／`hasMap` `areaServed` を追加／`howToJsonLd()` `galleryImagesJsonLd()` を新設／`WebPage` に `speakable` を追加 | **プレースホルダー混入の解消（36件→0件）** とスキーマ拡充 |
| `src/lib/seo.ts` | `absoluteUrl()` を末尾スラッシュ付きに統一 | **sitemapとcanonicalの表記不一致を解消（50件→0件）** |
| `src/data/site.ts` | `areaServed`（四日市＋北勢7自治体）を追加 | ローカルSEO |
| `src/components/ui/MenuCard.tsx` | 未確定料金で `{{PRICE_...}}` を表示しないよう変更 | 本文へのプレースホルダー露出を解消 |
| `src/components/ui/PageSummary.tsx` | `data-speakable` 属性を付与 | Speakableの参照先 |
| `src/components/layout/Header.tsx` | 予約CTAを `bookingLink()` 経由に | 死にリンク解消 |
| `src/components/layout/Footer.tsx` | 同上 | 同上 |
| `src/components/layout/MobileMenu.tsx` | 同上＋`withBasePath()` 適用＋クリックで閉じる | 死にリンク＋**basePath欠落404**の解消 |
| `src/components/layout/FloatingBookingButton.tsx` | 同上＋`withBasePath()` 適用 | 同上（「初回クーポンを見る」の404も解消） |
| `src/components/sections/Hero.tsx` | 予約CTAを `bookingLink()` 経由に | 死にリンク解消 |
| `src/components/sections/CTASection.tsx` | 同上 | 同上 |
| `src/components/ui/CouponCard.tsx` | 同上 | 同上 |
| `src/app/[locale]/page.tsx` | `howToJsonLd` を出力 | HowTo対応 |
| `src/app/[locale]/first-visit/page.tsx` | `howToJsonLd` を出力＋予約CTA修正 | 同上 |
| `src/app/[locale]/gallery/page.tsx` | `galleryImagesJsonLd` を出力 | ImageObject対応 |
| `src/app/[locale]/access/page.tsx` | 予約CTA修正 | 死にリンク解消 |
| `tests/seo.test.ts` | URL正規化・プレースホルダー混入・HowTo・ImageGalleryの検証を追加（+8件） | 回帰防止 |

## 変更していないファイル（意図的）

| ファイル | 理由 |
|---|---|
| `src/app/robots.ts` | 既にAIクローラーを明示許可済み・`Disallow`なし。**変更不要** |
| `src/app/sitemap.ts` | `absoluteUrl()` の修正で自動的に正しくなるため、本体は変更不要 |
| `public/icon.png` / `apple-touch-icon.png` | 既に設置済み |
| `src/app/global-not-found.tsx` | 404は実装済み |
| 301リダイレクト設定 | **GitHub Pagesでは設定できません。** URL変更を伴う施策はVercel移行後に |

---

## 検証結果（ビルド出力の実測）

| 項目 | 修正前 | 修正後 |
|---|---|---|
| HTML内のプレースホルダー露出 | 36件 | **0件** |
| 予約CTAのリンク先 | `{{BOOKING_URL}}`（404） | `/rina-nail/ja/access/`（有効） |
| basePath欠落の内部リンク | 3件（404） | **0件** |
| 内部リンクの到達性 | — | **23件中404が0件** |
| sitemapのURL表記不一致 | 50/50件 | **0/50件** |
| manifest | 無し | `/manifest.webmanifest` を出力 |
| JSON-LDの型数（TOP） | 5種 | **6種**（HowTo追加） |
| JSON-LDの型数（gallery） | 5種 | **6種**（ImageGallery追加） |
| テスト | 72件 | **80件** |

---

## 次に実装が必要なもの（未着手）

| 優先 | 内容 | 規模 |
|---|---|---|
| ★★★ | ブログ機能（`/blog` `/blog/[slug]` `/blog/category/[category]` + BlogPosting schema + sitemap連携） | 大 |
| ★★ | メニューの階層化（`/menu/fill-in` 等）※要301のためVercel移行後 | 中 |
| ★★ | お客様の声セクション（実在の口コミがそろってから） | 小 |
| ★★ | LINE相談CTAの設置 | 小 |
| ★ | HTML軽量化（装飾SVG 232個の削減） | 中 |
| ★ | 実写真への差し替え | — |
