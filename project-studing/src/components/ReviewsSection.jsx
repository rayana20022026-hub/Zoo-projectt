import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { addDoc, collection, serverTimestamp, where } from 'firebase/firestore'
import { ArrowLeft, ArrowRight, BadgeCheck, Quote, Star } from 'lucide-react'
import useLanguage from '../context/useLanguage.js'
import useFirestoreCollection from '../hooks/useFirestoreCollection.js'
import { db } from '../firebase.js'

export default function ReviewsSection() {
  const { t } = useLanguage()
  const approvedOnly = useMemo(() => [where('status', '==', 'approved')], [])
  const { documents: liveReviews, error } = useFirestoreCollection('reviews', [], false, true, approvedOnly)
  const [activeIndex, setActiveIndex] = useState(0)
  const [userName, setUserName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [submitState, setSubmitState] = useState('')
  const reduceMotion = useReducedMotion()
  const publicReviews = useMemo(
    () => liveReviews.filter((review) => !review.status || review.status === 'approved'),
    [liveReviews],
  )
  const activeReview = publicReviews.length ? publicReviews[activeIndex % publicReviews.length] : null
  const averageRating = publicReviews.length
    ? (publicReviews.reduce((sum, review) => sum + Number(review.rating ?? 5), 0) / publicReviews.length).toFixed(1)
    : '—'

  function showReview(direction) {
    if (!publicReviews.length) return
    setActiveIndex((index) => (index + direction + publicReviews.length) % publicReviews.length)
  }

  async function submitReview(event) {
    event.preventDefault()
    setSubmitState('')
    setSending(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        userName: userName.trim(),
        rating: Number(rating),
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        status: 'pending',
      })
      setUserName('')
      setComment('')
      setRating(5)
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    } finally {
      setSending(false)
    }
  }

  return (
    <section aria-labelledby="reviews-title" className="reviews-section" id="reviews">
      <div className="section-wrap reviews-layout">
        <motion.div
          className="reviews-intro"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.45 }}
        >
          <span className="section-eyebrow"><Quote size={14} /> {t('reviewsEyebrow')}</span>
          <h2 id="reviews-title">{t('reviewsTitle')}</h2>
          <p>{t('reviewsIntro')}</p>
          <div aria-label={t('reviewsFiveStars')} className="reviews-rating">
            <span className="reviews-stars" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => <Star fill="currentColor" key={index} size={15} />)}
            </span>
            <span className="reviews-rating-copy"><strong>{averageRating}</strong><span>{t('reviewsCount')}</span></span>
          </div>
          <div className="reviews-controls">
            <span className="reviews-pagination" aria-live="polite">
              <strong>{String(activeReview ? (activeIndex % publicReviews.length) + 1 : 0).padStart(2, '0')}</strong><span> / {String(publicReviews.length).padStart(2, '0')}</span>
            </span>
            <button aria-label={t('reviewPrevious')} className="reviews-arrow" disabled={publicReviews.length < 2} onClick={() => showReview(-1)} type="button">
              <ArrowLeft size={18} />
            </button>
            <button aria-label={t('reviewNext')} className="reviews-arrow" disabled={publicReviews.length < 2} onClick={() => showReview(1)} type="button">
              <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>

        {error && <p className="firestore-warning" role="status">{t('reviewsLoadError')}</p>}
        <div aria-live="polite" className="reviews-card-stage">
          {activeReview ? <AnimatePresence mode="wait" initial={false}>
            <motion.article
              animate={{ opacity: 1, x: 0 }}
              className="review-card"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 22 }}
              key={activeReview.id}
              transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: 'easeOut' }}
            >
              <div className="review-card-topline">
                <span className="review-quote-icon"><Quote fill="currentColor" size={20} /></span>
                {!activeReview.comment && <span className="review-verified"><BadgeCheck size={14} /> {t('reviewsVerified')}</span>}
              </div>
              <blockquote>{activeReview.comment ?? t(activeReview.quoteKey)}</blockquote>
              <div className="review-author">
                <span aria-hidden="true" className="review-avatar">{(activeReview.userName ?? t(activeReview.nameKey)).slice(0, 1)}</span>
                <span className="review-author-copy">
                  <strong>{activeReview.userName ?? t(activeReview.nameKey)}</strong>
                  {activeReview.roleKey && <span>{t(activeReview.roleKey)}</span>}
                </span>
                <span className="review-author-stars" aria-label={t('reviewsFiveStars')}>
                  {Array.from({ length: Number(activeReview.rating ?? 5) }, (_, index) => <Star fill="currentColor" key={index} size={12} />)}
                </span>
              </div>
            </motion.article>
          </AnimatePresence> : <p className="reviews-empty">{t('reviewsEmpty')}</p>}
        </div>
      </div>
      <form className="review-submit-form section-wrap" onSubmit={submitReview}>
        <h3>{t('reviewFormTitle')}</h3>
        <div className="review-form-fields">
          <label className="form-field">
            <span>{t('reviewName')}</span>
            <input autoComplete="name" maxLength={80} onChange={(event) => setUserName(event.target.value)} required value={userName} />
          </label>
          <label className="form-field review-rating-field">
            <span>{t('reviewRating')}</span>
            <span aria-label={t('reviewRating')} className="review-rating-input">
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1
                return <button aria-label={`${value}`} aria-pressed={rating === value} className={value <= rating ? 'is-selected' : ''} key={value} onClick={() => setRating(value)} type="button"><Star fill="currentColor" size={20} /></button>
              })}
            </span>
          </label>
          <label className="form-field form-field-full">
            <span>{t('reviewComment')}</span>
            <textarea maxLength={1200} onChange={(event) => setComment(event.target.value)} required rows={4} value={comment} />
          </label>
        </div>
        <button className="booking-primary-button review-submit-button" disabled={sending} type="submit">{sending ? t('reviewSending') : t('reviewSubmit')}</button>
        {submitState && <p aria-live="polite" className={`review-submit-message ${submitState}`} role={submitState === 'error' ? 'alert' : 'status'}>{t(submitState === 'success' ? 'reviewSubmitted' : 'reviewSubmitError')}</p>}
      </form>
    </section>
  )
}
