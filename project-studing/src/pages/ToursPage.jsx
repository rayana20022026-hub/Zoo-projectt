import { tours } from '../data/zooData.js'
import useFirestoreCollection from '../hooks/useFirestoreCollection.js'
import ToursSection from '../components/ToursSection.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'

export default function ToursPage() {
  const { documents: liveTours, error, loading } = useFirestoreCollection('tours', tours, true)

  return (
    <main className="standalone-page standalone-tours">
      {error && <ErrorNotice>Не удалось загрузить данные из Firestore. Показаны стандартные туры; проверьте базу и импортируйте данные через /admin.</ErrorNotice>}
      <ToursSection isLoading={loading && liveTours.length === 0} tours={liveTours} onBook={(tour) => window.dispatchEvent(new CustomEvent('wildhaven:book-tour', { detail: tour }))} />
    </main>
  )
}
