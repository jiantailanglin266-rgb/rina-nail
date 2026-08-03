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

## 変更したら必ず公開URLを報告する

サイトに変更を加えてプッシュしたら、**指示がなくても毎回**以下の3つを報告してください。
「URLを教えて」と聞かれるのを待たないこと。

1. **公開サイト**: https://jiantailanglin266-rgb.github.io/rina-nail/
2. **リポジトリ**: https://github.com/jiantailanglin266-rgb/rina-nail
3. **デプロイ結果**: GitHub Pages のワークフローが success になったかどうか

### デプロイ手順

Pages の環境保護ルールにより、**デプロイはデフォルトブランチからしか実行できません**。
現在のデフォルトブランチは `claude/rina-nail-website-ygjezu` です。

```
push → pages.yml を該当ブランチで workflow_dispatch → deployment status が success を確認 → URL を報告
```

デフォルトブランチが `main` に変更された場合は、`main` への push で自動デプロイされます
（deploy ジョブはデフォルトブランチ以外ではスキップされます）。
