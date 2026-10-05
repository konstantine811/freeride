import { useEffect, useRef, useState } from 'react'
import type { Map as MapboxMap } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function TrackMap({track,name}:{track:{lat:number;lng:number}[];name:string}) {
  const container=useRef<HTMLDivElement>(null)
  const mapRef=useRef<MapboxMap | null>(null)
  const token=import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim()
  const configured=!!token?.startsWith('pk.')
  const [status,setStatus]=useState<'loading'|'ready'|'error'>('loading')
  const [error,setError]=useState('')

  const showRoute=()=>{
    const map=mapRef.current
    if(!map)return
    const coordinates=track.map(({lat,lng})=>[lng,lat] as [number,number])
    const bounds=coordinates.reduce<[[number,number],[number,number]]>((result,[lng,lat])=>[
      [Math.min(result[0][0],lng),Math.min(result[0][1],lat)],
      [Math.max(result[1][0],lng),Math.max(result[1][1],lat)],
    ] as [[number,number],[number,number]],[coordinates[0],coordinates[0]])
    map.fitBounds(bounds,{padding:65,maxZoom:14,pitch:60,bearing:-25,duration:0})
  }

  useEffect(()=>{
    if(!configured)return
    let cancelled=false
    let resize:ResizeObserver | undefined
    let timeout:ReturnType<typeof setTimeout> | undefined
    setStatus('loading');setError('')
    void import('mapbox-gl').then(({default:mapbox})=>{
      if(cancelled || !container.current)return
      if(!mapbox.supported())throw new Error('WebGL unavailable')
      const coordinates=track.map(({lat,lng})=>[lng,lat] as [number,number])
      const bounds=new mapbox.LngLatBounds(coordinates[0],coordinates[0])
      for(const point of coordinates)bounds.extend(point)
      const map=new mapbox.Map({
        container:container.current,accessToken:token,
        style:'mapbox://styles/mapbox/satellite-streets-v12',
        center:coordinates[0],zoom:12,pitch:60,bearing:-25,
        scrollZoom:false,attributionControl:true,
      })
      mapRef.current=map
      map.addControl(new mapbox.NavigationControl({visualizePitch:true}),'top-right')
      map.addControl(new mapbox.FullscreenControl(),'top-right')
      map.touchZoomRotate.enableRotation()
      map.on('error',event=>{
        if(cancelled)return
        const code=(event.error as Error & {status?:number}).status
        setError(code===401 || code===403 ? 'Не вдалося підключити 3D-карту.' : 'Не вдалося завантажити частину карти. Перевірте з’єднання з інтернетом.')
        if(code===401 || code===403){setStatus('error');clearTimeout(timeout)}
      })
      timeout=setTimeout(()=>{if(!cancelled){setStatus('error');setError('Карта завантажується надто довго. Спробуйте оновити сторінку.')}},25000)
      map.on('load',()=>{
        if(cancelled)return
        map.addSource('route-terrain',{type:'raster-dem',url:'mapbox://mapbox.mapbox-terrain-dem-v1',tileSize:512,maxzoom:14})
        map.setTerrain({source:'route-terrain',exaggeration:1.4})
        map.setFog({color:'#c9dfef','high-color':'#76a4cd','horizon-blend':.12})
        map.addSource('route-track',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates}}})
        map.addLayer({id:'route-outline',type:'line',source:'route-track',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#062d39','line-width':8}})
        map.addLayer({id:'route-line',type:'line',source:'route-track',layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#25e1c4','line-width':4}})
        const marker=(point:[number,number],label:string,color:string)=>{
          const element=document.createElement('button')
          element.type='button';element.className='route-map-marker';element.style.backgroundColor=color;element.setAttribute('aria-label',label)
          new mapbox.Marker({element,anchor:'center'}).setLngLat(point).setPopup(new mapbox.Popup({offset:15}).setText(label)).addTo(map)
        }
        marker(coordinates[0],'Початок маршруту','#0a9d80')
        marker(coordinates[coordinates.length-1],'Завершення маршруту','#e9823d')
        map.fitBounds(bounds,{padding:65,maxZoom:14,pitch:60,bearing:-25,duration:0})
        clearTimeout(timeout);setStatus('ready')
      })
      resize=new ResizeObserver(()=>map.resize())
      resize.observe(container.current)
    }).catch(()=>{if(!cancelled){setStatus('error');setError('Для 3D-карти потрібен браузер із підтримкою WebGL.')}})
    return()=>{cancelled=true;clearTimeout(timeout);resize?.disconnect();mapRef.current?.remove();mapRef.current=null}
  },[track,token,configured])

  return <div className="track-map-frame" data-map-state={configured ? status : 'unconfigured'}>
    <div className="track-map-stage"><div className="track-map" ref={container} role="region" aria-label={`3D-карта маршруту: ${name}`} />
      {(!configured || status!=='ready') && <div className="track-map-status" role="status"><span aria-hidden="true">△</span><strong>{!configured ? '3D-карта ще не підключена' : status==='loading' ? 'Завантажуємо гори у 3D…' : '3D-карта недоступна'}</strong><p>{!configured ? 'Маршрут збережено. Карта з’явиться після підключення Mapbox.' : status==='error' ? error : 'Супутникові знімки · гірський рельєф'}</p></div>}
    </div>
    <div className="track-map-toolbar"><span><i /> Початок <i className="finish" /> Завершення</span><span>3D · Супутник</span><button disabled={!configured || status!=='ready'} onClick={showRoute}>Показати весь маршрут ↗</button></div>
    {configured && status==='ready' && <p className="track-map-hint">Обертайте й нахиляйте карту правою кнопкою миші або двома пальцями на екрані.</p>}
    {configured && status==='ready' && error && <p className="track-map-error" role="status">{error}</p>}
  </div>
}
