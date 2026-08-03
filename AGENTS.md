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
