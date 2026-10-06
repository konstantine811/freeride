import PlayIcon from './PlayIcon'
import VideoPlayer from './VideoPlayer'
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { useParallax } from '../hooks/useParallax'
import { useSiteContent } from '../context/ContentContext'

export default function Sections() {
  const parallaxRef = useParallax()
  const {content,t,image} = useSiteContent()
  return <main>
    <section className="directions wrap section" id="directions"><div className="section-heading"><div><p className="eyebrow lined">{t('directions.eyebrow')}</p><h2>{t('directions.title')}</h2></div><a className="text-link" href="#direction-cards">{t('directions.all')} <span>→</span></a></div><div className="direction-grid" id="direction-cards">{(['riding','training','rental'] as const).map(kind=><a key={kind} className="direction-card" id={kind==='rental'?'rental':undefined} href={kind==='training'?'#about':'#events'}><img src={image(`directions.${kind}.image`)} alt={t(`directions.${kind}.title`)} loading="lazy" /><h3>{t(`directions.${kind}.title`)} <span>→</span></h3><p>{t(`directions.${kind}.description`)}</p></a>)}</div></section>
    <section className="about parallax-section" id="about" ref={parallaxRef} style={{'--about-image':`url(${JSON.stringify(image('about.image'))})`} as CSSProperties}><div className="wrap"><div className="about-copy"><p className="eyebrow lined">{t('about.eyebrow')}</p><h2>{t('about.title')}</h2><p>{t('about.intro')}</p><p>{t('about.description')}</p></div></div></section>
    <section className="film wrap section" id="film"><div><p className="eyebrow lined">{t('film.eyebrow')}</p><h2>{t('film.title')}</h2><p>{t('film.description')}</p></div><VideoPlayer className="film-preview" title={t('film.title')}><img src={image('film.image')} alt={t('film.title')} loading="lazy" /><span className="play"><PlayIcon /></span><span className="youtube"><PlayIcon /> YouTube</span></VideoPlayer></section>
    <section className="events section" id="events"><div className="wrap"><div className="section-heading"><div><p className="eyebrow lined">{t('events.eyebrow')}</p><h2>{t('events.title')}</h2></div><Link className="text-link" to="/events">УСІ ПОДІЇ <span>→</span></Link></div><div className="event-grid" id="event-list">{content.reports.slice(0,2).map(report=><article className="event" key={report.slug}><img src={report.image} alt={report.title} loading="lazy" /><div><p className="event-meta">{report.date} / {t('report.location')}</p><h3>{report.title}</h3><p>{report.description}</p><Link className="home-report-link" to={`/events/${report.slug}`}>Читати звіт <span>→</span></Link></div></article>)}</div></div></section>
  </main>
}
