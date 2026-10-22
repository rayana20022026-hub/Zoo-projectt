import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import SiteLayout from './components/SiteLayout.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const Admin = lazy(() => import('./pages/Admin.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const AnimalsPage = lazy(() => import('./pages/AnimalsPage.jsx'))
const ToursPage = lazy(() => import('./pages/ToursPage.jsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<main className="route-loading" role="status">Загружаем страницу…</main>}>
        <Routes>
          <Route
            element={(
              <ThemeProvider>
                <LanguageProvider>
                  <SiteLayout />
                </LanguageProvider>
              </ThemeProvider>
            )}
          >
            <Route element={<Home />} path="/" />
            <Route element={<AnimalsPage />} path="/animals" />
            <Route element={<ToursPage />} path="/tours" />
            <Route element={<AboutPage />} path="/about" />
          </Route>
          <Route element={<LanguageProvider><ErrorBoundary><Admin /></ErrorBoundary></LanguageProvider>} path="/admin" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
