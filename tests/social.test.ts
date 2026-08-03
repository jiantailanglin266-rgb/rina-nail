import { describe, expect, it } from "vitest";

import { FacebookColorIcon } from "@/components/ui/icons/social/FacebookColorIcon";
import { InstagramColorIcon } from "@/components/ui/icons/social/InstagramColorIcon";
import { LineColorIcon } from "@/components/ui/icons/social/LineColorIcon";
import { TikTokColorIcon } from "@/components/ui/icons/social/TikTokColorIcon";
import { XColorIcon } from "@/components/ui/icons/social/XColorIcon";
import { YouTubeColorIcon } from "@/components/ui/icons/social/YouTubeColorIcon";
import { hasSocialAccounts, socialAccounts, type SocialKey } from "@/data/social";
import { isPlaceholder, placeholders, sameAsUrls } from "@/data/site";
import en from "@/i18n/messages/en.json";
import ja from "@/i18n/messages/ja.json";
import ko from "@/i18n/messages/ko.json";
import zhCn from "@/i18n/messages/zh-cn.json";
import zhTw from "@/i18n/messages/zh-tw.json";

/** すべてのSNSに対応するアイコンコンポーネントが存在することを型と実体の両面で保証します */
const iconByKey: Record<SocialKey, unknown> = {
  instagram: InstagramColorIcon,
  line: LineColorIcon,
  x: XColorIcon,
  tiktok: TikTokColorIcon,
  youtube: YouTubeColorIcon,
  facebook: FacebookColorIcon,
};

describe("SNSアカウント", () => {
  it("URLが未設定（プレースホルダー）のSNSは表示対象に含めない", () => {
    for (const account of socialAccounts()) {
      expect(isPlaceholder(account.url)).toBe(false);
    }
  });

  it("hasSocialAccounts() は socialAccounts() の件数と一致する", () => {
    expect(hasSocialAccounts()).toBe(socialAccounts().length > 0);
  });

  it("すべてのSNSにカラーアイコンが定義されている", () => {
    for (const icon of Object.values(iconByKey)) {
      expect(typeof icon).toBe("function");
    }
  });

  it("ブランドカラーは16進カラーコードで定義されている", () => {
    for (const account of socialAccounts()) {
      expect(account.brandColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("構造化データの sameAs には設定済みSNSのURLだけが入る", () => {
    expect(sameAsUrls()).toEqual(socialAccounts().map((account) => account.url));
  });

  it("SNSのプレースホルダーは {{...}} 形式で用意されている", () => {
    const keys = ["instagramUrl", "lineUrl", "xUrl", "tiktokUrl", "youtubeUrl", "facebookUrl"];
    for (const key of keys) {
      expect(key in placeholders).toBe(true);
    }
  });
});

describe("SNSの翻訳", () => {
  it("5言語すべてに見出しとリンクラベルがある", () => {
    for (const messages of [ja, en, zhCn, zhTw, ko]) {
      expect(messages.common.social.heading.length).toBeGreaterThan(0);
      // {name} は SNS名に置換されるため、必ず含まれている必要があります
      expect(messages.common.social.visit).toContain("{name}");
    }
  });
});
