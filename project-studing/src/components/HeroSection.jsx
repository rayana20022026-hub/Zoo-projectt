import { motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HeroSection({ t }) {
  return (
    <section className="hero-section" id="home">
      <img alt="" className="hero-photo" fetchPriority="high" src="https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=2400&q=90" />
      <div className="hero-overlay" />
      <motion.div animate={{ opacity: 1, y: 0 }} className="hero-copy section-wrap" initial={{ opacity: 0, y: 26 }} transition={{ duration: 0.7, delay: 0.12 }}>
        <span className="hero-eyebrow"><span className="hero-eyebrow-dot" />{t('eyebrow')}</span>
        <h1>{t('heroLineOne')}<br /><em>{t('heroLineTwo')}</em></h1>
        <p>{t('heroText')}</p>
        <div className="hero-actions">
          <Link className="hero-primary-button" to="/animals">{t('navAnimals')} <ArrowDown size={17} /></Link>
          <Link className="hero-secondary-button" to="/tours">{t('navTours')} <ArrowUpRight size={16} /></Link>
          <span className="hero-open-note"><span className="open-indicator" />{t('heroNote')}</span>
        </div>
      </motion.div>
      <div className="hero-vertical-note"><span>42°52' N</span><span className="vertical-note-line" /><span>74°36' E</span></div>
      <div className="hero-image-caption"><span>01 / 06</span><span>AMUR TIGER · WILDHAVEN</span></div>
    </section>
  )
}
