// ─── Telegram Bot API ────────────────────────────────────────────────────────
//
// Токен и chat_id читаются из переменных окружения Vite (.env):
//   VITE_TELEGRAM_BOT_TOKEN=<токен от @BotFather>
//   VITE_TELEGRAM_CHAT_ID=<числовой ID чата/пользователя>
//
// ⚠️  Частые причины ошибки 403 "the bot can't send messages to the bot":
//
//   1. CHAT_ID совпадает с числовой частью токена бота.
//      Токен выглядит как "1234567890:AAF...", числовая часть — 1234567890.
//      Это ID самого бота, не пользователя. Бот не может писать себе.
//
//   2. Пользователь ни разу не написал боту /start.
//      Telegram не разрешает боту начинать переписку первым.
//      Решение: открыть бота в Telegram и нажать /start.
//
//   3. Указан неверный chat_id (опечатка, старый ID и т.д.).
//
// ─── Как найти правильный chat_id ────────────────────────────────────────────
//   1. Напишите боту любое сообщение (например /start)
//   2. Откройте в браузере:
//      https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
//   3. Найдите "chat": { "id": XXXXXXX } — это ваш настоящий chat_id
// ─────────────────────────────────────────────────────────────────────────────

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
const CHAT_ID   = import.meta.env.VITE_TELEGRAM_CHAT_ID

// Человекочитаемые сообщения для кодов ошибок Telegram API
const TELEGRAM_ERROR_HINTS = {
  400: 'Неверный запрос (Bad Request). Проверьте формат chat_id и текст сообщения.',
  401: 'Неверный токен бота (Unauthorized). Проверьте VITE_TELEGRAM_BOT_TOKEN.',
  403: [
    'Доступ запрещён (Forbidden). Возможные причины:',
    '  • chat_id совпадает с ID самого бота — это ошибка конфигурации.',
    '  • Пользователь не написал боту /start — откройте бота в Telegram и нажмите /start.',
    '  • Указан неверный chat_id.',
    'Как найти chat_id: напишите боту /start, затем откройте',
    'https://api.telegram.org/bot<ТОКЕН>/getUpdates и найдите "chat.id".',
  ].join('\n'),
  429: 'Слишком много запросов (Too Many Requests). Telegram временно блокирует отправку.',
}

/**
 * Результат отправки — всегда возвращается объект, никогда не бросает исключение.
 * @typedef {{ ok: true, result: object } | { ok: false, status: number, description: string, hint: string }} TelegramResult
 */

/**
 * Отправляет текстовое сообщение в Telegram-чат.
 * Функция НИКОГДА не бросает исключение — все ошибки возвращаются как объект.
 *
 * @param {string} text  Готовый текст (поддерживается HTML-разметка через parse_mode: HTML)
 * @returns {Promise<TelegramResult>}
 */
export async function sendTelegram(text) {
  // Проверка наличия переменных окружения
  if (!BOT_TOKEN || !CHAT_ID) {
    const description = 'VITE_TELEGRAM_BOT_TOKEN или VITE_TELEGRAM_CHAT_ID не заданы в .env'
    console.warn('[Telegram]', description)
    return { ok: false, status: 0, description, hint: 'Добавьте переменные в файл .env и перезапустите сервер.' }
  }

  // Проверка: chat_id не должен совпадать с числовой частью токена
  // Токен: "1234567890:AAF..." → числовая часть "1234567890"
  const tokenNumericPart = BOT_TOKEN.split(':')[0]
  if (String(CHAT_ID) === tokenNumericPart) {
    const description = 'CHAT_ID совпадает с ID бота — бот не может писать самому себе.'
    const hint = 'Напишите боту /start в Telegram, затем откройте getUpdates и скопируйте "chat.id".'
    console.warn('[Telegram] 403 будет:', description, '\n' + hint)
    return { ok: false, status: 403, description, hint }
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  let response
  let result

  try {
    response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      // Параметры строго по документации Telegram Bot API:
      // https://core.telegram.org/bots/api#sendmessage
      body: JSON.stringify({
        chat_id:    String(CHAT_ID),   // всегда строка — надёжнее с числами и @username
        text,
        parse_mode: 'HTML',            // разрешает <b>, <i>, <code> и т.д.
      }),
    })
    result = await response.json()
  } catch (networkError) {
    // Сетевая ошибка (нет интернета, таймаут и т.д.)
    const description = `Сетевая ошибка: ${networkError.message}`
    console.warn('[Telegram] Сетевая ошибка:', networkError)
    return { ok: false, status: 0, description, hint: 'Проверьте подключение к интернету.' }
  }

  if (!response.ok || !result.ok) {
    const hint = TELEGRAM_ERROR_HINTS[response.status] ?? `Неизвестная ошибка Telegram API (${response.status}).`
    const description = result.description ?? `HTTP ${response.status}`
    console.warn(`[Telegram] Ошибка ${response.status}:`, description, '\n' + hint)
    return { ok: false, status: response.status, description, hint }
  }

  return { ok: true, result: result.result }
}

/**
 * Форматирует данные бронирования в красивое HTML-сообщение для Telegram.
 * @param {object} booking
 */
export function formatBookingMessage(booking) {
  const lines = [
    '🦁 <b>Новая заявка на тур — Wildhaven</b>',
    '',
    `🎟 <b>Тур:</b> ${booking.tourTitle ?? '—'}`,
    `💰 <b>Цена за человека:</b> ${booking.tourPrice ?? '—'} KGS`,
    '',
    `👤 <b>Имя:</b> ${booking.clientName ?? '—'}`,
    `📞 <b>Телефон:</b> ${booking.clientPhone ?? '—'}`,
    '',
    `📅 <b>Дата визита:</b> ${booking.visitDate ?? '—'}`,
    `👥 <b>Гостей:</b> ${booking.guestsCount ?? '—'}`,
    `💵 <b>Итого:</b> ${booking.totalPrice ?? '—'} KGS`,
    '',
    `🕐 <b>Создана:</b> ${new Date().toLocaleString('ru-RU')}`,
  ]
  return lines.join('\n')
}
