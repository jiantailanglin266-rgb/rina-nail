# ⑤ LLMO / GEO（AI検索最適化）

対象: ChatGPT / Gemini / Claude / Perplexity / Google AI Overview

## 現状評価（実測）

| 項目 | 状態 |
|---|---|
| robots.txt で AIクローラー許可 | ✅ GPTBot / OAI-SearchBot / ClaudeBot / PerplexityBot / Google-Extended を明示許可 |
| llms.txt / llms-full.txt | ✅ 実装済み（`/llms.txt` `/llms-full.txt`） |
| ページ冒頭の要約ブロック | ✅ 全ページに設置、`WebPage.description` と一致 |
| Speakable | ✅ **今回追加**（h1 と要約ブロックを指定） |
| HowTo | ✅ **今回追加**（施術の流れ5ステップ） |
| ImageObject | ✅ **今回追加**（ギャラリー全画像） |
| areaServed | ✅ **今回追加**（四日市＋北勢7自治体） |
| プレースホルダー混入 | ✅ **今回解消**（36件→0件） |
| Article / BlogPosting | ❌ ブログ未実装のため無し |
| Review / AggregateRating | ⚠️ **意図的に未実装**（後述） |
| 比較表・定義文 | ❌ 本文に不足 |

---

## 実装済みSchema一覧（今回の変更後）

| Schema | 出力ページ | 実装 |
|---|---|---|
| `NailSalon` + `BeautySalon` + `LocalBusiness` | 全ページ | ✅ |
| `PostalAddress` | 全ページ（LocalBusiness内） | ✅ |
| `GeoCoordinates` | — | ⚠️ 緯度経度の設定待ち（設定すれば自動出力） |
| `OpeningHoursSpecification` | 全ページ | ✅ 営業5日分 |
| `OfferCatalog` / `Service` / `Offer` / `PriceSpecification` | 全ページ | ✅ |
| `Person`（オーナー） | 全ページ | ✅ |
| `WebSite` | 全ページ | ✅ |
| `WebPage` + `SpeakableSpecification` | 全ページ | ✅ |
| `BreadcrumbList` | 下層全ページ | ✅ |
| `FAQPage` | TOP / FAQ | ✅ |
| `HowTo` + `HowToStep` | TOP / first-visit | ✅ |
| `ImageGallery` + `ImageObject` | gallery | ✅ |
| `LocationFeatureSpecification`（駐車場） | 全ページ | ✅ |
| `ReserveAction` + `EntryPoint` | — | ⚠️ 予約URL設定待ち |
| `sameAs` | — | ⚠️ SNS URL設定待ち |
| `Organization` | — | LocalBusiness が上位互換のため不要 |
| `Article` / `BlogPosting` | — | ❌ ブログ実装時に追加 |
| `VideoObject` | — | ❌ 動画コンテンツ作成時に追加 |
| `Review` / `AggregateRating` | — | ⚠️ **下記の理由で実装しません** |

### Review / AggregateRating を実装しない理由

**自作の口コミを構造化データに書くことは Google のスパムポリシー違反**です
（自己申告のレビューはリッチリザルトの対象外、悪質な場合は手動対策の対象）。
実在するお客様の声を、ご本人の許可を得て掲載できるようになってから実装してください。
そのときは以下の形になります（**今は絶対に入れないでください**）。

```json
{
  "@type": "Review",
  "author": { "@type": "Person", "name": "（実在するお客様のお名前・イニシャル）" },
  "datePublished": "2026-08-01",
  "reviewRating": { "@type": "Rating", "ratingValue": 5, "bestRating": 5 },
  "reviewBody": "（実際にいただいた文面をそのまま）",
  "itemReviewed": { "@id": "https://（サイト）/#salon" }
}
```

---

## ブログ実装時に追加するJSON-LD（完成コード）

`src/lib/structured-data.ts` に追加する想定の関数です。

```ts
/** ブログ記事。E-E-A-T のため author を Person に紐付けます */
export function blogPostingJsonLd({
  locale, slug, title, description, datePublished, dateModified, image, category,
}: {
  locale: Locale; slug: string; title: string; description: string;
  datePublished: string; dateModified: string; image: string; category: string;
}): JsonLdObject {
  const url = `${siteUrl}/${locale}/blog/${slug}/`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,            // 110文字以内
    description,
    inLanguage: localeHtmlLang[locale],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${url}#webpage` },
    datePublished,
    dateModified,
    image: { "@type": "ImageObject", url: `${siteUrl}${image}`, width: 1200, height: 630 },
    articleSection: category,
    // 誰が書いたかを明示することが E-E-A-T の中核
    author: { "@id": personId },
    publisher: { "@id": salonId },
    isPartOf: { "@id": websiteId },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "[data-speakable]"] },
  };
}
```

---

## AIが引用しやすい書き方（本文側の対策）

生成AIは「そのまま抜き出せる短い塊」を好みます。以下を全ページ・全記事に入れてください。

### 1. 定義文（1文で言い切る）

```
フィルインとは、ジェルネイルのベースを一層残したまま付け替える施術方法のことです。
```

AIはこの形をそのまま引用します。「〜と言われています」「〜な場合もあります」のような
ぼかした文は引用されません。**主語＋とは＋述語＋です** の形にしてください。

### 2. 比較表（HTMLの `<table>` で書く）

```markdown
| | フィルイン | 通常のオフ |
|---|---|---|
| ベース | 一層残す | すべて除去 |
| 溶剤 | 使わない | 使う |
| 自爪への負担 | 抑えやすい | 相対的に大きい |
| 所要時間 | 短め | 長め |
| できない場合 | 浮きが広い/グリーンネイル | — |
```

画像化した表はAIが読めません。**必ずテキストの表**で書いてください。

### 3. 箇条書きの結論を冒頭に

```markdown
## 結論
- 四日市でフィルイン対応のサロンは複数あるが、完全プライベート（1日1組）は限られる
- 料金相場は3,800円〜6,600円程度
- 「フィルインできるか」は爪の状態次第で、来店時の判断になる
```

### 4. 専門用語解説ブロック

各記事末に用語集を置きます。AIが用語の定義元として参照します。

| 用語 | 説明 |
|---|---|
| フィルイン | ベースを一層残して付け替える施術方法 |
| 一層残し | フィルインの別称 |
| サンディング | 自爪の表面を軽く削ってジェルを密着させる下準備 |
| アセトン | ジェルを溶かす溶剤。フィルインでは使用しない |
| グリーンネイル | 自爪とジェルの間で細菌が繁殖し爪が緑色に変色した状態 |
| 自爪育成 | 自分の爪の状態を整えながら伸ばしていくこと |
| キューティクルケア | 甘皮まわりを整える工程 |
| フォルム | ジェルの厚みと曲線の形状 |

### 5. Q&Aを本文にも書く（FAQPageと二重に）

構造化データだけでなく**本文にもQ&Aを書いてください**。
AI検索は本文テキストを引用元にすることが多いためです。

---

## llms.txt の改善

現在 `/llms.txt` には `{{PHONE_NUMBER}}` 等が「未確定」として出力されています。
これは**意図的な設計で正しい**です（AIに誤情報を渡さないため）。
実値が入れば自動で置き換わります。

ブログ実装後は llms.txt に記事一覧セクションを追加してください。

```
## コラム記事
- フィルインとは: https://（サイト）/ja/blog/what-is-fill-in/
- ジェルで爪が薄くなる理由: https://（サイト）/ja/blog/nail-thin-reason/
```

---

## AI検索での想定質問と、答えられる状態か

| 想定質問 | 現状 | 対策 |
|---|---|---|
| 「四日市でフィルインができるネイルサロンは？」 | △ 情報はあるが競合も同様 | 完全プライベートの掛け合わせで差別化 |
| 「四日市のネイルサロンで駐車場があるところは？」 | ✅ 明記済み | — |
| 「男性でも行けるネイルサロンは四日市にある？」 | ✅ 明記済み | 専用ページ化でさらに強化 |
| 「Rina nailの営業時間は？」 | ✅ 構造化データ完備 | — |
| 「Rina nailの電話番号は？」 | ❌ 未設定 | **要設定** |
| 「Rina nailの予約方法は？」 | ❌ 予約URL未設定 | **要設定（最優先）** |
| 「フィルインとは何ですか？」 | △ 説明はあるが定義文が弱い | 定義文を1文で追記 |
| 「四日市のネイル料金相場は？」 | ❌ 自店の4メニューが未定 | **要設定** |
