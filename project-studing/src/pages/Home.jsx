import useLanguage from '../context/useLanguage.js'
import BenefitsGrid from '../components/BenefitsGrid.jsx'
import HeroSection from '../components/HeroSection.jsx'
import HomeIntro from '../components/HomeIntro.jsx'
import QuickLinks from '../components/QuickLinks.jsx'
import ReviewsSection from '../components/ReviewsSection.jsx'

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="home-page">
      <HeroSection t={t} />
      <section className="home-intro section-wrap">
        <HomeIntro t={t} />
        <BenefitsGrid t={t} />
      </section>
      <QuickLinks t={t} />
      <ReviewsSection />
    </main>
  )
}
