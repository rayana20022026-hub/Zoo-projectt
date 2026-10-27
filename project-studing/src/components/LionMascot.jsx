import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Send, MapPin, Sparkles, Ticket, Clock3 } from 'lucide-react'
const suggestions = ['Какие туры есть сегодня?', 'Где красная панда?', 'Где кафе и что там есть?', 'Где туалет?']
const hours = '09:00–19:00'

const tours = [
  { id: 'family', ru: 'Семейная экспедиция', kg: 'Үй-бүлөлүк тур', price: 1500, descriptionRu: 'Детские задания, близкое знакомство с животными и входной билет.', descriptionKg: 'Балдар үчүн тапшырмалар, жаныбарлар менен жакындан таанышуу жана кирүү билети.', scheduleRu: 'суббота и воскресенье в 11:00', scheduleKg: 'ишемби жана жекшемби күндөрү саат 11:00дө' },
  { id: 'overview', ru: 'Обзорный тур', kg: 'Обзордук тур', price: 1000, descriptionRu: 'Обзорная экскурсия по парку.', descriptionKg: 'Парк боюнча обзордук экскурсия.' },
]

function detectLanguage(text) {
  const value = String(text ?? '').toLocaleLowerCase()
  if (/\p{Script=Han}/u.test(value)) return 'zh'
  if (/[әғқұһі]/u.test(value) || /(сәлем|қайда|қанша|жануар|бүгін|жұмыс|арыстан|қайсы|бар ма|жұмыс істей)/u.test(value)) return 'kk'
  if (/[ңөү]/u.test(value) || /(салам|барбы|канча|кайда|бүгүн|үй.?бүл|жаныбар|саат|кайсы|кызыл|жырткыч|обзордук|канаттуулар|турлар|турдун|туру)/u.test(value)) return 'kg'
  if (/[çğıöşü]/u.test(value) || /(merhaba|nerede|aslan|hayvan|bugün|kaç|saat|ücret|bilet|parkı)/u.test(value)) return 'tr'
  if (/\p{Script=Cyrillic}/u.test(value)) return 'ru'
  if (/\p{Script=Latin}/u.test(value)) return 'en'
  return 'ru'
}

const LEO_SYSTEM_INSTRUCTION = 'Ты — Leo, официальный дружелюбный ассистент Wildhaven. Используй переданный JSON сайта. Для наличия животных authoritative source — assistantAnimals и unavailableAnimals; не считай упоминание животного в общем каталоге подтверждением, что оно живёт в парке. Отвечай точно, кратко и только об объекте, о котором спросили. Полный список давай только по прямой просьбе перечислить всё. Отвечай на языке посетителя, учитывай историю диалога. Не выдумывай сведений.'

function buildSystemMessage(siteData, language) {
  const languageNames = { kg: 'Kyrgyz', ru: 'Russian', en: 'English', kk: 'Kazakh', tr: 'Turkish', zh: 'Chinese' }
  return `${LEO_SYSTEM_INSTRUCTION}\nDetected visitor language: ${languageNames[language] ?? 'the language of the latest user message'} (${language}). Answer entirely in this language; never switch to Russian unless the visitor writes in Russian. Keep animal names and factual values accurate.\n\nПолный контекст сайта в JSON:\n${JSON.stringify(siteData)}`
}

function localized(record, field, language, dictionary) {
  const value = record?.[field]
  const key = record?.[`${field}Key`]
  if (value && typeof value === 'object') return value[language] ?? (key && dictionary?.[key]) ?? value[language === 'kg' ? 'ky' : 'ru'] ?? value.ru ?? ''
  return (key && dictionary?.[key]) || record?.[`${field}_${language}`] || record?.[`${field}_ru`] || (typeof value === 'string' ? value : '')
}

function matchesText(question, value) {
  const text = String(value ?? '').toLocaleLowerCase().replaceAll('ё', 'е')
  const queryTerms = question.split(/[^\p{L}\p{N}]+/u)
  return text.length > 1 && (question.includes(text) || text.split(/[^\p{L}\p{N}]+/u).some((part) => part.length > 3 && queryTerms.some((queryTerm) => queryTerm.includes(part))))
}

function answerQuestion(question, siteData, previousQuestion = '') {
  const language = detectLanguage(question)
  const kg = language === 'kg'
  const phrase = (ru, kgText, en, kk, tr, zh) => ({ ru, kg: kgText, en, kk, tr, zh }[language] ?? ru)
  const q = question.toLocaleLowerCase().replaceAll('ё', 'е')
  const dictionary = siteData?.translations?.[language] ?? siteData?.translations?.[kg ? 'ky' : 'ru'] ?? {}
  const data = siteData ?? {}
  const asksTours = /тур|экскурс|экспедиц|саякат|сапар|обзор|закулись|кормлен|азыктандыруу|түнкү|көшөгө|tour|excursion|price|cost|ticket|тур|саяхат|экскурсия|тур|tur|gezi|bilet|ツアー|票/iu.test(q)
  const listTours = /(какие|перечисл|список|все тур|бардык|кандай тур|турлар кандай|турлар бар|туры есть|сколько стоят туры|цены на туры|цены туров|турлар канча турат|турлардын баасы|which tours|list tours|all tours|tour options|tours available|what tours|қандай тур|турлар бар|турлар тізімі|hangi turlar|turlar neler)/iu.test(q)

  if (/^(салам|саламатсызбы|привет|здравствуй(те)?|добрый день|доброе утро|добрый вечер|hello|hi|hey|good morning|good evening|сәлем|сәлеметсіз бе|merhaba|你好)[!.?\s]*$/iu.test(q)) {
    return phrase('Здравствуйте! Я Leo, помощник парка Wildhaven. Спросите меня о турах, ценах, графике работы или животных.', 'Салам! Мен Leo, Wildhaven паркынын жардамчысымын. Турлар, баалар, иш убактысы же жаныбарлар тууралуу сураңыз.', 'Hello! I’m Leo, the Wildhaven park assistant. Ask me about tours, prices, opening hours, or animals.', 'Сәлем! Мен Wildhaven паркінің көмекшісі Leo-мын. Турлар, бағалар, жұмыс уақыты немесе жануарлар туралы сұраңыз.', 'Merhaba! Ben Wildhaven parkının yardımcısı Leo. Turlar, fiyatlar, çalışma saatleri veya hayvanlar hakkında soru sorabilirsiniz.', '你好！我是 Wildhaven 公园助手 Leo。欢迎询问游览项目、价格、开放时间或动物。')
  }
  const unavailableAnimal = (data.unavailableAnimals ?? []).find((animal) => animal.aliases.some((alias) => matchesText(q, alias)))
  if (unavailableAnimal) {
    const englishAlias = unavailableAnimal.aliases.find((alias) => /\p{Script=Latin}/u.test(alias))
    const translatedNames = {
      deer: { ru: 'оленя', kg: 'бугу', en: 'deer', kk: 'бұғыны', tr: 'geyiği', zh: '鹿' },
      giraffe: { ru: 'жирафа', kg: 'жираф', en: 'giraffe', kk: 'керікті', tr: 'zürafayı', zh: '长颈鹿' },
      elephant: { ru: 'слона', kg: 'пилди', en: 'elephant', kk: 'пілді', tr: 'filli', zh: '大象' },
    }
    const name = unavailableAnimal.names?.[language] ?? translatedNames[englishAlias]?.[language] ?? unavailableAnimal.names?.ru
    return phrase(`К сожалению, в нашем зоопарке пока нет ${name}.`, `Тилекке каршы, биздин зоопаркта азырынча ${name} жок.`, `Unfortunately, ${name} is not currently at our zoo.`, `Өкінішке қарай, хайуанаттар бағымызда әзірге ${name} жоқ.`, `Maalesef hayvanat bahçemizde şu anda ${name} yok.`, `很遗憾，我们的动物园目前没有${name}。`)
  }
  if (asksTours) {
    const allTours = data.assistantTours?.length ? data.assistantTours : (data.tours?.length ? data.tours : tours)
    const specific = allTours.find((tour) => [localized(tour, 'title', language, dictionary), tour.id, ...(tour.aliases ?? [])].some((term) => matchesText(q, term)))
    const selected = specific ? [specific] : listTours ? allTours : []
    if (!selected.length) return phrase('Какой тур вас интересует? Напишите его название.', 'Кайсы тур тууралуу билгиңиз келет? Турдун атын жазыңыз.', 'Which tour would you like to know about? Please share its name.', 'Қай тур туралы білгіңіз келеді? Атауын жазыңыз.', 'Hangi tur hakkında bilgi almak istersiniz? Adını yazın.', '您想了解哪项游览？请告诉我名称。')
    return selected.map((tour) => {
      const name = localized(tour, 'title', language, dictionary) || localized(tour, 'name', language, dictionary) || tour.id
      const description = localized(tour, 'description', language, dictionary)
      const schedule = localized(tour, 'days', language, dictionary) || tour.schedule || ''
      const admission = tour.includesAdmission ? phrase('Входной билет включён.', 'Кирүү билети кошулган.', 'Admission is included.', 'Кіру билеті қосылған.', 'Giriş bileti dahildir.', '包含入园门票。') : ''
      const durationUnit = phrase('мин.', 'мүнөт', 'min.', 'мин.', 'dk.', '分钟')
      return [name, tour.price != null ? `${tour.price} ${phrase('сом', 'сом', 'som', 'теңге', 'som', '索姆')}` : '', tour.durationMinutes ? `${tour.durationMinutes} ${durationUnit}` : '', description, schedule, admission].filter(Boolean).join(' · ')
    }).join('. ')
  }
  if (/саат|график|иштей|иш убак|когда открыт|время работы|работает|открыт|жабыл|ачыл|opening hours|when.*open|what time|hours|open today|жұмыс уақыты|қашан ашық|çalışma saat|ne zaman açık|营业时间|几点开门/iu.test(q)) {
    const hoursValue = data.openingHours?.[language] ?? data.openingHours?.[language === 'kg' ? 'ky' : 'ru'] ?? hours
    return phrase(`Парк работает ежедневно: ${hoursValue}.`, `Парк күн сайын ${hoursValue} иштейт.`, `The park is open daily: ${hoursValue}.`, `Саябақ күн сайын жұмыс істейді: ${hoursValue}.`, `Park her gün ${hoursValue} saatleri arasında açıktır.`, `公园每日开放：${hoursValue}。`)
  }
  const animals = data.assistantAnimals?.length ? data.assistantAnimals : (data.animals ?? [])
  const animalNames = (animal) => [localized(animal, 'name', language, dictionary), animal.names?.ru, animal.names?.ky, animal.id, animal.name_ru, animal.name_ky, animal.imageAlt, ...(animal.aliases ?? []), ...Object.values(animal.nameKey ? siteData?.translations ?? {} : {}).map((locale) => locale?.[animal.nameKey])].filter(Boolean)
  const isFollowUp = /(зон|кайсы жерде|кайсы зона|кайда|где|какая зона|where|location|find|which area|қайда|қай жерде|nerede|hangi bölge|在哪里|哪一区)/iu.test(q)
  const feeding = (data.feedings ?? []).find((item) => item.animals.some((name) => matchesText(q, name)))
  if (feeding && /(корм|азыкт|тамак|время|когда|саат|time|feed|feeding|when|уақыт|тамақтан|beslen|ne zaman|喂食|喂养)/iu.test(q)) {
    const names = feeding.names?.[language] ?? feeding.names?.ru ?? 'animals'
    const days = feeding.days?.[language] ?? feeding.days?.ru ?? ''
    return phrase(`Львов и тигров кормят ${feeding.days.ru} в ${feeding.time}. Тур с утренним кормлением стоит ${feeding.tourPrice} сом.`, `${feeding.names.ky} ${feeding.days.ky}, саат ${feeding.time}де азыктандырышат. Азыктандыруу туру ${feeding.tourPrice} сом турат.`, `${names} are fed ${days} at ${feeding.time}. The feeding tour costs ${feeding.tourPrice} som.`, `${names} ${days} күні сағат ${feeding.time}-де тамақтандырылады. Азықтандыру туры ${feeding.tourPrice} сом тұрады.`, `${names}, ${days} günü saat ${feeding.time}'de beslenir. Beslenme turu ${feeding.tourPrice} somdur.`, `${names}在${days} ${feeding.time}喂食。喂食游览价格为${feeding.tourPrice}索姆。`)
  }
  let animal = animals.find((item) => animalNames(item).some((name) => matchesText(q, name)))
  if (!animal && isFollowUp) animal = animals.find((item) => animalNames(item).some((name) => matchesText(previousQuestion.toLocaleLowerCase(), name)))
  if (animal) {
    const name = localized(animal, 'name', language, dictionary) || animal.id
    const zoneByCategory = { predators: '01', rare: '05', birds: '02', reptiles: '03', mammals: '04' }
    const zone = animal.zoneNumber ?? animal.zone ?? zoneByCategory[animal.categoryKey ?? animal.category]
    if (isFollowUp && zone) return phrase(`${name} находится в зоне ${zone}.`, `${name} ${zone}-зонада.`, `${name} is in Zone ${zone}.`, `${name} ${zone}-аймақта орналасқан.`, `${name}, ${zone}. bölgede bulunuyor.`, `${name}位于${zone}区。`)
    if (/(барбы|есть ли|имеется ли|можно увидеть|is there|do you have|can i see|are there|бар ма|var mı|可以看到|有.*吗)/iu.test(q)) {
      return phrase(`Да, ${name.toLocaleLowerCase()} есть в парке${zone ? `, зона ${zone}` : ''}.`, `Ооба, ${name.toLocaleLowerCase()} бар. Ал ${zone ? `${zone}-зонада` : 'паркта'} жашайт.`, `Yes, ${name.toLocaleLowerCase()} is at the park${zone ? `, in Zone ${zone}` : ''}.`, `Иә, саябақта ${name.toLocaleLowerCase()} бар${zone ? `, ${zone}-аймақта` : ''}.`, `Evet, parkta ${name.toLocaleLowerCase()} var${zone ? `, ${zone}. bölgede` : ''}.`, `有，公园里有${name}${zone ? `，位于${zone}区` : ''}。`)
    }
    const details = [localized(animal, 'fact', language, dictionary), localized(animal, 'habitat', language, dictionary), localized(animal, 'feeding', language, dictionary)].filter(Boolean)
    if (zone) details.push(phrase(`зона ${zone}`, `${zone}-зона`, `Zone ${zone}`, `${zone}-аймақ`, `${zone}. bölge`, `${zone}区`))
    if (details.length) return `${name}: ${details.join('. ')}`
  }
  const knownButUnavailable = (data.animals ?? []).find((item) => !animals.some((available) => available.id === item.id) && animalNames(item).some((name) => matchesText(q, name)))
  if (knownButUnavailable) {
    const name = localized(knownButUnavailable, 'name', language, dictionary) || knownButUnavailable.name_ru || knownButUnavailable.id
    return phrase(`К сожалению, в нашем зоопарке пока нет ${name.toLocaleLowerCase()}.`, `Тилекке каршы, биздин зоопаркта азырынча ${name.toLocaleLowerCase()} жок.`, `Unfortunately, ${name.toLocaleLowerCase()} is not currently at our zoo.`, `Өкінішке қарай, хайуанаттар бағымызда әзірге ${name.toLocaleLowerCase()} жоқ.`, `Maalesef hayvanat bahçemizde şu anda ${name.toLocaleLowerCase()} yok.`, `很遗憾，我们的动物园目前没有${name.toLocaleLowerCase()}。`)
  }
  const facility = Object.entries(data.facilities ?? {}).find(([key, value]) => [key, ...(value.aliases ?? []), ...Object.values(value).filter((item) => typeof item === 'string')].some((term) => matchesText(q, term)))
  if (facility) return facility[1][language] ?? facility[1].ru ?? JSON.stringify(facility[1])
  const zone = (data.zones ?? []).find((item) => q.includes(String(item.number)) || [...Object.values(item.names ?? {}), ...(item.aliases ?? [])].some((name) => matchesText(q, name)))
  if (zone) return phrase(`Зона ${zone.number}: ${zone.names?.[language] ?? zone.names?.ru ?? zone.name ?? ''}`, `${zone.number}-зона: ${zone.names?.ky ?? zone.names?.ru ?? zone.name ?? ''}`, `Zone ${zone.number}: ${zone.names?.en ?? zone.names?.ru ?? zone.name ?? ''}`, `${zone.number}-аймақ: ${zone.names?.kk ?? zone.names?.ru ?? zone.name ?? ''}`, `${zone.number}. bölge: ${zone.names?.tr ?? zone.names?.ru ?? zone.name ?? ''}`, `${zone.number}区：${zone.names?.zh ?? zone.names?.ru ?? zone.name ?? ''}`)
  if (/билет|цен|стоим|сколько|канча|баа|баасы|price|cost|how much|ticket price|бағасы|қанша тұрады|fiyat|ne kadar|票价|多少钱/iu.test(q)) {
    return phrase('Стоимость какого тура вас интересует? Напишите его название.', 'Кайсы турдун баасын билгиңиз келет? Турдун атын жазыңыз.', 'Which tour price would you like to know? Please share its name.', 'Қай турдың бағасын білгіңіз келеді? Атауын жазыңыз.', 'Hangi turun fiyatını öğrenmek istiyorsunuz? Adını yazın.', '您想了解哪项游览的价格？请告诉我名称。')
  }
  return phrase('Уточните, пожалуйста, название объекта, о котором спрашиваете.', 'Кайсы объект тууралуу сурап жатканыңызды тактап, атын жазыңызчы.', 'Could you clarify which place or animal you are asking about?', 'Қай орын немесе жануар туралы сұрап тұрғаныңызды нақтылаңызшы.', 'Hangi yer veya hayvanı sorduğunuzu belirtir misiniz?', '请问您想了解哪个地点或动物？')
}

function LionIllustration() {
  return <svg aria-hidden="true" viewBox="0 0 100 100" className="lion-mascot-art"><path fill="#c78337" d="M50 5c-8 0-12 5-16 10-7-2-14 2-15 10-8 2-12 9-10 17-6 6-7 14-2 21-4 8 0 16 7 19 1 9 8 14 17 13 5 6 13 7 20 3 7 4 15 3 20-3 9 1 16-4 17-13 7-3 11-11 7-19 5-7 4-15-2-21 2-8-2-15-10-17-1-8-8-12-15-10C62 10 58 5 50 5Z"/><path fill="#f2c47e" d="M50 22c-16 0-27 12-27 29 0 19 11 33 27 33s27-14 27-33C77 34 66 22 50 22Z"/><path fill="#70472e" d="M38 47c2-4 6-4 8 0-1 3-2 5-4 5s-3-2-4-5Zm16 0c2-4 6-4 8 0-1 3-2 5-4 5s-3-2-4-5Z"/><path fill="#754632" d="M45 58c0-3 10-3 10 0s-3 6-5 6-5-3-5-6Z"/><path d="M50 63c-1 5-5 6-8 3m8-3c1 5 5 6 8 3" fill="none" stroke="#754632" strokeWidth="2.5" strokeLinecap="round"/></svg>
}

export default function LionMascot({ siteData, onAskAI }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [previousQuestion, setPreviousQuestion] = useState('')
  const [messages, setMessages] = useState([{ from: 'leo', text: 'Привет! Я Leo. Чем помочь с прогулкой по Wildhaven?' }])
  const handleSendMessage = async (question) => {
    const cleanQuestion = question.trim()
    if (!cleanQuestion) return
    const userMessage = { from: 'you', text: cleanQuestion }
    setMessages((current) => [...current, userMessage])
    let reply
    try {
      reply = onAskAI
        ? await onAskAI({ system: buildSystemMessage(siteData, detectLanguage(cleanQuestion)), messages: [...messages, userMessage].map(({ from, text }) => ({ role: from === 'leo' ? 'assistant' : 'user', content: text })) })
        : answerQuestion(cleanQuestion, siteData, previousQuestion)
    } catch {
      reply = answerQuestion(cleanQuestion, siteData, previousQuestion)
    }
    const language = detectLanguage(cleanQuestion)
    const errorMessages = { ru: 'Не удалось подготовить ответ. Попробуйте ещё раз.', kg: 'Жооп түзүүдө ката кетти. Сураныч, кайра аракет кылыңыз.', en: 'I could not prepare a reply. Please try again.', kk: 'Жауап дайындау мүмкін болмады. Қайталап көріңіз.', tr: 'Yanıt hazırlanamadı. Lütfen tekrar deneyin.', zh: '暂时无法生成回复，请重试。' }
    setMessages((current) => [...current, { from: 'leo', text: typeof reply === 'string' ? reply : reply?.text ?? errorMessages[language] }])
    setPreviousQuestion(cleanQuestion)
    setDraft('')
  }
  return <div className="lion-mascot-widget">
    <AnimatePresence>{open && <motion.section aria-label="Leo Assistant Chat" className="leo-chat" initial={{ opacity: 0, y: 14, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}>
      <header className="leo-chat-header"><span className="leo-avatar"><LionIllustration /></span><span><strong>Leo Assistant</strong><small><i /> Wildhaven · онлайн</small></span><button aria-label="Закрыть чат" onClick={() => setOpen(false)} type="button"><X size={17} /></button></header>
      <div aria-live="polite" className="leo-chat-messages">{messages.map((message, index) => <div className={`leo-message leo-message-${message.from}`} key={`${index}-${message.text}`}><p>{message.text}</p></div>)}</div>
      <div className="leo-chat-suggestions">{suggestions.map((suggestion, index) => { const Icon = [Sparkles, MapPin, Ticket, Clock3][index]; return <button key={suggestion} onClick={() => handleSendMessage(suggestion)} type="button"><Icon size={13} />{suggestion}</button> })}</div>
      <form className="leo-chat-form" onSubmit={(event) => { event.preventDefault(); handleSendMessage(draft) }}><input aria-label="Ваш вопрос" onChange={(event) => setDraft(event.target.value)} placeholder="Спросите Leo…" value={draft} /><button aria-label="Отправить" type="submit"><Send size={16} /></button></form>
    </motion.section>}</AnimatePresence>
    <motion.button aria-label={open ? 'Закрыть чат Leo' : 'Открыть чат Leo Assistant'} aria-expanded={open} className="lion-mascot-button" onClick={() => setOpen((value) => !value)} type="button" animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.06 }} whileTap={{ scale: .96 }}><LionIllustration /><span className="lion-mascot-online" /></motion.button>
  </div>
}
