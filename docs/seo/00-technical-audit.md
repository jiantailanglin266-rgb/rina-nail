# ① 技術診断と改善（実施済み／要対応）

対象: `https://jiantailanglin266-rgb.github.io/rina-nail/`
診断方法: 実際にビルドした静的エクスポート（公開ファイルと同一）を機械的に解析。
推測ではなく出力されたHTML・JSON-LD・sitemap.xml・robots.txt を直接検証しています。

> 注記: この作業環境からは `github.io` への外部アクセスがプロキシで遮断されているため、
> 公開URLのブラウザ実表示・Lighthouse実測・Search Console の値は確認できていません。
> ここに書いているのは **ビルド成果物から検証できた事実** に限定しています。

---

## サマリー（重大度順）

| # | 問題 | 重大度 | 状態 |
|---|---|---|---|
| 1 | 予約CTA 30箇所すべてが `{{BOOKING_URL}}` という文字列にリンク。押しても存在しないURLへ飛ぶ | 致命的 | **修正済み**（暫定） |
| 2 | JSON-LD に `{{LATITUDE}}` `{{LONGITUDE}}` `{{PHONE_NUMBER}}` が文字列のまま出力 | 致命的 | **修正済み** |
| 3 | メニューページに `{{PRICE_ART_DESIGN}}` 等が本文として表示 | 高 | **修正済み** |
| 4 | モバイル固定バーの「初回クーポンを見る」が basePath 欠落で404 | 高 | **修正済み** |
| 5 | sitemap.xml の全50URLが canonical と表記不一致（末尾スラッシュ） | 高 | **修正済み** |
| 6 | ブログ／コラムが0本。情報収集クエリの受け皿が無い | 高 | 未対応（要実装） |
| 7 | Web App Manifest が無い | 中 | **修正済み** |
| 8 | HowTo / ImageObject / Speakable / areaServed 未実装 | 中 | **修正済み** |
| 9 | HTML 977KB（うちRSCペイロード569KB・インラインSVG170KB） | 中 | 未対応（要検討） |
| 10 | NAP不完全（郵便番号・電話・緯度経度・予約URL・SNS が全て未設定） | 致命的 | **オーナー入力待ち** |

---

## 1. 予約CTAが全て行き止まり【致命的】

### ■問題点
ビルド出力を検索した結果、トップページだけで **`href="{{BOOKING_URL}}"` が30箇所**。
ヘッダー・ヒーロー・クーポン・フッター・モバイル固定バー・モバイルメニューの
すべての予約ボタンが該当します。相対URLとして解決されるため
`/rina-nail/ja/{{BOOKING_URL}}` という存在しないパスへ遷移し、404になります。

### ■改善理由
**予約数が構造的にゼロになります。** SEO・MEO・LLMOで流入を増やしても、
着地後の唯一のゴールが機能していないため、投資が全て無駄になります。
最優先で直すべき箇所です。

### ■改善内容
予約リンクの解決を1か所に集約する `src/lib/booking.ts` を新設しました。
予約URLが未設定のあいだは、行き止まりにせず**アクセスページ**
（住所・営業時間・地図・ご予約の案内がある）へ誘導します。

```ts
export function bookingLink(locale: Locale): BookingLink {
  if (isPlaceholder(links.booking)) {
    return { href: localeHref(locale, routes.access.path), external: false, isConfigured: false };
  }
  return { href: links.booking, external: true, isConfigured: true };
}
```

サイト内の予約CTAはすべてこの関数を経由するようにしました
（Header / Hero / CTASection / CouponCard / Footer / MobileMenu /
FloatingBookingButton / access / first-visit）。

### ■期待効果
死にリンク30件を解消。予約URLを設定すれば**1箇所の環境変数で全CTAが自動的に
予約サイトへ切り替わります**（コード変更不要）。

### ■残っている対応（オーナー）
`.env.local` または GitHub Actions の環境変数に実際の予約URLを設定してください。
これが最も効果の大きい1手です。

```bash
NEXT_PUBLIC_BOOKING_URL=https://（ホットペッパー等の予約ページURL）
```

---

## 2. 構造化データにプレースホルダーが混入【致命的】

### ■問題点
`LocalBusiness`（NailSalon）の JSON-LD に、次の値が文字列のまま出力されていました。

```json
"geo": { "@type": "GeoCoordinates", "latitude": "{{LATITUDE}}", "longitude": "{{LONGITUDE}}" },
"telephone": "{{PHONE_NUMBER}}",
"potentialAction": { "target": { "urlTemplate": "{{BOOKING_URL}}" } }
```

### ■改善理由
緯度経度は数値、電話番号は電話番号として解釈されます。
そこに `{{LATITUDE}}` が入ると **不正な値** として扱われ、
最悪の場合 LocalBusiness エンティティ全体が無効と判定されます。
**「項目が無い」より「間違った値がある」ほうが有害**です。
Googleマップ・AI検索の双方で店舗情報の信頼度に直結します。

### ■改善内容
未確定の項目は**キーごと出力しない**方式に変更しました。

```ts
function compact(obj: JsonLdObject): JsonLdObject {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

function geoCoordinates(): JsonLdObject | undefined {
  const latitude = resolved(placeholders.latitude);
  const longitude = resolved(placeholders.longitude);
  if (!latitude || !longitude) return undefined;   // 片方でも欠けたら出さない
  return { "@type": "GeoCoordinates", latitude, longitude };
}
```

緯度経度が無くても場所を示せるよう `hasMap`（Googleマップの店舗URL）を追加しました。

回帰防止テストも追加しています。

```ts
it("JSON-LD にプレースホルダー文字列が一切出力されない", () => {
  expect(JSON.stringify(salonJsonLd("ja", ja))).not.toMatch(/\{\{[A-Z_]+\}\}/);
});
```

### ■期待効果
検証: 修正前 **36件** のプレースホルダー露出 → 修正後 **0件**。
LocalBusiness が有効な構造化データとして解釈されるようになります。

---

## 3. 料金プレースホルダーが本文に表示

### ■問題点
メニューカードが `{{PRICE_ART_DESIGN}}` `{{PRICE_UNLIMITED_ART}}` を
そのままお客様に表示していました。

### ■改善理由
未完成のサイトという印象を与え、離脱と信頼低下に直結します。

### ■改善内容
未確定メニューは「料金確定後に掲載します」だけを表示し、
プレースホルダー文字列は出さないようにしました（架空の価格は出しません）。

---

## 4. basePath 欠落によるサイト内リンク404

### ■問題点
`next/link` は basePath を自動付与しますが、生の `<a>` は付きません。
そのため以下が `/ja/menu`（正: `/rina-nail/ja/menu/`）となり404していました。

- モバイル固定バー「初回クーポンを見る」（以前から発生）
- モバイルメニューの予約ボタン

### ■改善内容
`withBasePath()` を明示適用。検証結果: **内部リンク23件中、404になるもの0件**。

---

## 5. sitemap.xml と canonical の表記不一致

### ■問題点

| | URL |
|---|---|
| canonical | `.../rina-nail/ja/menu/`（末尾スラッシュあり） |
| sitemap.xml | `.../rina-nail/ja/menu`（**なし**） |

**50URL中50URLが不一致**でした。

### ■改善理由
静的エクスポートは `trailingSlash: true` のため、実体は `<path>/index.html`。
sitemapのURLはリダイレクト対象になり、Search Console上で
「リダイレクトを含むURL」として扱われ、インデックス処理が遅れます。

### ■改善内容
`absoluteUrl()` で正規形（末尾スラッシュ付き）に統一。sitemap・hreflang・canonical が完全一致。

```ts
export function absoluteUrl(locale: Locale, path: string): string {
  const url = `${siteUrl}/${locale}${path}`;
  return url.endsWith("/") ? url : `${url}/`;
}
```

検証: 末尾スラッシュ無し **50件 → 0件**。

---

## 6. 診断: 問題が無かった項目（確認済み）

推測で「要改善」と書かないため、正常だった項目も記録します。

| 項目 | 結果 |
|---|---|
| title | `四日市のフィルインネイルサロン Rina nail｜完全個室・駐車場あり`（33文字・主軸KW前方一致）✓ |
| description | 全ページ設定済み・重複なし ✓ |
| H1 | 各ページ1つ ✓ / H2は16個で階層崩れなし ✓ |
| canonical | 全ページ絶対URLで設定 ✓ |
| hreflang | 5言語＋x-default の6本を全ページに出力 ✓ |
| OGP / Twitter Card | `summary_large_image`・og:image絶対URL ✓ |
| 画像alt | 9枚すべて設定・空alt無し ✓ |
| LCP | ヒーロー画像に `<link rel="preload" as="image">` が出力済み ✓ |
| CLS | 画像は全て width/height 指定、地図とマーキーは高さ固定 ✓ |
| robots.txt | `Disallow` 無し。GPTBot / ClaudeBot / PerplexityBot / Google-Extended を明示許可 ✓ |
| 404 | `global-not-found.tsx` で全言語対応 ✓ |
| favicon | icon.png / apple-touch-icon.png あり ✓ |
| パンくず | 下層ページに BreadcrumbList 出力済み ✓ |
| JS | 装飾はCSSアニメーション中心。クライアントコンポーネントは3つのみ ✓ |

---

## 7. 未対応（要判断）: HTMLの重さ

### ■問題点
トップページのHTMLが **977KB**。内訳を実測しました。

| 内訳 | サイズ |
|---|---|
| RSCフライトペイロード（`self.__next_f`） | 569KB |
| インラインSVG（サルビア装飾 232個） | 170KB |
| その他HTML | 238KB |

### ■改善理由
モバイル4G回線ではHTML転送だけで体感が変わります。
装飾SVGはサーバーで描画したDOMとRSCペイロードで**二重に転送**されています。

### ■改善案（未実施・要判断）
1. サルビアの装飾要素数を、モバイルで現在の1/3程度まで減らす
2. 花のSVGを `<symbol>` + `<use>` に集約し、同じパスの重複を排除する
3. 装飾レイヤーをクライアントコンポーネント化してRSCペイロードから外す

いずれも見た目が変わるため、実施前にご判断ください。
1と2だけで **300〜400KB程度の削減** が見込めます。

---

## 8. 最優先の未対応: NAP情報の不足【オーナー対応】

技術面をどれだけ整えても、以下が空欄のままではローカル検索で勝てません。

| 項目 | 環境変数 | 影響 |
|---|---|---|
| 予約URL | `NEXT_PUBLIC_BOOKING_URL` | **予約導線ゼロ**。最優先 |
| 電話番号 | `NEXT_PUBLIC_PHONE_NUMBER` | JSON-LD `telephone`・電話CTA・GBPとの整合 |
| 郵便番号 | `src/data/site.ts` の `postalCode` | PostalAddress の完全性 |
| 緯度経度 | `NEXT_PUBLIC_LATITUDE` / `LONGITUDE` | マップ表示精度・GeoCoordinates |
| Instagram | `NEXT_PUBLIC_INSTAGRAM_URL` | `sameAs`（エンティティ確立に直結） |
| 料金4件 | `src/data/menu.ts` | Offer の完全性・比較検討時の離脱防止 |
