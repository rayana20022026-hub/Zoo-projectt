import FormField from './FormField.jsx'

export default function TextField({ label, className = '', ...props }) {
  return (
    <FormField className={className} label={label}>
      <input {...props} />
    </FormField>
  )
}
