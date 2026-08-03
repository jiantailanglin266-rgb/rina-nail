/** クラス名を結合します（false / undefined は除外） */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
