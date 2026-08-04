type Props = {
  label: string;
  children: string;
};

/**
 * ページ冒頭の要約文。
 *
 * 生成AIや検索エンジンがページの主旨を1段落で把握できるよう、
 * 各ページに必ず設置します。内容は JSON-LD の WebPage.description と一致させています。
 */
export function PageSummary({ label, children }: Props) {
  return (
    <aside
      aria-label={label}
      // JSON-LD の speakable（SpeakableSpecification）が参照する目印です
      data-speakable=""
      className="gradient-frame glass-card rounded-2xl px-5 py-4 hover:translate-y-0 hover:shadow-[0_18px_40px_-30px_rgba(77,22,125,0.45)] sm:px-7 sm:py-6"
    >
      <p className="text-ink/85 text-sm leading-relaxed sm:text-[0.95rem]">{children}</p>
    </aside>
  );
}
