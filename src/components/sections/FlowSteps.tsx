import { Reveal } from "@/components/animations/Reveal";
import { GradientText } from "@/components/ui/GradientText";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  steps: Messages["home"]["flow"]["steps"];
};

/** 施術の流れ。番号は装飾ではなく順序情報のため、ol で表現します。 */
export function FlowSteps({ steps }: Props) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, index) => (
        <Reveal as="li" key={step.title} delay={index * 0.08} className="h-full">
          <div className="gradient-frame flex h-full flex-col rounded-2xl bg-white p-5">
            <p className="font-display text-3xl leading-none">
              <GradientText variant="goldPink">{String(index + 1).padStart(2, "0")}</GradientText>
            </p>
            <h3 className="mt-3 text-base leading-snug">{step.title}</h3>
            <p className="text-muted mt-2 text-sm leading-relaxed">{step.body}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
