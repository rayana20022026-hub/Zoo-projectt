import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader, Ticket, X } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { formatKgs } from '../data/zooData.js'
import useLanguage from '../context/useLanguage.js'
import { auth, db } from '../firebase.js'
import { sendTelegram, formatBookingMessage } from '../lib/telegram.js'
import BookingReceipt from './BookingReceipt.jsx'
import BookingSummary from './BookingSummary.jsx'

/* ─── helpers ─────────────────────────────────────────────── */

function getDefaultDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const local = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function createTicketId() {
  return `WH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function getTourTitle(tour, t) {
  return tour.name ?? t(tour.titleKey ?? '') ?? 'Тур'
}

const INITIAL_FORM = { fullName: '', phone: '', date: getDefaultDate(), guests: 2 }

/* ─── Component ───────────────────────────────────────────── */

export default function BookingModal({ tour, tours = [], onTourChange, onClose }) {
  const { language, t } = useLanguage()

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    fullName: auth.currentUser?.displayName ?? '',
  })

  const [ticketId,       setTicketId]       = useState('')
  const [receiptTotal,   setReceiptTotal]   = useState(0)
  const [requestId]                         = useState(createTicketId)
  const [phoneError,     setPhoneError]     = useState('')
  const [bookingError,   setBookingError]   = useState('')
  const [telegramWarn,   setTelegramWarn]   = useState('') // мягкое предупреждение
  // Три состояния загрузки: idle | saving | sending
  const [status, setStatus] = useState('idle')

  const total = tour.price * Number(form.guests)

  const formattedDate = new Intl.DateTimeFormat(
    language === 'zh' ? 'zh-CN' : language,
    { day: 'numeric', month: 'long', year: 'numeric' },
  ).format(new Date(`${form.date}T12:00:00`))

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'phone') setPhoneError('')
  }

  async function submitBooking(event) {
    event.preventDefault()
    setBookingError('')

    // Валидация телефона
    if (!/^\+996\d{9}$/.test(form.phone)) {
      setPhoneError(t('invalidPhone'))
      return
    }

    // Авторизация
    const user = auth.currentUser
    if (!user) {
      setBookingError(t('bookingAuthRequired'))
      return
    }

    const guestsCount    = Number(form.guests)
    const calculatedTotal = tour.price * guestsCount
    const tourTitle      = getTourTitle(tour, t)

    const bookingData = {
      ticketId:    requestId,
      tourId:      tour.id ?? null,
      tourTitle,
      tourPrice:   tour.price,
      clientName:  form.fullName.trim(),
      clientPhone: form.phone.trim(),
      visitDate:   form.date,
      guestsCount,
      totalPrice:  calculatedTotal,
      userId:      user.uid,
      userEmail:   user.email ?? null,
      status:      'pending',
    }

    try {
      // Шаг 1 — сохраняем в Firestore
      setStatus('saving')
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
      })

      // Шаг 2 — отправляем уведомление в Telegram
      setStatus('sending')
      const tgResult = await sendTelegram(formatBookingMessage(bookingData))
      if (!tgResult.ok) {
        // Уведомление не доставлено, но бронирование уже сохранено в Firestore.
        // Показываем жёлтое предупреждение — не критическую ошибку.
        setTelegramWarn(
          tgResult.status === 403
            ? 'Уведомление в Telegram не отправлено: бот не может писать по этому Chat ID. Напишите боту /start в Telegram и обновите VITE_TELEGRAM_CHAT_ID в .env.'
            : `Уведомление в Telegram не доставлено: ${tgResult.description}. Заявка сохранена.`,
        )
      }

      // Успех
      setReceiptTotal(calculatedTotal)
      setTicketId(requestId)
      setForm({ ...INITIAL_FORM, fullName: form.fullName })
    } catch (error) {
      console.error('Could not save the booking.', error)
      setBookingError(
        error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.',
      )
    } finally {
      setStatus('idle')
    }
  }

  // Текст на кнопке зависит от текущего шага
  function submitLabel() {
    if (status === 'saving')  return <><Loader size={15} className="btn-spin" /> Сохраняем…</>
    if (status === 'sending') return <><Loader size={15} className="btn-spin" /> Отправляем…</>
    return <>{t('submitBooking')} <ArrowLeft className="button-arrow-right" size={17} /></>
  }

  const isBusy = status !== 'idle'

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="modal-backdrop booking-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        aria-labelledby="booking-title"
        aria-modal="true"
        className={`booking-dialog ${ticketId ? 'ticket-dialog' : ''}`}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ duration: 0.24 }}
      >
        {/* Шапка */}
        <div className="booking-dialog-header">
          <span className="dialog-step-mark">
            {ticketId ? <Ticket size={19} /> : '01 / 01'}
          </span>
          <div className="booking-title-wrap">
            <span className="section-eyebrow">
              {ticketId ? t('bookingReceipt') : t('bookingStep')}
            </span>
            <h2 id="booking-title">
              {ticketId ? t('ticketTitle') : t('bookingTitle')}
            </h2>
          </div>
          <button
            aria-label={t('close')}
            className="dialog-close dialog-close-static"
            onClick={onClose}
            type="button"
          >
            <X size={19} />
          </button>
        </div>

        {/* Форма / Квитанция */}
        {!ticketId ? (
          <div>
            <p className="booking-intro">{t('bookingSubtitle')}</p>

            {/* Выбор тура (если открыто не с конкретного тура) */}
            {tours.length > 1 && (
              <label className="form-field form-field-full">
                <span>{t('chooseTour')}</span>
                <select
                  value={tour.id}
                  onChange={(event) => {
                    const next = tours.find((item) => String(item.id) === event.target.value)
                    if (next) onTourChange?.(next)
                  }}
                >
                  {tours.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getTourTitle(item, t)} — {formatKgs(item.price, language)} KGS
                    </option>
                  ))}
                </select>
              </label>
            )}

            <BookingSummary language={language} t={t} tour={tour} />

            <form className="booking-form" onSubmit={submitBooking}>
              <label className="form-field form-field-full">
                <span>{t('fullName')}</span>
                <input
                  autoComplete="name"
                  name="fullName"
                  onChange={updateField}
                  placeholder={t('namePlaceholder')}
                  required
                  value={form.fullName}
                />
              </label>

              <label className="form-field form-field-full">
                <span>{t('phone')}</span>
                <input
                autoComplete="off"
                  inputMode="tel"
                maxLength={13}
                  name="phone"
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
                    updateField({ target: { name: 'phone', value } })
                  }}
                  placeholder="+996555123456"
                  pattern="\+996[0-9]{9}"
                  required
                  value={form.phone}
                />
                {phoneError && <small className="field-error">{phoneError}</small>}
              </label>

              <label className="form-field">
                <span>{t('date')}</span>
                <input
                  min={getDefaultDate()}
                  name="date"
                  onChange={updateField}
                  required
                  type="date"
                  value={form.date}
                />
              </label>

              <label className="form-field">
                <span>{t('guests')}</span>
                <select name="guests" onChange={updateField} value={form.guests}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              <div className="booking-total">
                <span>{t('total')}</span>
                <strong>{formatKgs(total, language)} <small>KGS</small></strong>
              </div>

              {bookingError && (
                <p className="field-error" role="alert">{bookingError}</p>
              )}

              {telegramWarn && (
                <p className="field-warn" role="status">{telegramWarn}</p>
              )}

              <button
                className="booking-primary-button"
                disabled={isBusy}
                type="submit"
              >
                {submitLabel()}
              </button>
            </form>
          </div>
        ) : (
          <BookingReceipt
            customerName={form.fullName}
            date={formattedDate}
            guests={form.guests}
            language={language}
            onClose={onClose}
            ticketId={ticketId}
            total={receiptTotal}
            tour={tour}
            t={t}
          />
        )}
      </motion.section>
    </motion.div>
  )
}
