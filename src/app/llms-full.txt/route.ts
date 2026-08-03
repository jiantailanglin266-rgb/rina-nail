import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import { buildLlmsFullTxt } from "@/lib/llms-txt";

export const dynamic = "force-static";

/**
 * llms.txt の詳細版。全ページの本文相当をプレーンテキストでまとめています。
 * 生成AIがサイト全体を1リクエストで把握できるようにするためのものです。
 */
export async function GET() {
  const messages = await getMessages(defaultLocale);

  return new Response(buildLlmsFullTxt(messages), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
