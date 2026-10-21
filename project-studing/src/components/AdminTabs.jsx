export default function AdminTabs({ collections, selected, onSelect }) {
  return (
    <div aria-label="Тип контента" className="admin-tabs" role="tablist">
      {collections.map((content) => (
        <button
          aria-selected={selected === content.id}
          className={selected === content.id ? 'is-active' : ''}
          key={content.id}
          onClick={() => onSelect(content.id)}
          role="tab"
          type="button"
        >
          {content.label}
        </button>
      ))}
    </div>
  )
}
