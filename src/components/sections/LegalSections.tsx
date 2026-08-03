type Section = { heading: string; body: string[] };

type Props = {
  sections: Section[];
};

/** プライバシーポリシー・利用規約の本文（同じ構造を共有します） */
export function LegalSections({ sections }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-lg sm:text-xl">{section.heading}</h2>
          <div className="text-muted mt-4 space-y-3 text-sm leading-relaxed">
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
