import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader, Phone, Ticket, X } from 'lucide-react'
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'
import { formatKgs } from '../data/zooData.js'
import useLanguage from '../context/useLanguage.js'
import { auth, db, storage } from '../firebase.js'
import { sendTelegram, formatBookingMessage } from '../lib/telegram.js'
import BookingReceipt from './BookingReceipt.jsx'
import BookingSummary from './BookingSummary.jsx'
import PhoneInput from './PhoneInput.jsx'

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

export default function BookingModal({ tour, tours = [], onTourChange, onClose, onPaymentComplete }) {
  const { language, t } = useLanguage()

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    fullName: auth.currentUser?.displayName ?? '',
  })
  useEffect(() => {
    const currentUser = auth.currentUser
    if (!currentUser) return
    getDoc(doc(db, 'users', currentUser.uid)).then((profile) => {
      if (!profile.exists()) return
      const data = profile.data()
      setForm((current) => ({ ...current, fullName: current.fullName || data.fullName || currentUser.displayName || '', phone: current.phone || data.phone || '' }))
    }).catch(() => {})
  }, [])

  const [ticketId,       setTicketId]       = useState('')
  const [paymentBooking, setPaymentBooking] = useState(null)
  const [paymentProof, setPaymentProof] = useState(null)
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
    if (!/^\+\d{7,12}$/.test(form.phone)) {
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
      userId:      user.uid,
      tourId:      tour.id ?? null,
      userEmail:   user.email ?? null,
      tourTitle,
      tourPrice:   tour.price,
      clientName:  form.fullName.trim(),
      clientPhone: form.phone.trim(),
      visitDate:   form.date,
      guestsCount,
      totalPrice:  calculatedTotal,
      status:      'awaiting-payment',
    }

    try {
      // Шаг 1 — сохраняем в Firestore
      setStatus('saving')
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
      })
      const profileRef = doc(db, 'users', user.uid)
      const profile = await getDoc(profileRef).catch(() => null)
      const contact = { uid: user.uid, fullName: form.fullName.trim(), email: user.email ?? null, phone: form.phone.trim() }
      await setDoc(profileRef, profile?.exists() ? contact : { ...contact, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), loginCount: 1 }, { merge: true }).catch(() => {})

      setPaymentBooking({ bookingRef, bookingData })
    } catch (error) {
      console.error('Could not save the booking.', error)
      setBookingError(
        error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.',
      )
    } finally {
      setStatus('idle')
    }
  }

  async function confirmPayment() {
    if (!paymentBooking || isBusy) return
    setBookingError('')
    setStatus('saving')
    try {
      const paidBooking = { ...paymentBooking.bookingData, status: 'paid' }
      let paymentProofPath = null
      if (paymentProof) {
        if (!paymentProof.type.startsWith('image/') || paymentProof.size > 5 * 1024 * 1024) {
          throw new Error('Загрузите изображение чека размером не более 5 МБ.')
        }
        const proofRef = ref(storage, `payment-proofs/${auth.currentUser.uid}/${paymentBooking.bookingRef.id}/${crypto.randomUUID()}`)
        await uploadBytes(proofRef, paymentProof, { contentType: paymentProof.type })
        paymentProofPath = proofRef.fullPath
      }
      await updateDoc(paymentBooking.bookingRef, {
        status: 'paid',
        paidAt: serverTimestamp(),
        paymentMethod: 'MBank QR',
        ...(paymentProofPath ? { paymentProofPath } : {}),
      })
      setReceiptTotal(paidBooking.totalPrice)
      setTicketId(paidBooking.ticketId)
      setForm((current) => ({ ...INITIAL_FORM, fullName: current.fullName }))
      onPaymentComplete?.()
      sendTelegram(formatBookingMessage(paidBooking)).then((tgResult) => {
        if (!tgResult.ok) console.warn('Ticket is paid, but Telegram did not deliver the notice:', tgResult.description)
      }).catch((error) => console.warn('Ticket is paid, but Telegram notification failed.', error))
    } catch (error) {
      console.error('Could not confirm ticket payment.', error)
      setBookingError(error.message || 'Could not confirm payment. Please try again.')
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
        className={`booking-dialog ${ticketId ? 'ticket-dialog' : ''} ${paymentBooking ? 'payment-dialog' : ''}`}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ duration: 0.24 }}
      >
        {/* Шапка */}
        <div className={`booking-dialog-header ${paymentBooking ? 'payment-dialog-header' : ''}`}>
          <span className="dialog-step-mark">
            {ticketId ? <Ticket size={19} /> : '01 / 01'}
          </span>
          <div className="booking-title-wrap">
            <span className="section-eyebrow">
              {ticketId ? t('bookingReceipt') : t('bookingStep')}
            </span>
            <h2 id="booking-title">
              {paymentBooking ? 'Оплата билета' : ticketId ? t('ticketTitle') : t('bookingTitle')}
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
        {paymentBooking ? (
          <div className="payment-content">
            <p className="payment-instruction">Отсканируйте QR-код в MBank и оплатите <strong>{formatKgs(paymentBooking.bookingData.totalPrice, language)} KGS</strong></p>
            <img className="payment-qr" src="/qr-code.png" alt="QR-код для оплаты через MBank" />
            <p className="payment-recipient"><Phone aria-hidden="true" size={17} /><strong>MBank: +996 (770) 250 411 (РАЯНА А.)</strong></p>
            <p className="payment-hint">После перевода нажмите кнопку ниже, чтобы перейти к вашим билетам.</p>
            <label className="form-field payment-proof-field">
              <span>Чек или скриншот оплаты (необязательно)</span>
              <input accept="image/*" disabled={isBusy} onChange={(event) => setPaymentProof(event.target.files?.[0] ?? null)} type="file" />
            </label>
            {bookingError && <p className="field-error" role="alert">{bookingError}</p>}
            {telegramWarn && <p className="field-warn" role="status">{telegramWarn}</p>}
            <button className="booking-primary-button payment-submit" disabled={isBusy} onClick={confirmPayment} type="button">{isBusy ? <><Loader size={15} className="btn-spin" /> Сохраняем оплату…</> : 'Билет'}</button>
            <button className="auth-register-button payment-back" disabled={isBusy} onClick={() => setPaymentBooking(null)} type="button">Назад к бронированию</button>
          </div>
        ) : !ticketId ? (
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
                <PhoneInput value={form.phone} onChange={(value) => updateField({ target: { name: 'phone', value } })} />
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
