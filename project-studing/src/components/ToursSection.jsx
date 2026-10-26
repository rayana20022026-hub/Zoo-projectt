import { useMemo, useState } from 'react'
import { Compass, Search, X } from 'lucide-react'
import { tours as starterTours } from '../data/zooData.js'
import useLanguage from '../context/useLanguage.js'
import SectionHeading from './SectionHeading.jsx'
import SkeletonGrid from './SkeletonGrid.jsx'
import TourCard from './TourCard.jsx'
import resolveLocalizedField from '../utils/resolveLocalizedField.js'

const tourFilters = [
  { id: 'all', labels: { ru: 'Все', en: 'All', tr: 'Tümü', zh: '全部', kg: 'Баары', kk: 'Барлығы' } },
  { id: 'family', labels: { ru: 'Семейные', en: 'Family', tr: 'Aile', zh: '家庭', kg: 'Үй-бүлөлүк', kk: 'Отбасылық' } },
  { id: 'vip', labels: { ru: 'VIP-тур', en: 'VIP tour', tr: 'VIP tur', zh: 'VIP 游览', kg: 'VIP тур', kk: 'VIP тур' } },
  { id: 'feeding', labels: { ru: 'С кормлением', en: 'Animal feeding', tr: 'Besleme', zh: '动物喂食', kg: 'Азыктандыруу', kk: 'Азықтандыру' } },
  { id: 'popular', labels: { ru: 'Популярные', en: 'Popular', tr: 'Popüler', zh: '热门', kg: 'Популярдуу', kk: 'Танымал' } },
]

function getTourName(tour, language, t) {
  const title = resolveLocalizedField(tour, 'title', language, '')
  if (title) return t(title)
  if (tour.titleKey) return t(tour.titleKey)
  return resolveLocalizedField(tour, 'name', language, tour.name ?? '')
}

function matchesFilter(tour, filter) {
  const includes = tour.includes ?? []
  const category = String(tour.categoryKey ?? tour.category ?? '').toLowerCase()
  if (filter === 'family') return includes.includes('familyWelcome') || category === 'family' || tour.id === 'junior-naturalist'
  if (filter === 'vip') return tour.isVip === true || category === 'vip' || tour.id === 'keeper'
  if (filter === 'feeding') return category === 'feeding' || includes.includes('feedingExperience') || tour.feedingExperience === true
  if (filter === 'popular') return category === 'popular' || tour.featured === true || tour.popular === true
  return true
}

export default function ToursSection({ isLoading = false, onBook, tours: visibleTours = starterTours }) {
  const { language, t } = useLanguage()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const filteredTours = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase(language)
    return visibleTours.filter((tour) => {
      const name = getTourName(tour, language, t).toLocaleLowerCase(language)
      return name.includes(normalizedSearch) && matchesFilter(tour, activeFilter)
    })
  }, [activeFilter, language, search, t, visibleTours])

  return (
    <section className="tours-section" id="tours">
      <div className="section-wrap tours-inner">
        <SectionHeading Icon={Compass} className="tours-heading" description={t('toursIntro')} eyebrow={t('tourEyebrow')} title={t('toursTitle')}>
          <div className="tours-tools">
            <label className="tour-search">
              <Search aria-hidden="true" size={16} />
              <span className="sr-only">Поиск туров</span>
              <input aria-label="Поиск туров по названию" onChange={(event) => setSearch(event.target.value)} placeholder="Найти тур…" value={search} />
              {search && <button aria-label="Очистить поиск" onClick={() => setSearch('')} type="button"><X size={14} /></button>}
            </label>
            <div aria-label="Фильтр туров по категории" className="tour-filter-list" role="group">
              {tourFilters.map((filter) => (
                <button aria-pressed={activeFilter === filter.id} className={`category-chip ${activeFilter === filter.id ? 'is-active' : ''}`} key={filter.id} onClick={() => setActiveFilter(filter.id)} type="button">
                  {filter.labels[language] ?? filter.labels.ru}
                </button>
              ))}
            </div>
            <div className="tour-heading-note"><span className="tour-note-dot" /> {t('smallGroups')}</div>
          </div>
        </SectionHeading>
        {isLoading
          ? <SkeletonGrid />
          : filteredTours.length === 0
            ? <div className="tour-no-results"><Search aria-hidden="true" size={22} /><strong>Туры не найдены</strong><span>Попробуйте изменить запрос или категорию.</span><button className="category-chip" onClick={() => { setSearch(''); setActiveFilter('all') }} type="button">Сбросить фильтры</button></div>
          : <div className="tour-grid">{filteredTours.map((tour, index) => <TourCard index={index} key={tour.id} language={language} onBook={onBook} t={t} tour={tour} />)}</div>}
        <p className="tour-note">{t('tourNote')}</p>
      </div>
    </section>
  )
}
