import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
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
    return onSnapshot(doc(db,'site','main'),snapshot => {
      if (!snapshot.exists()) {setState({content:defaultContent,revision:0,loading:false,error:''});return}
      const data = snapshot.data()
      const result = siteContentSchema.safeParse(data.content)
      if (!result.success || !Number.isInteger(data.revision) || data.revision < 1) {
        setState(previous => ({...previous,loading:false,error:'Контент у базі має неправильний формат. Збереження заблоковано.'}))
        return
      }
      setState({content:{...result.data,texts:{...defaultContent.texts,...result.data.texts},images:{...defaultContent.images,...result.data.images}},revision:data.revision,loading:false,error:''})
    },error => setState(previous => ({...previous,loading:false,error:errorMessage(error)})))
  },[])
  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>
}

export function useSiteContent() {
  const state = useContext(ContentContext)
  return {...state,t:(key:string) => state.content.texts[key] ?? defaultContent.texts[key] ?? '',image:(key:string) => state.content.images[key] ?? defaultContent.images[key] ?? ''}
}
