"use client";

import { useEffect } from "react";

import { trackBookingEvent } from "@/lib/booking/analytics";

/**
 * 予約ページの表示を1回だけ計測します。
 *
 * 表示だけを目的とした要素は描画しません（`null` を返します）。
 * GA4が未設置なら何も起きません。
 */
export function BookingPageView() {
  useEffect(() => {
    trackBookingEvent("view_booking_page");
  }, []);

  return null;
}
