const COUNTRIES = [
  ['+996', 'Кыргызстан'], ['+7', 'Казахстан'], ['+7', 'Россия'], ['+998', 'Узбекистан'], ['+90', 'Турция'],
  ['+1', 'США / Канада'], ['+44', 'Великобритания'], ['+49', 'Германия'], ['+86', 'Китай'], ['+91', 'Индия'],
]

export default function PhoneInput({ value, onChange, disabled = false, name = 'phone' }) {
  const selectedCode = COUNTRIES.find(([code]) => value.startsWith(code))?.[0] ?? '+996'
  const localNumber = value.startsWith(selectedCode) ? value.slice(selectedCode.length) : value.replace(/^\+/, '')
  function setCode(code) { onChange(`${code}${localNumber}`) }
  return <span className="phone-input-group">
    <select aria-label="Код страны" disabled={disabled} value={selectedCode} onChange={(event) => setCode(event.target.value)}>{COUNTRIES.map(([code, country], index) => <option key={`${code}-${country}`} value={code}>{country} {code}</option>)}</select>
    <input autoComplete="tel-national" disabled={disabled} inputMode="tel" maxLength={12} name={name} onChange={(event) => onChange(`${selectedCode}${event.target.value.replace(/\D/g, '')}`)} placeholder="555123456" required type="tel" value={localNumber} />
  </span>
}
