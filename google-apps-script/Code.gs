/**
 * Rina nail — Web予約のバックエンド（Google Apps Script）
 *
 * このスクリプトが唯一のサーバーです。
 * サイト本体は静的ファイル（GitHub Pages）なのでサーバーを持てません。
 * Googleカレンダーの読み書きとメール送信には権限が必要ですが、
 * ブラウザ側のコードに認証情報を置くと閲覧者全員に見えてしまいます。
 * そこで **サロンのGoogleアカウントで動くこのスクリプト** に処理を集約しています。
 *
 * 設定は「プロジェクトの設定 → スクリプト プロパティ」に入れてください
 * （コードに直接書かないでください）。必要なキーは README を参照。
 *
 * デプロイ: 「デプロイ → 新しいデプロイ → ウェブアプリ」
 *   - 次のユーザーとして実行: 自分
 *   - アクセスできるユーザー: 全員
 * 発行されたURLを、サイト側の NEXT_PUBLIC_BOOKING_API_URL に設定します。
 */

/* ============================================================
   設定
   ※ サイト側 src/data/booking/settings.ts と同じ値にしてください。
     ずれると「画面では選べるのに確定できない」状態になります。
   ============================================================ */

var CONFIG = {
  timeZone: 'Asia/Tokyo',
  slotIntervalMinutes: 30,
  bufferBeforeMinutes: 15,
  bufferAfterMinutes: 15,
  bookableDaysAhead: 60,
  minLeadTimeHours: 3,
  maxReservationsPerDay: 4,
  // 曜日ごとの営業時間（0=日曜）。null は定休日
  businessHours: {
    0: null,
    1: { open: '10:00', close: '18:00' },
    2: { open: '10:00', close: '18:00' },
    3: { open: '10:00', close: '16:00' },
    4: { open: '10:00', close: '18:00' },
    5: { open: '10:00', close: '18:00' },
    6: null,
  },
  // 予約1件あたりの最大同時実行を避けるためのロック待ち時間（ミリ秒）
  lockWaitMs: 20000,
  reminder: { previousDayAtHour: 10, hoursBefore: 3 },
};

/** メニュー定義（サイト側 src/data/booking/menus.ts と同じ） */
var MENUS = {
  oneColor: { name: 'ワンカラー', price: 5500, minutes: 60 },
  gradation: { name: 'グラデーション', price: 6600, minutes: 75 },
  french: { name: 'フレンチネイル', price: 6600, minutes: 75 },
  flatSimple: { name: '定額シンプルコース', price: 7700, minutes: 90 },
  flatDesign: { name: '定額デザインコース', price: 8800, minutes: 105 },
  broughtDesign: { name: '持ち込みデザイン', price: null, minutes: 120 },
  gelOff: { name: 'ジェルネイルオフ', price: 2200, minutes: 30 },
  sculpture: { name: 'スカルプ', price: null, minutes: 120 },
  nailCare: { name: 'ネイルケア', price: 4400, minutes: 45 },
  footNail: { name: 'フットネイル', price: 7700, minutes: 90 },
  extension: { name: '長さ出し', price: 550, minutes: 20 },
  repair: { name: '亀裂補強', price: 550, minutes: 15 },
  consult: { name: 'その他相談', price: null, minutes: 30 },
};

var OPTIONS = {
  offOther: { name: '他店オフ', price: 2200, minutes: 30 },
  offOwn: { name: '自店オフ', price: 1100, minutes: 20 },
  extension: { name: '長さ出し', price: 550, minutes: 20 },
  repair: { name: '亀裂補強', price: 550, minutes: 15 },
  parts: { name: 'パーツ追加', price: 110, minutes: 10 },
  art: { name: 'アート追加', price: 550, minutes: 15 },
  footChange: { name: 'フット変更', price: 2200, minutes: 30 },
  colorAdd: { name: 'カラー追加', price: 550, minutes: 10 },
  stone: { name: 'ストーン追加', price: 110, minutes: 10 },
};

/* ============================================================
   スクリプトプロパティ
   ============================================================ */

function prop(key, required) {
  var value = PropertiesService.getScriptProperties().getProperty(key);
  if (!value && required) throw new Error('スクリプトプロパティ ' + key + ' が未設定です');
  return value || '';
}

function config() {
  return {
    calendarId: prop('CALENDAR_ID', true),
    ownerEmail: prop('OWNER_EMAIL', true),
    fromName: prop('FROM_NAME', false) || 'Rina nail',
    siteUrl: prop('SITE_URL', true),
    tokenSecret: prop('BOOKING_TOKEN_SECRET', true),
    sheetId: prop('SHEET_ID', true),
    salonName: prop('SALON_NAME', false) || 'Rina nail',
    salonAddress: prop('SALON_ADDRESS', false) || '三重県四日市市平尾町3082-5',
    salonPhone: prop('SALON_PHONE', false) || '',
    turnstileSecret: prop('TURNSTILE_SECRET', false),
  };
}

/* ============================================================
   エントリポイント
   ============================================================ */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var action = body.action;

    if (action === 'availability') return ok(handleAvailability(body));
    if (action === 'create') return ok(handleCreate(body));
    if (action === 'get') return ok(handleGet(body));
    if (action === 'reschedule') return ok(handleReschedule(body));
    if (action === 'cancel') return ok(handleCancel(body));

    return fail('invalidInput');
  } catch (error) {
    // 想定内のエラーはコードで返し、それ以外は unknown にします。
    // 例外メッセージをそのまま返すと内部構造が漏れるため返しません。
    if (error && error.bookingCode) return fail(error.bookingCode);
    console.error(error);
    return fail('unknown');
  }
}

/** 動作確認用。ブラウザで開いたときに設定の過不足だけを返します */
function doGet() {
  var missing = [];
  ['CALENDAR_ID', 'OWNER_EMAIL', 'SITE_URL', 'BOOKING_TOKEN_SECRET', 'SHEET_ID'].forEach(function (key) {
    if (!PropertiesService.getScriptProperties().getProperty(key)) missing.push(key);
  });
  return ContentService.createTextOutput(
    JSON.stringify({ ok: missing.length === 0, missing: missing }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function ok(data) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, data: data })).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function fail(code) {
  return ContentService.createTextOutput(JSON.stringify({ ok: false, code: code })).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function abort(code) {
  var error = new Error(code);
  error.bookingCode = code;
  throw error;
}

/* ============================================================
   空き状況
   ============================================================ */

function handleAvailability(body) {
  var date = String(body.date || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) abort('invalidInput');

  var cfg = config();
  var calendar = CalendarApp.getCalendarById(cfg.calendarId);
  if (!calendar) abort('calendarError');

  var dayStart = new Date(date + 'T00:00:00+09:00');
  var dayEnd = new Date(date + 'T23:59:59+09:00');

  /*
   * 予定の「種類」は見ません。
   * 予約・休憩・外出・私用・臨時休業のいずれであっても、
   * カレンダーに入っている時間は予約不可として扱います（要件どおり）。
   * これにより、運営者はカレンダーに予定を入れるだけで受付を止められます。
   */
  var events = calendar.getEvents(dayStart, dayEnd);
  var busy = events.map(function (event) {
    if (event.isAllDayEvent()) {
      return { start: date + 'T00:00:00+09:00', end: date + 'T23:59:59+09:00' };
    }
    return { start: event.getStartTime().toISOString(), end: event.getEndTime().toISOString() };
  });

  return { busy: busy, reservationCount: countReservationsOn(date) };
}

/* ============================================================
   予約作成
   ============================================================ */

function handleCreate(body) {
  var cfg = config();
  verifyTurnstile(body.turnstileToken);

  var menu = MENUS[body.menuId];
  if (!menu) abort('invalidInput');

  var optionIds = Array.isArray(body.optionIds) ? body.optionIds : [];
  var form = body.form || {};
  validateForm(form);

  var idempotencyKey = String(body.idempotencyKey || '');
  if (!idempotencyKey) abort('invalidInput');

  // 同時アクセスを直列化します。これが重複予約を防ぐ要です。
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.lockWaitMs)) abort('slotTaken');

  try {
    // 二重送信（通信が切れて再送された場合など）は、
    // 新規登録せずに1件目の結果をそのまま返します。
    var existing = findByIdempotencyKey(idempotencyKey);
    if (existing) {
      return {
        reservationId: existing.reservationId,
        manageToken: createToken(existing.reservationId),
        startIso: existing.startIso,
        endIso: existing.endIso,
        duplicated: true,
      };
    }

    var start = new Date(body.startIso);
    if (isNaN(start.getTime())) abort('invalidInput');

    var treatment = menu.minutes + sumOptionMinutes(optionIds);
    var blockStart = new Date(start.getTime() - CONFIG.bufferBeforeMinutes * 60000);
    var blockEnd = new Date(start.getTime() + (treatment + CONFIG.bufferAfterMinutes) * 60000);

    // 画面表示後に状況が変わっている可能性があるため、ここで必ず再検証します
    assertBookable(start, blockStart, blockEnd);

    var reservationId = newReservationId();
    var event = createCalendarEvent(cfg, reservationId, {
      menu: menu,
      optionIds: optionIds,
      form: form,
      start: start,
      blockStart: blockStart,
      blockEnd: blockEnd,
      treatment: treatment,
    });

    var record = {
      reservationId: reservationId,
      idempotencyKey: idempotencyKey,
      eventId: event.getId(),
      status: 'confirmed',
      startIso: start.toISOString(),
      endIso: blockEnd.toISOString(),
      menuId: body.menuId,
      optionIds: optionIds.join(','),
      name: form.name,
      kana: form.kana || '',
      phone: form.phone,
      email: form.email,
      locale: body.locale || 'ja',
      createdAt: new Date().toISOString(),
    };
    appendReservation(record);

    var token = createToken(reservationId);

    /*
     * メール送信の失敗で予約を取り消さないでください。
     * カレンダー登録が成功した時点で「予約は成立」しています。
     * ここで例外を投げると、お客様が再送信して二重予約になります。
     */
    try {
      sendCustomerMail(cfg, record, menu, optionIds, form, token);
      sendOwnerMail(cfg, record, menu, optionIds, form, event);
    } catch (mailError) {
      console.error('メール送信に失敗しました: ' + mailError);
      markMailFailed(reservationId);
    }

    return {
      reservationId: reservationId,
      manageToken: token,
      startIso: record.startIso,
      endIso: record.endIso,
      duplicated: false,
    };
  } finally {
    lock.releaseLock();
  }
}

/** 営業時間・締切・受付期間・重複・1日の上限をまとめて確認します */
function assertBookable(start, blockStart, blockEnd) {
  var now = new Date();

  if (start.getTime() < now.getTime()) abort('pastDate');
  if (start.getTime() < now.getTime() + CONFIG.minLeadTimeHours * 3600000) abort('tooSoon');

  var limit = new Date(now.getTime());
  limit.setDate(limit.getDate() + CONFIG.bookableDaysAhead);
  if (start.getTime() > limit.getTime()) abort('outsideHours');

  var dayOfWeek = Number(Utilities.formatDate(start, CONFIG.timeZone, 'u')) % 7; // 1=月...7=日 → 0=日
  var hours = CONFIG.businessHours[dayOfWeek];
  if (!hours) abort('outsideHours');

  var startMinutes = minutesOfDay(start);
  var endMinutes = minutesOfDay(blockEnd);
  if (startMinutes < toMinutes(hours.open)) abort('outsideHours');
  if (endMinutes > toMinutes(hours.close)) abort('outsideHours');

  var date = Utilities.formatDate(start, CONFIG.timeZone, 'yyyy-MM-dd');
  if (countReservationsOn(date) >= CONFIG.maxReservationsPerDay) abort('dailyLimit');

  // カレンダー上に重なる予定がひとつでもあれば取れません
  var calendar = CalendarApp.getCalendarById(config().calendarId);
  var conflicts = calendar.getEvents(blockStart, blockEnd);
  if (conflicts.length > 0) abort('slotTaken');
}

function minutesOfDay(date) {
  var text = Utilities.formatDate(date, CONFIG.timeZone, 'HH:mm');
  return toMinutes(text);
}

function toMinutes(text) {
  var parts = String(text).split(':');
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function sumOptionMinutes(ids) {
  return ids.reduce(function (total, id) {
    return total + (OPTIONS[id] ? OPTIONS[id].minutes : 0);
  }, 0);
}

function sumPrice(menu, ids) {
  var undecided = menu.price === null;
  var total = menu.price || 0;
  ids.forEach(function (id) {
    var option = OPTIONS[id];
    if (!option) return;
    if (option.price === null) undecided = true;
    else total += option.price;
  });
  return { total: total, undecided: undecided };
}

/* ============================================================
   カレンダー
   ============================================================ */

function createCalendarEvent(cfg, reservationId, data) {
  var calendar = CalendarApp.getCalendarById(cfg.calendarId);

  /*
   * タイトルには「メニュー名」と「姓」だけを入れます。
   * カレンダーの一覧画面は通知やロック画面にも出るため、
   * 電話番号やメールアドレスをタイトルに含めません（要件どおり）。
   */
  var lastName = String(data.form.name || '').split(/[\s　]/)[0];
  var title = '【' + data.menu.name + '】' + lastName + '様';

  var price = sumPrice(data.menu, data.optionIds);
  var optionNames = data.optionIds
    .map(function (id) {
      return OPTIONS[id] ? OPTIONS[id].name : id;
    })
    .join('、');

  var description = [
    '予約ID: ' + reservationId,
    'お客様名: ' + data.form.name + '（' + (data.form.kana || '') + '）',
    '電話番号: ' + data.form.phone,
    'メール: ' + data.form.email,
    'メニュー: ' + data.menu.name,
    'オプション: ' + (optionNames || 'なし'),
    '料金目安: ' + (price.undecided ? '来店時にご案内' : '¥' + price.total.toLocaleString()),
    '施術時間: ' + data.treatment + '分（準備・片付けを含め ' +
      (data.treatment + CONFIG.bufferBeforeMinutes + CONFIG.bufferAfterMinutes) + '分）',
    'オフ: ' + offLabel(data.form.needsOff),
    '来店: ' + (data.form.visitType === 'repeat' ? '再来店' : '初回'),
    '爪の状態: ' + (data.form.nailCondition || '-'),
    'アレルギー: ' + (data.form.allergy || '-'),
    '希望カラー: ' + (data.form.color || '-'),
    '希望デザイン: ' + (data.form.design || '-'),
    '連絡事項: ' + (data.form.note || '-'),
    '連絡希望: ' + (data.form.contactPreference === 'phone' ? '電話' : 'メール'),
    '予約経路: 公式サイト',
    '',
    '※この予定を削除すると、その時間は再び予約可能になります。',
  ].join('\n');

  return calendar.createEvent(title, data.blockStart, data.blockEnd, {
    description: description,
    location: cfg.salonAddress,
  });
}

/* ============================================================
   予約の保存（スプレッドシート）
   ============================================================ */

var SHEET_NAME = '予約';
var HEADERS = [
  'reservationId', 'idempotencyKey', 'eventId', 'status', 'startIso', 'endIso',
  'menuId', 'optionIds', 'name', 'kana', 'phone', 'email', 'locale',
  'createdAt', 'updatedAt', 'mailStatus', 'reminderSent',
];

function sheet() {
  var book = SpreadsheetApp.openById(config().sheetId);
  var target = book.getSheetByName(SHEET_NAME);
  if (!target) {
    target = book.insertSheet(SHEET_NAME);
    target.appendRow(HEADERS);
  }
  return target;
}

function appendReservation(record) {
  var row = HEADERS.map(function (key) {
    return record[key] !== undefined ? record[key] : '';
  });
  sheet().appendRow(row);
}

function findRow(predicate) {
  var values = sheet().getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var record = {};
    HEADERS.forEach(function (key, index) {
      record[key] = values[i][index];
    });
    if (predicate(record)) return { rowIndex: i + 1, record: record };
  }
  return null;
}

function findByIdempotencyKey(key) {
  var found = findRow(function (record) {
    return String(record.idempotencyKey) === key;
  });
  return found ? found.record : null;
}

function findByReservationId(id) {
  return findRow(function (record) {
    return String(record.reservationId) === id;
  });
}

function countReservationsOn(date) {
  var values = sheet().getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < values.length; i++) {
    var status = values[i][HEADERS.indexOf('status')];
    var startIso = values[i][HEADERS.indexOf('startIso')];
    if (status !== 'confirmed' || !startIso) continue;
    var day = Utilities.formatDate(new Date(startIso), CONFIG.timeZone, 'yyyy-MM-dd');
    if (day === date) count++;
  }
  return count;
}

function updateRow(rowIndex, changes) {
  var target = sheet();
  Object.keys(changes).forEach(function (key) {
    var column = HEADERS.indexOf(key) + 1;
    if (column > 0) target.getRange(rowIndex, column).setValue(changes[key]);
  });
  target.getRange(rowIndex, HEADERS.indexOf('updatedAt') + 1).setValue(new Date().toISOString());
}

function markMailFailed(reservationId) {
  var found = findByReservationId(reservationId);
  if (found) updateRow(found.rowIndex, { mailStatus: 'failed' });
}

function newReservationId() {
  var stamp = Utilities.formatDate(new Date(), CONFIG.timeZone, 'yyyyMMdd');
  var random = Utilities.getUuid().replace(/-/g, '').substring(0, 6).toUpperCase();
  return 'RN' + stamp + random;
}

/* ============================================================
   トークン（予約変更・キャンセル用）
   ============================================================ */

/**
 * 予約IDだけでは変更できないようにするため、署名付きトークンを使います。
 * 形式: <予約ID>.<有効期限>.<HMAC-SHA256の署名>
 * 秘密鍵はスクリプトプロパティにあり、外部に出ません。
 */
function createToken(reservationId) {
  var expires = Date.now() + 90 * 24 * 3600 * 1000; // 90日
  var payload = reservationId + '.' + expires;
  return payload + '.' + sign(payload);
}

function sign(payload) {
  var bytes = Utilities.computeHmacSha256Signature(payload, config().tokenSecret);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}

function verifyToken(token) {
  var parts = String(token || '').split('.');
  if (parts.length !== 3) abort('invalidToken');

  var payload = parts[0] + '.' + parts[1];
  // 署名を先に確認します（存在しない予約IDを試されても情報を返さないため）
  if (sign(payload) !== parts[2]) abort('invalidToken');
  if (Number(parts[1]) < Date.now()) abort('expiredToken');

  var found = findByReservationId(parts[0]);
  if (!found) abort('invalidToken');
  return found;
}

/* ============================================================
   予約の取得・変更・キャンセル
   ============================================================ */

function handleGet(body) {
  var found = verifyToken(body.token);
  var record = found.record;
  return {
    reservationId: record.reservationId,
    status: record.status,
    startIso: record.startIso,
    endIso: record.endIso,
    menuId: record.menuId,
    optionIds: record.optionIds ? String(record.optionIds).split(',') : [],
    name: record.name,
  };
}

function handleReschedule(body) {
  var cfg = config();
  var found = verifyToken(body.token);
  var record = found.record;
  if (record.status === 'cancelled') abort('alreadyCancelled');

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(CONFIG.lockWaitMs)) abort('slotTaken');

  try {
    var menu = MENUS[record.menuId];
    var optionIds = record.optionIds ? String(record.optionIds).split(',').filter(Boolean) : [];
    var start = new Date(body.startIso);
    if (isNaN(start.getTime())) abort('invalidInput');

    var treatment = menu.minutes + sumOptionMinutes(optionIds);
    var blockStart = new Date(start.getTime() - CONFIG.bufferBeforeMinutes * 60000);
    var blockEnd = new Date(start.getTime() + (treatment + CONFIG.bufferAfterMinutes) * 60000);

    // 自分自身の予定を「重複」と判定しないよう、いったん外してから確認します
    var calendar = CalendarApp.getCalendarById(cfg.calendarId);
    var event = calendar.getEventById(record.eventId);
    if (event) event.deleteEvent();

    try {
      assertBookable(start, blockStart, blockEnd);
    } catch (error) {
      // 移動先が埋まっていた場合は元の時間に戻します
      if (event) {
        createCalendarEventFromRecord(cfg, record, menu, optionIds);
      }
      throw error;
    }

    var newEvent = createCalendarEvent(cfg, record.reservationId, {
      menu: menu,
      optionIds: optionIds,
      form: recordToForm(record),
      start: start,
      blockStart: blockStart,
      blockEnd: blockEnd,
      treatment: treatment,
    });

    updateRow(found.rowIndex, {
      eventId: newEvent.getId(),
      startIso: start.toISOString(),
      endIso: blockEnd.toISOString(),
    });

    try {
      sendRescheduleMails(cfg, record, menu, optionIds, start, body.token);
    } catch (mailError) {
      console.error('変更メールの送信に失敗しました: ' + mailError);
    }

    return {
      reservationId: record.reservationId,
      manageToken: body.token,
      startIso: start.toISOString(),
      endIso: blockEnd.toISOString(),
      duplicated: false,
    };
  } finally {
    lock.releaseLock();
  }
}

function handleCancel(body) {
  var cfg = config();
  var found = verifyToken(body.token);
  var record = found.record;

  // すでにキャンセル済みなら、同じ結果を返します（二重クリック対策）
  if (record.status === 'cancelled') {
    return { reservationId: record.reservationId };
  }

  var calendar = CalendarApp.getCalendarById(cfg.calendarId);
  var event = calendar.getEventById(record.eventId);
  // 予定を削除すると、その時間は自動的に再び予約可能になります
  if (event) event.deleteEvent();

  updateRow(found.rowIndex, { status: 'cancelled' });

  try {
    sendCancelMails(cfg, record);
  } catch (mailError) {
    console.error('キャンセルメールの送信に失敗しました: ' + mailError);
  }

  return { reservationId: record.reservationId };
}

function createCalendarEventFromRecord(cfg, record, menu, optionIds) {
  var start = new Date(record.startIso);
  var treatment = menu.minutes + sumOptionMinutes(optionIds);
  return createCalendarEvent(cfg, record.reservationId, {
    menu: menu,
    optionIds: optionIds,
    form: recordToForm(record),
    start: start,
    blockStart: new Date(start.getTime() - CONFIG.bufferBeforeMinutes * 60000),
    blockEnd: new Date(start.getTime() + (treatment + CONFIG.bufferAfterMinutes) * 60000),
    treatment: treatment,
  });
}

function recordToForm(record) {
  return {
    name: record.name,
    kana: record.kana,
    phone: record.phone,
    email: record.email,
  };
}

/* ============================================================
   入力検証（サーバー側。ブラウザ側の検証は回避できるため必須）
   ============================================================ */

function validateForm(form) {
  if (!form || typeof form !== 'object') abort('invalidInput');
  if (!isNonEmpty(form.name, 60)) abort('invalidInput');
  if (!isNonEmpty(form.kana, 60)) abort('invalidInput');
  if (!/^0\d{9,10}$|^\+\d{10,15}$/.test(String(form.phone || '').replace(/[^0-9+]/g, ''))) {
    abort('invalidInput');
  }
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(form.email || '').trim())) abort('invalidInput');
  if (!form.agreeTerms || !form.agreeCancel || !form.agreePrivacy) abort('invalidInput');

  ['nailCondition', 'allergy', 'color', 'design', 'note'].forEach(function (key) {
    if (form[key] && String(form[key]).length > 500) abort('invalidInput');
  });
}

function isNonEmpty(value, max) {
  var text = String(value || '').trim();
  return text.length > 0 && text.length <= max;
}

/** Cloudflare Turnstile を使う場合のみ検証します（未設定なら素通り） */
function verifyTurnstile(token) {
  var secret = config().turnstileSecret;
  if (!secret) return;
  if (!token) abort('invalidInput');

  var response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: secret, response: token },
    muteHttpExceptions: true,
  });
  var result = JSON.parse(response.getContentText() || '{}');
  if (!result.success) abort('rateLimited');
}

/* ============================================================
   メール
   ============================================================ */

function offLabel(value) {
  if (value === 'own') return '自店オフあり';
  if (value === 'other') return '他店オフあり';
  return 'なし';
}

function formatDateTime(iso) {
  return Utilities.formatDate(new Date(iso), CONFIG.timeZone, 'yyyy年M月d日(E) HH:mm');
}

function manageUrl(cfg, token) {
  return cfg.siteUrl.replace(/\/$/, '') + '/ja/booking/manage/?token=' + encodeURIComponent(token);
}

function mapUrl(cfg) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(cfg.salonAddress);
}

function sendCustomerMail(cfg, record, menu, optionIds, form, token) {
  var price = sumPrice(menu, optionIds);
  var optionNames = optionIds
    .map(function (id) { return OPTIONS[id] ? OPTIONS[id].name : id; })
    .join('、') || 'なし';

  var rows = [
    ['予約番号', record.reservationId],
    ['予約日時', formatDateTime(record.startIso)],
    ['メニュー', menu.name],
    ['オプション', optionNames],
    ['担当', '中村 梨奈'],
    ['施術予定時間', (menu.minutes + sumOptionMinutes(optionIds)) + '分'],
    ['料金目安', price.undecided ? '来店時にご案内します' : '¥' + price.total.toLocaleString() + '（税込）'],
  ];

  var text = [
    form.name + ' 様',
    '',
    'ご予約ありがとうございます。以下の内容で承りました。',
    '',
  ].concat(rows.map(function (row) { return row[0] + ': ' + row[1]; }))
    .concat([
      '',
      '■ 店舗',
      cfg.salonName,
      cfg.salonAddress,
      cfg.salonPhone ? 'TEL: ' + cfg.salonPhone : '',
      '地図: ' + mapUrl(cfg),
      '',
      '■ ご来店にあたって',
      '・駐車場をご利用いただけます。',
      '・場所が分からない場合は当日ご連絡ください。',
      '',
      '■ キャンセルについて',
      'ご都合が悪くなった場合は、できるだけ早めにご連絡ください。',
      '',
      '■ 予約の変更・キャンセル',
      manageUrl(cfg, token),
      '',
      cfg.salonName,
    ]).filter(Boolean).join('\n');

  var html = mailShell(
    'ご予約を承りました',
    '<p>' + escapeHtml(form.name) + ' 様</p>' +
    '<p>ご予約ありがとうございます。以下の内容で承りました。</p>' +
    table(rows) +
    '<h3>店舗</h3>' +
    '<p>' + escapeHtml(cfg.salonName) + '<br>' + escapeHtml(cfg.salonAddress) +
    (cfg.salonPhone ? '<br><a href="tel:' + escapeHtml(cfg.salonPhone) + '">' + escapeHtml(cfg.salonPhone) + '</a>' : '') +
    '<br><a href="' + mapUrl(cfg) + '">Googleマップで開く</a></p>' +
    '<h3>ご来店にあたって</h3>' +
    '<ul><li>駐車場をご利用いただけます。</li><li>場所が分からない場合は当日ご連絡ください。</li></ul>' +
    '<h3>キャンセルについて</h3>' +
    '<p>ご都合が悪くなった場合は、できるだけ早めにご連絡ください。</p>' +
    button('予約の変更・キャンセル', manageUrl(cfg, token)),
  );

  MailApp.sendEmail({
    to: form.email,
    subject: '【' + cfg.salonName + '】ご予約を承りました（' + formatDateTime(record.startIso) + '）',
    body: text,
    htmlBody: html,
    name: cfg.fromName,
  });
}

function sendOwnerMail(cfg, record, menu, optionIds, form, event) {
  var price = sumPrice(menu, optionIds);
  var optionNames = optionIds
    .map(function (id) { return OPTIONS[id] ? OPTIONS[id].name : id; })
    .join('、') || 'なし';

  var rows = [
    ['予約日時', formatDateTime(record.startIso)],
    ['お客様名', form.name + '（' + (form.kana || '') + '）'],
    ['電話番号', form.phone],
    ['メール', form.email],
    ['メニュー', menu.name],
    ['オプション', optionNames],
    ['料金', price.undecided ? '未確定（来店時案内）' : '¥' + price.total.toLocaleString()],
    ['施術時間', (menu.minutes + sumOptionMinutes(optionIds)) + '分'],
    ['オフ', offLabel(form.needsOff)],
    ['来店区分', form.visitType === 'repeat' ? '再来店' : '初回'],
    ['爪の状態', form.nailCondition || '-'],
    ['アレルギー', form.allergy || '-'],
    ['希望カラー', form.color || '-'],
    ['希望デザイン', form.design || '-'],
    ['連絡事項', form.note || '-'],
    ['連絡希望', form.contactPreference === 'phone' ? '電話' : 'メール'],
    ['予約ID', record.reservationId],
  ];

  var eventLink = 'https://calendar.google.com/calendar/r/day/' +
    Utilities.formatDate(new Date(record.startIso), CONFIG.timeZone, 'yyyy/MM/dd');

  var html = mailShell(
    '新規予約が入りました',
    table(rows) +
    // スマートフォンからそのまま電話・返信できるようにします
    '<p><a href="tel:' + escapeHtml(String(form.phone).replace(/[^0-9+]/g, '')) + '">電話をかける</a>　|　' +
    '<a href="mailto:' + escapeHtml(form.email) + '">メールで返信</a></p>' +
    button('Googleカレンダーで開く', eventLink),
  );

  MailApp.sendEmail({
    to: cfg.ownerEmail,
    subject: '【新規予約】' + formatDateTime(record.startIso) + ' ' + form.name + '様（' + menu.name + '）',
    body: rows.map(function (row) { return row[0] + ': ' + row[1]; }).join('\n') +
      '\n\nカレンダー: ' + eventLink,
    htmlBody: html,
    name: cfg.fromName,
  });
}

function sendRescheduleMails(cfg, record, menu, optionIds, start, token) {
  var when = formatDateTime(start.toISOString());
  MailApp.sendEmail({
    to: record.email,
    subject: '【' + cfg.salonName + '】ご予約日時を変更しました（' + when + '）',
    body: record.name + ' 様\n\nご予約日時を ' + when + ' に変更しました。\n\n変更・キャンセル: ' + manageUrl(cfg, token),
    htmlBody: mailShell('ご予約日時を変更しました',
      '<p>' + escapeHtml(record.name) + ' 様</p><p>ご予約日時を <strong>' + when + '</strong> に変更しました。</p>' +
      button('予約の変更・キャンセル', manageUrl(cfg, token))),
    name: cfg.fromName,
  });
  MailApp.sendEmail({
    to: cfg.ownerEmail,
    subject: '【予約変更】' + when + ' ' + record.name + '様',
    body: '予約ID: ' + record.reservationId + '\n変更後: ' + when + '\n電話: ' + record.phone,
    name: cfg.fromName,
  });
}

function sendCancelMails(cfg, record) {
  var when = formatDateTime(record.startIso);
  MailApp.sendEmail({
    to: record.email,
    subject: '【' + cfg.salonName + '】ご予約をキャンセルしました',
    body: record.name + ' 様\n\n' + when + ' のご予約をキャンセルしました。\nまたのご利用をお待ちしております。',
    htmlBody: mailShell('ご予約をキャンセルしました',
      '<p>' + escapeHtml(record.name) + ' 様</p><p>' + when + ' のご予約をキャンセルしました。</p>'),
    name: cfg.fromName,
  });
  MailApp.sendEmail({
    to: cfg.ownerEmail,
    subject: '【予約キャンセル】' + when + ' ' + record.name + '様',
    body: '予約ID: ' + record.reservationId + '\n日時: ' + when + '\n電話: ' + record.phone,
    name: cfg.fromName,
  });
}

/* ---------- メールの見た目 ---------- */

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function table(rows) {
  return '<table style="width:100%;border-collapse:collapse;font-size:14px">' +
    rows.map(function (row) {
      return '<tr>' +
        '<th style="text-align:left;padding:10px 8px;border-bottom:1px solid #eee;color:#666;font-weight:500;width:38%">' +
        escapeHtml(row[0]) + '</th>' +
        '<td style="padding:10px 8px;border-bottom:1px solid #eee">' + escapeHtml(row[1]) + '</td>' +
        '</tr>';
    }).join('') + '</table>';
}

function button(label, url) {
  return '<p style="margin:24px 0"><a href="' + url + '" style="display:inline-block;padding:14px 24px;' +
    'background:#b16ce8;color:#fff;text-decoration:none;border-radius:999px;font-size:15px">' +
    escapeHtml(label) + '</a></p>';
}

/** スマートフォンで読みやすい1カラムのHTMLメール */
function mailShell(heading, content) {
  return '<!doctype html><html><body style="margin:0;padding:0;background:#faf7fb">' +
    '<div style="max-width:600px;margin:0 auto;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,' +
    '\'Hiragino Sans\',\'Noto Sans JP\',sans-serif;color:#2b2431;line-height:1.7">' +
    '<h2 style="font-size:20px;font-weight:600;margin:0 0 20px">' + escapeHtml(heading) + '</h2>' +
    content +
    '<hr style="border:none;border-top:1px solid #eee;margin:28px 0">' +
    '<p style="font-size:12px;color:#888">このメールは送信専用です。ご返信いただいてもお答えできない場合があります。</p>' +
    '</div></body></html>';
}

/* ============================================================
   リマインド（時間主導トリガーで1日1回動かします）
   ============================================================ */

/**
 * トリガー設定: 「時計のアイコン → トリガーを追加」
 *   実行する関数: sendReminders / イベントのソース: 時間主導型 / 1時間おき
 */
function sendReminders() {
  var cfg = config();
  var now = new Date();
  var values = sheet().getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    var record = {};
    HEADERS.forEach(function (key, index) { record[key] = values[i][index]; });
    if (record.status !== 'confirmed' || !record.startIso) continue;
    if (record.reminderSent === 'sent') continue;

    var start = new Date(record.startIso);
    var hoursUntil = (start.getTime() - now.getTime()) / 3600000;
    if (hoursUntil < 0) continue;

    var shouldSend =
      (CONFIG.reminder.hoursBefore > 0 && hoursUntil <= CONFIG.reminder.hoursBefore) ||
      (hoursUntil <= 24 && Number(Utilities.formatDate(now, CONFIG.timeZone, 'H')) >= CONFIG.reminder.previousDayAtHour);

    if (!shouldSend) continue;

    try {
      MailApp.sendEmail({
        to: record.email,
        subject: '【' + cfg.salonName + '】ご予約のお知らせ（' + formatDateTime(record.startIso) + '）',
        body: record.name + ' 様\n\nまもなくご予約のお時間です。\n日時: ' + formatDateTime(record.startIso) +
          '\n場所: ' + cfg.salonAddress + '\n地図: ' + mapUrl(cfg) + '\n\nお気をつけてお越しください。',
        htmlBody: mailShell('ご予約のお知らせ',
          '<p>' + escapeHtml(record.name) + ' 様</p>' +
          '<p>まもなくご予約のお時間です。</p>' +
          table([['日時', formatDateTime(record.startIso)], ['場所', cfg.salonAddress]]) +
          button('Googleマップで開く', mapUrl(cfg))),
        name: cfg.fromName,
      });
      updateRow(i + 1, { reminderSent: 'sent' });
    } catch (error) {
      console.error('リマインド送信に失敗: ' + error);
    }
  }
}
