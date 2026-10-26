import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { tours } from '../data/zooData.js'
import { db } from '../firebase.js'
import ToursSection from '../components/ToursSection.jsx'
import ErrorNotice from '../components/ErrorNotice.jsx'

export default function ToursPage() {
  const [liveTours, setLiveTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadTours() {
      try {
        const snapshot = await getDocs(collection(db, 'tours'))
        if (!isMounted) return
        const firestoreTours = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))
        setLiveTours(firestoreTours.length ? firestoreTours : tours)
      } catch (loadError) {
        if (!isMounted) return
        console.error('Could not load tours from Firestore.', loadError)
        setError(loadError)
        setLiveTours(tours)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTours()
    return () => { isMounted = false }
  }, [])

  return (
    <main className="standalone-page standalone-tours">
      {error && <ErrorNotice>Не удалось загрузить данные из Firestore. Показаны стандартные туры; проверьте базу и импортируйте данные через /admin.</ErrorNotice>}
      <ToursSection isLoading={loading} tours={liveTours} onBook={(tour) => window.dispatchEvent(new CustomEvent('wildhaven:book-tour', { detail: tour }))} />
    </main>
  )
}
