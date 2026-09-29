// Уведомления владельцу магазина. Сейчас — Telegram-бот.
// Если TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы, пишем в лог и не падаем.

export async function notifyOwner(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('⚠️ Telegram не настроен, уведомление не отправлено:\n' + text)
    return
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
    })
    if (!res.ok) {
      console.error('❌ Telegram ответил ошибкой:', res.status, await res.text())
    }
  } catch (error) {
    console.error('❌ Не удалось отправить уведомление в Telegram:', error)
  }
}

export function formatMoney(kopecks: number) {
  return `${(kopecks / 100).toLocaleString('ru-RU')} ₽`
}
