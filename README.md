# Rina nail（リナネイル）公式サイト

三重県四日市市平尾町の完全予約制・完全プライベートネイルサロン **Rina nail** の公式サイトです。
日本語を原文として、英語・簡体字中国語・繁体字中国語・韓国語の5言語に対応しています。

- コンセプト：**爪にやさしく、私らしく輝く。**
- サブコピー：フィルイン施術で、自爪をいたわりながら長く楽しめるネイルを。

---

## 1. 技術構成

| 項目            | 内容                                                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| フレームワーク  | Next.js 16（App Router / React Server Components）                                                                           |
| 言語            | TypeScript（strict）                                                                                                         |
| UI              | React 19                                                                                                                     |
| スタイル        | Tailwind CSS v4（`src/app/globals.css` の `@theme` でトークン定義）                                                          |
| アニメーション  | CSS keyframes（背景装飾・マーキー）＋ Framer Motion（スクロール表示のみ）                                                    |
| アイコン        | Lucide Icons（Instagram のみ自前のインラインSVG）                                                                            |
| 多言語          | 自前の軽量i18n（`[locale]` セグメント ＋ JSONの辞書）                                                                        |
| 画像            | next/image（AVIF / WebP 自動変換）                                                                                           |
| フォント        | next/font（Noto Sans JP / Zen Kaku Gothic New / Shippori Mincho / Cormorant Garamond / Montserrat）                          |
| 構造化データ    | JSON-LD（NailSalon / LocalBusiness / BeautySalon / Person / Service / Offer / FAQPage / BreadcrumbList / WebSite / WebPage） |
| テスト          | Vitest                                                                                                                       |
| 整形 / 静的解析 | Prettier / ESLint                                                                                                            |
| デプロイ想定    | Vercel（GitHub Pages での静的プレビューにも対応）                                                                            |

### 設計の要点

- **テキストはコンポーネントに直書きしない。** 表示文言はすべて `src/i18n/messages/*.json` にあります。
- **構造データとコンテンツを分離。** 価格・営業時間・画像パスなどは `src/data/` にあり、
  将来ヘッドレスCMSへ移す場合もこの層だけを差し替えれば済みます。
- **本文と JSON-LD と llms.txt は同じデータ源から生成。** 三者の内容が食い違いません。
- **クライアントコンポーネントは3つだけ。** 言語切り替え、モバイルメニュー、ギャラリー絞り込み、
  そしてスクロール表示（`Reveal`）のみ。背景装飾・マーキー・FAQアコーディオンは
  CSS と `<details>` で実装しているため、クライアントJSを使いません。

---

## 2. セットアップ

```bash
npm install
cp .env.example .env.local
```

### 開発サーバー

```bash
npm run dev
```

http://localhost:3000 で起動します（`/` は言語判定のうえ `/ja` などへ転送されます）。

### 本番ビルド / 起動

```bash
npm run build
npm run start
```

### コマンド一覧

| コマンド               | 内容                                        |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | 開発サーバー                                |
| `npm run build`        | 本番ビルド                                  |
| `npm run start`        | 本番サーバー                                |
| `npm run typecheck`    | TypeScript の型チェック（翻訳の欠落も検出） |
| `npm run lint`         | ESLint                                      |
| `npm run test`         | Vitest（翻訳キーの整合・SEO設定の検証）     |
| `npm run format`       | Prettier で整形                             |
| `npm run placeholders` | 仮画像を再生成                              |

---

## 3. ディレクトリ構成

```text
src/
├── app/
│   ├── [locale]/                ロケール付きの全ページ（ルートレイアウトもここ）
│   │   ├── layout.tsx           <html lang> / フォント / ヘッダー / フッター / 共通JSON-LD
│   │   ├── page.tsx             トップページ
│   │   ├── not-found.tsx        ロケール配下の404
│   │   ├── menu/                メニュー・料金
│   │   ├── gallery/             デザインギャラリー
│   │   ├── fill-in/             フィルイン解説
│   │   ├── first-visit/         初めての方へ
│   │   ├── access/              アクセス・営業時間
│   │   ├── faq/                 よくある質問
│   │   ├── about/               サロン情報
│   │   ├── privacy/             プライバシーポリシー
│   │   └── terms/               利用規約
│   ├── global-not-found.tsx     どのルートにも一致しないURLの404
│   ├── globals.css              デザインシステム（カラー / フォント / アニメーション）
│   ├── sitemap.ts               sitemap.xml（全言語 × 全ページ ＋ hreflang）
│   ├── robots.ts                robots.txt
│   ├── llms.txt/route.ts        生成AI向けのサイト要約
│   └── llms-full.txt/route.ts   生成AI向けの全ページ内容
├── components/
│   ├── layout/                  Header / MobileMenu / LanguageSwitcher / Footer / Section など
│   ├── sections/                Hero / GalleryGrid / OwnerProfile / FAQAccordion / AccessMap など
│   ├── ui/                      ActionLink / GradientText / MenuCard / CouponCard / JsonLd など
│   └── animations/              Reveal / Marquee / AnimatedGoldBackground
├── data/                        構造データ（site / menu / hours / gallery / navigation）
├── i18n/
│   ├── config.ts                対応言語・言語判定・Cookie設定
│   ├── dictionary.ts            翻訳の読み込み（サーバー専用）
│   └── messages/                ja.json / en.json / zh-cn.json / zh-tw.json / ko.json
├── lib/                         seo / structured-data / breadcrumbs / llms-txt / utils
└── proxy.ts                     「/」のロケール判定リダイレクト（Next.js 16 の Middleware）

public/
├── images/                      仮画像（hero / salon / owner / gallery / common）
├── icon.png
└── apple-touch-icon.png

scripts/
├── generate-placeholders.mjs    仮画像の生成
└── export-root-redirect.mjs     静的エクスポート時のルート転送ページ生成

docs/
└── PLACEHOLDERS.md              公開前に差し替える項目の一覧
```

---

## 4. 多言語の仕組み

### URL設計

| 言語           | URL      | hreflang  |
| -------------- | -------- | --------- |
| 日本語（原文） | `/ja`    | `ja`      |
| 英語           | `/en`    | `en`      |
| 簡体字中国語   | `/zh-cn` | `zh-Hans` |
| 繁体字中国語   | `/zh-tw` | `zh-Hant` |
| 韓国語         | `/ko`    | `ko`      |

`x-default` には原文である日本語版（`/ja`）を割り当てています。

### 言語の判定と保存

1. `/` へアクセスすると `src/proxy.ts` が動きます
2. Cookie（`NEXT_LOCALE`）に保存された言語があればそれを使います
3. なければ `Accept-Language` から推定します（中国語は地域サブタグを見て簡体字／繁体字を出し分け）
4. どれにも当てはまらなければ日本語へ

ヘッダーの言語切り替えUIで言語を選ぶと、その選択が Cookie（1年）に保存されます。
ロケール付きのページはすべてビルド時に静的生成されるため、`proxy.ts` が動くのは
ロケールなしのURLへアクセスされたときだけです。

### 翻訳の追加・修正

1. `src/i18n/messages/ja.json` を編集します（**日本語が原文です**）
2. 他言語の同じキーを編集します
3. `npm run typecheck` を実行します

日本語版の型（`typeof ja`）を全言語の型として使っているため、
**キーが欠けていると型エラーになります。** 翻訳漏れがビルド前に検出できます。
`npm run test` では、キー構造の一致・空文字の混入・店舗名の表記揺れも検証しています。

### 言語を追加する場合

1. `src/i18n/config.ts` の `locales` / `localeNames` / `localeHtmlLang` / `localeOgLocale` に追記
2. `src/i18n/messages/<locale>.json` を作成（`ja.json` をコピーして翻訳）
3. `src/i18n/dictionary.ts` の `dictionaries` に追記

sitemap・hreflang・言語切り替えUI・`llms.txt` はすべて `locales` から生成されるため、
上記3ステップだけで全体に反映されます。

---

## 5. SEO設計

- ページごとの固有 `title` / `description`（`src/i18n/messages/*.json` の `seo` セクション）
- `canonical`（言語別の絶対URL）
- `hreflang`（5言語 ＋ `x-default`）— メタタグと sitemap.xml の両方に出力
- OGP / Twitter Card（言語別の `og:locale`）
- `robots.txt` — インデックス全面許可。`noindex` / `Disallow: /` は使用していません
- `sitemap.xml` — 全言語 × 全ページ（50URL）＋ 各URLに hreflang
- パンくずリスト（表示と `BreadcrumbList` を同じデータから生成）
- 見出し階層（各ページ `h1` は1つ、セクションは `h2` 以下）
- 全画像に `alt`（ギャラリーはカテゴリー名から言語別に自動生成）
- 内部リンク（ヘッダー / フッター / 各セクションのCTA / 関連ページ導線）

### 主要キーワード（ローカルSEO）

四日市 ネイルサロン / 四日市 フィルイン / 四日市 プライベートネイルサロン /
三重県 ネイルサロン / 四日市 ワンカラーネイル / 四日市 ネイルアート /
四日市 自宅ネイルサロン / 四日市 メンズネイル / 平尾町 ネイルサロン

---

## 6. LLMO（生成AI最適化）設計

- **`/llms.txt`** — サイト名・店舗概要・主要ページ一覧・サービス概要・営業時間・所在地・
  予約方法・問い合わせ・多言語ページ・注意事項・正規URLを1ファイルにまとめています
- **`/llms-full.txt`** — 全ページの本文相当をプレーンテキストで出力します
- **ページごとの要約文** — 各ページ冒頭に要約ブロックを設置し、同じ文章を
  JSON-LD の `WebPage.description` にも使っています（本文と構造化データが一致）
- **表形式の店舗概要** — サロン情報ページに、機械可読な表として基本情報を掲載
- **Q&A の充実** — FAQページ（11問）と `FAQPage` 構造化データ
- **固有名詞の統一** — 店舗名・住所・人名は `src/data/site.ts` の1か所で定義
- **robots.txt** — GPTBot / ClaudeBot / PerplexityBot / Google-Extended などを明示的に許可

### 表現方針

事実確認できない内容は書きません。

- 「絶対に傷まない」とは書かず、**「自爪への負担を抑える」**と表現しています
- 医療的・治療的な断定表現を使っていません（利用規約に「医療行為を行いません」と明記）
- 実在しない口コミ・受賞歴・順位表現（No.1 など）は掲載していません
- そのため JSON-LD にも `aggregateRating` / `review` を含めていません

---

## 7. プレースホルダーの差し替え

**公開前に必ず [docs/PLACEHOLDERS.md](docs/PLACEHOLDERS.md) を確認してください。**

架空の電話番号・SNSアカウント・予約URLは一切入れていません。未確定の項目は
`{{BOOKING_URL}}` のようなプレースホルダーのまま出力されます。

### 予約URLの差し替え

`.env.local`（本番は Vercel の環境変数）に1行追加するだけです。

```bash
NEXT_PUBLIC_BOOKING_URL=https://example.com/reserve
```

これだけで、以下すべてが同時に切り替わります。

- ヘッダーの「予約する」
- ヒーローの「空席確認・予約する」
- メニュー / クーポン / 各ページ下部のCTA
- モバイル画面下部の固定バー
- JSON-LD の `ReserveAction`
- `llms.txt` の予約URL

---

## 8. 画像の差し替え

`public/images/` の仮画像を、**同じパス・同じ縦横比**のファイルで上書きするだけです。
コード側の変更は必要ありません。

```bash
# 例：ヒーロー画像を差し替える
cp /path/to/実写.jpg public/images/hero/hero-main.jpg
```

サイズが変わる場合は、`src/data/gallery.ts`（ギャラリー）または各コンポーネントの
`width` / `height` を実寸に合わせてください（CLS防止のため必ず指定しています）。

仮画像を作り直す場合は `npm run placeholders` を実行します。

### ギャラリーに画像を追加する

1. `public/images/gallery/` に画像を置く
2. `src/data/gallery.ts` の `galleryItems` に1行追加する

alt テキストはカテゴリー名から言語別に自動生成されるため、追加作業は不要です。

### OGP画像

`public/images/common/ogp.png`（1200×630）が全言語共通で使われます。
言語別に分けたい場合は、`src/lib/seo.ts` の `pageMetadata()` に `image` を渡してください。

---

## 9. デプロイ

### Vercel（推奨）

1. リポジトリを Vercel にインポート
2. 環境変数を設定（最低限 `NEXT_PUBLIC_SITE_URL`、公開前に `NEXT_PUBLIC_BOOKING_URL`）
3. デプロイ

ビルド設定はデフォルトのままで動きます（`next build` / 出力は自動検出）。
`src/proxy.ts` による `/` のロケール判定リダイレクトもそのまま有効です。

### GitHub Pages（プレビュー用）

静的エクスポートに切り替えます。`proxy.ts` は動かないため、
`/` 用のリダイレクトページを後処理で生成します。

```bash
GITHUB_PAGES=true PAGES_BASE_PATH=/rina-nail npm run build
PAGES_BASE_PATH=/rina-nail node scripts/export-root-redirect.mjs
# 生成物は out/ に出力されます
```

静的エクスポートでは next/image の最適化APIが使えないため、`images.unoptimized` になります。
**本番は Vercel など Node ランタイムのある環境を推奨します。**

---

## 10. Lighthouse 改善ポイント

現状の実装で対策済みの項目と、公開後に見直したい項目です。

### 対策済み

| 項目           | 対応                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------- |
| LCP            | ヒーロー画像に `priority`、`sizes` を指定。日本語フォントは `preload: false` で初期転送量を削減 |
| CLS            | 全画像に `width` / `height` を明示。地図枠は `aspect-ratio` で高さを固定                        |
| TBT            | クライアントコンポーネントを4つに限定。背景装飾・マーキー・FAQはCSSのみで実装                   |
| 画像           | next/image による AVIF / WebP 自動変換、`loading="lazy"`（ヒーロー以外）                        |
| フォント       | `display: swap`。日本語フォントは preload せず描画を止めない                                    |
| アニメーション | `transform` / `opacity` のみを動かし GPU 負荷を抑制。無限ループは低速                           |
| モバイル       | `decor-desktop-only` により、モバイルでは背景装飾の要素数を減らす                               |
| a11y           | フォーカス表示、`aria-expanded` / `aria-controls`、スキップリンク、装飾の `aria-hidden`         |
| 動きの抑制     | `prefers-reduced-motion` でアニメーションを停止（マーキーは先頭位置で固定）                     |

### 公開後に確認したい項目

1. **実写画像の最適化** — 仮画像は軽量ですが、実写に差し替えると LCP が悪化しやすくなります。
   ヒーロー画像は 200KB 以下を目安に圧縮してください。
2. **フォントのサブセット化** — 日本語フォントは容量が大きいため、
   使用文字が確定したらサブセット化を検討してください。
3. **地図の埋め込み** — Google マップの iframe は重いため、
   `loading="lazy"` を維持したうえで、必要ならクリック後に読み込む方式へ変更してください。
4. **Framer Motion の削減** — さらに軽くしたい場合、`Reveal` を
   CSS の `animation-timeline: view()` に置き換えると Framer Motion を完全に外せます。
5. **Search Console / 構造化データテスト** — 公開後に
   [リッチリザルトテスト](https://search.google.com/test/rich-results) で JSON-LD を検証してください。

---

## 11. 今後の拡張

- **CMS連携** — `src/data/` の各モジュール（`getMenu()` のような関数に置き換え）だけを
  差し替えれば、UI側の変更なしでヘッドレスCMSへ移行できます
- **お知らせ機能** — `src/app/[locale]/news/` を追加し、`src/data/news.ts` を作る想定です
- **予約システムの内製化** — 現状は外部予約サイトへのリンクです
- **住所の表示調整** — 個人宅サロンのため、番地を非表示にする場合は
  `src/data/site.ts` の `store.address` を変更するだけで、本文・フッター・JSON-LD に反映されます
