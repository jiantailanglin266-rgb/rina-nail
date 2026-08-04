import { tokenize, weightOf } from "@/lib/chat/tokenize";

export type ChatLink = {
  label: string;
  href: string;
  external: boolean;
};

export type KnowledgeEntry = {
  id: string;
  /** チャット内やクイック返信で見せる質問文 */
  question: string;
  /** 回答本文。改行で段落を分けます */
  answer: string;
  /** 検索に使う語。質問文に含まれない言い回しを補います */
  keywords: string[];
  /** 回答の下に出す導線 */
  link?: ChatLink;
};

export type MatchResult = {
  /** 十分な確信度で見つかった回答 */
  best: KnowledgeEntry | null;
  /** 確信度が低いときに「もしかして」で出す候補 */
  suggestions: KnowledgeEntry[];
};

/** これ以上の一致率なら、その回答をそのまま返します */
const CONFIDENT_SCORE = 0.45;
/** 「もしかして」の候補として提示する最低の一致率 */
const SUGGEST_SCORE = 0.2;

type Indexed = KnowledgeEntry & {
  /** 意図的に登録した語。強い手がかりとして扱います */
  keywordTokens: Set<string>;
  /** 質問文から取れた語。丁寧語などの言い回しを含むため軽く扱います */
  questionTokens: Set<string>;
  tokens: Set<string>;
};

/**
 * 質問文から取れた語の重み。
 *
 * 「〜を教えてください」「〜ますか」といった言い回しは、
 * どの項目の質問文にも現れるうえに2文字の並びとして高得点になりやすく、
 * これを等しく扱うと「行き方を教えて」が「施術の流れを教えてください」に
 * 引っ張られます（実際に起きました）。
 * キーワードは人が選んだ手がかりなので、そのままの重みで扱います。
 */
const QUESTION_WEIGHT = 0.45;

/**
 * 「その項目を特定できる語」と見なす珍しさの下限。
 *
 * 知識ベース全体の1/4以下の項目にしか出てこない語を、特徴的な語とみなします。
 * これが無いと、「今日の天気を教えて」のような無関係な質問が
 * 「を教えて」「ますか」といった言い回しの一致だけで
 * それらしい回答に当たってしまいます。
 */
const DISTINCTIVE_RARITY = Math.log(5);

/**
 * 知識ベースに無い語を、分母でどれくらい重く見るか。
 *
 * 0にすると「近くのラーメン屋」のように知らない語だらけの質問でも、
 * たまたま一致した1語（“メン”と“メンズ”）だけで一致率100%になってしまいます。
 * 逆に最大にすると、言い回しが違うだけで正しい回答が出せなくなります。
 * 中くらいの重みにして、どちらも避けます。
 */
const UNKNOWN_RARITY = 1;

/**
 * 回答とみなす、一致した得点の絶対値の下限。
 *
 * 割合だけで判定すると「教えてください」のように
 * 言い回しだけの入力が、たまたま同じ言い回しを持つ項目に
 * 100%一致してしまいます。中身のある語が一定量必要です。
 */
const MIN_MATCHED = 2;

export type ChatIndex = {
  entries: Indexed[];
  /** トークンごとの珍しさ（IDF）。多くの項目に出る語ほど小さくなります */
  rarity: Map<string, number>;
  /** 索引に無い語の珍しさ（＝最も珍しい扱い） */
  maxRarity: number;
};

/**
 * 知識ベースを検索用に索引化します。
 *
 * 質問文とキーワードをトークン化し、あわせて **各トークンの珍しさ（IDF）** を求めます。
 * 「を教えて」「ますか」のような、どの項目にも出てくる言い回しは
 * それ自体では意味を持たないため軽く扱い、
 * 「駐車」「カード」のように特定の項目にしか出てこない語を重く扱います。
 *
 * これが無いと、「行き方を教えて」が
 * 「施術の流れを教えてください」に引っ張られます（実際に起きました）。
 */
export function buildIndex(entries: KnowledgeEntry[]): ChatIndex {
  const indexed: Indexed[] = entries.map((entry) => {
    const keywordTokens = tokenize(entry.keywords.join(" "));
    const questionTokens = tokenize(entry.question);
    return {
      ...entry,
      keywordTokens,
      questionTokens,
      tokens: new Set([...keywordTokens, ...questionTokens]),
    };
  });

  const documentFrequency = new Map<string, number>();
  for (const entry of indexed) {
    for (const token of entry.tokens) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  const total = indexed.length || 1;
  const rarity = new Map<string, number>();
  for (const [token, frequency] of documentFrequency) {
    rarity.set(token, Math.log(1 + total / frequency));
  }

  return { entries: indexed, rarity, maxRarity: Math.log(1 + total) };
}

/**
 * 質問文にもっとも近い項目を探します。
 *
 * スコアは **「入力された質問のうち、どれだけがその項目で説明できるか」**（0〜1）です。
 * 一致したトークンの重みを、質問全体の重みで割って求めます。
 *
 * 項目側の語数で割らないのは、キーワードを丁寧に登録した項目ほど
 * 不利になってしまうためです（当初その実装にしていて、
 * 「営業時間は？」が営業時間の項目に当たらない不具合が出ました）。
 * 同点の場合は、一致した重みの合計が大きいほうを選びます。
 */
export function findAnswer(query: string, index: ChatIndex): MatchResult {
  const queryTokens = tokenize(query);
  if (queryTokens.size === 0) return { best: null, suggestions: [] };

  // トークンごとの得点は「長さの重み × 珍しさ」
  const scoreOf = (token: string) =>
    weightOf(token) * (index.rarity.get(token) ?? UNKNOWN_RARITY);

  /*
   * 分母は「知識ベースに存在する語」だけで計算します。
   * 知らない語（例:「車で行けますか」の“行け”）を分母に含めると、
   * 言い回しが違うだけで一致率が下がり、正しい回答が出せなくなります。
   * 知らない語をまったく無視しても問題にならないのは、
   * 下の「特徴的な語がひとつも一致していない場合は回答しない」条件があるためです。
   */
  let total = 0;
  for (const token of queryTokens) total += scoreOf(token);
  if (total === 0) return { best: null, suggestions: [] };

  const scored = index.entries
    .map((entry) => {
      let matched = 0;
      let distinctive = 0;
      for (const token of queryTokens) {
        const weight = entry.keywordTokens.has(token)
          ? 1
          : entry.questionTokens.has(token)
            ? QUESTION_WEIGHT
            : 0;
        if (weight === 0) continue;

        const score = scoreOf(token) * weight;
        matched += score;

        /*
         * 「その項目を特定できた」と数えるのは、次のどちらかの場合だけです。
         *
         * 1. 人が登録したキーワードに一致した（意味のある手がかり）
         * 2. その項目の質問文にしか出てこない語に一致した
         *
         * 質問文どうしで共有される語を含めると、「教えてください」のような
         * 丁寧な言い回しだけの入力が、同じ言い回しを持つ項目に
         * 当たってしまいます（実際に起きました）。
         */
        const rarity = index.rarity.get(token) ?? 0;
        const isKeyword = entry.keywordTokens.has(token);
        const isUniqueToEntry = rarity >= index.maxRarity;
        if (rarity >= DISTINCTIVE_RARITY && (isKeyword || isUniqueToEntry)) {
          distinctive += score;
        }
      }
      return { entry, score: matched / total, matched, distinctive };
    })
    // 助詞や丁寧語だけの一致は「答えが分かった」ことになりません
    .filter((item) => item.distinctive > 0 && item.matched >= MIN_MATCHED)
    .filter((item) => item.score >= SUGGEST_SCORE)
    .sort((a, b) => b.score - a.score || b.matched - a.matched);

  if (scored.length === 0) return { best: null, suggestions: [] };

  const top = scored[0];
  if (top.score >= CONFIDENT_SCORE) {
    return { best: top.entry, suggestions: [] };
  }

  return { best: null, suggestions: scored.slice(0, 3).map((item) => item.entry) };
}
