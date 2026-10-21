import { AnimatePresence, motion } from 'framer-motion'
import { Clock3, MapPin, X } from 'lucide-react'
import resolveLocalizedField from '../utils/resolveLocalizedField.js'

// Возвращает отображаемое имя животного.
// Приоритет: прямая строка name (Firestore) → ключ перевода nameKey → заглушка.
function getAnimalName(animal, language) {
  return resolveLocalizedField(animal, 'name', language, animal.nameKey ?? 'Без названия')
}

// Возвращает готовый текст или переводит ключ через t().
// Если значение уже является прямой строкой (из Firestore), возвращаем её без перевода.
function resolveField(value, t) {
  if (!value) return null
  // Если строка длиннее 30 символов — это, скорее всего, готовый текст из Firestore,
  // а не ключ перевода. Короткие строки прогоняем через t() на случай, если это ключ.
  if (typeof value === 'string' && value.length > 30) return value
  return t(value)
}

export default function AnimalDialog({ animal, language = 'ru', onClose, t }) {
  return (
    <AnimatePresence>
      {animal && (
        <motion.div
          animate={{ opacity: 1 }}
          className="modal-backdrop"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            animate={{ opacity: 1, y: 0, scale: 1 }}
            aria-labelledby="animal-dialog-title"
            aria-modal="true"
            className="animal-dialog"
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            transition={{ duration: 0.24 }}
          >
            {/* Изображение */}
            <div className="animal-dialog-image">
              <img alt={t(getAnimalName(animal, language))} src={animal.image} />
              <button
                aria-label={t('close')}
                className="dialog-close"
                onClick={onClose}
                type="button"
              >
                <X size={19} />
              </button>
            </div>

            <div className="animal-dialog-copy">
              {/* Тег / категория */}
              <span className="animal-card-kicker">
                {t(animal.tagKey ?? animal.categoryKey ?? animal.category)}
              </span>

              {/* Название */}
              <h2 id="animal-dialog-title">{t(getAnimalName(animal, language))}</h2>

              {/* Подзаголовок (subtitle) — прямая строка из Firestore */}
              {animal.subtitle && (
                <p className="animal-dialog-subtitle">{animal.subtitle}</p>
              )}

              {/* Описание: прямая строка description (Firestore) или ключ factKey */}
              <p>{resolveLocalizedField(animal, 'description', language, animal.factKey) ? resolveField(resolveLocalizedField(animal, 'description', language, animal.factKey), t) : null}</p>

              {/* Среда обитания: прямая строка habitat (Firestore) или ключ habitatKey */}
              {(animal.habitat ?? animal.habitatKey) && (
                <div className="animal-fact-row">
                  <MapPin size={17} />
                  <span>
                    <small>{t('habitat')}</small>
                    {resolveField(animal.habitat ?? animal.habitatKey, t)}
                  </span>
                </div>
              )}

              {/* Время кормления: прямая строка feedingTime (Firestore) или ключ feedingKey */}
              {(animal.feedingTime ?? animal.feedingKey) && (
                <div className="animal-fact-row">
                  <Clock3 size={17} />
                  <span>
                    <small>{t('feeding')}</small>
                    {resolveField(animal.feedingTime ?? animal.feedingKey, t)}
                  </span>
                </div>
              )}

              {/* Примечание о кормлении */}
              {(animal.feedingTime ?? animal.feedingKey) && (
                <p className="feeding-note">{t('feedingNote')}</p>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
