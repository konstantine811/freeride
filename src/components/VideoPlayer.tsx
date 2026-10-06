import PlayIcon from './PlayIcon'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSiteContent } from '../context/ContentContext'
import CinematicPlayer from './CinematicPlayer'
import { isYouTubeChannelUrl, youtubeVideoId } from '../lib/youtube'

export default function VideoPlayer({children,title,className,poster}:{children:ReactNode;title:string;className:string;poster?:string}) {
  const {content,image}=useSiteContent()
  const [open,setOpen]=useState(false)
  const dialogRef=useRef<HTMLDialogElement>(null)
  const videoId=youtubeVideoId(content.videoUrl)
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
      <div className="video-player-frame">
        <button className="video-dialog-close" onClick={close} aria-label="Закрити відео" autoFocus><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
        {videoId ? <CinematicPlayer videoId={videoId} title={title} poster={poster ?? image('film.image')} videoUrl={content.videoUrl} channelUrl={channel && isYouTubeChannelUrl(channel) ? channel : undefined} /> : <div className="video-unavailable"><h2>{title}</h2><span aria-hidden="true"><PlayIcon /></span><p>Відео для перегляду на сайті ще не додано.</p><div className="video-dialog-links"><a href={content.videoUrl} target="_blank" rel="noopener noreferrer">Дивитися на YouTube ↗︎</a>{channel && isYouTubeChannelUrl(channel) && <a href={channel} target="_blank" rel="noopener noreferrer">Наш канал YouTube ↗︎</a>}</div></div>}
      </div>
    </dialog>,document.body)}
  </>
}
