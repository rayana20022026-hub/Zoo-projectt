export default function AdminTable({ children, label }) {
  return <section aria-label={label} className="admin-list-panel">{children}</section>
}
