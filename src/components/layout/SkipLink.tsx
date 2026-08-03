export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="text-ink sr-only rounded-full bg-white px-5 py-3 text-sm font-medium shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
    >
      {label}
    </a>
  );
}
