import { motion } from 'framer-motion'
import { ArrowUpRight, Camera, Check, Compass, Users, Utensils } from 'lucide-react'
import PriceDisplay from './PriceDisplay.jsx'
import resolveLocalizedField from '../utils/resolveLocalizedField.js'

const includedIcons = { guide: Compass, photo: Camera, feedingExperience: Utensils, familyWelcome: Users }

function formatDuration(minutes, t) {
  if (minutes < 60) return `${minutes} ${t('minutesShort')}`
  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} ${t('hoursShort')}`
}

export default function TourCard({ tour, index, language, onBook, t }) {
  const title = resolveLocalizedField(tour, 'title', language, tour.name ?? tour.titleKey ?? 'Без названия')
  const description = resolveLocalizedField(tour, 'description', language, tour.descriptionKey ?? '')
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={`tour-card ${tour.featured ? 'tour-card-featured' : ''}`}
      initial={{ opacity: 0, y: 22 }}
      transition={{ duration: 0.45, delay: index * 0.09 }}
      whileHover={{ y: -7, transition: { duration: 0.2 } }}
    >
      {tour.featured && <span className="tour-ribbon">{t('popular')}</span>}
      <div className="tour-card-topline"><span className="tour-number">0{index + 1}</span><ArrowUpRight size={17} /></div>
      {tour.image && <img alt="" className="tour-card-image" loading="lazy" src={tour.image} />}
      <h3>{t(title)}</h3>
      <p className="tour-description">{t(description)}</p>
      <div className="tour-price-line"><strong><PriceDisplay amount={tour.price} language={language} /></strong><span>{t('perPerson')}</span></div>
      {tour.durationMinutes && <div className="tour-meta-line"><span>{t('duration')}</span><strong>{formatDuration(tour.durationMinutes, t)}</strong></div>}
      {tour.daysKey && <div className="tour-meta-line"><span>{t('days')}</span><strong>{t(tour.daysKey)}</strong></div>}
      {tour.includes?.length > 0 && <div className="tour-inclusions">
        <span className="inclusions-title">{t('included')}</span>
        {tour.includes.map((item) => {
          const Icon = includedIcons[item] ?? Check
          return <span className="inclusion-item" key={item}><Icon size={15} /><span>{t(item)}</span><Check className="inclusion-check" size={14} /></span>
        })}
      </div>}
      <button className="tour-book-button" onClick={() => onBook(tour)} type="button">{t('chooseTour')} <ArrowUpRight size={17} /></button>
    </motion.article>
  )
}
