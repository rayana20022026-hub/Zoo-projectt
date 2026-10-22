import { useCallback, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  Flame,
  Globe,
  ImageIcon,
  Loader2,
  LogOut,
  MapPin,
  MessageSquare,
  Pencil,
  PlusCircle,
  ShieldCheck,
  Star,
  Tag,
  Ticket,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react'
import { auth, db, functions } from '../firebase.js'
import useLanguage from '../context/useLanguage.js'
import './Admin.css'

/* ─── helpers ──────────────────────────────────────────────── */

function slugify(str) {
  return (str ?? '')
    .trim()
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || `item-${crypto.randomUUID().slice(0, 8)}`
}

function fmtDate(val) {
  if (!val) return '—'
  const d = val?.toDate ? val.toDate() : new Date(val)
  if (isNaN(d)) return String(val)
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtMoney(n) {
  if (n == null) return '—'
  return Number(n).toLocaleString('ru-RU') + ' KGS'
}

/* ─── Toast ─────────────────────────────────────────────────── */

function Toast({ toasts, remove }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{t.message}</span>
          <button onClick={() => remove(t.id)} type="button" aria-label="Закрыть"><X size={14} /></button>
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])
  const remove = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), [])
  return { toasts, add, remove }
}

/* ─── Modal ─────────────────────────────────────────────────── */

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Закрыть"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* ─── FormField ──────────────────────────────────────────────── */

function Field({ label, icon: Icon, error, children }) {
  return (
    <label className="afield">
      <span className="afield-label">
        {Icon && <Icon size={13} />} {label}
      </span>
      {children}
      {error && <span className="afield-error">{error}</span>}
    </label>
  )
}

/* ─── StatusBadge ────────────────────────────────────────────── */

const STATUS_MAP = {
  pending:     { label: 'Ожидает',    color: 'badge-warn' },
  confirmed:   { label: 'Подтверждено', color: 'badge-ok' },
  cancelled:   { label: 'Отменено',   color: 'badge-err' },
  completed:   { label: 'Выполнено',  color: 'badge-ok' },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status ?? '—', color: 'badge-gray' }
  return <span className={`badge ${s.color}`}>{s.label}</span>
}

/* ─── Login page ─────────────────────────────────────────────── */

function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetBusy, setResetBusy] = useState(false)
  const [busy, setBusy]         = useState(false)

  const AUTH_ERRORS = {
    'auth/invalid-credential': 'Неверный email или пароль.',
    'auth/user-not-found':     'Пользователь не найден.',
    'auth/wrong-password':     'Неверный пароль.',
    'auth/invalid-email':      'Некорректный email.',
    'auth/too-many-requests':  'Слишком много попыток. Попробуйте позже.',
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const user = credential.user

      if (user.email !== 'admin@rayana.kg') {
        await signOut(auth)
        setError('У вас нет прав администратора!')
        return
      }
    } catch (err) {
      setError(AUTH_ERRORS[err.code] ?? 'Произошла ошибка. Попробуйте снова.')
    } finally {
      setBusy(false)
    }
  }

  async function resetPassword() {
    setError('')
    setResetMessage('')
    if (!email.trim()) {
      setError('Введите email, чтобы запросить сброс пароля.')
      return
    }
    setResetBusy(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
    } catch {
      // Keep the response the same to avoid revealing whether this account exists.
    } finally {
      setResetMessage('Если аккаунт с таким email существует, Firebase отправил письмо для сброса пароля.')
      setResetBusy(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Вход</h1>
        <form onSubmit={submit}>
          <div className="login-fields">
            <Field label="Email" icon={User}>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </Field>
            <Field label="Пароль" icon={ShieldCheck}>
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>
          </div>
          {error && <p className="login-error" role="alert"><AlertCircle size={14} />{error}</p>}
          {resetMessage && <p className="login-reset-message" role="status">{resetMessage}</p>}
          <button className="login-submit" type="submit" disabled={busy}>
            {busy ? <><Loader2 size={15} className="spin" /> Подождите…</> : 'Войти'}
          </button>
          <button className="password-reset-button" disabled={resetBusy} onClick={resetPassword} type="button">
            {resetBusy ? 'Отправка…' : 'Забыли пароль? Отправить ссылку для сброса'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── NoAccess page ──────────────────────────────────────────── */

function NoAccessPage({ user, onLogout }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo noaccess"><ShieldCheck size={22} /></div>
        <h1>Нет доступа</h1>
        <p className="login-hint">Аккаунт <strong>{user.email}</strong> не имеет прав администратора.</p>
        <p className="login-hint">Добавьте документ в Firestore:</p>
        <code className="login-uid-box">admins / {user.uid}</code>
        <button className="login-submit" style={{ marginTop: 20 }} onClick={onLogout} type="button">
          <LogOut size={15} /> Выйти
        </button>
      </div>
    </div>
  )
}

/* ─── Animals section ────────────────────────────────────────── */

const ANIMAL_CATEGORIES = ['mammals', 'birds', 'reptiles', 'predators', 'rare']
const CONTENT_LANGUAGES = [
  { code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' },
  { code: 'kg', label: 'Кыргызча' }, { code: 'tr', label: 'Türkçe' }, { code: 'zh', label: '中文' },
]

function TranslationFields({ field, values = {}, onChange, multiline = false, error }) {
  const Input = multiline ? 'textarea' : 'input'
  return CONTENT_LANGUAGES.map(({ code, label }) => (
    <Field error={code === 'ru' ? error : undefined} key={code} label={`${field} (${label})${code === 'ru' ? ' *' : ''}`} icon={code === 'ru' ? Tag : BookOpen}>
      <Input onChange={(event) => onChange(code, event.target.value)} placeholder={`${field} — ${label}`} rows={multiline ? 3 : undefined} value={values[code] ?? ''} />
    </Field>
  ))
}

const EMPTY_ANIMAL = { name: '', subtitle: '', category: 'mammals', description: '', nameTranslations: { ru: '' }, descriptionTranslations: { ru: '' }, habitat: '', feedingTime: '', image: '' }

function AnimalsSection({ toast }) {
  const [docs, setDocs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)   // null | 'new' | doc-object
  const [form, setForm]         = useState(EMPTY_ANIMAL)
  const [errors, setErrors]     = useState({})
  const [busy, setBusy]         = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'animals'), orderBy('name')))
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      toast('Не удалось загрузить животных.', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  function openNew() { setForm(EMPTY_ANIMAL); setErrors({}); setModal('new') }
  function openEdit(doc) { setForm({ ...EMPTY_ANIMAL, ...doc, nameTranslations: { ru: doc.name ?? '', ...(doc.nameTranslations ?? {}) }, descriptionTranslations: { ru: doc.description ?? '', ...(doc.descriptionTranslations ?? {}) } }); setErrors({}); setModal(doc) }

  function validate() {
    const e = {}
    if (!(form.nameTranslations?.ru ?? form.name).trim()) e.name = 'Введите название на русском'
    if (!(form.descriptionTranslations?.ru ?? form.description).trim()) e.description = 'Введите описание на русском'
    if (!form.category.trim())    e.category    = 'Выберите категорию'
    if (!form.image.trim())       e.image       = 'Введите URL изображения'
    else {
      try { new URL(form.image.trim()) } catch { e.image = 'Некорректный URL' }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function save() {
    if (!validate()) return
    setBusy(true)
    try {
      const data = {
        name:        (form.nameTranslations?.ru ?? form.name).trim(),
        nameTranslations: Object.fromEntries(Object.entries(form.nameTranslations ?? {}).map(([lang, value]) => [lang, value.trim()])),
        subtitle:    form.subtitle.trim(),
        category:    form.category.trim(),
        categoryKey: form.category.trim(),
        description: (form.descriptionTranslations?.ru ?? form.description).trim(),
        descriptionTranslations: Object.fromEntries(Object.entries(form.descriptionTranslations ?? {}).map(([lang, value]) => [lang, value.trim()])),
        habitat:     form.habitat.trim(),
        feedingTime: form.feedingTime.trim(),
        image:       form.image.trim(),
      }
      if (modal === 'new') {
        const id = slugify(data.name)
        await setDoc(doc(db, 'animals', id), { ...data, id, createdAt: serverTimestamp() })
        toast('Животное добавлено.')
      } else {
        await updateDoc(doc(db, 'animals', modal.id), data)
        toast('Изменения сохранены.')
      }
      setModal(null)
      load()
    } catch (err) {
      toast('Ошибка сохранения: ' + err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await deleteDoc(doc(db, 'animals', deleteId))
      toast('Запись удалена.')
      setDeleteId(null)
      load()
    } catch {
      toast('Не удалось удалить запись.', 'error')
    }
  }

  const f = (key) => ({ value: form[key], onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })) })
  const translationField = (field, lang) => (value) => setForm((previous) => ({ ...previous, [field]: { ...previous[field], [lang]: value } }))

  return (
    <div className="section-wrap">
      <div className="section-topbar">
        <div>
          <h1 className="section-title">Животные</h1>
          <p className="section-sub">Коллекция <code>animals</code></p>
        </div>
        <button className="btn-primary" onClick={openNew} type="button"><PlusCircle size={16} /> Добавить</button>
      </div>

      {loading
        ? <div className="loader-center"><Loader2 size={28} className="spin" /><span>Загрузка…</span></div>
        : docs.length === 0
          ? <div className="empty-state"><BookOpen size={40} /><p>Нет животных. Нажмите «Добавить».</p></div>
          : (
            <div className="card-grid">
              {docs.map((d) => (
                <div key={d.id} className="animal-card-admin">
                  <div className="animal-card-img">
                    {d.image
                      ? <img src={d.image} alt={d.name} />
                      : <div className="img-placeholder"><ImageIcon size={28} /></div>}
                    <span className="animal-cat-chip">{d.category ?? d.categoryKey}</span>
                  </div>
                  <div className="animal-card-body">
                    <strong>{d.name}</strong>
                    {d.subtitle && <span className="animal-subtitle-text">{d.subtitle}</span>}
                    <p className="animal-desc-text">{(d.description ?? '').slice(0, 90)}{d.description?.length > 90 ? '…' : ''}</p>
                    <div className="animal-meta">
                      {d.habitat    && <span><MapPin size={11} />{d.habitat}</span>}
                      {d.feedingTime && <span><Clock size={11} />{d.feedingTime}</span>}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button className="btn-icon" onClick={() => openEdit(d)} title="Редактировать"><Pencil size={15} /></button>
                    <button className="btn-icon btn-danger" onClick={() => setDeleteId(d.id)} title="Удалить"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

      {/* Форма создания / редактирования */}
      {modal && (
        <Modal title={modal === 'new' ? 'Новое животное' : `Редактировать: ${modal.name}`} onClose={() => setModal(null)}>
          <div className="modal-form-grid">
            <TranslationFields error={errors.name} field="Название" onChange={(lang, value) => translationField('nameTranslations', lang)(value)} values={form.nameTranslations} />
            <Field label="Подзаголовок" icon={Tag}>
              <input {...f('subtitle')} placeholder="Panthera leo" />
            </Field>
            <Field label="Категория *" icon={Tag} error={errors.category}>
              <select {...f('category')}>
                {ANIMAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="URL изображения *" icon={ImageIcon} error={errors.image}>
              <input {...f('image')} placeholder="https://…" type="url" />
            </Field>
            <TranslationFields error={errors.description} field="Описание" multiline onChange={(lang, value) => translationField('descriptionTranslations', lang)(value)} values={form.descriptionTranslations} />
            <Field label="Среда обитания" icon={MapPin}>
              <input {...f('habitat')} placeholder="Африканские саванны" />
            </Field>
            <Field label="Время кормления" icon={Clock}>
              <input {...f('feedingTime')} placeholder="10:00 и 16:00" />
            </Field>
          </div>
          {form.image && (
            <div className="modal-preview">
              <img src={form.image} alt="preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)} type="button">Отмена</button>
            <button className="btn-primary" onClick={save} disabled={busy} type="button">
              {busy ? <><Loader2 size={14} className="spin" /> Сохранение…</> : 'Сохранить'}
            </button>
          </div>
        </Modal>
      )}

      {/* Подтверждение удаления */}
      {deleteId && (
        <Modal title="Удалить запись?" onClose={() => setDeleteId(null)}>
          <p className="confirm-text">Запись <strong>{deleteId}</strong> будет удалена из Firestore без возможности восстановления.</p>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setDeleteId(null)} type="button">Отмена</button>
            <button className="btn-danger-solid" onClick={confirmDelete} type="button"><Trash2 size={15} /> Удалить</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ─── Tours section ──────────────────────────────────────────── */

const EMPTY_TOUR = { name: '', price: '', duration: '', schedule: '', description: '', titleTranslations: { ru: '' }, descriptionTranslations: { ru: '' } }

function ToursSection({ toast }) {
  const [docs, setDocs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY_TOUR)
  const [errors, setErrors]     = useState({})
  const [busy, setBusy]         = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'tours'))
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      toast('Не удалось загрузить туры.', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  function openNew()     { setForm(EMPTY_TOUR); setErrors({}); setModal('new') }
  function openEdit(doc) { setForm({ ...EMPTY_TOUR, ...doc, titleTranslations: { ru: doc.name ?? doc.title ?? '', ...(doc.titleTranslations ?? {}) }, descriptionTranslations: { ru: doc.description ?? '', ...(doc.descriptionTranslations ?? {}) }, price: String(doc.price ?? ''), duration: String(doc.durationMinutes ?? '') }); setErrors({}); setModal(doc) }

  function validate() {
    const e = {}
    if (!(form.titleTranslations?.ru ?? form.name).trim()) e.name = 'Введите название на русском'
    if (!(form.descriptionTranslations?.ru ?? form.description).trim()) e.description = 'Введите описание на русском'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Введите корректную цену'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function save() {
    if (!validate()) return
    setBusy(true)
    try {
      const data = {
        name:            (form.titleTranslations?.ru ?? form.name).trim(),
        titleTranslations: Object.fromEntries(Object.entries(form.titleTranslations ?? {}).map(([lang, value]) => [lang, value.trim()])),
        price:           Number(form.price),
        durationMinutes: form.duration ? Number(form.duration) : null,
        schedule:        form.schedule.trim(),
        description:     (form.descriptionTranslations?.ru ?? form.description).trim(),
        descriptionTranslations: Object.fromEntries(Object.entries(form.descriptionTranslations ?? {}).map(([lang, value]) => [lang, value.trim()])),
      }
      if (modal === 'new') {
        const id = slugify(data.name)
        await setDoc(doc(db, 'tours', id), { ...data, id, createdAt: serverTimestamp() })
        toast('Тур добавлен.')
      } else {
        await updateDoc(doc(db, 'tours', modal.id), data)
        toast('Изменения сохранены.')
      }
      setModal(null)
      load()
    } catch (err) {
      toast('Ошибка сохранения: ' + err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await deleteDoc(doc(db, 'tours', deleteId))
      toast('Тур удалён.')
      setDeleteId(null)
      load()
    } catch {
      toast('Не удалось удалить тур.', 'error')
    }
  }

  const f = (key) => ({ value: form[key], onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })) })
  const translationField = (field, lang) => (value) => setForm((previous) => ({ ...previous, [field]: { ...previous[field], [lang]: value } }))

  return (
    <div className="section-wrap">
      <div className="section-topbar">
        <div>
          <h1 className="section-title">Туры</h1>
          <p className="section-sub">Коллекция <code>tours</code></p>
        </div>
        <button className="btn-primary" onClick={openNew} type="button"><PlusCircle size={16} /> Добавить</button>
      </div>

      {loading
        ? <div className="loader-center"><Loader2 size={28} className="spin" /><span>Загрузка…</span></div>
        : docs.length === 0
          ? <div className="empty-state"><Ticket size={40} /><p>Нет туров. Нажмите «Добавить».</p></div>
          : (
            <div className="tours-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Цена</th>
                    <th>Длительность</th>
                    <th>Расписание</th>
                    <th style={{ width: 90 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="table-name-cell">
                          <div>
                            <strong>{d.name ?? d.titleKey}</strong>
                            <span className="table-id">{d.id}</span>
                          </div>
                        </div>
                      </td>
                      <td><strong>{fmtMoney(d.price)}</strong></td>
                      <td>{d.durationMinutes ? `${d.durationMinutes} мин` : '—'}</td>
                      <td className="table-muted">{d.schedule || '—'}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => openEdit(d)} title="Редактировать"><Pencil size={14} /></button>
                          <button className="btn-icon btn-danger" onClick={() => setDeleteId(d.id)} title="Удалить"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

      {modal && (
        <Modal title={modal === 'new' ? 'Новый тур' : `Редактировать: ${modal.name ?? modal.id}`} onClose={() => setModal(null)}>
          <div className="modal-form-grid">
            <TranslationFields error={errors.name} field="Название" onChange={(lang, value) => translationField('titleTranslations', lang)(value)} values={form.titleTranslations} />
            <Field label="Цена (KGS) *" icon={Flame} error={errors.price}>
              <input {...f('price')} type="number" min="0" placeholder="1200" />
            </Field>
            <Field label="Длительность (мин)" icon={Clock}>
              <input {...f('duration')} type="number" min="0" placeholder="90" />
            </Field>
            <Field label="Расписание" icon={CalendarDays}>
              <input {...f('schedule')} placeholder="Пн–Вс, 09:00–18:00" />
            </Field>
            <TranslationFields error={errors.description} field="Описание" multiline onChange={(lang, value) => translationField('descriptionTranslations', lang)(value)} values={form.descriptionTranslations} />
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)} type="button">Отмена</button>
            <button className="btn-primary" onClick={save} disabled={busy} type="button">
              {busy ? <><Loader2 size={14} className="spin" /> Сохранение…</> : 'Сохранить'}
            </button>
          </div>
        </Modal>
      )}

      {deleteId && (
        <Modal title="Удалить тур?" onClose={() => setDeleteId(null)}>
          <p className="confirm-text">Тур <strong>{deleteId}</strong> будет удалён.</p>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setDeleteId(null)} type="button">Отмена</button>
            <button className="btn-danger-solid" onClick={confirmDelete} type="button"><Trash2 size={15} /> Удалить</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ─── Bookings section ───────────────────────────────────────── */

const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

function BookingsSection({ toast }) {
  const [docs, setDocs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')))
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch {
      toast('Не удалось загрузить заявки.', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  async function changeStatus(id, status) {
    setUpdatingId(id)
    try {
      await updateDoc(doc(db, 'bookings', id), { status })
      setDocs((prev) => prev.map((d) => d.id === id ? { ...d, status } : d))
      toast('Статус обновлён.')
    } catch {
      toast('Не удалось обновить статус.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await deleteDoc(doc(db, 'bookings', deleteId))
      toast('Заявка удалена.')
      setDeleteId(null)
      setDocs((prev) => prev.filter((d) => d.id !== deleteId))
    } catch {
      toast('Не удалось удалить заявку.', 'error')
    }
  }

  const total = docs.length
  const pending = docs.filter((d) => d.status === 'pending').length
  const revenue = docs.filter((d) => d.status !== 'cancelled').reduce((s, d) => s + (Number(d.totalPrice) || 0), 0)

  return (
    <div className="section-wrap">
      <div className="section-topbar">
        <div>
          <h1 className="section-title">Заявки и бронирования</h1>
          <p className="section-sub">Коллекция <code>bookings</code></p>
        </div>
        <button className="btn-secondary" onClick={() => { setLoading(true); load() }} type="button"><Database size={15} /> Обновить</button>
      </div>

      {/* Сводка */}
      <div className="stats-row">
        <div className="stat-card"><span className="stat-val">{total}</span><span className="stat-label">Всего заявок</span></div>
        <div className="stat-card"><span className="stat-val pending-val">{pending}</span><span className="stat-label">Ожидают</span></div>
        <div className="stat-card"><span className="stat-val">{fmtMoney(revenue)}</span><span className="stat-label">Общая выручка</span></div>
      </div>

      {loading
        ? <div className="loader-center"><Loader2 size={28} className="spin" /><span>Загрузка…</span></div>
        : docs.length === 0
          ? <div className="empty-state"><CalendarDays size={40} /><p>Заявок пока нет.</p></div>
          : (
            <div className="bookings-list">
              {docs.map((d) => (
                <div key={d.id} className={`booking-row ${expanded === d.id ? 'is-open' : ''}`}>
                  <div className="booking-row-head" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                    <div className="booking-row-main">
                      <User size={15} className="booking-user-icon" />
                      <div>
                        <strong>{d.clientName ?? d.fullName ?? '—'}</strong>
                        <span className="booking-phone">{d.clientPhone ?? d.phone ?? ''}</span>
                      </div>
                    </div>
                    <div className="booking-row-meta">
                      <span className="booking-tour-name">{d.tourTitle ?? d.tourTitleKey ?? '—'}</span>
                      <StatusBadge status={d.status} />
                      <span className="booking-price">{fmtMoney(d.totalPrice ?? d.total)}</span>
                      <ChevronDown size={16} className={`chevron ${expanded === d.id ? 'rotated' : ''}`} />
                    </div>
                  </div>
                  {expanded === d.id && (
                    <div className="booking-row-detail">
                      <div className="booking-detail-grid">
                        <div><span className="det-label"><CalendarDays size={12} /> Дата визита</span><span>{d.visitDate ?? d.date ?? '—'}</span></div>
                        <div><span className="det-label"><Users size={12} /> Гостей</span><span>{d.guestsCount ?? d.guests ?? '—'}</span></div>
                        <div><span className="det-label"><Ticket size={12} /> Номер заявки</span><span style={{ fontFamily: 'monospace' }}>{d.ticketId ?? d.id}</span></div>
                        <div><span className="det-label"><Clock size={12} /> Создана</span><span>{fmtDate(d.createdAt)}</span></div>
                      </div>
                      <div className="booking-row-actions">
                        <div className="status-select-wrap">
                          <span className="det-label">Статус:</span>
                          <select
                            value={d.status ?? 'pending'}
                            disabled={updatingId === d.id}
                            onChange={(e) => changeStatus(d.id, e.target.value)}
                          >
                            {BOOKING_STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_MAP[s]?.label ?? s}</option>
                            ))}
                          </select>
                          {updatingId === d.id && <Loader2 size={14} className="spin" />}
                        </div>
                        <button className="btn-icon btn-danger" onClick={() => setDeleteId(d.id)} title="Удалить заявку"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

      {deleteId && (
        <Modal title="Удалить заявку?" onClose={() => setDeleteId(null)}>
          <p className="confirm-text">Заявка <strong>{deleteId}</strong> будет удалена без возможности восстановления.</p>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setDeleteId(null)} type="button">Отмена</button>
            <button className="btn-danger-solid" onClick={confirmDelete} type="button"><Trash2 size={15} /> Удалить</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function ReviewsAdminSection({ toast }) {
  const { t } = useLanguage()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'reviews'))
      const items = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
      items.sort((a, b) => {
        const first = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt ?? 0).getTime()
        const second = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt ?? 0).getTime()
        return second - first
      })
      setDocs(items)
    } catch {
      toast(t('adminReviewsLoadError'), 'error')
    } finally {
      setLoading(false)
    }
  }, [toast, t])

  useEffect(() => { load() }, [load])

  async function changeStatus(review, status) {
    setUpdatingId(review.id)
    try {
      await updateDoc(doc(db, 'reviews', review.id), { status })
      setDocs((previous) => previous.map((item) => item.id === review.id ? { ...item, status } : item))
      toast(t(status === 'approved' ? 'adminReviewPublished' : 'adminReviewHidden'))
    } catch {
      toast(t('adminReviewStatusError'), 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await deleteDoc(doc(db, 'reviews', deleteId))
      setDocs((previous) => previous.filter((item) => item.id !== deleteId))
      setDeleteId(null)
      toast(t('adminReviewDeleted'))
    } catch {
      toast(t('adminReviewDeleteError'), 'error')
    }
  }

  return (
    <div className="section-wrap">
      <div className="section-topbar">
        <div>
          <h1 className="section-title">{t('navReviews')}</h1>
          <p className="section-sub">{t('adminCollection')} <code>reviews</code></p>
        </div>
        <button className="btn-secondary" onClick={() => { setLoading(true); load() }} type="button"><Database size={15} /> {t('adminRefresh')}</button>
      </div>
      {loading
        ? <div className="loader-center"><Loader2 size={28} className="spin" /><span>{t('adminLoading')}</span></div>
        : docs.length === 0
          ? <div className="empty-state"><MessageSquare size={40} /><p>{t('adminReviewsEmpty')}</p></div>
          : <div className="reviews-admin-list">
            {docs.map((review) => (
              <article className="reviews-admin-card" key={review.id}>
                <div className="reviews-admin-card-top">
                  <div>
                    <strong>{review.userName ?? t('adminAnonymous')}</strong>
                    <time>{fmtDate(review.createdAt)}</time>
                  </div>
                  <span aria-label={`${review.rating ?? 0} / 5`} className="reviews-admin-stars">
                    {Array.from({ length: Number(review.rating) || 0 }, (_, index) => <Star fill="currentColor" key={index} size={14} />)}
                  </span>
                </div>
                <p>{review.comment ?? ''}</p>
                <div className="reviews-admin-actions">
                  <label>
                    <span className={`badge ${review.status === 'approved' ? 'badge-ok' : 'badge-warn'}`}>{review.status === 'approved' ? t('adminApproved') : t('adminHidden')}</span>
                    <select aria-label={t('adminReviewStatus')} disabled={updatingId === review.id} onChange={(event) => changeStatus(review, event.target.value)} value={review.status === 'approved' ? 'approved' : 'pending'}>
                      <option value="approved">{t('adminApproved')}</option>
                      <option value="pending">{t('adminHidden')}</option>
                    </select>
                  </label>
                  <button className="btn-icon btn-danger" onClick={() => setDeleteId(review.id)} title={t('adminDeleteReview')} type="button"><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} title={t('adminDeleteReviewQuestion')}>
          <p className="confirm-text">{t('adminDeleteReviewConfirm')}</p>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setDeleteId(null)} type="button">{t('adminCancel')}</button>
            <button className="btn-danger-solid" onClick={confirmDelete} type="button"><Trash2 size={15} /> {t('adminDelete')}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ─── Sidebar ────────────────────────────────────────────────── */

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: Database },
  { id: 'animals',  label: 'Животные',    icon: Globe },
  { id: 'tours',    label: 'Туры',        icon: Ticket },
  { id: 'bookings', label: 'Бронирования', icon: CalendarDays },
  { id: 'users', label: 'Пользователи', icon: Users },
  { id: 'reviews',  label: 'navReviews', icon: MessageSquare },
]

function Sidebar({ active, onNav, user, onLogout, t }) {
  return (
    <aside className="adm-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><Database size={18} /></div>
        <div>
          <span className="sidebar-brand">WILDHAVEN</span>
          <span className="sidebar-brand-sub">ADMIN PANEL</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar-link ${active === id ? 'is-active' : ''}`}
            onClick={() => onNav(id)}
            type="button"
          >
            <Icon size={17} />
            {id === 'reviews' ? t(label) : label}
            {active === id && <ChevronRight size={14} className="sidebar-arrow" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-avatar"><User size={15} /></div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-email">{user.email}</span>
          <span className="sidebar-user-role">Администратор</span>
        </div>
        <button className="sidebar-logout" onClick={onLogout} title="Выйти" type="button"><LogOut size={16} /></button>
      </div>
    </aside>
  )
}

/* ─── Main Admin component ───────────────────────────────────── */

export default function Admin() {
  const { t } = useLanguage()
  const [user, setUser]               = useState(null)
  const [isAdmin, setIsAdmin]         = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [section, setSection]         = useState('animals')
  const { toasts, add: addToast, remove: removeToast } = useToast()

  useEffect(() => {
    let active = true
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!active) return
      setUser(u)
      setIsAdmin(u?.email === 'admin@rayana.kg')
      setAuthLoading(false)
    })
    return () => { active = false; unsub() }
  }, [])

  async function logout() {
    try { await signOut(auth) } catch { /* ignore */ }
  }

  if (authLoading) {
    return (
      <div className="adm-fullscreen-center">
        <Loader2 size={32} className="spin" />
        <span>Проверяем доступ…</span>
      </div>
    )
  }

  if (!user) return <LoginPage />
  if (!isAdmin) return <NoAccessPage user={user} onLogout={logout} />

  return (
    <div className="adm-layout">
      <Toast toasts={toasts} remove={removeToast} />
      <Sidebar active={section} onNav={setSection} user={user} onLogout={logout} t={t} />
      <main className="adm-main">
        {section === 'dashboard' && <DashboardSection />}
        {section === 'users' && <UsersSection />}
        {section === 'animals'  && <AnimalsSection  toast={addToast} />}
        {section === 'tours'    && <ToursSection    toast={addToast} />}
        {section === 'bookings' && <BookingsSection toast={addToast} />}
        {section === 'reviews' && <ReviewsAdminSection toast={addToast} />}
      </main>
    </div>
  )
}

function DashboardSection() {
  const [stats, setStats] = useState({ animals: 0, tours: 0, bookings: 0 })
  useEffect(() => { Promise.all(['animals', 'tours', 'bookings'].map((name) => getDocs(collection(db, name)))).then(([animals, tours, bookings]) => setStats({ animals: animals.size, tours: tours.size, bookings: bookings.size })).catch(() => {}) }, [])
  return <section className="section-wrap"><div className="section-topbar"><div><h1 className="section-title">Dashboard</h1><p className="section-sub">Сводная статистика зоопарка</p></div></div><div className="dashboard-stat-grid">{[['Животные', stats.animals], ['Туры', stats.tours], ['Бронирования', stats.bookings]].map(([label, count]) => <article className="dashboard-stat-card" key={label}><span>{label}</span><strong>{count}</strong></article>)}</div></section>
}

function UsersSection() {
  const [users, setUsers] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resettingId, setResettingId] = useState('')
  useEffect(() => { Promise.all([getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))), getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')))]).then(([userSnap, bookingSnap]) => { setUsers(userSnap.docs.map((item) => ({ id: item.id, ...item.data() }))); setBookings(bookingSnap.docs.map((item) => item.data())) }).catch(() => {}).finally(() => setLoading(false)) }, [])
  async function removeUser(person) {
    if (!window.confirm(`Удалить аккаунт ${person.email || person.fullName || person.uid}? Все его бронирования также будут удалены.`)) return
    setDeletingId(person.id)
    setDeleteError('')
    try {
      await httpsCallable(functions, 'deleteCustomerAccount')({ uid: person.uid })
      setUsers((current) => current.filter((user) => user.id !== person.id))
      setBookings((current) => current.filter((booking) => booking.userId !== person.uid))
    } catch (error) {
      console.error('Could not delete customer account.', error)
      setDeleteError('Не удалось удалить пользователя. Проверьте, что Cloud Function развернута и у вас есть права администратора.')
    } finally {
      setDeletingId('')
    }
  }
  async function sendResetLink(person) {
    if (!person.email) {
      setResetMessage('У пользователя не указан email для сброса пароля.')
      return
    }
    setResettingId(person.id)
    setResetMessage('')
    try {
      await sendPasswordResetEmail(auth, person.email)
      setResetMessage(`Ссылка для смены пароля отправлена на ${person.email}.`)
    } catch (error) {
      console.error('Could not send customer password reset email.', error)
      setResetMessage('Не удалось отправить ссылку. Проверьте настройки Firebase Authentication.')
    } finally {
      setResettingId('')
    }
  }
  return <section className="section-wrap"><div className="section-topbar"><div><h1 className="section-title">Пользователи</h1><p className="section-sub">История зарегистрированных клиентов и их бронирований</p></div></div>{deleteError && <p className="admin-user-error" role="alert">{deleteError}</p>}{resetMessage && <p className="admin-user-reset-message" role="status">{resetMessage}</p>}{loading ? <p>Загрузка…</p> : <div className="admin-users-list">{users.map((person) => { const own = bookings.filter((item) => item.userId === person.uid); return <article className="admin-user-card" key={person.id}><div><strong>{person.fullName || 'Без имени'}</strong><span>{person.email || '—'} · {person.phone || 'Телефон не указан'}</span><small>Регистрация: {fmtDate(person.createdAt)} · Последний вход: {fmtDate(person.lastLoginAt)} · Входов: {person.loginCount || 1}</small></div><div className="admin-user-actions"><b>{own.length} бронир.</b><button className="admin-user-reset" disabled={resettingId === person.id || !person.email} onClick={() => sendResetLink(person)} type="button">{resettingId === person.id ? 'Отправка…' : 'Сбросить пароль'}</button><button className="admin-user-delete" disabled={deletingId === person.id} onClick={() => removeUser(person)} type="button"><Trash2 size={14} />{deletingId === person.id ? 'Удаление…' : 'Удалить пользователя'}</button></div>{own.length > 0 && <small className="admin-user-history">{own.map((item) => `${item.tourTitle || 'Тур'} — ${item.visitDate}`).join(' · ')}</small>}</article> })}{users.length === 0 && <p>Пользователей пока нет.</p>}</div>}</section>
}
