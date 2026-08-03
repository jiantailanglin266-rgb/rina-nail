import { ExternalLink } from "lucide-react";

import { mapEmbedUrl, mapLinkUrl, store } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * Googleマップの埋め込み。
 *
 * APIキー不要の埋め込み方式で、住所（`src/data/site.ts`）から生成します。
 * `NEXT_PUBLIC_MAP_EMBED_URL` を設定すると、そちらが優先されます
 * （Maps Embed API や Place ID 指定のURLへ差し替える用）。
 *
 * - `loading="lazy"` で、初期表示（LCP）を妨げません
 * - 高さを `aspect-ratio` で固定しているため、読み込み前後でずれません（CLS対策）
 * - iframe には `title` を付け、スクリーンリーダーからも内容が分かるようにしています
 */
export function AccessMap({ locale, messages }: Props) {
  return (
    <div>
      <div className="gradient-frame bg-soft-lilac/50 overflow-hidden rounded-2xl">
        <div className="aspect-[16/10] w-full sm:aspect-[16/9]">
          <iframe
            src={mapEmbedUrl(locale)}
            title={`${messages.access.mapHeading}｜${store.address.full}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="size-full border-0"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <a
          href={mapLinkUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple hover:text-neon-pink inline-flex items-center gap-1.5 text-sm underline underline-offset-4 transition"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          {messages.access.openInMaps}
        </a>
        <p className="text-muted text-xs">{messages.access.mapNote}</p>
      </div>
    </div>
  );
}
