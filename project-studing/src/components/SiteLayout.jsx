import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Outlet, useNavigate } from 'react-router-dom'
import { animals, reviews, tours, translations } from '../data/zooData.js'
import { auth } from '../firebase.js'
import useFirestoreCollection from '../hooks/useFirestoreCollection.js'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import AuthModal from './AuthModal.jsx'
import BookingModal from './BookingModal.jsx'
import MyTicketsModal from './MyTicketsModal.jsx'
import LionMascot from './LionMascot.jsx'
import '../pages/Home.css'

export default function SiteLayout() {
  const navigate = useNavigate()
  const { documents: liveTours } = useFirestoreCollection('tours', tours, true)
  const { documents: liveAnimals } = useFirestoreCollection('animals', animals, true)
  const siteData = {
    animals: liveAnimals.map((animal) => ({
      ...animal,
      names: { ru: translations.ru[animal.nameKey] ?? animal.name?.ru ?? animal.name, ky: translations.ky[animal.nameKey] ?? animal.name?.ky ?? animal.name },
      zoneNumber: animal.zoneNumber ?? animal.zone ?? ({ predators: '01', rare: '03', birds: '06', reptiles: '03' }[animal.categoryKey ?? animal.category]),
      aliases: animal.id === 'lion' ? ['арыстан', 'арстан', 'лев', 'львы'] : animal.id === 'tiger' ? ['жолборс', 'тигр', 'тигры'] : animal.id === 'panda' ? ['кызыл панда', 'красная панда', 'малая панда', 'панда'] : [],
    })),
    assistantAnimals: ['lion', 'wolf', 'panda'].map((id) => liveAnimals.find((animal) => animal.id === id) ?? animals.find((animal) => animal.id === id)).filter(Boolean).map((animal) => ({
      ...animal,
      names: { ru: translations.ru[animal.nameKey] ?? animal.name?.ru ?? animal.name, ky: translations.ky[animal.nameKey] ?? animal.name?.ky ?? animal.name },
      zoneNumber: animal.zoneNumber ?? animal.zone ?? ({ predators: '01', rare: '03', birds: '06' }[animal.categoryKey ?? animal.category]),
      aliases: animal.id === 'lion' ? ['арыстан', 'арстан', 'лев', 'львы'] : animal.id === 'wolf' ? ['серый волк', 'бөрү', 'карышкыр'] : animal.id === 'panda' ? ['кызыл панда', 'красная панда', 'малая панда', 'панда'] : [],
    })),
    unavailableAnimals: [
      { names: { ru: 'оленя', ky: 'бугу' }, aliases: ['олень', 'оленя', 'бугу', 'deer'] },
      { names: { ru: 'жирафа', ky: 'жираф' }, aliases: ['жираф', 'жирафа', 'жирафы', 'giraffe'] },
      { names: { ru: 'слона', ky: 'пил' }, aliases: ['слон', 'слона', 'слоны', 'пил', 'пилдер', 'elephant'] },
    ],
    tours: liveTours.map((tour) => ({
      ...tour,
      title: { ru: translations.ru[tour.titleKey] ?? tour.title?.ru ?? tour.name, ky: translations.ky[tour.titleKey] ?? tour.title?.ky ?? tour.name },
      description: { ru: translations.ru[tour.descriptionKey] ?? tour.description?.ru ?? tour.description, ky: translations.ky[tour.descriptionKey] ?? tour.description?.ky ?? tour.description },
      days: { ru: translations.ru[tour.daysKey] ?? tour.days?.ru ?? tour.days, ky: translations.ky[tour.daysKey] ?? tour.days?.ky ?? tour.days },
    })),
    assistantTours: [
      { id: 'family', title: { ru: 'Семейная экспедиция', ky: 'Үй-бүлөлүк тур' }, aliases: ['family', 'семейная экспедиция', 'семейный тур', 'үй-бүлөлүк тур'], price: 1500, description: { ru: 'Детские задания, близкое знакомство с животными.', ky: 'Балдар үчүн тапшырмалар, жаныбарлар менен жакындан таанышуу.' }, days: { ru: 'Суббота и воскресенье, 11:00', ky: 'Ишемби жана жекшемби, саат 11:00' }, includesAdmission: true },
      { id: 'overview', title: { ru: 'Обзорный тур', ky: 'Обзордук тур' }, aliases: ['обзорный тур', 'обзорная экскурсия', 'обзордук тур'], price: 1000 },
      { id: 'behind-scenes', title: { ru: 'Закулисье зоопарка', ky: 'Зоопарктын көшөгө артындагы сыры' }, aliases: ['закулисье', 'закулисье зоопарка', 'закулисье туру', 'көшөгө артындагы сыр'], price: 1200, durationMinutes: 120, days: { ru: 'Вторник, четверг и суббота, 14:00', ky: 'Шейшемби, бейшемби жана ишемби, саат 14:00' } },
      { id: 'predator-feeding', title: { ru: 'Утреннее кормление хищников', ky: 'Жырткычтарды эртең менен азыктандыруу' }, aliases: ['утреннее кормление', 'кормление хищников', 'эртең менен азыктандыруу'], price: 1000, durationMinutes: 90, days: { ru: 'Среда, пятница и воскресенье, 10:00', ky: 'Шаршемби, жума жана жекшемби, саат 10:00' } },
    ],
    reviews,
    translations,
    openingHours: { ru: 'ежедневно с 09:00 до 19:00', ky: 'күн сайын 09:00дөн 19:00гө чейин' },
    zones: [
      { number: '01', names: { ru: 'Хищники', ky: 'Жырткычтар' }, aliases: ['арстандар', 'львы', 'хищники'] },
      { number: '02', names: { ru: 'Кафе Wild Cafe: горячие блюда, напитки и десерты', ky: 'Wild Cafe: ысык тамактар, суусундуктар жана десерттер' }, aliases: ['wild cafe', 'кафе', 'кофейня', 'кафетерий', 'тамактануучу жай', 'еда', 'тамак'] },
      { number: '03', names: { ru: 'Экзотические животные, красная (малая) панда', ky: 'Экзотикалык жаныбарлар, кызыл панда' }, aliases: ['экзотические животные', 'красная панда', 'малая панда', 'кызыл панда'] },
      { number: '04', names: { ru: 'Фаст-фуд и напитки', ky: 'Фастфуд жана суусундуктар' }, aliases: ['фаст-фуд', 'фастфуд', 'напитки', 'суусундук'] },
      { number: '05', names: { ru: 'Места для пикника', ky: 'Пикник жайлары' }, aliases: ['пикник'] },
      { number: '06', names: { ru: 'Птицы', ky: 'Канаттуулар' }, aliases: ['птицы', 'канаттуулар'] },
    ],
    facilities: {
      parking: { ru: 'Автомобильная парковка у входа в парк', ky: 'Унаа токтотуучу жай парктын кире беришинде' },
      toilets: { ru: 'Туалеты (WC) возле зон 01, 03 и 06', ky: 'Дааратканалар (WC) 01, 03 жана 06-зоналардын жанында', aliases: ['туалет', 'туалеты', 'wc', 'санузел', 'даарат', 'ажаткана'] },
      shop: { ru: 'Сувенирный магазин у главного входа', ky: 'Белек дүкөнү башкы кире бериштин жанында' },
    },
    feedings: [
      { animals: ['арстан', 'арыстан', 'лев', 'львы', 'тигр', 'тигры', 'жолборс'], names: { ru: 'львов и тигров', ky: 'арстандарды жана жолборсторду' }, days: { ru: 'среда, пятница и воскресенье', ky: 'шаршемби, жума жана жекшемби' }, time: '10:00', tourPrice: 1000 },
    ],
    rules: [],
    contacts: { address: { ru: 'Бишкек, Кыргызская Республика', ky: 'Бишкек, Кыргыз Республикасы' } },
  }
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [selectedTour, setSelectedTour] = useState(null)
  const [ticketsOpen, setTicketsOpen] = useState(false)
  const pendingTourRef = useRef(null)
  const defaultTour = liveTours.find((tour) => tour.featured) ?? liveTours[0]

  useEffect(() => onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser)
    setAuthLoading(false)
    if (currentUser && pendingTourRef.current) {
      setSelectedTour(pendingTourRef.current)
      pendingTourRef.current = null
      setAuthModalOpen(false)
    } else if (!currentUser && pendingTourRef.current) {
      setAuthModalOpen(true)
    }
  }), [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'resetPassword' && params.has('oobCode')) setAuthModalOpen(true)
  }, [])

  const openBooking = useCallback((tour = defaultTour) => {
    if (!tour) return
    if (authLoading) {
      pendingTourRef.current = tour
    } else if (user) {
      setSelectedTour(tour)
    } else {
      pendingTourRef.current = tour
      setAuthModalOpen(true)
    }
  }, [authLoading, defaultTour, user])

  useEffect(() => {
    function handleBookingRequest(event) {
      openBooking(event.detail)
    }
    window.addEventListener('wildhaven:book-tour', handleBookingRequest)
    return () => window.removeEventListener('wildhaven:book-tour', handleBookingRequest)
  }, [openBooking])

  function continueAfterAuthentication() {
    if (pendingTourRef.current) {
      setSelectedTour(pendingTourRef.current)
      pendingTourRef.current = null
    }
    setAuthModalOpen(false)
  }

  async function logOut() {
    setAuthModalOpen(false)
    setSelectedTour(null)
    pendingTourRef.current = null
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Could not sign out the visitor.', error)
    }
  }

  return (
    <div className="zoo-app">
      <Header onBook={openBooking} onLogin={() => setAuthModalOpen(true)} onSignOut={logOut} onMyTickets={() => setTicketsOpen(true)} user={user} />
      <Outlet />
      <Footer />
      <LionMascot siteData={siteData} />
      <AnimatePresence>
        {selectedTour && <BookingModal onClose={() => setSelectedTour(null)} onPaymentComplete={() => { setSelectedTour(null); navigate('/'); setTicketsOpen(true) }} onTourChange={setSelectedTour} tours={liveTours} tour={selectedTour} />}
        {authModalOpen && (
          <AuthModal
            key="visitor-auth"
            onClose={() => { setAuthModalOpen(false); pendingTourRef.current = null }}
            onAuthenticated={continueAfterAuthentication}
          />
        )}
        {ticketsOpen && user && <MyTicketsModal onClose={() => setTicketsOpen(false)} user={user} />}
      </AnimatePresence>
    </div>
  )
}
