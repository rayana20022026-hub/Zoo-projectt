import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, Leaf, LogOut, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { languages } from '../data/zooData.js'
import useLanguage from '../context/useLanguage.js'
import ThemeToggle from './ThemeToggle.jsx'

export default function Header({ onBook, user, onLogin, onSignOut }) {
  const { language, setLanguage, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <motion.header
      animate={{ y: 0, opacity: 1 }}
      className="site-header"
      initial={{ y: -18, opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Link aria-label="Wildhaven — главная" className="brand" to="/">
        <span className="brand-mark"><Leaf size={19} fill="currentColor" /></span>
        <span className="brand-wordmark">WILDHAVEN<span>· BISHKEK</span></span>
      </Link>

      <nav aria-label={t('siteNav')} className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
        <NavLink end onClick={() => setMenuOpen(false)} to="/">{t('navHome')}</NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/animals">{t('navAnimals')}</NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/tours">{t('navTours')}</NavLink>
        <NavLink onClick={() => setMenuOpen(false)} to="/about">{t('navAbout')}</NavLink>
      </nav>

      <div className="header-actions">
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? t('close') : t('openMenu')}
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <label className="language-picker">
          <span className="sr-only">{t('languageLabel')}</span>
          <select aria-label={t('languageLabel')} onChange={(event) => setLanguage(event.target.value)} value={language}>
            {languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
          </select>
          <ArrowDown aria-hidden="true" size={12} />
        </label>
        <ThemeToggle />
        {user ? (
          <div className="header-account">
            <span className="header-user-name">{user.displayName || user.email?.split('@')[0]}</span>
            <button aria-label={t('authLogout')} className="header-logout-button" onClick={onSignOut} title={t('authLogout')} type="button"><LogOut size={15} /></button>
          </div>
        ) : (
          <button className="header-login-button" onClick={onLogin} type="button">{t('authLogin')}</button>
        )}
        <button className="header-book-button" onClick={() => onBook()} type="button">
          {t('book')}
        </button>
      </div>
    </motion.header>
  )
}
