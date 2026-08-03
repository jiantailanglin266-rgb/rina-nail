type Props = {
  /** 単一オブジェクト、または複数の構造化データ */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * JSON-LD を <script type="application/ld+json"> として出力します。
 * `<` を Unicode エスケープし、文字列由来のスクリプト挿入を防いでいます。
 */
export function JsonLd({ data }: Props) {
  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(entry).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
