import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import { buildLlmsTxt } from "@/lib/llms-txt";

export const dynamic = "force-static";

/**
 * https://llmstxt.org/ の慣習に沿った、生成AI向けのサイト要約。
 * 本文・JSON-LD と同じデータから生成しているため、内容が食い違いません。
 */
export async function GET() {
  const messages = await getMessages(defaultLocale);

  return new Response(buildLlmsTxt(messages), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
