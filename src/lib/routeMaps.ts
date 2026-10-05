const mapId = /^[A-Za-z0-9_-]{1,200}$/

function httpsUrl(value:string):URL | null {
  try {
    const url=new URL(value)
    return url.protocol==='https:' && !url.username && !url.password && !url.port ? url : null
  } catch {return null}
}

export function isEarthProjectUrl(value:string):boolean {
  const url=httpsUrl(value)
  if(!url || url.hostname!=='earth.google.com')return false
  return /^\/earth\/d\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) || /^\/web\/(?:@|data=).+/.test(url.pathname)
}

/** Convert a shared My Maps URL into Google's supported embed URL. */
export function myMapsEmbedUrl(value:string):string | null {
  const url=httpsUrl(value)
  if(!url || !['www.google.com','maps.google.com'].includes(url.hostname))return null
  if(!/^\/maps\/d\/(?:u\/\d+\/)?(?:edit|viewer|embed)\/?$/.test(url.pathname))return null
  const id=url.searchParams.get('mid')
  if(!id || !mapId.test(id))return null
  return `https://www.google.com/maps/d/embed?mid=${encodeURIComponent(id)}`
}
