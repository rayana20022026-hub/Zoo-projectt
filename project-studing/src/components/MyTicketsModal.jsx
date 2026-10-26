import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { X } from 'lucide-react'
import { db } from '../firebase.js'
import { formatKgs } from '../data/zooData.js'

export default function MyTicketsModal({ user, onClose }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => onSnapshot(query(collection(db, 'bookings'), where('userId', '==', user.uid)), (snapshot) => {
    setTickets(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    setLoading(false)
  }, () => setLoading(false)), [user.uid])
  return <div className="modal-backdrop" onClick={onClose}><section className="booking-dialog tickets-dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
    <div className="booking-dialog-header"><div className="booking-title-wrap"><span className="section-eyebrow">WILDHAVEN</span><h2>Мои билеты</h2></div><button className="dialog-close dialog-close-static" onClick={onClose} aria-label="Закрыть" type="button"><X size={19} /></button></div>
    {loading ? <p>Загружаем билеты…</p> : tickets.length === 0 ? <p>Пока нет оформленных бронирований.</p> : <div className="my-tickets-list">{tickets.map((ticket) => <article key={ticket.id} className="my-ticket-card"><strong>{ticket.tourTitle || 'Тур'}</strong><span>Дата: {ticket.visitDate}</span><span>Гостей: {ticket.guestsCount}</span><span>{formatKgs(ticket.totalPrice, 'ru')} KGS</span><small>Статус: {ticket.status === 'paid' ? 'Оплачено' : ticket.status === 'confirmed' ? 'Подтверждено' : ticket.status === 'completed' ? 'Завершено' : ticket.status === 'cancelled' ? 'Отменено' : 'Ожидает подтверждения'}</small></article>)}</div>}
  </section></div>
}
