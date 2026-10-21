import { motion } from 'framer-motion'
import { ArrowDownRight } from 'lucide-react'
import resolveLocalizedField from '../utils/resolveLocalizedField.js'

function getAnimalName(animal, language) {
  return resolveLocalizedField(animal, 'name', language, animal.nameKey ?? 'Без названия')
}

export default function AnimalCard({ animal, index, language = 'ru', onSelect, t }) {
  const category = animal.categoryKey ?? animal.category
  return (
    <motion.button
      animate={{ opacity: 1, y: 0 }}
      className={`animal-card animal-card-${index + 1}`}
      exit={{ opacity: 0, scale: 0.96 }}
      initial={{ opacity: 0, y: 20 }}
      layout
      onClick={() => onSelect(animal)}
      transition={{ duration: 0.3, delay: Math.min(index * 0.045, 0.2) }}
      type="button"
      whileHover={{ y: -8, rotateX: 2, rotateY: -1, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.985 }}
    >
      <span className="animal-image-wrap">
        <img alt={t(getAnimalName(animal, language))} loading="lazy" src={animal.image} />
        <span className="animal-card-shade" />
        <span className="animal-category-label">{t(category)}</span>
        <span className="animal-card-arrow"><ArrowDownRight size={18} /></span>
      </span>
      <span className="animal-card-copy">
        <span className="animal-card-kicker">{t(animal.tagKey ?? category)}</span>
        <span className="animal-card-name">{t(getAnimalName(animal, language))}</span>
      </span>
    </motion.button>
  )
}
