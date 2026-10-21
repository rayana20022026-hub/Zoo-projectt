import { useState } from 'react'
import { ArrowUpRight, Leaf, MapPin, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import useLanguage from '../context/useLanguage.js'

export default function Footer() {
  const { t } = useLanguage()
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="site-footer">
      <div className="section-wrap footer-main">
        <div className="footer-brand-col">
          <Link aria-label="Wildhaven — главная" className="brand footer-brand" to="/">
            <span className="brand-mark"><Leaf size={19} fill="currentColor" /></span>
            <span className="brand-wordmark">WILDHAVEN<span>· BISHKEK</span></span>
          </Link>
          <p>{t('footerText')}</p>
          <span className="footer-location"><MapPin size={15} /> {t('footerAddress')}</span>
        </div>
        <div className="footer-hours">
          <h3>{t('openingHours')}</h3>
          <p>{t('hoursValue')}</p>
          <Link to="/tours">{t('navTours')} <ArrowUpRight size={14} /></Link>
        </div>
        <div className="footer-newsletter">
          <h3>{t('newsletter')}</h3>
          <p>{t('newsletterPrompt')}</p>
          {subscribed ? (
            <p aria-live="polite" className="newsletter-success"><Sparkles size={15} /> {t('newsletterSuccess')}</p>
          ) : (
            <form className="newsletter-form" onSubmit={(event) => { event.preventDefault(); setSubscribed(true) }}>
              <input aria-label={t('emailPlaceholder')} placeholder={t('emailPlaceholder')} required type="email" />
              <button aria-label={t('subscribe')} title={t('subscribe')} type="submit"><ArrowUpRight size={18} /></button>
            </form>
          )}
        </div>
      </div>
      <div className="section-wrap footer-bottom"><span>© {new Date().getFullYear()} WILDHAVEN</span><span>{t('footerLegal')}</span><Link to="/">{t('backToTop')} ↑</Link></div>
    </footer>
  )
}
