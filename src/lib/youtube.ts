const hosts=new Set(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'])
export function youtubeVideoId(value:string):string|null {
  try {
    const url=new URL(value)
    if(url.protocol!=='https:' || url.username || url.password)return null
    const parts=url.pathname.split('/').filter(Boolean)
    const id=url.hostname==='youtu.be' && parts.length===1 ? parts[0] : hosts.has(url.hostname) ? url.pathname==='/watch' ? url.searchParams.get('v') : ['embed','shorts','live'].includes(parts[0]) && parts.length===2 ? parts[1] : null : null
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
  } catch {return null}
}
export function youtubeEmbedUrl(value:string):string|null {
  const id=youtubeVideoId(value)
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&hl=uk` : null
}
export function isYouTubeChannelUrl(value:string):boolean {
  try {const url=new URL(value);return url.protocol==='https:' && !url.username && !url.password && ['youtube.com','www.youtube.com','m.youtube.com'].includes(url.hostname) && /^\/(?:@[\p{L}\p{N}_.-]+|(?:channel|c|user)\/[A-Za-z0-9_-]+)(?:\/videos)?\/?$/u.test(decodeURIComponent(url.pathname))}catch{return false}
}
