export default function GuideCard({ guide, t }) {
  return (
    <article className="guide-card">
      <img alt={t(guide.nameKey)} loading="lazy" src={guide.image} />
      <div className="guide-card-copy">
        <h3>{t(guide.nameKey)}</h3>
        <p>{t(guide.expertiseKey)}</p>
      </div>
    </article>
  )
}
