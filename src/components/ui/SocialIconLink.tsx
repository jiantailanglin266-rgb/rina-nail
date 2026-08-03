import { FacebookColorIcon } from "@/components/ui/icons/social/FacebookColorIcon";
import { InstagramColorIcon } from "@/components/ui/icons/social/InstagramColorIcon";
import { LineColorIcon } from "@/components/ui/icons/social/LineColorIcon";
import { TikTokColorIcon } from "@/components/ui/icons/social/TikTokColorIcon";
import { XColorIcon } from "@/components/ui/icons/social/XColorIcon";
import { YouTubeColorIcon } from "@/components/ui/icons/social/YouTubeColorIcon";
import type { SocialAccount, SocialKey } from "@/data/social";

type Size = "xs" | "sm" | "md";

type Props = {
  account: SocialAccount;
  /** スクリーンリーダー向けのラベル（例:「Instagramを見る（別タブで開きます）」） */
  label: string;
  size?: Size;
  /** SVGグラデーションIDの重複を避けるための接頭辞（配置ごとに変えます） */
  uid?: string;
  /** アイコンの右にSNS名を表示します（フッターの一覧など） */
  showName?: boolean;
};

const sizeClass: Record<Size, string> = {
  xs: "size-7 [&>svg]:size-7",
  sm: "size-8 [&>svg]:size-8",
  md: "size-10 [&>svg]:size-10",
};

/** SNSごとのカラーアイコン。`uid` はグラデーションID用に個別アイコンへ渡します。 */
function SocialIcon({ socialKey, uid }: { socialKey: SocialKey; uid: string }) {
  switch (socialKey) {
    case "instagram":
      return <InstagramColorIcon uid={uid} />;
    case "line":
      return <LineColorIcon />;
    case "x":
      return <XColorIcon />;
    case "tiktok":
      return <TikTokColorIcon />;
    case "youtube":
      return <YouTubeColorIcon />;
    case "facebook":
      return <FacebookColorIcon />;
  }
}

/**
 * SNSのカラーアイコン1件分のリンク。
 *
 * - アイコンは装飾（`aria-hidden`）なので、リンク側の `aria-label` で内容を伝えます
 * - ホバー・フォーカス時にブランドカラーのグローが出ます（`--brand` はインラインで受け渡し）
 * - 外部リンクのため `target="_blank"` ＋ `rel="noopener noreferrer"`
 */
export function SocialIconLink({ account, label, size = "sm", uid = "", showName }: Props) {
  return (
    <a
      href={account.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={account.name}
      style={{ ["--brand" as string]: account.brandColor }}
      className="social-link group inline-flex items-center gap-2 rounded-full"
    >
      <span
        className={`${sizeClass[size]} social-icon inline-flex items-center justify-center transition duration-200 group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5`}
      >
        <SocialIcon socialKey={account.key} uid={`${uid}${account.key}`} />
      </span>
      {showName ? (
        <span className="group-hover:text-purple text-sm transition">{account.name}</span>
      ) : null}
    </a>
  );
}
