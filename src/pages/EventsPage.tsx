import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import VideoPreview from '../components/VideoPreview'
import { useSiteContent } from '../context/ContentContext'

type Filter = 'all' | 'reports' | 'videos'

export default function EventsPage() {
  const {content,t,image} = useSiteContent()
  const reports = content.reports
  const [filter, setFilter] = useState<Filter>('all')
  return <div className="editorial-page events-page">
    <div className="events-backdrop" aria-hidden="true" style={{backgroundImage:`linear-gradient(180deg,#05152350,#07152222 35%,#071522e6 78%,#071522 100%),linear-gradient(90deg,#07152299,transparent 60%),url(${JSON.stringify(image('events.image'))})`}} />
    <SiteHeader />
    <main className="wrap editorial-main">
      <section className="events-intro"><p className="eyebrow">ЕКСПЕДИЦІЇ<br />ЛЮДИ<br />ГОРИ</p><h1>{t('events.pageTitle')}</h1><p>{t('events.description')}</p></section>
      <div className="event-filters" aria-label="Фільтр подій">{([{ value:'all', label:'Усі події' }, { value:'reports', label:'Звіти' }, { value:'videos', label:'Відео' }] as const).map(tab => <button key={tab.value} className={filter === tab.value ? 'selected' : ''} aria-pressed={filter === tab.value} onClick={() => setFilter(tab.value)}>{tab.label}</button>)}</div>
      {filter !== 'videos' && <section className="report-cards" aria-label="Звіти з виїздів">{reports.map((report, index) => <Link key={report.slug} to={`/events/${report.slug}`} className={`report-card${index === 0 ? ' featured' : ''}`}>
        <img src={report.image} style={{ objectPosition:report.position }} alt="" loading={index === 0 ? 'eager' : 'lazy'} />
        <div className="report-card-copy"><span className="report-tag">ЗВІТ</span><h2>{report.title}</h2>{index === 0 && <><p>{report.description}</p><span className="outline-button">Читати звіт <span>→</span></span></>}</div>{index !== 0 && <span className="card-arrow" aria-hidden="true">→</span>}
      </Link>)}</section>}
      {filter !== 'reports' && <section className="trip-videos" id="trip-videos"><div className="rule-heading"><h2>{t('events.videoTitle')}</h2><span /><a href={content.texts['video.channelUrl'] || content.videoUrl} target="_blank" rel="noreferrer">Дивитися всі відео →</a></div><div className="video-grid"><VideoPreview image={image('directions.riding.image')} title="Фрірайд у Карпатах" /><VideoPreview image={image('film.image')} title="Світанки в горах" /></div></section>}
    </main>
  </div>
}
