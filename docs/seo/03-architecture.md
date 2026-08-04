# ④⑫ サイト構造・トピッククラスター・内部リンク設計

## 現状の構造（10ページ・階層1段）

```
TOP
├ menu / gallery / fill-in / first-visit / access / faq / about
└ privacy / terms
```

**問題点:** 全ページがTOP直下のフラット構造。
「サービス」も「情報」も同列で、トピックの関連性がGoogleに伝わりません。
またブログ階層が無いため、情報収集クエリの受け皿が0です。

---

## 再設計する構造（4階層 / トピッククラスター）

```
TOP（ハブ: 四日市のプライベートネイルサロン）
│
├─【カテゴリ: サービス】
│   ├─ /menu（料金一覧・ハブ）
│   │   ├─ /menu/fill-in ……… フィルイン（既存 /fill-in から移設）
│   │   ├─ /menu/care …………… ネイルケア・自爪育成
│   │   ├─ /menu/mens ………… メンズネイル
│   │   └─ /menu/foot ………… フットネイル
│   │
│   └─ /gallery（デザイン集・ハブ）
│       ├─ /gallery/simple  /office  /nuance
│       └─ /gallery/glitter /gorgeous /seasonal /mens
│
├─【カテゴリ: 来店前情報】
│   ├─ /first-visit（初めての方へ・ハブ）
│   ├─ /access（アクセス・駐車場）
│   └─ /about（サロン・ネイリスト紹介）
│
├─【ブログ】/blog（新設・最重要）
│   ├─ /blog/category/fill-in ……… フィルイン・自爪の知識
│   ├─ /blog/category/care ………… 爪のお悩み・ケア
│   ├─ /blog/category/design ……… デザイン・トレンド
│   ├─ /blog/category/first-time … 初めての方向け
│   ├─ /blog/category/local ……… 四日市の地域情報
│   └─ /blog/category/season …… 季節・イベント
│
├─【FAQ】/faq（ハブ）
│   └─ カテゴリ別アンカー（#booking #fill-in #price #access #mens …）
│
└─【規約】/privacy /terms
```

---

## トピッククラスター（3クラスター）

### クラスター1: フィルイン（最重要・主軸の差別化）

```
ピラー: /menu/fill-in「フィルインとは｜四日市で自爪への負担を抑えるネイル」
  ├→ /blog/fill-in-vs-off      フィルインと通常オフの違い
  ├→ /blog/fill-in-demerit     フィルインのデメリットと向かない爪
  ├→ /blog/nail-thin-reason    ジェルで爪が薄くなる本当の理由
  ├→ /blog/paragel-difference  パラジェルとフィルインは何が違う？
  ├→ /blog/fill-in-price       フィルインの料金相場（四日市）
  └→ /blog/other-salon-off     他店のジェルもフィルインできる？
（全記事 → ピラーへ内部リンク／ピラー → 全記事へリンク／ピラー → /menu → 予約）
```

### クラスター2: 初めてのネイルサロン（不安解消 → 予約）

```
ピラー: /first-visit
  ├→ /blog/first-time-anxiety   ネイルサロンが初めてで不安な方へ
  ├→ /blog/salon-conversation   会話が苦手でも大丈夫な理由
  ├→ /blog/nail-flow            当日の流れと所要時間
  ├→ /blog/work-friendly-nail   職場でも浮かないネイル
  ├→ /blog/mens-nail-first      男性が初めてネイルケアに行くとき
  └→ /blog/kids-ok              子連れで行けるネイルサロン
```

### クラスター3: 四日市ローカル（MEO連動）

```
ピラー: /access
  ├→ /blog/yokkaichi-nail-parking  駐車場のあるネイルサロンの探し方
  ├→ /blog/hirao-access            平尾町までの道順（写真つき）
  ├→ /blog/yokkaichi-nail-price    四日市のネイル料金相場
  └→ /blog/kintetsu-yokkaichi      近鉄四日市からの行き方
```

---

## 内部リンク設計（リンクジュースの流し方）

### 原則

1. **TOPのリンク先を絞る。** TOPから全ページに均等リンクすると評価が分散します。
   TOPからは「menu / fill-in / gallery / first-visit / access」の**5本を本文リンクで強調**。
2. **ブログ記事は必ずピラーページへ1本以上リンク。** ブログが集めた評価をピラーに集約します。
3. **ピラーは予約CTAへ。** 集めた評価を予約に変換します。
4. **ブログ同士は同一クラスター内のみ相互リンク。** クラスターを跨ぐリンクは薄めます。

### リンク本数の設計

| ページ | 受けるリンク（目標） | 出すリンク |
|---|---|---|
| TOP | 全ページのヘッダー/フッター | 主要5 + フッター全 |
| /menu/fill-in（ピラー） | **ブログ6本 + TOP + menu** | クラスター記事6 + /menu + 予約 |
| /first-visit（ピラー） | ブログ6本 + TOP | クラスター記事6 + 予約 |
| /access（ピラー） | ブログ4本 + TOP + 全ページfooter | クラスター記事4 + 地図 + 予約 |
| ブログ個別 | 同クラスター2〜3本 | ピラー1 + 同クラスター2 + 予約1 |

### 実装上の注意（このサイト固有）

- **生の `<a>` でサイト内リンクを書かないこと。** `next/link` は basePath を自動付与しますが、
  生の `<a>` は付かず404になります（実際に3件発生していました）。
  やむを得ず `<a>` を使う場合は `withBasePath()` を必ず通してください。
- 内部リンクは `localeHref(locale, path)` で言語を保持すること。
  言語を跨ぐリンクは hreflang の整合を崩します。

---

## パンくず設計

現状は下層ページに `BreadcrumbList` を出力済み（✅ 実装確認済み）。
階層化にあわせて2段構成に拡張します。

```
ホーム > メニュー・料金 > フィルイン
ホーム > ギャラリー > ニュアンス
ホーム > ブログ > フィルインの知識 > フィルインと通常オフの違い
```

JSON-LD（実装済みの `breadcrumbJsonLd()` にそのまま渡せます）:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム",
      "item": "https://（サイト）/ja/" },
    { "@type": "ListItem", "position": 2, "name": "ブログ",
      "item": "https://（サイト）/ja/blog/" },
    { "@type": "ListItem", "position": 3, "name": "フィルインの知識",
      "item": "https://（サイト）/ja/blog/category/fill-in/" },
    { "@type": "ListItem", "position": 4, "name": "フィルインと通常オフの違い",
      "item": "https://（サイト）/ja/blog/fill-in-vs-off/" }
  ]
}
```

---

## URL設計ルール

| ルール | 例 |
|---|---|
| 英小文字・ハイフン区切り | `/blog/fill-in-vs-off/` |
| 末尾スラッシュあり（canonicalと統一） | `/ja/menu/fill-in/` |
| 言語は先頭セグメント | `/ja/` `/en/` `/zh-cn/` `/zh-tw/` `/ko/` |
| 日付をURLに含めない | ❌ `/blog/2026/03/...` |
| カテゴリはURLに含める（ブログのみ） | `/blog/category/fill-in/` |
| **既存URLを変える場合は301必須** | `/fill-in/` → `/menu/fill-in/` |

> ⚠️ GitHub Pages は 301リダイレクトを設定できません。
> `/fill-in` → `/menu/fill-in` の移設を行う場合は、
> **Vercel等（`next.config.ts` の `redirects()` が使える環境）へ移行してから**実施してください。
> 移行前に実施すると、既存の評価が失われます。
