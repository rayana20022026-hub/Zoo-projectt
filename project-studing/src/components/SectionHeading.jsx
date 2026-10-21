export default function SectionHeading({ Icon, eyebrow, title, description, className = '', children }) {
  return (
    <div className={`section-heading ${className}`.trim()}>
      <div>
        <span className="section-eyebrow">{Icon && <Icon size={14} />} {eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </div>
  )
}
