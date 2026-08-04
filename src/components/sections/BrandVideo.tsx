"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";

import type { SiteVideo } from "@/data/media";
import type { Messages } from "@/i18n/dictionary";
import { withBasePath } from "@/lib/base-path";

type Props = {
  video: SiteVideo;
  messages: Messages;
};

/**
 * ブランド動画（ファーストビュー直下）。
 *
 * ## 自動再生の扱い
 *
 * 音声なしで自動再生し、繰り返します。広告動画としては一般的な挙動ですが、
 * **動きが苦手な方のために必ず止められるようにしています。**
 *
 * - `prefers-reduced-motion` が有効な環境では自動再生しません（1コマ目で静止）
 * - 再生／一時停止ボタンを常に表示します
 * - 音声は最初から鳴りません（`muted`）
 *
 * ## 表示のガタつき対策
 *
 * 縦横比を先に指定しているため、動画の読み込み前後で高さが変わりません。
 * `preload="metadata"` にしているのは、ファーストビューの直下にあり
 * 最初の表示速度（LCP）に影響させたくないためです。
 */
export function BrandVideo({ video, messages }: Props) {
  const text = messages.home.brandVideo;
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 動きを減らす設定のときは自動再生しません
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    // 自動再生はブラウザに拒否されることがあるため、失敗しても何も壊さないようにします
    element
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

  function toggle() {
    const element = ref.current;
    if (!element) return;

    if (element.paused) {
      void element.play().then(() => setPlaying(true));
    } else {
      element.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="gradient-frame relative overflow-hidden rounded-3xl bg-black/5 p-1.5 sm:p-2">
      <video
        ref={ref}
        // 音声なし・繰り返し。iOSでは playsInline が無いと全画面で開いてしまいます
        muted
        loop
        playsInline
        preload="metadata"
        poster={video.poster ? withBasePath(video.poster) : undefined}
        aria-label={text.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ aspectRatio: video.aspectRatio } as CSSProperties}
        className="w-full rounded-[1.25rem] object-cover"
      >
        {/* 生の <source> は basePath が自動で付かないため、明示的に付けます */}
        <source src={withBasePath(video.src)} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={toggle}
        // 状態を色や記号だけでなく、読み上げ用の文言でも伝えます
        aria-label={playing ? text.pause : text.play}
        className="focus-visible:outline-purple absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full bg-white/85 text-ink shadow-lg backdrop-blur transition hover:bg-white"
      >
        {playing ? (
          <Pause className="size-5" aria-hidden="true" />
        ) : (
          <Play className="size-5 translate-x-px" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
