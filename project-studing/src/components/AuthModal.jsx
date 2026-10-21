import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, LockKeyhole, X } from 'lucide-react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import useLanguage from '../context/useLanguage.js'
import { auth } from '../firebase.js'

function getAuthErrorMessage(error, t) {
  const errorMessages = {
    'auth/email-already-in-use': 'authEmailInUse',
    'auth/invalid-email': 'authInvalidEmail',
    'auth/weak-password': 'authWeakPassword',
    'auth/invalid-credential': 'authInvalidCredentials',
    'auth/user-not-found': 'authInvalidCredentials',
    'auth/wrong-password': 'authInvalidCredentials',
    'auth/too-many-requests': 'authTooManyRequests',
  }

  return t(errorMessages[error.code] ?? 'authGenericError')
}

export default function AuthModal({ onClose, onAuthenticated }) {
  const { t } = useLanguage()
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function authenticate(event, register = false) {
    event.preventDefault()
    setErrorMessage('')
    if (register && !/^\+996\d{9}$/.test(phone)) {
      setErrorMessage('Введите номер в формате +996 и 9 цифр.')
      return
    }
    setSubmitting(true)

    try {
      const normalizedEmail = email.trim()
      if (register) {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
        await updateProfile(credential.user, { displayName: displayName.trim() })
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password)
      }
      onAuthenticated()
    } catch (error) {
      console.error('Could not authenticate the booking customer.', error)
      setErrorMessage(getAuthErrorMessage(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="modal-backdrop auth-backdrop"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        animate={{ opacity: 1, y: 0, scale: 1 }}
        aria-labelledby="auth-title"
        aria-modal="true"
        className="auth-dialog"
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ duration: 0.24 }}
      >
        <button aria-label={t('close')} className="auth-close" onClick={onClose} type="button"><X size={19} /></button>
        <span className="auth-brand-mark"><Leaf fill="currentColor" size={20} /></span>
        <span className="auth-eyebrow"><LockKeyhole size={13} /> {t('authEyebrow')}</span>
        <h2 id="auth-title">{t('authTitle')}</h2>
        <p className="auth-intro">{t('authIntro')}</p>

        <form className="auth-form" onSubmit={(event) => authenticate(event, isRegistering)}>
          {isRegistering && (
            <label>
              <span>{t('fullName')}</span>
              <input
                autoComplete="name"
                autoFocus
                disabled={submitting}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                type="text"
                value={displayName}
              />
            </label>
          )}
          {isRegistering && (
            <label>
              <span>Телефон</span>
              <input
                autoComplete="off"
                disabled={submitting}
                inputMode="tel"
                maxLength={13}
                onChange={(event) => setPhone(event.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, ''))}
                pattern="\+996[0-9]{9}"
                placeholder="+996555123456"
                required
                type="tel"
                value={phone}
              />
            </label>
          )}
          <label>
            <span>{t('authEmail')}</span>
            <input
              autoComplete="off"
              autoFocus={!isRegistering}
              disabled={submitting}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>{t('authPassword')}</span>
            <input
              autoComplete="new-password"
              disabled={submitting}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
          <button className="auth-login-button" disabled={submitting} type="submit">
            {submitting ? t('authWorking') : isRegistering ? t('authRegister') : t('authLogin')}
          </button>
          <button className="auth-register-button" disabled={submitting} onClick={() => setIsRegistering((registering) => !registering)} type="button">
            {isRegistering ? t('authHaveAccount') : t('authNoAccount')}
          </button>
        </form>
      </motion.section>
    </motion.div>
  )
}
