import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { collection, doc, getDocFromServer, getDocsFromServer, onSnapshot } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { defaultContent, siteContentSchema } from '../data/content'
import type { SiteContent } from '../data/content'
import { errorMessage } from '../lib/errors'

interface ContentState { content:SiteContent; revision:number; loading:boolean; error:string }
const ContentContext = createContext<ContentState>({content:defaultContent,revision:0,loading:false,error:''})
export function ContentProvider({children}:{children:ReactNode}) {
  const [state,setState] = useState<ContentState>({content:defaultContent,revision:0,loading:!!db,error:''})
  useEffect(() => {
    if (!db) return
    const database = db
    let generation = 0
    const unsubscribe = onSnapshot(doc(database,'site','main'),async snapshot => {
      const request = ++generation
      try {
        if (!snapshot.exists()) {setState({content:defaultContent,revision:0,loading:false,error:''});return}
        const data = snapshot.data()
        let rawContent = data.content
        if (data.storageVersion === 2) {
          const reports = await getDocsFromServer(collection(database,'reports'))
          const latest = await getDocFromServer(doc(database,'site','main'))
          if (request !== generation || latest.data()?.revision !== data.revision) return
          const records = reports.docs.map(item => item.data())
          if (records.some(item=>!Number.isInteger(item.order) || !Number.isInteger(item.revision) || item.revision > data.revision)) throw new Error('Звіти у базі мають неправильний формат.')
          rawContent = {...data.content,reports:records.sort((a,b)=>a.order-b.order).map(item=>item.report)}
        }
        const result = siteContentSchema.safeParse(rawContent)
        if (!result.success || !Number.isInteger(data.revision) || data.revision < 1) {
          setState(previous => ({...previous,loading:false,error:'Контент у базі має неправильний формат. Збереження заблоковано.'}))
          return
        }
        setState({content:{...result.data,texts:{...defaultContent.texts,...result.data.texts},images:{...defaultContent.images,...result.data.images}},revision:data.revision,loading:false,error:''})
      } catch (error) { if (request === generation) setState(previous => ({...previous,loading:false,error:errorMessage(error)})) }
    },error => {generation++;setState(previous => ({...previous,loading:false,error:errorMessage(error)}))})
    return () => {generation++;unsubscribe()}
  },[])
  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export function useSiteContent() {
  const state = useContext(ContentContext)
  return {...state,t:(key:string) => state.content.texts[key] ?? defaultContent.texts[key] ?? '',image:(key:string) => state.content.images[key] ?? defaultContent.images[key] ?? ''}
}
