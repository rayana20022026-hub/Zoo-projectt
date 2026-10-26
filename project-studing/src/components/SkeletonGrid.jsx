function SkeletonCard() {
  return (
    <article aria-hidden="true" className="tour-card skeleton-card animate-pulse">
      <div className="skeleton-topline">
        <span className="skeleton-block skeleton-number" />
        <span className="skeleton-block skeleton-icon" />
      </div>
      <div className="skeleton-block skeleton-image" />
      <div className="skeleton-block skeleton-title" />
      <div className="skeleton-block skeleton-copy skeleton-copy-long" />
      <div className="skeleton-block skeleton-copy" />
      <div className="skeleton-price-row">
        <span className="skeleton-block skeleton-price" />
        <span className="skeleton-block skeleton-caption" />
      </div>
      <div className="skeleton-block skeleton-button" />
    </article>
  )
}

export default function SkeletonGrid({ count = 3 }) {
  return (
    <div aria-label="Загружаем туры" className="tour-grid skeleton-grid" role="status">
      {Array.from({ length: count }, (_, index) => <SkeletonCard key={index} />)}
    </div>
  )
}
