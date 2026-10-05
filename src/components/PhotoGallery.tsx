import { useEffect, useRef, useState } from 'react'
import { useSiteContent } from '../context/ContentContext'
import type { ReportPhoto } from '../data/reports'

export default function PhotoGallery({ photos }: { photos: ReportPhoto[] }) {
  const {t} = useSiteContent()
  const [active, setActive] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const move = (step: number) => setActive(index => index === null ? null : (index + step + photos.length) % photos.length)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || active === null) return
    if (!dialog.open) dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [active])

  const close = () => { dialogRef.current?.close(); setActive(null) }
  return <section className="photo-report">
    <div className="rule-heading"><h2>{t('report.photoTitle')}</h2><span /><button onClick={() => setActive(0)}>Дивитися всі фото →</button></div>
    <div className="photo-grid">{photos.slice(0, 3).map((photo, index) => <button key={photo.src} onClick={() => setActive(index)} aria-label={`Відкрити фото: ${photo.alt}`}><img src={photo.src} alt={photo.alt} loading="lazy" /><span aria-hidden="true">↗</span></button>)}</div>
    <dialog className="photo-dialog" ref={dialogRef} aria-label="Фотогалерея виїзду" onCancel={() => setActive(null)} onClick={event => { if (event.target === event.currentTarget) close() }} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); move(1) } }}>
      <button className="gallery-close" onClick={close} aria-label="Закрити галерею" autoFocus>✕</button>
      {active !== null && <div className="gallery-view"><img src={photos[active].src} alt={photos[active].alt} /><div className="gallery-controls"><button onClick={() => move(-1)} aria-label="Попереднє фото">←</button><p>{active + 1} / {photos.length}<span>{photos[active].alt}</span></p><button onClick={() => move(1)} aria-label="Наступне фото">→</button></div></div>}
    </dialog>
  </section>
}
