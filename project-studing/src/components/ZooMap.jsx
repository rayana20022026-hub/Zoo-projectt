import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bird, Building2, MapPin, PawPrint, Shell, Sparkles, Ticket, LocateFixed, Route, Plus, Minus, RotateCcw } from 'lucide-react'

const zoneCategories = [
  { id: 'all', label: 'Все зоны' }, { id: 'predators', label: 'Хищники' }, { id: 'birds', label: 'Птицы' },
  { id: 'reptiles', label: 'Рептилии' }, { id: 'mammals', label: 'Млекопитающие' }, { id: 'rare', label: 'Редкие виды' }, { id: 'infrastructure', label: 'Кафе и сервисы' },
]

const zones = [
  { id: 'predators', category: 'predators', zoneNumber: '01', title: 'Зона хищников', locationInfo: 'Северный сектор, вдоль центральной аллеи.', animals: ['Амурские тигры', 'Львы', 'Рыси', 'Волки'], icon: PawPrint, position: [28, 23], directions: 'От главного входа идите прямо по центральной аллее и следуйте указателям к северному сектору.', description: 'Зона крупных хищников с обзорными площадками у вольеров.' },
  { id: 'birds', category: 'birds', zoneNumber: '02', title: 'Павильон птиц', locationInfo: 'Восточный сектор, рядом с озером.', animals: ['Попугаи', 'Фламинго', 'Павлины', 'Орлы'], icon: Bird, position: [75, 27], directions: 'От главного входа пройдите по центральной аллее и поверните направо к озеру.', description: 'Павильон и прогулочная зона для наблюдения за птицами.' },
  { id: 'reptiles', category: 'reptiles', zoneNumber: '03', title: 'Дом рептилий', locationInfo: 'Западный сектор, рядом с крытой галереей.', animals: ['Черепахи', 'Игуаны', 'Змеи', 'Ящерицы'], icon: Shell, position: [20, 67], directions: 'От главного входа двигайтесь по центральной аллее и поверните налево к крытой галерее.', description: 'Крытый павильон с отдельными террариумами.' },
  { id: 'mammals', category: 'mammals', zoneNumber: '04', title: 'Зона млекопитающих', locationInfo: 'Южная поляна, вдоль большой прогулочной дорожки.', animals: ['Слоны', 'Жирафы', 'Зебры', 'Олени'], icon: PawPrint, position: [54, 76], directions: 'От главного входа следуйте по центральной аллее к южной поляне.', description: 'Открытые вольеры и смотровые площадки для спокойного наблюдения.' },
  { id: 'rare', category: 'rare', zoneNumber: '05', title: 'Редкие виды', locationInfo: 'Западная поляна, рядом с тихой прогулочной тропой.', animals: ['Красная панда', 'Амурский тигр'], icon: Sparkles, position: [44, 38], directions: 'От главного входа идите по центральной аллее и следуйте указателям к западной поляне.', description: 'Зона знакомства с редкими и уязвимыми видами.' },
  { id: 'infrastructure', category: 'infrastructure', zoneNumber: '06', title: 'Инфраструктура и кафе', locationInfo: 'У главного входа и вдоль центральной аллеи.', animals: [], services: ['Касса', 'Кафе', 'Зона отдыха', 'Туалеты'], icon: Building2, position: [51, 54], directions: 'Касса находится у главного входа. Кафе и зоны отдыха отмечены вдоль центральной аллеи.', description: 'Здесь можно купить билеты, отдохнуть и найти необходимые сервисы.' },
]

function MapArtwork() {
  return (
    <svg aria-hidden="true" className="zoo-map-artwork" viewBox="0 0 1000 620" preserveAspectRatio="none">
      <defs>
        <pattern id="mapDots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1" fill="#b4c78d" opacity=".16" /></pattern>
        <linearGradient id="mapLand" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#243b2c" /><stop offset="1" stopColor="#17291f" /></linearGradient>
      </defs>
      <rect width="1000" height="620" fill="url(#mapLand)" /><rect width="1000" height="620" fill="url(#mapDots)" />
      <path d="M42 88 Q170 18 310 78 T572 88 Q730 35 944 94 L970 470 Q820 592 670 540 T390 562 Q200 620 35 490Z" fill="#355139" stroke="#66805a" strokeWidth="3" />
      <path d="M61 92 Q193 42 304 96 T548 110 Q729 60 924 112 L943 460 Q800 555 666 513 T384 534 Q207 583 62 475Z" fill="#304a35" />
      <path d="M80 313 C226 287 282 333 398 305 S629 269 738 306 848 350 924 317" fill="none" stroke="#d1c59a" strokeWidth="28" strokeLinecap="round" opacity=".9" />
      <path d="M504 106 C484 191 514 236 500 308 S480 442 516 526" fill="none" stroke="#d1c59a" strokeWidth="22" strokeLinecap="round" opacity=".85" />
      <path d="M630 140 C710 110 816 138 835 196 C848 237 793 267 724 248 C665 231 601 177 630 140Z" fill="#397c78" stroke="#8db7a1" strokeWidth="4" />
      <g fill="#6d8a57" opacity=".85"><circle cx="118" cy="177" r="34"/><circle cx="173" cy="199" r="24"/><circle cx="295" cy="150" r="30"/><circle cx="379" cy="197" r="21"/><circle cx="858" cy="373" r="35"/><circle cx="788" cy="427" r="25"/><circle cx="326" cy="438" r="34"/><circle cx="175" cy="390" r="27"/><circle cx="657" cy="467" r="30"/><circle cx="875" cy="171" r="23"/></g>
      <g fill="#a2b77b" opacity=".7"><circle cx="119" cy="177" r="12"/><circle cx="295" cy="150" r="10"/><circle cx="858" cy="373" r="12"/><circle cx="326" cy="438" r="11"/><circle cx="657" cy="467" r="10"/></g>
      <g fill="#d7c890" fontFamily="sans-serif" fontSize="16" fontWeight="700" letterSpacing="2"><text x="65" y="565">ГЛАВНЫЙ ВХОД</text><text x="734" y="119">ОЗЕРО</text><text x="810" y="510">ЮЖНАЯ ПОЛЯНА</text></g>
      <g fill="#f0dfa8"><circle cx="501" cy="309" r="10"/><path d="M496 309h10M501 304v10" stroke="#304a35" strokeWidth="2"/></g>
    </svg>
  )
}

export default function ZooMap() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [focusedZone, setFocusedZone] = useState(null)
  const [locationStatus, setLocationStatus] = useState('')
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const isDimmed = (zone) => activeFilter !== 'all' && activeFilter !== zone.category
  const selectZone = (zone) => { setFocusedZone(zone.id); setSelectedRoute(zone) }
  const clearRoute = () => { setFocusedZone(null); setSelectedRoute(null) }
  const locateVisitor = () => {
    setLocationStatus('Ваше местоположение: Главный вход')
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('Вы на территории Wildhaven · маршрут начинается от Главного входа'),
      () => setLocationStatus('Геолокация недоступна · маршрут начинается от Главного входа'),
      { timeout: 5000, maximumAge: 60000 },
    )
  }

  return (
    <main className="zoo-map-page">
      <section className="zoo-map-section section-wrap">
        <div className="zoo-map-heading">
          <span className="section-eyebrow"><MapPin size={14} /> WILDHAVEN · ПЛАН ПОСЕЩЕНИЯ</span>
          <h1>Карта зоопарка</h1>
          <p>Выберите категорию или отметку на схеме, чтобы спланировать прогулку по Wildhaven.</p>
        </div>
        <div aria-label="Категории карты зоопарка" className="zoo-map-filters" role="group">
          {zoneCategories.map((category) => <button aria-pressed={activeFilter === category.id} className={`category-chip ${activeFilter === category.id ? 'is-active' : ''}`} key={category.id} onClick={() => setActiveFilter(category.id)} type="button">{category.label}</button>)}
        </div>

        <div className="zoo-map-layout">
          <div aria-label="Схема территории зоопарка" className="zoo-map-board">
            <div className="zoo-map-canvas" style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}>
            <MapArtwork />
            {selectedRoute && <svg className="zoo-map-route" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-label={`Маршрут от Главного входа до ${selectedRoute.title}`}><defs><filter id="routeGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path className="zoo-map-route-glow" d={`M 501 309 C 501 309, 500 330, 500 350 S ${selectedRoute.position[0] * 10} ${selectedRoute.position[1] * 6.2}, ${selectedRoute.position[0] * 10} ${selectedRoute.position[1] * 6.2}`} fill="none"/><path className="zoo-map-route-line" d={`M 501 309 C 501 309, 500 330, 500 350 S ${selectedRoute.position[0] * 10} ${selectedRoute.position[1] * 6.2}, ${selectedRoute.position[0] * 10} ${selectedRoute.position[1] * 6.2}`} fill="none"/><circle className="zoo-map-route-start" cx="501" cy="309" r="8"/></svg>}
            <div aria-label="Север" className="zoo-map-compass">N<span>↑</span></div>
            {zones.map((zone) => {
              const Icon = zone.icon
              const dimmed = isDimmed(zone)
              return <motion.button animate={{ opacity: focusedZone ? focusedZone === zone.id ? 1 : 0.5 : dimmed ? 0.28 : 1, scale: focusedZone === zone.id ? 1.22 : 1 }} className={`map-marker map-marker-${zone.category} ${focusedZone === zone.id ? 'is-selected' : ''}`} initial={false} key={zone.id} onClick={() => selectZone(zone)} style={{ left: `${zone.position[0]}%`, top: `${zone.position[1]}%`, '--map-counter-rotation': `${-rotation}deg` }} type="button" whileHover={{ y: -8, scale: 1.1 }} aria-label={`${zone.zoneNumber}: ${zone.title}`}>
                <span className="map-marker-pin"><Icon aria-hidden="true" size={18} /></span><span className="map-marker-number">{zone.zoneNumber}</span><span className="map-marker-tooltip">{zone.title}</span>
              </motion.button>
            })}
            </div>
            {selectedRoute && <motion.aside className="map-route-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} key={selectedRoute.id}><span className="map-route-card-icon"><Route size={17}/></span><span className="map-route-card-copy"><strong>{selectedRoute.title}</strong><small>{selectedRoute.description} · {Math.max(1, Math.round((Math.abs(selectedRoute.position[0] - 50) + Math.abs(selectedRoute.position[1] - 50)) / 18))} мин от входа</small></span><button onClick={clearRoute} type="button">Сбросить маршрут</button></motion.aside>}
            <div className="zoo-map-controls"><button aria-label="Увеличить карту" onClick={() => setZoom((prev) => Math.min(prev + 0.25, 2.5))} type="button"><Plus size={17}/></button><button aria-label="Уменьшить карту" onClick={() => setZoom((prev) => Math.max(prev - 0.25, 1))} type="button"><Minus size={17}/></button><button aria-label="Повернуть карту на 90 градусов" onClick={() => setRotation((prev) => (prev + 90) % 360)} title="Повернуть карту" type="button"><RotateCcw size={15}/></button></div>
          </div>
          <aside aria-label="Список зон зоопарка" className="zoo-map-sidebar">
            <div className="zoo-map-sidebar-heading"><span>Исследуйте</span><strong>Зоны парка</strong><small>Выберите точку на карте</small></div>
            <button className="zoo-map-location" onClick={locateVisitor} type="button"><LocateFixed size={15} /><span><strong>Где находится</strong><small>{locationStatus || 'Сейчас: Главный вход'}</small></span></button>
            <div className="zoo-map-zone-list">{zones.map((zone) => {
              const Icon = zone.icon
              return <button className={`zoo-map-list-item ${focusedZone === zone.id ? 'is-selected' : ''} ${isDimmed(zone) ? 'is-dimmed' : ''}`} key={zone.id} onClick={() => selectZone(zone)} type="button"><span className={`zoo-map-list-icon zoo-map-zone-${zone.category}`}><Icon size={16} /></span><span><small>ЗОНА {zone.zoneNumber}</small><strong>{zone.title}</strong></span><span className="zoo-map-list-arrow">↗</span></button>
            })}</div>
            <div className="zoo-map-entrance"><Ticket size={16} /><span><strong>Главный вход</strong><small>Касса и начало маршрута</small></span></div>
          </aside>
        </div>
      </section>

    </main>
  )
}
