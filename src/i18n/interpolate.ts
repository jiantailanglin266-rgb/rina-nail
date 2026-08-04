/**
 * 翻訳文の差し込み（`{name}` → 値）。
 *
 * `dictionary.ts` から分けているのは、あちらが `server-only` を読み込むためです。
 * クライアントコンポーネントから `dictionary.ts` を値として読み込むとビルドが失敗します
 * （型だけの読み込みは問題ありません）。
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
