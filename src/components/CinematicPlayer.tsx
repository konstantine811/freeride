import {useEffect,useRef,useState} from 'react'
import type Plyr from 'plyr'
import 'plyr/dist/plyr.css'

export default function CinematicPlayer({videoId,title,poster,videoUrl,channelUrl}:{videoId:string;title:string;poster:string;videoUrl:string;channelUrl?:string}) {
  const root=useRef<HTMLDivElement>(null)
  const [message,setMessage]=useState('Завантажуємо відео…')
  useEffect(()=>{
    let cancelled=false
    let player:Plyr | undefined
    let timer:ReturnType<typeof setTimeout> | undefined
    setMessage('Завантажуємо відео…')
    void import('plyr').then(({default:Player})=>{
      if(cancelled || !root.current)return
      const element=document.createElement('div')
      element.dataset.plyrProvider='youtube';element.dataset.plyrEmbedId=videoId;element.setAttribute('aria-label',title)
      root.current.appendChild(element)
      player=new Player(element,{
        autoplay:true,ratio:'16:9',iconUrl:'/icons/plyr.svg',
        controls:['play-large','play','rewind','fast-forward','progress','current-time','duration','mute','volume','settings','fullscreen'],
        settings:['speed'],hideControls:true,keyboard:{focused:true,global:false},
        youtube:{noCookie:true,rel:0,iv_load_policy:3},
        i18n:{play:'Відтворити',pause:'Пауза',restart:'З початку',rewind:'Назад на {seektime} с',fastForward:'Вперед на {seektime} с',seek:'Перемотування',seekLabel:'{currentTime} із {duration}',played:'Відтворено',buffered:'Завантажено',currentTime:'Поточний час',duration:'Тривалість',volume:'Гучність',mute:'Вимкнути звук',unmute:'Увімкнути звук',enableCaptions:'Увімкнути субтитри',disableCaptions:'Вимкнути субтитри',enterFullscreen:'Повний екран',exitFullscreen:'Вийти з повного екрана',settings:'Налаштування',speed:'Швидкість',normal:'Звичайна',menuBack:'Назад',quality:'Якість',loop:'Повтор',all:'Усі',disabled:'Вимкнено'},
      })
      if(poster)player.poster=poster
      player.on('ready',()=>{
        if(cancelled)return
        clearTimeout(timer);setMessage('')
        const controls=root.current?.querySelector('.plyr__controls')
        if(!controls || controls.querySelector('.player-film-info'))return
        const info=document.createElement('div');info.className='player-film-info'
        const emblem=document.createElement('span');emblem.className='player-film-emblem';emblem.textContent='△';emblem.setAttribute('aria-hidden','true')
        const copy=document.createElement('div')
        const heading=document.createElement('strong');heading.textContent=title
        const subtitle=document.createElement('span');subtitle.className='video-dialog-links'
        const addLink=(href:string,label:string)=>{const link=document.createElement('a');link.href=href;link.textContent=label;link.target='_blank';link.rel='noopener noreferrer';subtitle.append(link)}
        addLink(videoUrl,'Дивитися на YouTube ↗')
        if(channelUrl)addLink(channelUrl,'Канал YouTube ↗')
        copy.append(heading,subtitle);info.append(emblem,copy)
        const transport=document.createElement('div');transport.className='player-transport'
        for(const name of ['rewind','play','fast-forward']){const button=controls.querySelector(`[data-plyr="${name}"]`);if(button)transport.append(button)}
        const options=document.createElement('div');options.className='player-options'
        for(const selector of ['.plyr__volume','.plyr__menu','[data-plyr="fullscreen"]']){const control=controls.querySelector(selector);if(control)options.append(control)}
        controls.append(info,transport,options)
      })
      player.on('error',()=>{if(!cancelled){clearTimeout(timer);setMessage('Відео недоступне у плеєрі. Відкрий його на YouTube.')}})
      timer=setTimeout(()=>{if(!cancelled)setMessage('Не вдалося підключити відео. Спробуй відкрити його на YouTube.')},20000)
    }).catch(()=>{if(!cancelled)setMessage('Не вдалося завантажити плеєр. Відкрий відео на YouTube.')})
    return()=>{cancelled=true;clearTimeout(timer);player?.destroy();root.current?.replaceChildren()}
  },[videoId,title,poster,videoUrl,channelUrl])
  return <div className="cinematic-player"><div ref={root} className="cinematic-player-root" />{message && <div className="cinematic-player-status" role="status"><p>{message}</p><div className="video-dialog-links"><a href={videoUrl} target="_blank" rel="noopener noreferrer">Дивитися на YouTube ↗</a>{channelUrl && <a href={channelUrl} target="_blank" rel="noopener noreferrer">Канал YouTube ↗</a>}</div></div>}</div>
}
