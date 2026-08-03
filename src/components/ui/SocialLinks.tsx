import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { socialAccounts } from "@/data/social";
import { interpolate } from "@/i18n/dictionary";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  messages: Messages;
  size?: "xs" | "sm" | "md";
  /** SVGグラデーションIDの重複を避けるための接頭辞（header / footer / menu など） */
  uid: string;
  /** アイコンの横にSNS名も表示します */
  showNames?: boolean;
  /**
   * 表示する最大件数。
   * ヘッダーは横幅が限られており、全SNSを並べるとナビゲーションが折り返してしまうため、
   * 主要なSNSだけに絞ります（表示順は `src/data/social.ts` の定義順）。
   * フッターとモバイルメニューでは全件表示します。
   */
  maxItems?: number;
  className?: string;
};

/**
 * SNSのカラーアイコン一覧。
 *
 * 表示するのは `src/data/social.ts` で **URLが設定済みのSNSだけ** です。
 * 1件も設定されていない場合は、何も描画しません（空の枠が残らないようにするため）。
 */
export function SocialLinks({
  messages,
  size = "sm",
  uid,
  showNames,
  maxItems,
  className,
}: Props) {
  const all = socialAccounts();
  const accounts = maxItems ? all.slice(0, maxItems) : all;
  if (accounts.length === 0) return null;

  return (
    <ul
      aria-label={messages.common.social.heading}
      className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}
    >
      {accounts.map((account) => (
        <li key={account.key}>
          <SocialIconLink
            account={account}
            label={interpolate(messages.common.social.visit, { name: account.name })}
            size={size}
            uid={uid}
            showName={showNames}
          />
        </li>
      ))}
    </ul>
  );
}
