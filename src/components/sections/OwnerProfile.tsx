import { AppImage } from "@/components/ui/AppImage";

import { GradientText } from "@/components/ui/GradientText";
import { store } from "@/data/site";
import type { Messages } from "@/i18n/dictionary";
import { cn } from "@/lib/utils";

type Props = {
  messages: Messages;
  /** 得意分野の行を表示するか（サロン情報ページ用） */
  showSpecialty?: boolean;
  className?: string;
};

/** オーナー／ネイリスト 中村梨奈の紹介 */
export function OwnerProfile({ messages, showSpecialty = false, className }: Props) {
  const owner = messages.home.owner;

  return (
    <div className={cn("grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14", className)}>
      <div className="gradient-frame relative mx-auto w-full max-w-xs overflow-hidden rounded-[2rem] lg:mx-0">
        <AppImage
          src="/images/owner/owner.jpg"
          alt={owner.imageAlt}
          width={800}
          height={1000}
          loading="lazy"
          sizes="(max-width: 1024px) 70vw, 320px"
          className="h-auto w-full object-cover"
        />
      </div>

      <div>
        <p className="font-accent text-muted text-[0.7rem] tracking-[0.28em] uppercase">
          {owner.role}
        </p>
        <h3 className="mt-2 text-2xl sm:text-3xl">
          {owner.name}
          <span className="font-display text-muted ml-3 text-base">{store.ownerRomaji}</span>
        </h3>

        <p className="font-mincho-jp mt-4 text-lg leading-relaxed">
          <GradientText variant="purpleGold">「{owner.message}」</GradientText>
        </p>

        <div className="text-muted mt-6 space-y-3 text-sm leading-relaxed">
          {owner.greeting.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {showSpecialty ? (
          <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            <div className="bg-soft-lilac/70 rounded-2xl px-4 py-3">
              <dt className="text-muted text-xs">{messages.about.overview.labels.career}</dt>
              <dd className="mt-1 font-medium">{messages.about.overview.values.career}</dd>
            </div>
            <div className="bg-soft-pink/70 rounded-2xl px-4 py-3">
              <dt className="text-muted text-xs">{messages.about.owner.specialtyLabel}</dt>
              <dd className="mt-1 font-medium">{messages.about.owner.specialty}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </div>
  );
}
