import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, X, Send, MapPin, Clock3, Ticket, Sparkles } from 'lucide-react'

function LionIllustration() {
  return <svg aria-hidden="true" viewBox="0 0 100 100" className="lion-mascot-art"><path fill="#c78337" d="M50 5c-8 0-12 5-16 10-7-2-14 2-15 10-8 2-12 9-10 17-6 6-7 14-2 21-4 8 0 16 7 19 1 9 8 14 17 13 5 6 13 7 20 3 7 4 15 3 20-3 9 1 16-4 17-13 7-3 11-11 7-19 5-7 4-15-2-21 2-8-2-15-10-17-1-8-8-12-15-10C62 10 58 5 50 5Z"/><path fill="#f2c47e" d="M50 22c-16 0-27 12-27 29 0 19 11 33 27 33s27-14 27-33C77 34 66 22 50 22Z"/><path fill="#70472e" d="M38 47c2-4 6-4 8 0-1 3-2 5-4 5s-3-2-4-5Zm16 0c2-4 6-4 8 0-1 3-2 5-4 5s-3-2-4-5Z"/><path fill="#754632" d="M45 58c0-3 10-3 10 0s-3 6-5 6-5-3-5-6Z"/><path d="M50 63c-1 5-5 6-8 3m8-3c1 5 5 6 8 3" fill="none" stroke="#754632" strokeWidth="2.5" strokeLinecap="round"/></svg>
}

const suggestions = ['Где красная панда?', 'Какие туры есть сегодня?', 'Сколько стоят билеты?', 'Время работы']

const knowledgeBase = [
  { id: 'predators', keywords: { kg: ['карышкыр', 'жырткыч'], ru: ['волк', 'хищник', 'лев', 'тигр'], en: ['wolf', 'predator', 'lion', 'tiger'], tr: ['kurt', 'yırtıcı', 'aslan', 'kaplan'], zh: ['狼', '猛兽', '狮子', '老虎'] }, answers: { kg: 'Зоопарктын түндүк тарабындагы 01-зонада жырткычтар жашайт.', ru: 'Зона 01 (Зона хищников) находится в северной части парка.', en: 'Zone 01 (Predator Zone) is in the north of the park.', tr: '01. Bölge (Yırtıcı Hayvanlar Bölgesi) parkın kuzeyindedir.', zh: '01区（猛兽区）位于公园北部。' } },
  { id: 'birds', keywords: { kg: ['куштар'], ru: ['птиц', 'павлин'], en: ['bird', 'peacock'], tr: ['kuş', 'tavus'], zh: ['鸟类', '孔雀'] }, answers: { kg: 'Куштар павильону көлдүн жанындагы 02-зонада.', ru: 'Зона 02 (Павильон птиц) находится рядом с Озером.', en: 'Zone 02 (Bird Pavilion) is next to the lake.', tr: '02. Bölge (Kuşlar Pavyonu) gölün yanındadır.', zh: '02区（鸟类馆）位于湖边。' } },
  { id: 'reptiles', keywords: { kg: ['сойлоп жүрүүчүлөр', 'жылан'], ru: ['рептил', 'зме'], en: ['reptile', 'snake'], tr: ['sürüngen', 'yılan'], zh: ['爬行动物', '蛇'] }, answers: { kg: 'Сойлоп жүрүүчүлөр үйү — 03-зона.', ru: 'Зона 03 (Дом рептилий).', en: 'Zone 03 (Reptile House).', tr: '03. Bölge (Sürüngen Evi).', zh: '03区（爬行动物馆）。' } },
  { id: 'mammals', keywords: { kg: ['сүт эмүүчүлөр', 'коён', 'жираф'], ru: ['млекопитающ', 'жираф', 'заяц'], en: ['mammal', 'giraffe', 'hare'], tr: ['memeli', 'zürafa'], zh: ['哺乳动物', '长颈鹿', '野兔'] }, answers: { kg: 'Жирафтар жана сүт эмүүчүлөр 04-зонада.', ru: 'Зона 04 (Зона млекопитающих). Здесь находятся жирафы.', en: 'Zone 04 (Mammal Zone). Giraffes are here.', tr: '04. Bölge (Memeliler Bölgesi). Zürafalar burada.', zh: '04区（哺乳动物区），长颈鹿也在这里。' } },
  { id: 'rare', keywords: { kg: ['сейрек кездешүүчү', 'панда'], ru: ['редк', 'панд'], en: ['rare species', 'rare animal', 'panda'], tr: ['nadir tür', 'panda'], zh: ['珍稀动物', '熊猫'] }, answers: { kg: 'Пандалар жана сейрек кездешүүчү жаныбарлар 05-зонада.', ru: 'Зона 05 (Редкие виды). Здесь живут красные панды.', en: 'Zone 05 (Rare Species). Red pandas live here.', tr: '05. Bölge (Nadir Türler). Kırmızı pandalar burada yaşar.', zh: '05区（珍稀动物区），小熊猫生活在这里。' } },
  { id: 'services', keywords: { kg: ['кафе', 'тамак', 'кофе'], ru: ['кофе', 'кофейн', 'кафе', 'ед', 'перекус', 'ресторан'], en: ['cafe', 'coffee', 'food', 'restaurant'], tr: ['kafe', 'kahve', 'yemek', 'restoran'], zh: ['咖啡馆', '咖啡', '餐厅', '食物'] }, answers: { kg: 'Кафе жана тамактануучу жайлар борбордук аллеянын жанындагы 06-зонада.', ru: 'Зона 06 (Инфраструктура и кафе) у центральной аллеи.', en: 'Zone 06 (Facilities and Cafe) is by the central path.', tr: '06. Bölge (Hizmetler ve Kafe) merkez yolun yanındadır.', zh: '06区（服务设施和咖啡馆）位于中央步道旁。' } },
  { id: 'tickets', keywords: { kg: ['билет'], ru: ['билет', 'цен', 'стоим', 'купить'], en: ['ticket', 'price', 'cost', 'buy'], tr: ['bilet', 'fiyat', 'ücret', 'satın al'], zh: ['门票', '票价', '购买'] }, answers: { kg: 'Билеттерди башкы кире бериштеги кассадан сатып алсаңыз болот.', ru: 'Билеты можно купить на главной странице или в кассе у Главного входа.', en: 'You can buy tickets on the home page or at the ticket office by the Main Entrance.', tr: 'Biletleri ana sayfadan veya Ana Giriş yanındaki gişeden alabilirsiniz.', zh: '您可以在主页购买门票，也可以在主入口旁的售票处购买。' } },
  { id: 'hours', keywords: { kg: ['убакыт', 'саат'], ru: ['врем', 'час', 'график', 'работ'], en: ['hour', 'time', 'opening', 'open'], tr: ['saat', 'çalışma', 'açık'], zh: ['开放时间', '营业时间', '几点', '时间'] }, answers: { kg: 'Зоопарк күн сайын 09:00дөн 20:00гө чейин иштейт.', ru: 'Мы работаем ежедневно с 09:00 до 20:00.', en: 'We are open daily from 09:00 to 20:00.', tr: 'Her gün 09:00–20:00 saatleri arasında açığız.', zh: '我们每天09:00至20:00开放。' } },
]

function detectLanguage(text) {
  if (/[\u3400-\u9fff]/u.test(text)) return 'zh'
  const lower = text.toLowerCase()
  if (/[ıİşŞğĞüÜçÇöÖ]/u.test(text) || ['merhaba', 'nerede', 'hangi', 'hayvan', 'kurt', 'aslan', 'kaplan', 'kuş', 'tavus', 'sürüngen', 'memeli', 'zürafa', 'kahve', 'bilet', 'saat'].some((word) => lower.includes(word))) return 'tr'
  if (['карышкыр', 'жырткыч', 'куштар', 'сойлоп', 'жылан', 'сүт эмүүчүлөр', 'коён', 'сейрек', 'тамак', 'убакыт', 'салам'].some((word) => lower.includes(word))) return 'kg'
  if (/[a-z]/i.test(text) && !/[а-яё]/i.test(text)) return 'en'
  if (['hello', 'where', 'wolf', 'predator', 'birds', 'reptile', 'giraffe', 'panda', 'tickets', 'hours', 'open'].some((word) => lower.includes(word))) return 'en'
  return 'ru'
}

function answerQuestion(question) {
  const q = question.toLowerCase().replaceAll('ё', 'е').trim()
  const language = detectLanguage(question)
  if (/^(салам|саламатсызбы|привет|здравствуй|здравствуйте|hello|hi|hey|merhaba|selam|你好|您好)[!.?\s]*$/iu.test(q)) {
    return { kg: 'Салам! Wildhaven боюнча эмнени билгиңиз келет?', ru: 'Здравствуйте! Что хотите узнать о Wildhaven?', en: 'Hello! What would you like to know about Wildhaven?', tr: 'Merhaba! Wildhaven hakkında ne öğrenmek istersiniz?', zh: '您好！请问您想了解 Wildhaven 的什么信息？' }[language]
  }
  const matchedEntries = knowledgeBase.filter((entry) => {
    const keywords = entry.keywords[language] ?? []
    return keywords.some((keyword) => q.includes(keyword.toLowerCase()))
  })
  const ticketAnswer = matchedEntries.find((entry) => entry.id === 'tickets')
  const hoursAnswer = matchedEntries.find((entry) => entry.id === 'hours')
  if (ticketAnswer && hoursAnswer) {
    return {
      kg: `${ticketAnswer.answers.kg} Зоопарк күн сайын 09:00дөн 20:00гө чейин иштейт.`,
      ru: `${ticketAnswer.answers.ru} ${hoursAnswer.answers.ru}`,
      en: `${ticketAnswer.answers.en} ${hoursAnswer.answers.en}`,
      tr: `${ticketAnswer.answers.tr} ${hoursAnswer.answers.tr}`,
      zh: `${ticketAnswer.answers.zh}${hoursAnswer.answers.zh}`,
    }[language]
  }
  if (matchedEntries.length) return matchedEntries[0].answers[language] ?? matchedEntries[0].answers.ru
  return { kg: 'Кечиресиз, бул маалымат азырынча жок. Жаныбарларды жана кызматтарды картадан 01–06-зоналар боюнча таба аласыз.', ru: 'К сожалению, я пока не знаю точный ответ. Животных и услуги можно найти на интерактивной карте в зонах 01–06.', en: 'Sorry, I do not have that information yet. You can find animals and services on the interactive map in zones 01–06.', tr: 'Üzgünüm, bu bilgi henüz bende yok. Hayvanları ve hizmetleri interaktif haritada 01–06. bölgelerde bulabilirsiniz.', zh: '抱歉，我暂时没有这方面的信息。您可以在互动地图的01至06区查找动物和服务。' }[language]
}

export default function LionMascot() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([{ from: 'leo', text: 'Привет! Я Leo. Чем помочь с прогулкой по Wildhaven?' }])
  const handleSendMessage = (question) => {
    const cleanQuestion = question.trim()
    if (!cleanQuestion) return
    setMessages((current) => [...current, { from: 'you', text: cleanQuestion }, { from: 'leo', text: answerQuestion(cleanQuestion) }])
    setDraft('')
  }
  return <div className="lion-mascot-widget">
    <AnimatePresence>{open && <motion.section aria-label="Leo Assistant Chat" className="leo-chat" initial={{ opacity: 0, y: 14, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
      <header className="leo-chat-header"><span className="leo-avatar"><LionIllustration /></span><span><strong>Leo Assistant</strong><small><i /> Wildhaven · онлайн</small></span><button aria-label="Закрыть чат" onClick={() => setOpen(false)} type="button"><X size={17} /></button></header>
      <div aria-live="polite" className="leo-chat-messages">{messages.map((message, index) => <div className={`leo-message leo-message-${message.from}`} key={`${index}-${message.text}`}><p>{message.text}</p></div>)}</div>
      <div className="leo-chat-suggestions">{suggestions.map((suggestion, index) => { const Icon = [MapPin, Sparkles, Ticket, Clock3][index]; return <button key={suggestion} onClick={() => handleSendMessage(suggestion)} type="button"><Icon size={13} />{suggestion}</button> })}</div>
      <form className="leo-chat-form" onSubmit={(event) => { event.preventDefault(); handleSendMessage(draft) }}><input aria-label="Ваш вопрос" onChange={(event) => setDraft(event.target.value)} placeholder="Спросите Leo…" value={draft} /><button aria-label="Отправить" type="submit"><Send size={16} /></button></form>
    </motion.section>}</AnimatePresence>
    <motion.button aria-label={open ? 'Закрыть чат Leo' : 'Открыть чат Leo Assistant'} aria-expanded={open} className="lion-mascot-button" onClick={() => setOpen((value) => !value)} type="button" animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.06 }} whileTap={{ scale: .96 }}><LionIllustration /><span className="lion-mascot-online" /></motion.button>
  </div>
}
