import { Ticket } from 'lucide-react'
import PriceDisplay from './PriceDisplay.jsx'

export default function BookingSummary({ tour, language, t }) {
  const duration = tour.durationMinutes < 60
    ? `${tour.durationMinutes} ${t('minutesShort')}`
    : `${tour.durationMinutes / 60} ${t('hoursShort')}`

  return (
    <div className="booking-selected-tour">
      <span className="booking-selected-icon"><Ticket size={17} /></span>
      <span><strong>{t(tour.name ?? tour.titleKey)}</strong><small>{duration}</small></span>
      <strong className="booking-selected-price"><PriceDisplay amount={tour.price} language={language} /></strong>
    </div>
  )
}
