import { Search } from 'lucide-react'

const categories = ['allCategories', 'predators', 'mammals', 'birds', 'reptiles', 'rare']

export default function AnimalFilters({ category, onCategoryChange, onQueryChange, query, t }) {
  return (
    <div className="animals-tools">
      <label className="animal-search">
        <Search size={16} />
        <span className="sr-only">{t('search')}</span>
        <input onChange={(event) => onQueryChange(event.target.value)} placeholder={t('search')} value={query} />
      </label>
      <div aria-label={t('animalCategories')} className="category-list" role="group">
        {categories.map((key) => (
          <button
            aria-pressed={category === key}
            className={`category-chip ${category === key ? 'is-active' : ''}`}
            key={key}
            onClick={() => onCategoryChange(key)}
            type="button"
          >
            {t(key)}
          </button>
        ))}
      </div>
    </div>
  )
}
