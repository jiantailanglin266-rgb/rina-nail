/**
 * 検索用のトークン化。
 *
 * 日本語・中国語は単語のあいだに空白が無いため、空白で切るだけでは
 * 「営業時間」という質問から「営業」「時間」を取り出せません。
 * そこで **CJKの文字は2文字ずつの並び（バイグラム）** に分解し、
 * 空白区切りの語（英数字・ハングル）と合わせて索引にします。
 *
 * 形態素解析器を使わないのは、辞書データを同梱すると
 * バンドルが数MB単位で増え、静的サイトの表示速度を損なうためです。
 * よくある質問への応答という用途では、バイグラムで十分な精度が出ます。
 */

/** CJK（漢字・ひらがな・カタカナ）1文字にマッチします */
const CJK = /[぀-ヿ㐀-䶿一-鿿]/;

/**
 * 検索の邪魔になる記号を空白に変換します。
 *
 * 長音符「ー」は**含めません**。カタカナ語の一部であり、
 * 記号として除くと「カード」が「カ」「ド」に分かれて検索に当たらなくなります
 * （実際にその不具合が出ました）。波ダッシュ「〜」は範囲を表す記号なので除きます。
 */
const PUNCTUATION = /[!-/:-@[-`{-~、。・「」『』（）？！〜…,.]/g;

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(PUNCTUATION, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 文字列を検索用トークンの集合に変換します。
 *
 * - 空白区切りの語はそのまま（英単語・ハングル・数字）
 * - CJKを含む語は、1文字と2文字の並びの両方を採用
 *   （1文字だけだと「爪」のような重要語を拾えないため）
 */
export function tokenize(text: string): Set<string> {
  const tokens = new Set<string>();

  for (const word of normalize(text).split(" ")) {
    if (!word) continue;

    if (!CJK.test(word)) {
      // 英数字・ハングルはそのまま1語として扱います
      tokens.add(word);
      continue;
    }

    const chars = [...word];
    for (let i = 0; i < chars.length; i += 1) {
      tokens.add(chars[i]);
      if (i + 1 < chars.length) tokens.add(chars[i] + chars[i + 1]);
    }
  }

  return tokens;
}

/**
 * トークンの重み。
 * 長い一致ほど「たまたま一致した」可能性が低いため、重くします。
 */
export function weightOf(token: string): number {
  if (token.length >= 3) return 3;
  if (token.length === 2) return 2;
  return 0.5;
}
