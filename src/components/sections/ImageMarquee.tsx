import { AppImage } from "@/components/ui/AppImage";
import { cn } from "@/lib/utils";

type Props = {
  /** `public/` からのパス。8枚以上あると流れが自然になります */
  images: string[];
  /** 読み上げ用の説明（装飾のため、既定では読み上げ対象から外します） */
  label: string;
  className?: string;
};

/**
 * ネイル写真を横に流すマーキー。
 *
 * ## 背景から浮かせないための工夫
 *
 * 写真をそのまま並べると、白い背景の上に長方形が並んで「貼り付けた感じ」になります。
 * これを避けるため、次の3つを重ねています。
 *
 * 1. **左右のフェード**（`mask-image`）— 端で写真が背景に溶けるようにし、
 *    帯の始まりと終わりを目立たせません
 * 2. **上下のやわらかいグラデーション** — セクションの背景色から
 *    写真の帯へなだらかにつながるようにします
 * 3. **写真の角丸と淡い縁** — サイト内のカードと同じ質感にそろえます
 *
 * ## 表示について
 *
 * - 装飾なので `aria-hidden` を付けています
 *   （同じ写真はギャラリーページに、説明付きで並んでいます）
 * - 同じ列を2組並べて `-50%` 動かすため、継ぎ目なく循環します
 * - `prefers-reduced-motion` では globals.css 側で停止します
 */
export function ImageMarquee({ images, label, className }: Props) {
  // 少なすぎると同じ写真がすぐ戻ってきて不自然なので、最低枚数を設けます
  if (images.length < 4) return null;

  // 継ぎ目なく循環させるため、同じ並びを2組つなげます
  const sequence = [...images, ...images];

  return (
    <div
      aria-hidden="true"
      aria-label={label}
      className={cn("image-marquee relative w-full overflow-hidden select-none", className)}
    >
      <div className="marquee-hover flex w-max">
        <div className="marquee-track-left flex w-max shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4">
          {sequence.map((src, index) => (
            <div
              key={`${src}-${index}`}
              // 作例写真が横位置で撮られているため、カードも横位置（3:2）にしています。
              // 縦位置にすると左右が切れて、片手が画面から外れてしまいます。
              className="border-white/60 relative h-28 w-42 shrink-0 overflow-hidden rounded-2xl border shadow-[0_10px_30px_-18px_rgba(77,22,125,0.5)] sm:h-40 sm:w-60"
            >
              <AppImage
                src={src}
                alt=""
                width={600}
                height={400}
                loading="lazy"
                sizes="(max-width: 640px) 168px, 240px"
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
