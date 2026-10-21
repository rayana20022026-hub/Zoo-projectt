import { useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './contexts.js'
import { languages, translations } from '../data/zooData.js'

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('wildhaven-language')
    const normalizedLanguage = savedLanguage === 'ky' ? 'kg' : savedLanguage
    return languages.some(({ code }) => code === normalizedLanguage) && translations[normalizedLanguage]
      ? normalizedLanguage
      : 'ru'
  })

  useEffect(() => {
    document.documentElement.lang = { kg: 'ky-KG', ky: 'ky-KG', ru: 'ru-RU', en: 'en', tr: 'tr-TR', zh: 'zh-CN' }[language] ?? 'ru-RU'
  }, [language])

  function changeLanguage(nextLanguage) {
    const normalizedLanguage = nextLanguage === 'ky' ? 'kg' : nextLanguage
    if (!languages.some(({ code }) => code === normalizedLanguage) || !translations[normalizedLanguage]) return
    localStorage.setItem('wildhaven-language', normalizedLanguage)
    setLanguage(normalizedLanguage)
  }

  const value = useMemo(() => {
    const dictionary = translations[language] ?? translations.ru ?? {}
    return {
      language,
      setLanguage: changeLanguage,
      t: (key) => {
        if (typeof key !== 'string' || key.length === 0) return ''
        return dictionary[key] ?? translations.ru?.[key] ?? key
      },
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
