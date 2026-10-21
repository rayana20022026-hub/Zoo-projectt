import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import useLanguage from '../context/useLanguage.js'
import useFirestoreCollection from '../hooks/useFirestoreCollection.js'
import AnimalCard from './AnimalCard.jsx'
import AnimalDialog from './AnimalDialog.jsx'
import AnimalFilters from './AnimalFilters.jsx'
import EmptyState from './EmptyState.jsx'
import ErrorNotice from './ErrorNotice.jsx'
import LoadingState from './LoadingState.jsx'
import SectionHeading from './SectionHeading.jsx'
import resolveLocalizedField from '../utils/resolveLocalizedField.js'

const NO_ANIMALS = []

function getAnimalName(animal, language) {
  return resolveLocalizedField(animal, 'name', language, animal.nameKey ?? 'Без названия')
}

export default function AnimalsSection() {
  const { language, t } = useLanguage()
  const { documents: liveAnimals, error, loading } = useFirestoreCollection('animals', NO_ANIMALS)
  const [category, setCategory] = useState('allCategories')
  const [query, setQuery] = useState('')
  const [activeAnimal, setActiveAnimal] = useState(null)
  const visibleAnimals = useMemo(() => liveAnimals.filter((animal) => {
    const animalCategory = animal.categoryKey ?? animal.category
    const matchesCategory = category === 'allCategories' || animalCategory === category
    return matchesCategory && t(getAnimalName(animal, language)).toLocaleLowerCase(language).includes(query.toLocaleLowerCase(language))
  }), [category, language, liveAnimals, query, t])

  return (
    <section className="animals-section section-wrap" id="animals">
      <SectionHeading Icon={Sparkles} className="animals-heading" description={t('animalsIntro')} eyebrow={t('animalsEyebrow')} title={t('animalsTitle')}>
        <AnimalFilters category={category} onCategoryChange={setCategory} onQueryChange={setQuery} query={query} t={t} />
      </SectionHeading>

      {error && <ErrorNotice>Не удалось загрузить животных из Firestore.</ErrorNotice>}
      {loading && <LoadingState>Загрузка...</LoadingState>}
      <motion.div className="animal-grid" layout>
        <AnimatePresence mode="popLayout">
          {visibleAnimals.map((animal, index) => (
            <AnimalCard animal={animal} index={index} key={animal.id} language={language} onSelect={setActiveAnimal} t={t} />
          ))}
        </AnimatePresence>
        {!loading && !error && liveAnimals.length === 0 && <EmptyState>Животные пока не добавлены</EmptyState>}
        {!loading && liveAnimals.length > 0 && visibleAnimals.length === 0 && <EmptyState>{t('noAnimals')}</EmptyState>}
      </motion.div>
      <AnimalDialog animal={activeAnimal} language={language} onClose={() => setActiveAnimal(null)} t={t} />
    </section>
  )
}

