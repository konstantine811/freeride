import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSiteContent } from '../context/ContentContext'
import { isYouTubeChannelUrl, youtubeEmbedUrl } from '../lib/youtube'

export default function VideoPlayer({children,title,className}:{children:ReactNode;title:string;className:string}) {
  const {content}=useSiteContent()
  const [open,setOpen]=useState(false)
  const dialogRef=useRef<HTMLDialogElement>(null)
  const embed=youtubeEmbedUrl(content.videoUrl)
  const channel=content.texts['video.channelUrl']
  useEffect(()=>{
    if(!open)return
    dialogRef.current?.showModal()
    const previous=document.body.style.overflow
    document.body.style.overflow='hidden'
    return()=>{document.body.style.overflow=previous}
  },[open])
  const close=()=>{dialogRef.current?.close();setOpen(false)}
  return <><button type="button" className={className} onClick={()=>setOpen(true)} aria-label={`${title} — переглянути відео`} aria-haspopup="dialog">{children}</button>
    {open && createPortal(<dialog className="video-dialog" ref={dialogRef} aria-label={title} onCancel={()=>setOpen(false)} onClick={event=>{if(event.target===event.currentTarget)close()}}>
      <header className="video-dialog-heading"><div><p className="eyebrow">FREERIDE PROJECT · ВІДЕО</p><h2>{title}</h2></div><button className="video-dialog-close" onClick={close} aria-label="Закрити відео" autoFocus>✕</button></header>
      <div className="video-player-frame">{embed ? <iframe src={embed} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <div className="video-unavailable"><span aria-hidden="true">▷</span><p>Відео для перегляду на сайті ще не додано.</p></div>}</div>
      <div className="video-dialog-links"><a href={content.videoUrl} target="_blank" rel="noopener noreferrer">Дивитися на YouTube ↗</a>{channel && isYouTubeChannelUrl(channel) && <a href={channel} target="_blank" rel="noopener noreferrer">Наш канал YouTube ↗</a>}</div>
      <p className="video-dialog-note">Якщо відео недоступне у плеєрі, відкрий його на YouTube.</p>
    </dialog>,document.body)}
  </>
}
