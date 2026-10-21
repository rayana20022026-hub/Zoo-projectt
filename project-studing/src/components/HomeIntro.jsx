import { motion } from 'framer-motion'
import { ArrowRight, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomeIntro({ t }) {
  return (
    <motion.div className="home-intro-copy" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.45 }}>
      <span className="section-eyebrow"><Leaf size={14} /> {t('aboutEyebrow')}</span>
      <h2>{t('homeIntroTitle')}</h2>
      <p>{t('homeIntroText')}</p>
      <Link className="text-link" to="/about">{t('navAbout')} <ArrowRight size={16} /></Link>
    </motion.div>
  )
}
