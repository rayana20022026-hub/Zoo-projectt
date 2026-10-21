export default function FormField({ label, children, className = '' }) {
  return <label className={`admin-form-field ${className}`.trim()}>{label}{children}</label>
}
