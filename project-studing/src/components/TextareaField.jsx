import FormField from './FormField.jsx'

export default function TextareaField({ label, className = '', ...props }) {
  return (
    <FormField className={className} label={label}>
      <textarea {...props} />
    </FormField>
  )
}
