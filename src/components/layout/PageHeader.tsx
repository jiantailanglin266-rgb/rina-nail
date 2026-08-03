import { GradientText } from "@/components/ui/GradientText";
import { PageSummary } from "@/components/ui/PageSummary";

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  summary: string;
  summaryLabel: string;
};

/** 下層ページ共通の見出しブロック（タイトル＋リード＋要約） */
export function PageHeader({ eyebrow, title, lead, summary, summaryLabel }: Props) {
  return (
    <header className="container-page pb-10 sm:pb-14">
      <p className="font-accent text-[0.7rem] tracking-[0.32em] uppercase" aria-hidden="true">
        <GradientText variant="pinkPurple">{eyebrow}</GradientText>
      </p>
      <h1 className="mt-3 text-3xl leading-snug text-balance sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h1>
      <p className="text-muted mt-4 max-w-3xl text-sm leading-relaxed sm:text-base">{lead}</p>
      <div className="mt-8 max-w-3xl">
        <PageSummary label={summaryLabel}>{summary}</PageSummary>
      </div>
    </header>
  );
}
