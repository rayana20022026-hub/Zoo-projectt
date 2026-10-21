import { AtSign, Clock3, MapPin, Phone, Users } from 'lucide-react'
import useLanguage from '../context/useLanguage.js'
import GuideCard from '../components/GuideCard.jsx'

const guides = [
  {
    nameKey: 'guideAidaName',
    expertiseKey: 'guideAidaExpertise',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=720&q=85',
  },
  {
    nameKey: 'guideTimurName',
    expertiseKey: 'guideTimurExpertise',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=720&q=85',
  },
  {
    nameKey: 'guideAlinaName',
    expertiseKey: 'guideAlinaExpertise',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=720&q=85',
  },
]

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <main className="standalone-page about-page">
      <section className="about-profile section-wrap">
        <div className="about-profile-intro">
          <span className="section-eyebrow"><Users size={14} /> {t('aboutEyebrow')}</span>
          <h1>{t('aboutTitle')}</h1>
          <p>{t('aboutText')}</p>
        </div>
        <div className="about-contact-grid">
          <article className="about-info-card">
            <AtSign size={20} />
            <h2>{t('instagramLabel')}</h2>
            <a href="https://www.instagram.com/wildhaven.bishkek/" rel="noreferrer" target="_blank">@wildhaven.bishkek</a>
          </article>
          <article className="about-info-card">
            <Phone size={20} />
            <h2>{t('phone')}</h2>
            <a href="tel:+996555123456">+996 555 123 456</a>
          </article>
          <article className="about-info-card">
            <MapPin size={20} />
            <h2>{t('addressLabel')}</h2>
            <p>{t('footerAddress')}</p>
          </article>
          <article className="about-info-card">
            <Clock3 size={20} />
            <h2>{t('openingHours')}</h2>
            <p>{t('hoursValue')}</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="guides-title" className="guides-section section-wrap">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow"><Users size={14} /> {t('teamEyebrow')}</span>
            <h2 id="guides-title">{t('guidesTitle')}</h2>
            <p>{t('guidesIntro')}</p>
          </div>
        </div>
        <div className="guide-grid">
          {guides.map((guide) => (
            <GuideCard guide={guide} key={guide.nameKey} t={t} />
          ))}
        </div>
      </section>
    </main>
  )
}
