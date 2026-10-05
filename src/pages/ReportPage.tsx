import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import VideoPreview from '../components/VideoPreview'
import PhotoGallery from '../components/PhotoGallery'
import RouteMap from '../components/RouteMap'
import { useSiteContent } from '../context/ContentContext'

export default function ReportPage() {
  const {content,t,image} = useSiteContent()
  const reports = content.reports
  const { slug } = useParams()
  const index = reports.findIndex(report => report.slug === slug)
  if (index < 0) return <div className="editorial-page"><SiteHeader /><main className="wrap missing-page"><p className="eyebrow">404</p><h1>Історію не знайдено</h1><Link className="outline-button" to="/events">← Усі звіти</Link></main></div>
  const report = reports[index]
  const next = reports[(index + 1) % reports.length]
  return <div className="editorial-page report-page">
    <div className="report-backdrop" style={{ backgroundImage:`url(${JSON.stringify(report.image)})` }} aria-hidden="true" />
    <SiteHeader />
    <main className="wrap editorial-main">
      <section className="report-intro"><nav className="breadcrumbs" aria-label="Навігаційний шлях"><Link to="/events">Події</Link><span>/</span><span>Звіт</span></nav><aside className="report-motto">ЛЮДИ<br />СНІГ<br />СВОБОДА</aside><h1>{report.title}</h1><div className="report-info"><span>⌖ <span>Локація: {t('report.location')}</span></span><i /><span>♧ <span>Формат: {t('report.format')}</span></span></div></section>
      <div className="report-story-grid"><section className="report-story"><div className="rule-heading"><h2>{t('report.storyTitle')}</h2><span /></div>{report.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="report-date">{report.date}</p></section><section><div className="rule-heading"><h2>{t('report.videoTitle')}</h2><span /></div><VideoPreview image={report.image} title={report.title} /></section></div>
      <RouteMap key={`route-${report.slug}`} route={report.route} title={report.title} />
      <PhotoGallery key={report.slug} photos={report.photos} />
      <section className="team-impressions"><div className="rule-heading"><h2>{t('report.impressionsTitle')}</h2><span /></div><div className="impression-content"><div className="impression-author"><img src={image('report.avatar')} alt="Учасник гірського виїзду" loading="lazy" /><div><h3>{t('report.author')}</h3><p>{t('report.authorDescription')}</p></div></div><blockquote><span aria-hidden="true">“</span><p>{t('report.quote')}</p><span aria-hidden="true">”</span></blockquote></div></section>
      <nav className="report-pagination" aria-label="Інші звіти"><Link className="outline-button" to="/events">← <span>Усі звіти</span></Link><Link className="next-report" to={`/events/${next.slug}`}><span><small>Наступна історія</small>{next.title}</span><span>→</span></Link></nav>
    </main>
  </div>
}
