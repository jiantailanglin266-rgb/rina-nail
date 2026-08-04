<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Rina nail — 作業時の約束

- **表示テキストをコンポーネントへ直書きしない。** すべて `src/i18n/messages/*.json` に置き、
  日本語（`ja.json`）を原文とします。キーを追加したら5言語すべてに追加してください
  （`npm run typecheck` で欠落を検出できます）。
- **店舗情報・料金・営業時間は `src/data/` が唯一の情報源。** 本文・JSON-LD・llms.txt は
  すべてここから生成しているため、直接コンポーネントに書くと三者がずれます。
- **架空の情報を作らない。** 電話番号・SNS・予約URL・緯度経度・口コミ・受賞歴・
  未確定の料金はプレースホルダー（`{{...}}`）のままにします。詳細は `docs/PLACEHOLDERS.md`。
- **「傷まない」と書かない。** 「自爪への負担を抑える」と表現します。医療的・治療的な断定もしません。
- **`noindex` / `nofollow` / `Disallow: /` を入れない。**
- クライアントコンポーネントは必要最小限に。装飾アニメーションはCSS、FAQは `<details>` で実装しています。
- 変更後は `npm run typecheck && npm run lint && npm run test && npm run build` を通してください。

## 変更したら「デプロイ完了 → 公開URL報告」まで必ずやり切る

サイトに変更を加えたら、**指示を待たずに毎回**、以下を最後まで実行してください。
**プッシュした時点で終わらせないこと。** 「URLを教えて」と聞かれるのを待たないこと。

### 手順（1つも省略しない）

1. `npm run typecheck && npm run lint && npm run test && npm run build` を通す
2. コミットして作業ブランチへプッシュする
3. **デプロイを実行する**
4. **デプロイ完了を確認する**（下記のコマンドで success を確認するまで待つ）
5. **変更が反映された公開URLを出力する**

### デプロイの実行

Pages の環境保護ルールにより、**デプロイはデフォルトブランチからしか実行できません**。
現在のデフォルトブランチは `claude/rina-nail-website-ygjezu` です
（`main` に変更された場合は `main` への push で自動デプロイされます。
deploy ジョブはデフォルトブランチ以外ではスキップされる設定です）。

作業ブランチへの push では自動デプロイが走らないため、**手動でトリガーします**。

```
mcp__github__actions_run_trigger（method: run_workflow, workflow_id: pages.yml,
                                  ref: claude/rina-nail-website-ygjezu）
```

### デプロイ完了の確認

```bash
OWNER=jiantailanglin266-rgb; REPO=rina-nail; BR=claude/rina-nail-website-ygjezu
until [ "$(curl -s "https://api.github.com/repos/$OWNER/$REPO/actions/workflows/pages.yml/runs?branch=$BR&per_page=1" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['workflow_runs'][0]['status'])")" = "completed" ]; do sleep 20; done

did=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/deployments?per_page=1" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)[0]['id'])")
curl -s "https://api.github.com/repos/$OWNER/$REPO/deployments/$did/statuses" \
  | python3 -c "import sys,json;s=json.load(sys.stdin)[0];print(s['state'], s.get('environment_url'))"
```

`state` が `success` になったら報告します。失敗した場合は、**その事実と原因を必ず報告**してください
（黙ってプッシュだけで終えない）。

### 報告に必ず含めるもの

1. **公開サイト**: https://jiantailanglin266-rgb.github.io/rina-nail/
2. **リポジトリ**: https://github.com/jiantailanglin266-rgb/rina-nail
3. **デプロイ結果**: success / failure

なお `github.io` への外部アクセスはプロキシで遮断されているため、
**公開後の実表示はブラウザで確認できません。確認できていないことを、
できたように書かないでください。**

## public 配下の画像は必ず `AppImage` を使う

`next/image` を直接使わないでください。

GitHub Pages 向けの静的エクスポート（`output: "export"` ＋ `images.unoptimized`）では、
next/image が src に `basePath` を付けません。その結果 `/rina-nail/images/...` ではなく
`/images/...` を参照してしまい、**すべての画像が404になります**（CSS/JSには付くため気付きにくい）。

`src/components/ui/AppImage.tsx` が `withBasePath()` を適用するので、必ずこれを経由してください。
通常のビルド（Vercel など）では basePath が空文字のため、挙動は変わりません。

## 予約CTAは必ず `bookingLink()` を経由する

`links.booking` を直接 `href` に渡さないでください。

予約URLが未設定（`{{BOOKING_URL}}`）のとき、その文字列がそのまま `href` に入り、
**押しても存在しないURLへ飛ぶ行き止まりのリンク**になります。
実際にトップページだけで30箇所発生していました。

`src/lib/booking.ts` の `bookingLink(locale)` が、未設定時はアクセスページへ
フォールバックします。新しい予約CTAを追加するときも必ずこれを使ってください。

## サイト内リンクを生の `<a>` で書かない

`next/link` は basePath を自動で付けますが、生の `<a>` は付きません。
GitHub Pages はサブディレクトリ配信のため、`/ja/menu` は404になります
（正: `/rina-nail/ja/menu/`）。実際に3件発生していました。

やむを得ず `<a>` を使う場合は `withBasePath()` を必ず通してください。

## 未確定の値を JSON-LD に出力しない

プレースホルダー（`{{...}}`）をそのまま構造化データに出すと、
緯度経度や電話番号が不正な値として解釈され、
**LocalBusiness 全体が無効と判定されるおそれ**があります。
「項目が無い」ほうが「間違った値がある」より安全です。

`structured-data.ts` の `compact()` で `undefined` のキーを落としています。
新しい項目を追加するときも、未確定なら `resolved()` で `undefined` にしてください。
`tests/seo.test.ts` にプレースホルダー混入を検出する回帰テストがあります。

## 口コミ（Review / AggregateRating）を勝手に追加しない

自作・架空の口コミを構造化データに書くことは Google のスパムポリシー違反で、
手動対策の対象になります。**実在するお客様の声を、ご本人の許可を得て掲載できるように
なってから**実装してください。

## チャットの回答は必ず既存データから組み立てる

`src/lib/chat/knowledge.ts` の回答は、`src/data/` と翻訳ファイルだけを情報源にします。
チャット専用に文言を書き起こすと、営業時間や料金を変えたときに
**本文・構造化データ・チャットの三者がずれます**
（「サイトには18時と書いてあるのにチャットは17時と答える」状態）。

よくあるご質問を増やすときは `faq.groups[].items` に `id` 付きで追加してください。
チャット・FAQページ・FAQPage構造化データの3か所に同時に反映されます。
別の言い方を拾わせたいときは `chat.faqKeywords` に手がかり語を足します（5言語すべて）。

検索の重み付けは繊細です（`docs/CHATBOT.md` に踏んだ落とし穴を記録しています）。
質問文や手がかり語を編集したら必ず `npm run test` を通してください。

## 予約はGoogleカレンダーの予約スケジュールに任せる

予約の受付・確認メール・変更・キャンセルは、すべてGoogle側で完結します。
サイト側は**予約ページを表示するだけ**です。次のものを作らないでください。

- 独自の予約管理画面・顧客管理
- Google Calendar API を使った予約作成
- 独自の確認メール・リマインドメール
- 独自の予約変更・キャンセル機能
- 予約完了の疑似判定

**iframe の中は別ドメイン（calendar.google.com）です。**
CSSで中身を変えることも、JavaScriptで読むこともできません（ブラウザの制限）。
予約が完了したかどうかは、Googleから届く確認メールが唯一の確定情報です。
「予約できたはず」と推測して完了イベントを送らないでください。

予約URLは `NEXT_PUBLIC_GOOGLE_BOOKING_URL` で渡します。
**コードに直接書かないでください。** 未設定でもサイトは壊れず、
予約ページには準備中の案内と連絡先が出ます（`BookingUnavailable`）。

以前あった Apps Script 版の実装は `docs/archive/google-apps-script-booking/` にあります。
