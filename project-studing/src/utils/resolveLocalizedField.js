export default function resolveLocalizedField(record, field, language, fallback = '') {
  const localized = record?.[`${field}Translations`] ?? record?.[field]
  if (localized && typeof localized === 'object') {
    return localized[language] || localized.ru || fallback
  }

  const languageField = record?.[`${field}_${language}`]
  const russianField = record?.[`${field}_ru`]
  return languageField || russianField || localized || fallback
}
