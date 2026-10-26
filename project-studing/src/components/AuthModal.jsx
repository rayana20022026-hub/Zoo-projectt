import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, LockKeyhole, X } from 'lucide-react'
import { confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile, verifyPasswordResetCode } from 'firebase/auth'
import { doc, getDoc, increment, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import useLanguage from '../context/useLanguage.js'
import { auth, db } from '../firebase.js'
import PhoneInput from './PhoneInput.jsx'

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

function getPasswordResetErrorMessage(error, t) {
  const messages = {
    'auth/operation-not-allowed': 'Сброс пароля отключён в настройках Firebase Authentication.',
    'auth/network-request-failed': 'Не удалось связаться с Firebase. Проверьте подключение к интернету и повторите попытку.',
    'auth/quota-exceeded': 'Превышен лимит отправки писем Firebase. Попробуйте позже.',
    'auth/user-disabled': 'Этот аккаунт отключён. Обратитесь к администратору.',
    'auth/invalid-continue-uri': 'В настройках Firebase указан некорректный адрес возврата для письма.',
    'auth/unauthorized-continue-uri': 'Адрес сайта не разрешён в настройках Firebase Authentication.',
    'auth/invalid-action-code': 'Ссылка для смены пароля недействительна или уже использована. Запросите новую.',
    'auth/expired-action-code': 'Срок действия ссылки истёк. Запросите новую ссылку для сброса пароля.',
  }

  return messages[error.code] ?? getAuthErrorMessage(error, t)
}

export default function AuthModal({ onClose, onAuthenticated }) {
  const { t } = useLanguage()
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('oobCode')
    if (params.get('mode') !== 'resetPassword' || !code) return
    setIsResettingPassword(true)
    setResetCode(code)
    verifyPasswordResetCode(auth, code)
      .then(setEmail)
      .catch(() => setErrorMessage('Ссылка для смены пароля недействительна или уже использована. Запросите новую.'))
  }, [])

  async function requestPasswordReset(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setSuccessMessage('Если аккаунт с таким адресом существует, Firebase отправил письмо. Проверьте входящие и папку «Спам».')
    } catch (error) {
      console.error('Could not send a password reset email.', error)
      setErrorMessage(getPasswordResetErrorMessage(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  async function completePasswordReset(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают.')
      return
    }
    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, resetCode, password)
      // Firebase Authentication is the password source of truth. Never store passwords in Firestore.
      setSuccessMessage('Пароль успешно изменён. Теперь можно войти с новым паролем.')
      setResetCode('')
      setPassword('')
      setConfirmPassword('')
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      console.error('Could not complete the password reset.', error)
      setErrorMessage(getPasswordResetErrorMessage(error, t))
    } finally {
      setSubmitting(false)
    }
  }

  async function authenticate(event, register = false) {
    event.preventDefault()
    setErrorMessage('')
    if (register && !/^\+\d{7,12}$/.test(phone)) {
      setErrorMessage('Введите корректный номер с кодом страны.')
      return
    }
    setSubmitting(true)

    try {
      const normalizedEmail = email.trim()
      if (register) {
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
        await updateProfile(credential.user, { displayName: displayName.trim() })
        await setDoc(doc(db, 'users', credential.user.uid), { uid: credential.user.uid, fullName: displayName.trim(), email: normalizedEmail, phone, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), loginCount: 1 })
      } else {
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
        const profileRef = doc(db, 'users', credential.user.uid)
        const profile = await getDoc(profileRef).catch(() => null)
        if (profile?.exists()) {
          await updateDoc(profileRef, { lastLoginAt: serverTimestamp(), loginCount: increment(1) }).catch(() => {})
        } else {
          await setDoc(profileRef, { uid: credential.user.uid, fullName: credential.user.displayName || '', email: credential.user.email || normalizedEmail, phone: '', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(), loginCount: 1 }).catch(() => {})
        }
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
        <h2 id="auth-title">{isResettingPassword ? 'Сброс пароля' : t('authTitle')}</h2>
        <p className="auth-intro">{isResettingPassword ? (resetCode ? 'Задайте новый пароль для аккаунта.' : 'Укажите email аккаунта. Firebase отправит безопасную ссылку для создания нового пароля.') : t('authIntro')}</p>

        <form className="auth-form" onSubmit={isResettingPassword ? (resetCode ? completePasswordReset : requestPasswordReset) : (event) => authenticate(event, isRegistering)}>
          {isRegistering && !isResettingPassword && (
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
          {isRegistering && !isResettingPassword && (
            <label>
              <span>Телефон</span>
              <PhoneInput disabled={submitting} onChange={setPhone} value={phone} />
            </label>
          )}
          <label>
            <span>{t('authEmail')}</span>
            <input
              autoComplete="email"
              autoFocus={!isRegistering || isResettingPassword}
              disabled={submitting}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          {!isResettingPassword && <label>
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
          </label>}
          {resetCode && <label>
            <span>Новый пароль</span>
            <input autoComplete="new-password" disabled={submitting} minLength={6} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>}
          {resetCode && <label>
            <span>Подтвердите новый пароль</span>
            <input autoComplete="new-password" disabled={submitting} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
          </label>}
          {!isRegistering && !isResettingPassword && <button className="auth-forgot-link" disabled={submitting} onClick={() => { setIsResettingPassword(true); setErrorMessage(''); setSuccessMessage('') }} type="button">Забыли пароль?</button>}
          {errorMessage && <p className="auth-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="field-warn" role="status">{successMessage}</p>}
          <button className="auth-login-button" disabled={submitting} type="submit">
            {submitting ? t('authWorking') : isResettingPassword ? (resetCode ? 'Сохранить новый пароль' : 'Отправить ссылку') : isRegistering ? t('authRegister') : t('authLogin')}
          </button>
          <button className="auth-register-button" disabled={submitting} onClick={() => { setIsResettingPassword(false); setIsRegistering((registering) => !registering); setErrorMessage(''); setSuccessMessage('') }} type="button">
            {isResettingPassword ? 'Вернуться ко входу' : isRegistering ? t('authHaveAccount') : t('authNoAccount')}
          </button>
        </form>
      </motion.section>
    </motion.div>
  )
}
