import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function QuickLinks({ t }) {
  return (
    <section aria-label={t('homeQuickLinks')} className="home-quick-links section-wrap">
      <Link className="home-quick-card home-quick-animals" to="/animals">
        <span><span className="section-eyebrow">{t('animalsEyebrow')}</span><strong>{t('animalsTitle')}</strong></span>
        <ArrowUpRight size={22} />
      </Link>
      <Link className="home-quick-card home-quick-tours" to="/tours">
        <span><span className="section-eyebrow">{t('tourEyebrow')}</span><strong>{t('toursTitle')}</strong></span>
        <ArrowUpRight size={22} />
      </Link>
    </section>
  )
}
