import { Check } from 'lucide-react'
import PriceDisplay from './PriceDisplay.jsx'

export default function BookingReceipt({ customerName, date, guests, language, onClose, ticketId, total, tour, t }) {
  return (
    <div>
      <div className="ticket-success-icon"><Check size={25} /></div>
      <p className="ticket-guest-greeting">{t('ticketGreeting')} {customerName}</p>
      <div className="e-ticket">
        <div className="e-ticket-top"><span className="e-ticket-brand">WILDHAVEN</span><span className="e-ticket-status">{t('bookingPending')}</span></div>
        <h3>{t(tour.name ?? tour.titleKey)}</h3>
        <div className="e-ticket-grid">
          <div><span>{t('ticketId')}</span><strong>{ticketId}</strong></div>
          <div><span>{t('ticketDate')}</span><strong>{date}</strong></div>
          <div><span>{t('ticketGuests')}</span><strong>{guests}</strong></div>
          <div><span>{t('total')}</span><strong><PriceDisplay amount={total} language={language} /></strong></div>
        </div>
        <div aria-hidden="true" className="ticket-barcode" />
      </div>
      <p className="ticket-email-note">Заявка отправлена.</p>
      <div className="ticket-actions">
        <button className="booking-secondary-button" onClick={() => window.print()} type="button">{t('ticketSave')}</button>
        <span className="booking-telegram-success"><Check size={16} /> Заявка отправлена</span>
        <button className="booking-primary-button" onClick={onClose} type="button">{t('done')}</button>
      </div>
    </div>
  )
}
