import type { ReportRoute } from './reports'

// Illustrative polylines near Carpathian hiking areas; these are not recorded GPS tracks.
export const demoRoutes = [
  {name:'Чорногора · район Говерли',track:[[48.1665,24.5358],[48.1649,24.5324],[48.1637,24.5284],[48.1614,24.5248],[48.1606,24.5207],[48.1587,24.5168],[48.1581,24.5131],[48.1601,24.5078],[48.1607,24.5003]]},
  {name:'Свидовець · район Драгобрата',track:[[48.2494,24.2411],[48.2467,24.2392],[48.2443,24.2359],[48.2422,24.2321],[48.2404,24.2285],[48.2371,24.2273],[48.2344,24.2258],[48.2308,24.2244],[48.2281,24.2247]]},
  {name:'Чорногора · район Петроса',track:[[48.1962,24.4277],[48.1919,24.4271],[48.1877,24.4243],[48.1832,24.4231],[48.1798,24.4215],[48.1761,24.4198],[48.1728,24.4206],[48.1699,24.4225],[48.1721,24.4241]]},
] satisfies {name:string;track:[number,number][]}[]

export function createDemoRoute(index:number):ReportRoute {
  const route=demoRoutes[index % demoRoutes.length]
  return {earthUrl:'',mapUrl:'',previewImage:'',description:route.name,name:route.name,track:route.track.map(([lat,lng])=>({lat,lng})),demo:true}
}
