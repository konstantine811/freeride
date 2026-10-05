import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { errorMessage } from '../lib/errors'

interface AuthState { user:User | null; loading:boolean; isAdmin:boolean; isOwner:boolean; error:string }
const AuthContext = createContext<AuthState>({user:null,loading:true,isAdmin:false,isOwner:false,error:''})

export function AuthProvider({ children }: { children:ReactNode }) {
  const [state,setState] = useState<AuthState>({user:null,loading:!!auth,isAdmin:false,isOwner:false,error:''})
  useEffect(() => {
    if (!auth || !db) return
    const database = db
    let stopRoles: (() => void) | undefined
    let generation = 0
    const stopAuth = onAuthStateChanged(auth,user => {
      stopRoles?.()
      const current = ++generation
      setState({user,loading:!!user,isAdmin:false,isOwner:false,error:''})
      if (!user) return
      let owner = false, admin = false, ownerReady = false, adminReady = false, failed = false
      const publish = () => {
        if (current === generation && !failed) setState(previous => ({...previous,isOwner:owner,isAdmin:owner || admin,loading:!ownerReady || !adminReady}))
      }
      const fail = (error:unknown) => {
        failed = true
        if (current === generation) setState({user,loading:false,isAdmin:false,isOwner:false,error:errorMessage(error)})
      }
      const stopOwner = onSnapshot(doc(database,'owners',user.uid),snapshot => {owner = snapshot.exists();ownerReady = true;publish()},fail)
      const stopAdmin = onSnapshot(doc(database,'admins',user.uid),snapshot => {admin = snapshot.exists() && snapshot.data().enabled === true;adminReady = true;publish()},fail)
      stopRoles = () => {stopOwner();stopAdmin()}
    },error => setState({user:null,loading:false,isAdmin:false,isOwner:false,error:errorMessage(error)}))
    return () => {generation++;stopAuth();stopRoles?.()}
  },[])
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
