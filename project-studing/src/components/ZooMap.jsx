import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bird, Building2, MapPin, PawPrint, Shell, Sparkles, Ticket, LocateFixed, Route, X, ChevronUp, ChevronDown, Plus, Minus, RotateCcw } from 'lucide-react'

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

// Minimal walkway network in the map SVG's 1000 × 620 coordinate space.
// Each route also uses this exact path string, keeping the path and trail aligned.
const walkwayPaths = {
  predators: 'M 500 570 C 500 515 500 445 500 390 C 500 355 501 330 501 309 C 501 265 501 222 500 190 C 450 166 365 145 280 142.6',
  birds: 'M 500 570 C 500 515 500 445 500 390 C 500 355 501 330 501 309 C 590 309 675 307 728 291 Q 758 270 750 220 L 750 167',
  reptiles: 'M 500 570 C 500 515 500 445 500 390 C 430 390 340 377 250 360 Q 210 380 200 415',
  mammals: 'M 500 570 C 502 530 514 492 540 471',
  rare: 'M 500 570 C 500 515 500 445 500 390 C 500 355 501 330 501 309 L 500 282 Q 497 253 477 244 L 440 236',
  infrastructure: 'M 500 570 C 500 515 500 445 500 390 C 500 355 501 340 510 335',
}

function MapArtwork() {
  return (
    <svg aria-hidden="true" className="zoo-map-artwork" viewBox="0 0 1000 620" preserveAspectRatio="none">
      <defs>
        <pattern id="mapDots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.2" fill="#e8f1c5" opacity=".18" /></pattern>
        <pattern id="grassTexture" width="46" height="38" patternUnits="userSpaceOnUse"><path d="M7 21q3-9 6 0m7 8q2-7 5 0m11-15q3-8 6 0" fill="none" stroke="#eff6c9" strokeWidth="1.4" opacity=".28"/><circle cx="30" cy="29" r="1.3" fill="#527b3c" opacity=".2"/></pattern>
        <linearGradient id="mapLand" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b5d36e"/><stop offset="1" stopColor="#83aa4c"/></linearGradient>
        <linearGradient id="sectorPredators" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c2db79"/><stop offset="1" stopColor="#8fb458"/></linearGradient>
        <linearGradient id="sectorBirds" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c8df82"/><stop offset="1" stopColor="#90bd62"/></linearGradient>
        <linearGradient id="sectorReptiles" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#b1cf70"/><stop offset="1" stopColor="#83aa54"/></linearGradient>
        <linearGradient id="sectorMammals" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#c3dc7c"/><stop offset="1" stopColor="#8db65a"/></linearGradient>
        <linearGradient id="sectorRare" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#d0df8a"/><stop offset="1" stopColor="#9abb60"/></linearGradient>
        <filter id="mapWaterShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#263d29" floodOpacity=".24"/></filter>
        <filter id="mapObjectShadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#263d29" floodOpacity=".38"/></filter>
      </defs>
      <rect width="1000" height="620" fill="#d8e3b7"/>
      <path d="M34 78 Q42 32 102 33 L890 30 Q960 38 966 103 L963 525 Q952 603 891 607 L96 606 Q34 596 31 525Z" fill="url(#mapLand)" stroke="#668a45" strokeWidth="5"/>
      <path d="M34 78 Q42 32 102 33 L890 30 Q960 38 966 103 L963 525 Q952 603 891 607 L96 606 Q34 596 31 525Z" fill="url(#mapDots)"/>
      <path d="M34 78 Q42 32 102 33 L890 30 Q960 38 966 103 L963 525 Q952 603 891 607 L96 606 Q34 596 31 525Z" fill="url(#grassTexture)" opacity=".72"/>
      {/* Separate habitat clearings */}
      <path className="map-sector map-sector-predators" d="M76 72 Q210 48 357 79 Q420 95 430 170 L397 246 Q324 278 238 265 L106 292 Q62 222 76 72Z"/>
      <path className="map-sector map-sector-birds" d="M567 66 Q744 45 906 84 L925 228 Q860 258 786 244 Q693 280 598 238 Q558 170 567 66Z"/>
      <path className="map-sector map-sector-reptiles" d="M62 344 Q139 304 256 329 Q335 342 369 402 L331 539 Q210 572 77 504 Q52 436 62 344Z"/>
      <path className="map-sector map-sector-mammals" d="M389 380 Q490 350 599 385 Q727 360 855 404 Q920 440 927 512 Q801 570 652 546 Q526 578 407 543Z"/>
      <path className="map-sector map-sector-rare" d="M376 183 Q428 157 482 183 Q519 211 494 256 Q460 287 414 265 Q381 240 376 183Z"/>
      <path className="map-sector map-sector-services" d="M458 285 Q505 268 545 294 L555 351 Q528 380 486 363 Q459 337 458 285Z"/>
      <path className="map-entry-plaza" d="M431 535 Q500 512 569 535 L590 585 Q500 602 410 585Z"/>

      {/* Lake, rock groups and trees */}
      <path className="map-lake" d="M610 122 C638 95 688 100 704 136 C720 171 698 203 662 203 C626 202 594 177 596 148 C597 137 602 128 610 122Z" filter="url(#mapWaterShadow)"/>
      <path className="map-lake-highlight" d="M612 137 C630 116 661 111 681 123"/>
      <g className="map-water-pools"><path d="M278 450q24-18 47-2 13 11-3 20-31 12-49-2-8-7 5-16z"/><path d="M716 432q21-13 42 0 13 9-2 16-27 10-42-1-8-6 2-15z"/><path d="M143 273q16-10 31 0 8 7-3 12-19 7-30-1-6-5 2-11z"/></g>
      <g className="map-rocks"><path d="M115 113l14-23 19 2 11 21z"/><path d="M167 102l11-17 17 3 8 16z"/><path d="M329 111l13-20 18 2 8 18z"/><path d="M831 116l12-20 19 2 9 18z"/><path d="M846 326l14-24 21 4 7 20z"/><path d="M269 466l13-20 19 2 7 18z"/><path d="M715 493l14-22 20 3 7 19z"/><path d="M120 460l11-18 18 2 7 16z"/><path d="M281 118l9-14 14 1 6 13z"/><path d="M773 284l12-18 16 3 5 15z"/><path d="M611 506l10-17 15 2 6 15z"/><path d="M91 493l9-14 14 1 6 13z"/><path d="M401 324l8-13 13 1 5 12z"/></g>
      <g className="map-trees">
        <g transform="translate(115 166)"><rect x="-4" y="2" width="8" height="22" rx="3"/><circle cy="-8" r="23"/><circle cx="-12" cy="-2" r="13"/></g>
        <g transform="translate(360 112)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="11" cy="-1" r="12"/></g>
        <g transform="translate(542 163)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="11" cy="-1" r="12"/></g>
        <g transform="translate(890 170)"><rect x="-4" y="2" width="8" height="22" rx="3"/><circle cy="-8" r="23"/><circle cx="-12" cy="-1" r="13"/></g>
        <g transform="translate(110 382)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="12" cy="-1" r="12"/></g>
        <g transform="translate(347 487)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="-12" cy="-1" r="12"/></g>
        <g transform="translate(836 448)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="24"/><circle cx="12" cy="-1" r="13"/></g>
        <g transform="translate(247 101) scale(.72)"><rect x="-4" y="2" width="8" height="22" rx="3"/><circle cy="-8" r="24"/><circle cx="12" cy="-1" r="13"/></g>
        <g transform="translate(414 139) scale(.64)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="-12" cy="-1" r="12"/></g>
        <g transform="translate(807 100) scale(.8)"><rect x="-4" y="2" width="8" height="22" rx="3"/><circle cy="-8" r="23"/><circle cx="-12" cy="-1" r="13"/></g>
        <g transform="translate(287 355) scale(.78)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="12" cy="-1" r="12"/></g>
        <g transform="translate(594 278) scale(.7)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="-12" cy="-1" r="12"/></g>
        <g transform="translate(921 328) scale(.76)"><rect x="-4" y="2" width="8" height="22" rx="3"/><circle cy="-8" r="23"/><circle cx="12" cy="-1" r="13"/></g>
        <g transform="translate(738 528) scale(.68)"><rect x="-4" y="2" width="8" height="21" rx="3"/><circle cy="-8" r="22"/><circle cx="-12" cy="-1" r="12"/></g>
      </g>
      <g className="map-shrubs"><circle cx="213" cy="239" r="12"/><circle cx="228" cy="235" r="15"/><circle cx="243" cy="241" r="10"/><circle cx="693" cy="257" r="11"/><circle cx="709" cy="253" r="14"/><circle cx="723" cy="260" r="10"/><circle cx="326" cy="505" r="11"/><circle cx="341" cy="499" r="14"/><circle cx="355" cy="506" r="10"/><circle cx="779" cy="383" r="12"/><circle cx="794" cy="378" r="15"/><circle cx="809" cy="386" r="10"/><circle cx="154" cy="492" r="11"/><circle cx="169" cy="487" r="14"/><circle cx="184" cy="494" r="10"/></g>

      {/* One smooth path from the entrance to each habitat */}
      <g className="zoo-map-walkways" fill="none">
        {Object.entries(walkwayPaths).map(([zoneId, path]) => <path className="zoo-map-walkway" d={path} key={zoneId} />)}
      </g>
      <g className="map-animals" filter="url(#mapObjectShadow)">
        <g className="map-animal map-animal-lion" transform="translate(157 191)"><ellipse cx="26" cy="21" rx="20" ry="12"/><circle cx="43" cy="14" r="13"/><circle className="map-animal-face" cx="46" cy="15" r="5"/><path d="M9 20Q-2 14 2 5m10 23-2 12m13-10-1 10m15-12 2 12m9-15 5 9"/><path className="map-animal-detail" d="M43 13l8 2-5 5m-21 0q7 5 13 0"/></g>
        <g className="map-animal map-animal-bird" transform="translate(805 190)"><path d="M2 20q13-20 27 0 12-19 26-1-13-6-24 7-14-10-29-6z"/><circle cx="28" cy="19" r="3"/><path d="M29 22l-2 9m-3-1h7"/></g>
        <g className="map-animal map-animal-turtle" transform="translate(122 426)"><ellipse cx="24" cy="19" rx="20" ry="13"/><path d="M40 17q15-9 17 1-2 8-13 5m-31 5-4 7m15-5-2 7m16-8 4 7"/><path className="map-animal-detail" d="M9 18q15-17 30 0m-18-8v18m11-18v18"/></g>
        <g className="map-animal map-animal-elephant" transform="translate(597 463)"><path d="M5 22q0-19 19-19h15q19 0 19 18v14H7z"/><circle cx="42" cy="13" r="12"/><path d="M49 20q12 8 3 21l-4 2m-36-8-2 12m16-12-1 12m15-12 1 12"/><path className="map-animal-detail" d="M42 12h1"/></g>
        <g className="map-animal map-animal-panda" transform="translate(388 204)"><ellipse cx="23" cy="25" rx="20" ry="14"/><circle cx="41" cy="15" r="12"/><circle className="map-animal-ear" cx="33" cy="5" r="5"/><circle className="map-animal-ear" cx="49" cy="5" r="5"/><circle className="map-animal-patch" cx="37" cy="15" r="4"/><circle className="map-animal-patch" cx="47" cy="15" r="4"/><circle className="map-animal-face" cx="42" cy="21" r="2"/><path d="M9 34l-2 8m17-6v8m14-15 5 9"/></g>
      </g>
      <g className="map-service-kiosk" transform="translate(553 314)" filter="url(#mapObjectShadow)"><path d="M0 12h44v33H0z"/><path d="M-4 12 22 0l26 12z"/><rect x="17" y="25" width="11" height="20" rx="2"/><path d="M6 19h8m16 0h8"/></g>
      <g className="map-crossroads"><circle cx="501" cy="309" r="8"/><circle cx="501" cy="309" r="3"/></g>
      <g className="map-entrance-gate" filter="url(#mapObjectShadow)"><path className="map-gate-roof" d="M450 548 500 522 550 548z"/><path className="map-gate-beam" d="M458 548h84v8h-84z"/><path className="map-gate-pillar" d="M460 553h11v26h-11zm69 0h11v26h-11z"/><path className="map-gate-fence" d="M471 557h18v21h-18zm22 0h14v21h-14zm18 0h18v21h-18z"/><rect className="map-gate-sign" x="478" y="536" width="44" height="12" rx="3"/><text x="500" y="545">WILDHAVEN</text></g>
      <g className="map-art-labels"><text x="523" y="314">РАЗВИЛКА</text><text x="555" y="577">ГЛАВНЫЙ ВХОД</text><text x="613" y="222">ОЗЕРО</text></g>
    </svg>
  )
}

export default function ZooMap() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [focusedZone, setFocusedZone] = useState(null)
  const [hoveredZone, setHoveredZone] = useState(null)
  const [previewZone, setPreviewZone] = useState(null)
  const [sheetCollapsed, setSheetCollapsed] = useState(false)
  const [locationStatus, setLocationStatus] = useState('')
  const [zoom, setZoom] = useState(1)
  const isDimmed = (zone) => activeFilter !== 'all' && activeFilter !== zone.category
  const zoomByButton = (factor) => setZoom((current) => Math.min(3, Math.max(1, current * factor)))
  const selectZone = (zone, openPreview = false) => {
    setFocusedZone(zone.id)
    if (openPreview) setPreviewZone(zone)
  }
  const clearRoute = () => { setFocusedZone(null); setSelectedRoute(null) }
  const closeZonePreview = () => {
    setPreviewZone(null)
    setFocusedZone(null)
    setSelectedRoute(null)
  }
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
            <div className="zoo-map-canvas" style={{ transform: `scale(${zoom})` }}>
            <MapArtwork />
            {selectedRoute && <svg key={selectedRoute.id} className="zoo-map-route" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-label={`Маршрут от Главного входа до ${selectedRoute.title}`}><defs><filter id="routeGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path className="zoo-map-route-glow" d={walkwayPaths[selectedRoute.id]} fill="none"/><path className="zoo-map-route-line" d={walkwayPaths[selectedRoute.id]} fill="none"/><circle className="zoo-map-route-start" cx="500" cy="570" r="8"/></svg>}
            <div aria-label="Север" className="zoo-map-compass">N<span>↑</span></div>
            {zones.map((zone) => {
              const Icon = zone.icon
              const dimmed = isDimmed(zone)
              return <motion.button animate={{ opacity: focusedZone ? focusedZone === zone.id || hoveredZone === zone.id ? 1 : 0.5 : dimmed ? 0.28 : 1 }} className={`map-marker map-marker-${zone.category} ${focusedZone === zone.id ? 'is-selected' : ''} ${hoveredZone === zone.id ? 'is-highlighted' : ''}`} initial={false} key={zone.id} onClick={() => selectZone(zone, true)} style={{ left: `${zone.position[0]}%`, top: `${zone.position[1]}%` }} type="button" whileHover={{ y: -3 }} aria-label={`${zone.zoneNumber}: ${zone.title}`}>
                <span className="map-marker-pin"><Icon aria-hidden="true" size={18} /></span><span className="map-marker-number">{zone.zoneNumber}</span><span className="map-marker-tooltip">{zone.title}</span>
              </motion.button>
            })}
            </div>
            <div aria-label="Управление масштабом карты" className="zoo-map-controls"><button aria-label="Приблизить карту" disabled={zoom >= 3} onClick={() => zoomByButton(1.25)} type="button"><Plus size={17}/></button><output aria-live="polite">{Math.round(zoom * 100)}%</output><button aria-label="Отдалить карту" disabled={zoom <= 1} onClick={() => zoomByButton(0.8)} type="button"><Minus size={17}/></button><button aria-label="Сбросить масштаб карты" disabled={zoom === 1} onClick={() => setZoom(1)} type="button"><RotateCcw size={15}/></button></div>
            {selectedRoute && <motion.aside className="map-route-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} key={selectedRoute.id}><span className="map-route-card-icon"><Route size={17}/></span><span className="map-route-card-copy"><strong>{selectedRoute.title}</strong><small>{selectedRoute.description} · {Math.max(1, Math.round((Math.abs(selectedRoute.position[0] - 50) + Math.abs(selectedRoute.position[1] - 92)) / 18))} мин от входа</small></span><button onClick={clearRoute} type="button">Сбросить маршрут</button></motion.aside>}
          </div>
          <aside aria-label="Список зон зоопарка" className={`zoo-map-sidebar ${sheetCollapsed ? 'is-collapsed' : ''}`}>
            <button className="zoo-map-sheet-toggle" type="button" aria-expanded={!sheetCollapsed} onClick={() => setSheetCollapsed((value) => !value)}><span className="zoo-map-sheet-handle"/><strong>Зоны парка</strong>{sheetCollapsed ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</button>
            <div className="zoo-map-sidebar-heading"><span>Исследуйте</span><strong>Зоны парка</strong><small>Выберите точку на карте</small></div>
            <button className="zoo-map-location" onClick={locateVisitor} type="button"><LocateFixed size={15} /><span><strong>Где находится</strong><small>{locationStatus || 'Сейчас: Главный вход'}</small></span></button>
            {previewZone && (() => { const Icon = previewZone.icon; return <motion.section className="map-zone-preview" key={previewZone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} aria-label={`Информация: ${previewZone.title}`}><button className="map-zone-preview-close" onClick={(event) => { event.stopPropagation(); closeZonePreview() }} aria-label="Закрыть карточку" type="button"><X size={16}/></button><span className={`map-zone-preview-icon zoo-map-zone-${previewZone.category}`}><Icon size={21}/></span><small>ЗОНА {previewZone.zoneNumber}</small><strong>{previewZone.title}</strong><p>{previewZone.description}</p><div className="map-zone-preview-animals">{(previewZone.animals.length ? previewZone.animals : previewZone.services).map((item) => <span key={item}>{item}</span>)}</div><button className="map-zone-preview-action" onClick={() => setSelectedRoute(previewZone)} type="button"><Route size={15}/>{selectedRoute?.id === previewZone.id ? 'Маршрут построен' : 'Построить маршрут'}</button></motion.section> })()}
            <div className="zoo-map-zone-list">{zones.map((zone) => {
              const Icon = zone.icon
              return <button aria-pressed={focusedZone === zone.id} className={`zoo-map-list-item ${focusedZone === zone.id ? 'is-selected' : ''} ${hoveredZone === zone.id ? 'is-hovered' : ''} ${isDimmed(zone) ? 'is-dimmed' : ''}`} key={zone.id} onMouseEnter={() => setHoveredZone(zone.id)} onMouseLeave={() => setHoveredZone(null)} onFocus={() => setHoveredZone(zone.id)} onBlur={() => setHoveredZone(null)} onClick={() => selectZone(zone, true)} type="button"><span className={`zoo-map-list-icon zoo-map-zone-${zone.category}`}><Icon size={16} /></span><span><small>ЗОНА {zone.zoneNumber}</small><strong>{zone.title}</strong></span><span className="zoo-map-list-arrow">↗</span></button>
            })}</div>
            <div className="zoo-map-entrance"><Ticket size={16} /><span><strong>Главный вход</strong><small>Касса и начало маршрута</small></span></div>
          </aside>
        </div>
      </section>

    </main>
  )
}
