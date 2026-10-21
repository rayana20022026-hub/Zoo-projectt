import { Compass } from 'lucide-react'
import { tours as starterTours } from '../data/zooData.js'
import useLanguage from '../context/useLanguage.js'
import EmptyState from './EmptyState.jsx'
import LoadingState from './LoadingState.jsx'
import SectionHeading from './SectionHeading.jsx'
import TourCard from './TourCard.jsx'

export default function ToursSection({ isLoading = false, onBook, tours: visibleTours = starterTours }) {
  const { language, t } = useLanguage()

  return (
    <section className="tours-section" id="tours">
      <div className="section-wrap tours-inner">
        <SectionHeading Icon={Compass} className="tours-heading" description={t('toursIntro')} eyebrow={t('tourEyebrow')} title={t('toursTitle')}>
          <div className="tour-heading-note"><span className="tour-note-dot" /> {t('smallGroups')}</div>
        </SectionHeading>
        {isLoading
          ? <LoadingState>Загружаем туры…</LoadingState>
          : visibleTours.length === 0
            ? <EmptyState>Пока нет доступных туров.</EmptyState>
          : <div className="tour-grid">{visibleTours.map((tour, index) => <TourCard index={index} key={tour.id} language={language} onBook={onBook} t={t} tour={tour} />)}</div>}
        <p className="tour-note">{t('tourNote')}</p>
      </div>
    </section>
  )
}
