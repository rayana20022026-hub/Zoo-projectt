import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Outlet } from 'react-router-dom'
import { tours } from '../data/zooData.js'
import { auth } from '../firebase.js'
import useFirestoreCollection from '../hooks/useFirestoreCollection.js'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import AuthModal from './AuthModal.jsx'
import BookingModal from './BookingModal.jsx'
import MyTicketsModal from './MyTicketsModal.jsx'
import '../pages/Home.css'

export default function SiteLayout() {
  const { documents: liveTours } = useFirestoreCollection('tours', tours, true)
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
      <AnimatePresence>
        {selectedTour && <BookingModal onClose={() => setSelectedTour(null)} onTourChange={setSelectedTour} tours={liveTours} tour={selectedTour} />}
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
