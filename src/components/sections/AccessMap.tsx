import { MapPin } from "lucide-react";

import { placeholders, isPlaceholder } from "@/data/site";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  messages: Messages;
};

/**
 * 地図の埋め込みエリア。
 *
 * 埋め込みURLが未確定のため、既定ではプレースホルダーの案内を表示します。
 * `NEXT_PUBLIC_MAP_EMBED_URL` を設定すると、同じ位置に地図が表示されます。
 * 高さを固定しているため、地図の有無でレイアウトがずれません（CLS対策）。
 */
export function AccessMap({ messages }: Props) {
  const url = placeholders.mapEmbedUrl;
  const unset = isPlaceholder(url);

  return (
    <div className="gradient-frame bg-soft-lilac/50 overflow-hidden rounded-2xl">
      <div className="aspect-[16/10] w-full sm:aspect-[16/7]">
        {unset ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <MapPin className="text-gold size-8" aria-hidden="true" />
            <p className="text-muted max-w-md text-xs leading-relaxed">
              {messages.access.mapPlaceholder}
            </p>
            <p className="font-accent text-muted text-[0.7rem] tracking-widest">
              {"{{MAP_EMBED_URL}}"}
            </p>
          </div>
        ) : (
          <iframe
            src={url}
            title={messages.access.mapHeading}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0"
          />
        )}
      </div>
    </div>
  );
}
