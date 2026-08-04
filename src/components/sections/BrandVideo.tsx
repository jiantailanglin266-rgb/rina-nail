"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Pause, Play } from "lucide-react";

import { videoAspectRatio, type SiteVideo } from "@/data/media";
import type { Messages } from "@/i18n/dictionary";
import { withBasePath } from "@/lib/base-path";

type Props = {
  video: SiteVideo;
  messages: Messages;
};

/**
 * ブランド動画（ファーストビュー直下）。
 *
 * ## 再生のしかた
 *
 * **操作なしで自動再生し、繰り返します。** 音声は鳴りません。
 * `autoPlay muted loop playsInline` をHTMLの属性として指定しているため、
 * JavaScriptが動かない場合でもブラウザ自身が再生します。
 *
 * `playsInline` は必須です。これが無いと、iPhoneでは再生時に
 * 全画面のプレーヤーが開いてしまい、サイトの表示が置き換わってしまいます。
 * 付けることで、ページ内に埋め込まれたまま再生されます。
 *
 * 動きを止めたい方のために、一時停止ボタンは常に表示しています
 * （サロン様のご要望により、「動きを減らす」設定の端末でも自動再生します）。
 *
 * ## 再生中もページの見た目を変えない
 *
 * - 縦横比を先に指定しているため、読み込み前後で高さが変わりません（ガタつき防止）
 * - 全画面にならず、枠の中だけで再生します
 * - 操作ボタンは枠の内側に重ねており、本文の位置に影響しません
 * - 画面外へスクロールすると再生を止めます（通信量と電池の節約。
 *   戻ってくると再開するため、見え方は変わりません）
 */
export function BrandVideo({ video, messages }: Props) {
  const text = messages.home.brandVideo;
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  /** 利用者が自分で止めた場合は、勝手に再開しません */
  const pausedByUser = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    /*
     * 自動再生はブラウザ側の判断で拒否されることがあります
     * （省電力モードなど）。その場合に備え、
     * 画面に入ったときにもう一度だけ再生を試みます。
     * 失敗しても何も壊さず、一時停止ボタンから手動で再生できます。
     */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!pausedByUser.current && element.paused) {
            element.play().catch(() => setPlaying(false));
          }
        } else if (!element.paused) {
          // 画面外では止めます（戻れば再開するので、見え方は変わりません）
          element.pause();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const element = ref.current;
    if (!element) return;

    if (element.paused) {
      pausedByUser.current = false;
      void element.play().catch(() => setPlaying(false));
    } else {
      pausedByUser.current = true;
      element.pause();
    }
  }

  return (
    <div
      className="gradient-frame relative mx-auto overflow-hidden rounded-3xl bg-black/5 p-1.5 sm:p-2"
      /*
       * スマートフォンでは画面いっぱいに、パソコンでは動画の実寸までで止めます。
       *
       * 実寸（864px）より大きく表示すると引き伸ばしになり、輪郭がぼやけます。
       * 逆に幅を固定してしまうと、スマートフォンで左右に余白が出て小さく見えます。
       * 「上限だけ決めて、それ以下では画面幅に合わせる」のが、
       * どちらの画面でも最も鮮明で大きく見える設定です。
       * 枠の余白（p-1.5 / sm:p-2）の分だけ上限を広げています。
       */
      style={{ maxWidth: `calc(${video.width}px + 1rem)` }}
    >
      <video
        ref={ref}
        // 実寸を渡しておくと、読み込み前でも高さが確定します
        width={video.width}
        height={video.height}
        // 操作なしで再生・繰り返し。音声は鳴りません
        autoPlay
        muted
        loop
        playsInline
        // iPhoneで全画面に切り替わらないようにします（サイトの表示を保つため）
        disablePictureInPicture
        preload="metadata"
        poster={video.poster ? withBasePath(video.poster) : undefined}
        aria-label={text.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ aspectRatio: videoAspectRatio(video) } as CSSProperties}
        className="w-full rounded-[1.25rem] object-cover"
      >
        {/* 生の <source> は basePath が自動で付かないため、明示的に付けます */}
        <source src={withBasePath(video.src)} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={toggle}
        // 状態を記号だけでなく、読み上げ用の文言でも伝えます
        aria-label={playing ? text.pause : text.play}
        className="text-ink absolute right-4 bottom-4 inline-flex size-11 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur transition hover:bg-white"
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
