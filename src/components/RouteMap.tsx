import TrackMap from './TrackMap'
import type { ReportRoute } from '../data/reports'
import { isEarthProjectUrl, myMapsEmbedUrl } from '../lib/routeMaps'

export default function RouteMap({route,title}:{route?:ReportRoute;title:string}) {
  const earthUrl=route?.earthUrl && isEarthProjectUrl(route.earthUrl) ? route.earthUrl : null
  const embedUrl=route?.mapUrl ? myMapsEmbedUrl(route.mapUrl) : null
  const hasTrack=(route?.track?.length ?? 0)>=2
  if(!earthUrl && !embedUrl && !hasTrack)return null
  return <section className="route-report" aria-label={`Пройдений маршрут: ${title}`}>
    <div className="rule-heading"><h2>{route?.demo ? 'Демонстраційний маршрут' : 'Пройдений маршрут'}</h2><span />{earthUrl && <a href={earthUrl} target="_blank" rel="noopener noreferrer">Відкрити Google Earth ↗</a>}</div>
    {route?.demo && <p className="demo-route-notice">Тестова схема в горах: умовні точки, не перевірений GPS-трек стежок.</p>}
    {route?.description && <p className="route-description">{route.description}</p>}
    {hasTrack && <TrackMap track={route!.track!} name={route?.name || title} />}
    {!hasTrack && (embedUrl ? <div className="route-map-frame"><iframe key={embedUrl} src={embedUrl} title={`Карта пройденого маршруту — ${title}`} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /><a href={route!.mapUrl} target="_blank" rel="noopener noreferrer">Відкрити карту в окремій вкладці ↗</a></div> : earthUrl && <a className={`earth-route-card${route?.previewImage ? ' has-preview' : ''}`} href={earthUrl} target="_blank" rel="noopener noreferrer">
      {route?.previewImage && <img src={route.previewImage} alt={`Знімок маршруту — ${title}`} loading="lazy" />}
      <div className="earth-route-content"><span className="earth-route-icon" aria-hidden="true">◎</span><div><span className="report-tag">GOOGLE EARTH · 3D</span><h3>{title}</h3><p>Переглянути маршрут, точки подорожі та гірський рельєф у Google Earth.</p><span className="outline-button">Відкрити маршрут <span>↗</span></span></div></div>
    </a>)}
  </section>
}
