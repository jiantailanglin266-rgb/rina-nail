"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

import { videoAspectRatio, type SiteVideo } from "@/data/media";
import type { Messages } from "@/i18n/dictionary";
import { withBasePath } from "@/lib/base-path";

type Props = {
  video: SiteVideo;
  messages: Messages;
};

const STORAGE_KEY = "intro-played";

/**
 * 「流すかどうか」の判定は、最初に読んだ結果をタブ内で固定します。
 *
 * この後すぐ sessionStorage に印を付けるため、毎回読み直すと
 * 「自分が付けた印」を見て再描画の途中でイントロが消えてしまいます。
 * useSyncExternalStore のスナップショットとして使うので、純粋関数である
 * 必要もあります（読むたびに値が変わってはいけません）。
 */
let shouldShowCache: boolean | null = null;
function readShouldShow(): boolean {
  if (shouldShowCache === null) {
    try {
      // 確認用スイッチ: URLに ?intro=1 を付けると、再生済みでも必ず流します。
      // 「一度だけ」の仕様上、動作確認のたびにタブを開き直すのは大変なためです
      const forced = new URLSearchParams(window.location.search).has("intro");
      shouldShowCache = forced || sessionStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      // プライベートブラウズ等で保存できない環境では、
      // 「ページを移るたびに毎回流れる」よりも「流さない」に倒します
      shouldShowCache = false;
    }
  }
  return shouldShowCache;
}
const subscribe = () => () => {};

/**
 * サイトへアクセスした直後に、一度だけ全画面で流れるイントロ動画。
 *
 * ## 「一度だけ」の判定
 *
 * sessionStorage に印を付け、**同じタブでは二度と流しません**。
 * ページ移動や言語切り替えのたびに流れると、本文へたどり着く邪魔になるためです。
 * タブを閉じて開き直すと、また一度だけ流れます。
 *
 * 印は表示した瞬間に付けるため、再生途中でリロードしても再演はありません。
 *
 * ## 決して閲覧を妨げない
 *
 * イントロは演出であって、本文より優先されるものではありません。
 * 次のどれか1つでも起きたら、すぐに消して本文を見せます。
 *
 * - 再生が最後まで終わった（通常の終わり方）
 * - スキップボタンが押された / Escキーが押された
 * - 自動再生がブラウザに拒否された（省電力モードなど）
 * - 動画の読み込みに失敗した
 * - 表示から15秒たった（回線が遅く再生が始まらない場合の保険）
 *
 * サーバー側では描画しない（getServerSnapshot が false を返す）ため、
 * JavaScriptが無効な環境ではイントロ自体が存在せず、本文がそのまま表示されます。
 */
export function IntroVideo({ video, messages }: Props) {
  const text = messages.intro;
  const shouldShow = useSyncExternalStore(subscribe, readShouldShow, () => false);
  const [phase, setPhase] = useState<"showing" | "leaving" | "done">("showing");
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const visible = shouldShow && phase !== "done";

  // フェードアウトを開始します（既に消えかけている場合は何もしません）
  function leave() {
    setPhase((current) => (current === "showing" ? "leaving" : current));
  }

  useEffect(() => {
    if (!shouldShow) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // 保存できなくても、このタブの表示は readShouldShow のキャッシュが抑えます
    }
  }, [shouldShow]);

  useEffect(() => {
    if (!visible) return;

    // 自動再生が拒否されたら、動かない画面で待たせず本文へ通します
    videoRef.current?.play().catch(() => {
      setPhase((current) => (current === "showing" ? "leaving" : current));
    });

    // 回線が遅く再生が始まらない場合でも、本文を見せないまま待たせ続けません
    const safety = window.setTimeout(() => {
      setPhase((current) => (current === "showing" ? "leaving" : current));
    }, 15_000);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPhase((current) => (current === "showing" ? "leaving" : current));
      }
    };
    window.addEventListener("keydown", onKey);

    // 背後のページが動かないように、表示中だけスクロールを止めます
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();

    return () => {
      window.clearTimeout(safety);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={text.label}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && phase === "leaving") setPhase("done");
      }}
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-white px-4 transition-opacity duration-500 ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        // 一度だけの演出なので loop は付けません。終わったら onEnded で消えます
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        width={video.width}
        height={video.height}
        onEnded={leave}
        onError={leave}
        /*
         * パソコン（lg以上）では画面全体を動画で覆います（はみ出た分は切り取り）。
         * スマートフォンは縦長画面のため、覆うと横長動画の中央しか見えなくなります。
         * そこで従来どおり「画面幅に合わせて中央に表示」のままにしています。
         * lg では幅と高さの両方を指定するため、aspect-ratio は自動的に無効になります。
         */
        style={
          {
            aspectRatio: videoAspectRatio(video),
            "--intro-max-w": `${video.width}px`,
          } as CSSProperties
        }
        className="w-full max-w-[var(--intro-max-w)] rounded-2xl lg:absolute lg:inset-0 lg:h-full lg:max-w-none lg:rounded-none lg:object-cover"
      >
        <source src={withBasePath(video.src)} type="video/mp4" />
      </video>

      <button
        ref={skipRef}
        type="button"
        onClick={leave}
        className="text-ink border-line/70 absolute right-5 bottom-5 inline-flex items-center rounded-full border bg-white/85 px-5 py-2.5 text-sm font-medium shadow-lg backdrop-blur transition hover:bg-white sm:right-8 sm:bottom-8"
      >
        {text.skip}
      </button>
    </div>
  );
}
