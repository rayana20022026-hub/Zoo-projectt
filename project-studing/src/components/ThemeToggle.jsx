import { Moon, Sun } from 'lucide-react'
import useLanguage from '../context/useLanguage.js'
import useTheme from '../context/useTheme.js'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()
  return (
    <button aria-label={t('themeSwitch')} className="theme-toggle" onClick={toggleTheme} title={t('themeSwitch')} type="button">
      {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}
