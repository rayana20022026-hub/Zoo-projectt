export default function BenefitsGrid({ t }) {
  const benefits = [
    ['homeFeatureSpecies', 'homeFeatureSpeciesText'],
    ['homeFeatureFamily', 'homeFeatureFamilyText'],
    ['homeFeatureCare', 'homeFeatureCareText'],
  ]

  return (
    <div aria-label={t('homeBenefitsTitle')} className="home-benefits">
      {benefits.map(([title, description], index) => (
        <article className="home-benefit-card" key={title}>
          <span className="home-benefit-number">0{index + 1}</span>
          <h3>{t(title)}</h3>
          <p>{t(description)}</p>
        </article>
      ))}
    </div>
  )
}
