import { paymentMethods } from "@/data/site";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label: string;
};

/**
 * 対応している支払い方法。
 * ブランド名は固有名詞のため翻訳せず、全言語で同じ表記を使います。
 */
export function PaymentMethods({ className, label }: Props) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {paymentMethods.map((method) => (
        <li
          key={method}
          className="border-line text-ink rounded-full border bg-white px-3 py-1.5 text-xs font-medium"
        >
          {method}
        </li>
      ))}
    </ul>
  );
}
