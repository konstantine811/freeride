import PlayIcon from './PlayIcon'
import VideoPlayer from './VideoPlayer'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useSiteContent } from '../context/ContentContext'
import Brand from './Brand'
import AccountLink from './AccountLink'
import { Link } from 'react-router-dom'
import { useParallax } from '../hooks/useParallax'

export default function Hero() {
  const {content,t,image} = useSiteContent()
  const [menuOpen, setMenuOpen] = useState(false)
  const [loadedLayers, setLoadedLayers] = useState<Record<string, boolean>>({})
  const layersReady = content.heroLayers && ['background', 'rider', 'snow'].every(layer => loadedLayers[image(`hero.${layer}`)])
  const markLoaded = (url: string) => setLoadedLayers(previous => ({ ...previous, [url]: true }))
  const parallaxRef = useParallax('top')
  return <section className={`hero hero-depth parallax-section${layersReady ? ' layers-ready' : ''}`} id="home" ref={parallaxRef} style={{'--hero-image':`url(${JSON.stringify(image('hero.image'))})`} as CSSProperties}>
    {content.heroLayers && <div className="hero-scene" aria-hidden="true">
      <img key={`background-${image('hero.background')}`}  className="hero-layer hero-layer-far" src={image('hero.background')} alt="" fetchPriority="high" onLoad={() => markLoaded(image('hero.background'))} />
      <img key={`rider-${image('hero.rider')}`}  className="hero-layer hero-layer-rider" src={image('hero.rider')} alt="" onLoad={() => markLoaded(image('hero.rider'))} />
      <img key={`snow-${image('hero.snow')}`}  className="hero-layer hero-layer-snow" src={image('hero.snow')} alt="" onLoad={() => markLoaded(image('hero.snow'))} />
    </div>}
    <header className="header wrap">
      <Brand />
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="navigation">{menuOpen ? 'Закрити ✕' : 'Меню ☰'}</button>
      <nav id="navigation" className={menuOpen ? 'navigation open' : 'navigation'} aria-label="Головна навігація">
        <a href="#about" onClick={() => setMenuOpen(false)}>Про проєкт</a><a href="#rental" onClick={() => setMenuOpen(false)}>Прокат</a><a href="#about" onClick={() => setMenuOpen(false)}>Команда</a><Link to="/events" onClick={() => setMenuOpen(false)}>Події</Link>
        <AccountLink onNavigate={() => setMenuOpen(false)} />
      </nav>
      <Link className="join" to="/events">{t('hero.join')} <span>→</span></Link>
      <span className="language">UA <i /> EN</span>
    </header>
    <div className="hero-content wrap">
      <div className="hero-copy"><p className="eyebrow">{t('hero.eyebrow')}</p><h1>{t('hero.title')}</h1><p className="hero-description">{t('hero.description')}</p>
        <div className="hero-actions"><a className="primary-button" href="#directions">{t('hero.cta')} <span>→</span></a><VideoPlayer className="watch-button" title={t('film.title')}><span className="play small"><PlayIcon /></span> {t('hero.video')}</VideoPlayer></div>
      </div>
      <aside className="hero-note">СВОБОДА<br />ЛЮДИ<br />ГОРИ<strong>БІЛЬШЕ,<br />НІЖ СПОРТ</strong></aside>
    </div>
    <div className="hero-bottom wrap"><div className="slide-indicator">01 <span>/</span> 04 <i /></div><a href="#directions">ГОРТАЙ ВНИЗ <span>↓</span></a></div>
  </section>
}
