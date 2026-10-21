import { ArrowUpRight, Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function StatsBlock({ t }) {
  return (
    <section aria-label={t('homeBenefitsTitle')} className="zoo-stats-strip">
      <div className="section-wrap zoo-stats-inner">
        <div className="stat-item"><strong>120<span>+</span></strong><span>{t('heroStatSpecies')}</span></div>
        <span className="stats-divider" />
        <div className="stat-item"><Heart size={18} /><span>{t('homeFeatureCare')}</span></div>
        <span className="stats-divider" />
        <div className="stat-item"><MapPin size={18} /><span>{t('footerAddress')}</span></div>
        <Link className="stats-book-link" to="/tours">{t('navTours')} <ArrowUpRight size={16} /></Link>
      </div>
    </section>
  )
}
