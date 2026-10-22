import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()

const database = getFirestore()
const telegramBotToken = defineSecret('TELEGRAM_BOT_TOKEN')
const telegramChatId = defineSecret('TELEGRAM_CHAT_ID')

export const createBooking = onCall(
  { secrets: [telegramBotToken, telegramChatId] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Войдите, чтобы оформить бронирование.')
    }

    const { ticketId, fullName, phone, date, guests, tourId } = request.data ?? {}
    const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00.000Z`) : null
    const validBookingDate = parsedDate !== null
      && !Number.isNaN(parsedDate.getTime())
      && parsedDate.toISOString().slice(0, 10) === date
      && date >= new Date().toISOString().slice(0, 10)
    if (
      typeof ticketId !== 'string'
      || !/^WH-[A-F0-9]{8}$/.test(ticketId)
      || typeof fullName !== 'string'
      || fullName.trim().length < 1
      || fullName.trim().length > 120
      || typeof phone !== 'string'
      || phone.replace(/\D/g, '').length < 7
      || phone.trim().length > 32
      || typeof date !== 'string'
      || !/^\d{4}-\d{2}-\d{2}$/.test(date)
      || !validBookingDate
      || !Number.isInteger(guests)
      || guests < 1
      || guests > 8
      || typeof tourId !== 'string'
      || tourId.length < 1
      || tourId.length > 100
    ) {
      throw new HttpsError('invalid-argument', 'Проверьте данные бронирования.')
    }

    const tourSnapshot = await database.collection('tours').doc(tourId).get()
    if (!tourSnapshot.exists || typeof tourSnapshot.data().price !== 'number' || tourSnapshot.data().price < 0) {
      throw new HttpsError('not-found', 'Выбранный тур больше недоступен.')
    }

    const tour = tourSnapshot.data()
    const price = tour.price
    const total = price * guests
    const bookingReference = database.collection('bookings').doc(ticketId)
    const previousBooking = await bookingReference.get()

    if (previousBooking.exists && previousBooking.data().userId !== request.auth.uid) {
      throw new HttpsError('already-exists', 'Не удалось создать уникальный номер заявки.')
    }

    if (previousBooking.exists && previousBooking.data().telegramStatus === 'sent') {
      return { ticketId, total: previousBooking.data().total }
    }

    await bookingReference.set({
      userId: request.auth.uid,
      ticketId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      date,
      guests,
      tourId,
      tourTitleKey: tour.name ?? tour.titleKey ?? tourId,
      price,
      total,
      status: 'pending-confirmation',
      telegramStatus: 'pending',
      createdAt: previousBooking.exists ? previousBooking.data().createdAt : FieldValue.serverTimestamp(),
    })

    const message = [
      'Новая заявка на тур Wildhaven Bishkek',
      `Номер: ${ticketId}`,
      `Тур: ${tour.name ?? tour.titleKey ?? tourId}`,
      `Имя: ${fullName.trim()}`,
      `Телефон: ${phone.trim()}`,
      `Дата: ${date}`,
      `Гостей: ${guests}`,
      `Стоимость: ${total} KGS`,
    ].join('\n')

    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken.value()}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId.value(), text: message }),
      })

      const telegramResult = await telegramResponse.json()
      if (!telegramResponse.ok || !telegramResult.ok) throw new Error('Telegram rejected the message.')

      await bookingReference.update({ telegramStatus: 'sent' })
    } catch {
      console.error('Booking was saved, but Telegram delivery failed.', ticketId)
      await bookingReference.update({ telegramStatus: 'failed' })
      throw new HttpsError('unavailable', 'Заявка сохранена, но не отправлена в Telegram. Свяжитесь с администратором.')
    }

    return { ticketId, total }
  },
)

export const deleteCustomerAccount = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Требуется вход администратора.')

  const adminProfile = await database.collection('admins').doc(request.auth.uid).get()
  if (!adminProfile.exists) throw new HttpsError('permission-denied', 'Только администратор может удалять аккаунты.')

  const uid = request.data?.uid
  if (typeof uid !== 'string' || uid.length < 1 || uid === request.auth.uid) {
    throw new HttpsError('invalid-argument', 'Некорректный идентификатор пользователя.')
  }

  const userProfile = database.collection('users').doc(uid)
  const bookings = await database.collection('bookings').where('userId', '==', uid).get()
  for (let offset = 0; offset < bookings.docs.length; offset += 450) {
    const batch = database.batch()
    bookings.docs.slice(offset, offset + 450).forEach((booking) => batch.delete(booking.ref))
    await batch.commit()
  }

  await userProfile.delete()
  try {
    await getAuth().deleteUser(uid)
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', 'Данные удалены, но аккаунт Firebase Authentication удалить не удалось.')
    }
  }
  return { uid, deletedBookings: bookings.size }
})
