import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Download, ImagePlus, Layers3, RotateCcw, Sparkles, UploadCloud } from 'lucide-react'
import { scenarios, scenarioForRoom } from './data/scenarios'
import { applyCreatorStyle, generateGenericMakeover } from './services/mockGeneration'
import type { CreatorRefinement, GenerationResult, MakeoverLevel, RoomPreferences, RoomType, ScenarioKey } from './types'

type Page = 'welcome' | 'preferences' | 'generating' | 'result' | 'refining' | 'helen'
type Stage = 'before' | 'generic' | 'helen'

const roomTypes: RoomType[] = ['Living Room', 'Bedroom', 'Kitchen', 'Dining Room', 'Bathroom', 'Home Office', 'Other']
const styles = [
  { name: 'Warm Modern', image: '/demo/living-generic.jpg' },
  { name: 'Contemporary', image: '/demo/kitchen-generic.jpg' },
  { name: 'Scandinavian', image: '/demo/bedroom-generic.jpg' },
  { name: 'Japandi', image: '/demo/bathroom-generic.jpg' },
  { name: 'Cosy Traditional', image: '/demo/bedroom-helen.jpg' },
  { name: 'Minimalist', image: '/demo/living-before.jpg' },
  { name: 'Modern Country', image: '/demo/kitchen-helen.jpg' },
  { name: 'Surprise Me', image: '/demo/living-helen.jpg' },
]
const levels: { name: MakeoverLevel; description: string }[] = [
  { name: 'Refresh', description: 'Colour, textiles, lighting & styling' },
  { name: 'Makeover', description: 'Furniture, layout & a fresh new feel' },
  { name: 'Full Redesign', description: 'A bigger rethink of finishes & furniture' },
]
const preserveOptions = ['Flooring', 'Sofa', 'Bed', 'Main furniture', 'Windows & doors', 'Current layout']
const changeOptions = ['Wall colour', 'Furniture', 'Lighting', 'Curtains', 'Rugs', 'Decor', 'Storage', 'Layout']
const defaultPreferences: RoomPreferences = { roomType: 'Living Room', style: 'Warm Modern', level: 'Makeover', preserve: ['Flooring', 'Windows & doors'], change: ['Wall colour', 'Furniture', 'Lighting', 'Curtains', 'Rugs', 'Decor', 'Storage'] }
const genericMessages = ['Understanding your room', 'Working with what you want to keep', 'Exploring your chosen style', 'Putting your makeover together']
const helenMessages = ['Keeping your makeover direction', 'Adding warmth and texture', 'Finishing the little details']

function toggleItem(items: string[], value: string) { return items.includes(value) ? items.filter(item => item !== value) : [...items, value] }

function App() {
  const [page, setPage] = useState<Page>('welcome')
  const [showDemo, setShowDemo] = useState(false)
  const [original, setOriginal] = useState('')
  const [uploaded, setUploaded] = useState(false)
  const [preferences, setPreferences] = useState<RoomPreferences>(defaultPreferences)
  const [generic, setGeneric] = useState<GenerationResult | null>(null)
  const [refined, setRefined] = useState<CreatorRefinement | null>(null)
  const [stage, setStage] = useState<Stage>('generic')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadUrl = useRef<string | null>(null)

  useEffect(() => {
    if (page !== 'generating' && page !== 'refining') return
    setProgress(0)
    const max = page === 'generating' ? genericMessages.length : helenMessages.length
    const timer = window.setInterval(() => setProgress(current => Math.min(current + 1, max - 1)), 880)
    return () => window.clearInterval(timer)
  }, [page])

  useEffect(() => () => { if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current) }, [])

  function chooseDemo(key: ScenarioKey) {
    setOriginal(scenarios[key].images.before)
    setUploaded(false)
    setPreferences({ ...defaultPreferences, roomType: scenarios[key].label as RoomType, preserve: key === 'bedroom' ? ['Bed', 'Flooring', 'Windows & doors'] : key === 'bathroom' ? ['Flooring', 'Windows & doors', 'Current layout'] : defaultPreferences.preserve })
    setGeneric(null); setRefined(null); setShowDemo(false); setPage('preferences'); window.scrollTo(0, 0)
  }

  function handleUpload(file?: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return }
    if (uploadUrl.current) URL.revokeObjectURL(uploadUrl.current)
    const url = URL.createObjectURL(file)
    uploadUrl.current = url
    setOriginal(url); setUploaded(true); setError(''); setGeneric(null); setRefined(null); setPreferences(defaultPreferences); setPage('preferences'); window.scrollTo(0, 0)
  }

  function selectRoom(room: RoomType) {
    setPreferences(current => ({ ...current, roomType: room }))
    if (!uploaded) setOriginal(scenarios[scenarioForRoom(room)].images.before)
  }

  async function generate() {
    setPage('generating'); window.scrollTo(0, 0)
    try { const result = await generateGenericMakeover(original, preferences); setGeneric(result); setStage('generic'); setPage('result'); window.scrollTo(0, 0) }
    catch { setError('Something went wrong. Please try again.'); setPage('preferences') }
  }

  async function refine() {
    if (!generic) return
    setPage('refining'); window.scrollTo(0, 0)
    try { const result = await applyCreatorStyle(generic); setRefined(result); setStage('helen'); setPage('helen'); window.scrollTo(0, 0) }
    catch { setError('Something went wrong. Please try again.'); setPage('result') }
  }

  function startAgain() {
    setPage('welcome'); setShowDemo(false); setOriginal(''); setGeneric(null); setRefined(null); setStage('generic'); setError(''); setPreferences(defaultPreferences); window.scrollTo(0, 0)
  }

  const selectedScenario = scenarios[scenarioForRoom(preferences.roomType)]
  const currentResult = page === 'helen' ? refined : generic
  const currentImage = stage === 'before' ? original : stage === 'helen' ? refined?.image : generic?.image
  const stageLabel = stage === 'before' ? 'Original room' : stage === 'helen' ? "Helen's Touch" : 'First makeover'
  const isResult = page === 'result' || page === 'helen'

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={startAgain} aria-label="Our Wentworth Diaries home"><span className="brand-mark">owd<span>.</span></span><span className="brand-name">OUR WENTWORTH<br/>DIARIES</span></button>
        <div className="header-right"><span className="header-caption">A ROOM TO REIMAGINE</span><span className="header-line"/><span className="header-product">MAKEOVER STUDIO</span></div>
      </header>

      {page === 'welcome' && <main className="welcome">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> YOUR SPACE, NEW POSSIBILITIES</div>
          <h1>See what your room <em>could become.</em></h1>
          <p className="hero-copy">Upload a photo, choose the direction, and create a realistic makeover around your actual space.</p>
          <div className="welcome-actions">
            <button className="button button-primary" onClick={() => fileInput.current?.click()}><UploadCloud size={19}/> Upload Your Room <ArrowRight size={18}/></button>
            <button className="button button-text" onClick={() => setShowDemo(true)}>Try a Demo Room <ArrowRight size={17}/></button>
          </div>
          <p className="micro-copy">No account needed · Your photo stays in this browser</p>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="welcome-steps"><span><b>01</b> Upload a room</span><i/><span><b>02</b> Choose your direction</span><i/><span><b>03</b> See the possibility</span></div>
        </div>
        <div className="hero-visual" aria-label="Illustrative living room makeover preview">
          <div className="hero-photo hero-photo-main"><img src="/demo/living-helen.jpg" alt="Cosy living room makeover demo"/><span className="hero-photo-tag">A warmer way to live</span></div>
          <div className="hero-photo hero-photo-before"><img src="/demo/living-before.jpg" alt="Living room before demo"/><span>BEFORE</span></div>
          <div className="visual-caption"><span className="tiny-star">✳</span><span>See it before you change it.</span></div>
        </div>
        <input ref={fileInput} className="visually-hidden" type="file" accept="image/*" onChange={event => handleUpload(event.target.files?.[0])}/>
      </main>}

      {page === 'preferences' && <main className="inner-page preferences-page">
        <div className="page-top"><button className="back-link" onClick={startAgain}><ArrowLeft size={17}/> Back</button><span className="step-indicator">STEP 02 / 03</span></div>
        <div className="preferences-grid">
          <aside className="room-preview"><div className="preview-image"><img src={original} alt="Your selected room"/><span className="image-pill">{uploaded ? 'YOUR PHOTO' : 'DEMO ROOM'}</span></div><div className="preview-caption"><ImagePlus size={20}/><div><strong>{uploaded ? 'Your room is ready' : selectedScenario.description}</strong><span>{uploaded ? 'We’ll use this as your starting point.' : 'Choose a few details for the preview.'}</span></div></div></aside>
          <div className="preferences-content">
            <div className="eyebrow"><span className="eyebrow-dot"/> MAKE IT YOURS</div>
            <h2>Choose your <em>direction.</em></h2>
            <p className="section-intro">A few quick choices are all we need. We’ve picked sensible starting points for you.</p>
            <section className="form-section"><div className="section-heading"><span className="section-number">01</span><div><h3>Which room is it?</h3><p>Start with the space you’re imagining.</p></div></div><div className="chip-grid room-chips">{roomTypes.map(room => <button key={room} className={`chip ${preferences.roomType === room ? 'selected' : ''}`} onClick={() => selectRoom(room)}>{room}</button>)}</div></section>
            <section className="form-section"><div className="section-heading"><span className="section-number">02</span><div><h3>Pick a style</h3><p>Go with your instinct. You can try another later.</p></div></div><div className="style-grid">{styles.map(style => <button key={style.name} className={`style-card ${preferences.style === style.name ? 'selected' : ''}`} onClick={() => setPreferences({ ...preferences, style: style.name })}><img src={style.image} alt=""/><span>{style.name}</span>{preferences.style === style.name && <span className="style-check"><Check size={14}/></span>}</button>)}</div></section>
            <section className="form-section"><div className="section-heading"><span className="section-number">03</span><div><h3>How much should change?</h3><p>We’ll keep the room itself recognisable.</p></div></div><div className="level-grid">{levels.map(level => <button key={level.name} className={`level-card ${preferences.level === level.name ? 'selected' : ''}`} onClick={() => setPreferences({ ...preferences, level: level.name })}><span className="level-radio">{preferences.level === level.name && <span/>}</span><strong>{level.name}</strong><small>{level.description}</small></button>)}</div></section>
            <section className="form-section compact"><div className="section-heading"><span className="section-number">04</span><div><h3>What should stay?</h3><p>Mark anything you’d like to work around.</p></div></div><div className="chip-grid">{preserveOptions.map(item => <button key={item} className={`chip check-chip ${preferences.preserve.includes(item) ? 'selected' : ''}`} onClick={() => setPreferences({ ...preferences, preserve: toggleItem(preferences.preserve, item) })}>{preferences.preserve.includes(item) && <Check size={15}/>} {item}</button>)}<button className={`chip check-chip ${preferences.preserve.length === 0 ? 'selected' : ''}`} onClick={() => setPreferences({ ...preferences, preserve: [] })}>Nothing specific</button></div></section>
            <section className="form-section compact"><div className="section-heading"><span className="section-number">05</span><div><h3>What can change?</h3><p>We’ve selected the usual favourites.</p></div></div><div className="chip-grid">{changeOptions.map(item => <button key={item} className={`chip check-chip ${preferences.change.includes(item) ? 'selected' : ''}`} onClick={() => setPreferences({ ...preferences, change: toggleItem(preferences.change, item) })}>{preferences.change.includes(item) && <Check size={15}/>} {item}</button>)}</div></section>
            <div className="generate-area"><button className="button button-primary" onClick={generate}>Generate My Makeover <ArrowRight size={18}/></button><span>Illustrative prototype preview · no live image generation</span></div>
            {error && <p className="error" role="alert">{error}</p>}
          </div>
        </div>
      </main>}

      {(page === 'generating' || page === 'refining') && <main className="loading-page"><div className="loading-photo"><img src={page === 'generating' ? original : generic?.image} alt="Room preview"/><div className="loading-wash"/><div className="loading-center"><div className="loading-icon"><Sparkles size={27}/></div><span className="eyebrow">{page === 'generating' ? 'CREATING YOUR PREVIEW' : "ADDING HELEN'S TOUCH"}</span><h2>{page === 'generating' ? 'A new view is on its way.' : 'The little details make it yours.'}</h2><p aria-live="polite">{(page === 'generating' ? genericMessages : helenMessages)[progress]}</p><div className="progress-track"><span style={{ width: `${((progress + 1) / (page === 'generating' ? genericMessages.length : helenMessages.length)) * 100}%` }}/></div></div></div></main>}

      {isResult && currentResult && <main className="inner-page result-page">
        <div className="page-top"><button className="back-link" onClick={() => { setPage(page === 'helen' ? 'result' : 'preferences'); setStage('generic'); window.scrollTo(0, 0) }}><ArrowLeft size={17}/> {page === 'helen' ? 'First makeover' : 'Preferences'}</button><span className="step-indicator">{page === 'helen' ? 'THE FINISHING TOUCH' : 'YOUR RESULT'}</span></div>
        <div className="result-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> {page === 'helen' ? 'A LITTLE MORE YOU' : 'THE REVEAL'}</div><h2>{page === 'helen' ? <>Now with <em>Helen’s Touch.</em></> : <>Your {preferences.style === 'Surprise Me' ? 'Room' : preferences.style} <em>Makeover.</em></>}</h2><p>{page === 'helen' ? 'We kept your makeover direction and added some of the colour, warmth, texture and finishing details seen across Helen’s interiors.' : 'A fresh way to see the potential in your space.'}</p></div><div className="result-meta"><span>{preferences.roomType}</span><span>{preferences.level}</span><span>{preferences.preserve.length} {preferences.preserve.length === 1 ? 'item' : 'items'} preserved</span></div></div>
        <div className="result-layout"><div className="result-primary"><div className="stage-tabs" role="tablist" aria-label="Compare room stages">{([{ key:'before', label:'Original' }, { key:'generic', label:'First Makeover' }, ...(page === 'helen' ? [{ key:'helen', label:"Helen's Touch" }] : [])] as {key:Stage;label:string}[]).map(tab => <button key={tab.key} role="tab" aria-selected={stage === tab.key} className={stage === tab.key ? 'active' : ''} onClick={() => setStage(tab.key)}>{tab.label}</button>)}</div><div className="result-image"><img src={currentImage} alt={`${stageLabel} visual`} /><span className="image-pill">{stageLabel.toUpperCase()}</span></div><div className="image-caption"><span><Layers3 size={17}/> {uploaded ? 'Your original photo + illustrative sample makeover' : 'Illustrative demo transformation'}</span><span>{stage === 'before' ? '01' : stage === 'generic' ? '02' : '03'} / {page === 'helen' ? '03' : '02'}</span></div><div className="demo-notice">{uploaded ? 'This prototype displays your uploaded photo as the original. The makeover images are prepared examples for the selected room type; they were not generated from your photo.' : 'These prepared demo images show the makeover flow. Style, makeover level and keep/change choices are saved for the future image generator, but do not alter the static demo imagery.'}</div></div>
          <aside className="result-sidebar">{page === 'result' ? <><div className="sidebar-kicker">NEXT, MAKE IT YOURS</div><div className="helen-card"><span className="helen-symbol">✳</span><h3>A little more warmth?</h3><p>Refine this makeover with colours, textures and cosy finishing details seen across Helen’s home projects.</p><button className="button button-light" onClick={refine}>Add Helen’s Touch <ArrowRight size={18}/></button></div></> : <div className="touch-note"><span className="helen-symbol">✳</span><span>Inspired by the visual style documented across Helen’s home projects. These are app-generated ideas, not personal recommendations from Helen.</span></div>}
            <div className="plan-card"><div className="card-heading"><span className="sidebar-kicker">{page === 'helen' ? 'THE REFINEMENT' : 'YOUR PLAN'}</span><h3>{page === 'helen' ? 'What changed' : 'Makeover notes'}</h3></div>{page === 'helen' ? <ul className="change-list">{refined?.changes.map(item => <li key={item}><Check size={17}/>{item}</li>)}</ul> : <div className="plan-list">{generic?.plan.map(item => <div key={item.title}><h4>{item.title}</h4><p>{item.detail}</p></div>)}</div>}</div>
            <div className="result-actions"><button className="secondary-action" onClick={() => { setPage('preferences'); window.scrollTo(0, 0) }}><RotateCcw size={17}/> Try Another Style</button><a className="secondary-action" href={stage === 'before' ? original : stage === 'helen' ? refined?.image : generic?.image} download={`our-wentworth-diaries-${stage}.jpg`}><Download size={17}/> Save Image</a><button className="secondary-action" onClick={startAgain}><ArrowLeft size={17}/> Start Again</button></div>
          </aside></div>
      </main>}

      {showDemo && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowDemo(false) }}><div className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title"><div className="modal-head"><div><span className="eyebrow">EXPLORE A ROOM</span><h2 id="demo-title">Choose a demo room.</h2></div><button className="modal-close" onClick={() => setShowDemo(false)} aria-label="Close demo choices">×</button></div><p>Try the complete makeover flow using one of four illustrative rooms.</p><div className="demo-grid">{Object.values(scenarios).map(room => <button key={room.key} onClick={() => chooseDemo(room.key)}><img src={room.images.before} alt={`${room.label} before`}/><span><strong>{room.label}</strong><ArrowRight size={17}/></span></button>)}</div></div></div>}
      <footer className="site-footer"><span>OUR WENTWORTH DIARIES</span><span>Imagine what’s possible at home.</span><span>PROTOTYPE EXPERIENCE <ChevronDown size={13}/></span></footer>
    </div>
  )
}

export default App
