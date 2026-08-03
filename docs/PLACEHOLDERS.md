# プレースホルダー一覧

公開前に実際の値へ差し替える必要がある項目の一覧です。
**架空の値は一切入れていません。** 未確定の情報はすべてプレースホルダーのまま出力されます。

---

## 1. 環境変数で差し替えるもの

`.env.local`（本番は Vercel などの環境変数）に設定すると、本文・フッター・
構造化データ（JSON-LD）・`llms.txt` にすべて自動反映されます。

| プレースホルダー    | 環境変数                    | 影響する箇所                                                                                                                        | 未設定時の挙動                                                    |
| ------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `{{BOOKING_URL}}`   | `NEXT_PUBLIC_BOOKING_URL`   | 全ページの予約CTA（ヘッダー／ヒーロー／メニュー／クーポン／フッター／モバイル下部固定バー）、JSON-LD の `ReserveAction`、`llms.txt` | リンク先が文字列のまま。ボタンには「未設定」の `title` が付きます |
| `{{INSTAGRAM_URL}}` | `NEXT_PUBLIC_INSTAGRAM_URL` | ヒーローとフッターのInstagram導線、JSON-LD の `sameAs`、`llms.txt`                                                                  | Instagram導線そのものが**非表示**になります                       |
| `{{PHONE_NUMBER}}`  | `NEXT_PUBLIC_PHONE_NUMBER`  | フッターとアクセスページの電話導線、JSON-LD の `telephone`、`llms.txt`                                                              | 電話導線そのものが**非表示**になります                            |
| `{{LATITUDE}}`      | `NEXT_PUBLIC_LATITUDE`      | JSON-LD の `geo.latitude`                                                                                                           | 文字列のまま出力されます                                          |
| `{{LONGITUDE}}`     | `NEXT_PUBLIC_LONGITUDE`     | JSON-LD の `geo.longitude`                                                                                                          | 文字列のまま出力されます                                          |
| `{{MAP_EMBED_URL}}` | `NEXT_PUBLIC_MAP_EMBED_URL` | アクセスページとトップページの地図枠                                                                                                | 地図枠に「未設定です」という案内文が表示されます                  |
| （正規URL）         | `NEXT_PUBLIC_SITE_URL`      | canonical / hreflang / OGP / sitemap.xml / robots.txt / JSON-LD の全URL                                                             | `https://rina-nail.example.com` が使われます                      |

> **重要**: `{{LATITUDE}}` `{{LONGITUDE}}` `{{PHONE_NUMBER}}` は、未設定のまま公開すると
> JSON-LD に文字列がそのまま入ります。**公開前に必ず設定してください。**
> 値が用意できない場合は、`src/lib/structured-data.ts` の該当プロパティを削除してください
> （`resolved()` ヘルパーで未設定時に省略する形へ変更できます）。

---

## 2. コード内で差し替えるもの（料金）

以下のメニューは金額が未確定のため、`src/data/menu.ts` でプレースホルダーを設定しています。
金額が決まったら `price` に数値（税込・円）を入れ、`pricePlaceholder` の行を削除してください。

| プレースホルダー          | メニュー           | 該当箇所                          |
| ------------------------- | ------------------ | --------------------------------- |
| `{{PRICE_ART_DESIGN}}`    | アート込みデザイン | `src/data/menu.ts` の `menuItems` |
| `{{PRICE_UNLIMITED_ART}}` | つけ放題           | 同上                              |
| `{{PRICE_OFF}}`           | オフ               | 同上                              |
| `{{PRICE_CARE}}`          | ケア               | 同上                              |

差し替え例:

```ts
{
  id: "artDesign",
  category: "art",
- price: null,
- pricePlaceholder: "{{PRICE_ART_DESIGN}}",
+ price: 7500,
+ from: true,          // 「7,500円〜」と表示する場合
  fillIn: true,
  offIncluded: true,
},
```

確定済みの料金（変更不要）:

- ワンカラー: 5,500円〜（オフ込み・フィルイン対応）
- 初回限定デザイン: 7,000円（通常価格 7,500円）
- 平日限定ワンカラー: 5,000円
- 全オフの追加料金: 1本100円から

---

## 3. 画像

`public/images/` 以下はすべて `npm run placeholders` で生成した**仮画像**です。
実写に差し替える手順は [README](../README.md#8-画像の差し替え) を参照してください。

| パス                               | 用途                  | 推奨サイズ |
| ---------------------------------- | --------------------- | ---------- |
| `public/images/hero/hero-main.jpg` | ヒーロー（LCP要素）   | 1200×1500  |
| `public/images/salon/salon-01.jpg` | コンセプトセクション  | 1400×933   |
| `public/images/owner/owner.jpg`    | オーナープロフィール  | 800×1000   |
| `public/images/gallery/*.jpg`      | ギャラリー（14枚）    | 1000×1250  |
| `public/images/common/ogp.png`     | OGP画像（全言語共通） | 1200×630   |
| `public/icon.png`                  | ファビコン            | 512×512    |
| `public/apple-touch-icon.png`      | ホーム画面アイコン    | 180×180    |

---

## 4. 意図的に載せていない情報

以下は事実確認ができないため、**あえて記載していません**。実績ができてから追加してください。

- 口コミ・レビュー（`aggregateRating` / `review` も JSON-LD に含めていません）
- 受賞歴・資格
- 「地域No.1」などの順位表現
- 施術の所要時間の具体的な分数（「メニューにより異なる」と記載）
- 郵便番号（`src/data/site.ts` の `store.address.postalCode` が空文字。判明したら設定してください）
