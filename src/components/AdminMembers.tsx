import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { errorMessage } from '../lib/errors'

export default function AdminMembers() {
  const [members,setMembers] = useState<{uid:string;email:string;enabled:boolean}[]>([])
  const [email,setEmail] = useState('')
  const [busy,setBusy] = useState(false), [error,setError] = useState(''), [ready,setReady] = useState(false)
  useEffect(() => {
    if(!db)return
    return onSnapshot(collection(db,'admins'),snapshot => {setMembers(snapshot.docs.map(item=>({uid:item.id,email:String(item.data().email ?? ''),enabled:item.data().enabled===true})));setReady(true)},err=>{setError(errorMessage(err));setReady(false)})
  },[])
  const grant = async (event:FormEvent) => {
    event.preventDefault();if(!auth?.currentUser)return
    setBusy(true);setError('')
    try {
      const token = await auth.currentUser.getIdToken()
      const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
      const response = await fetch(`${baseUrl}/api/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim() }),
      }).catch(() => { throw new Error('Не вдалося підключитися до сервера. Перевірте, чи працює бекенд.') })
      if (response.status === 405) throw new Error('Запит потрапив на сервер без API адміністраторів. У налаштуваннях frontend на Vercel задайте VITE_API_BASE_URL — адресу бекенду без /api — і виконайте новий деплой.')
      const result = await response.json().catch(() => { throw new Error('Сервер надання доступу недоступний. Перевірте підключення бекенду.') })
      if (response.status === 503 && result.error === 'Authentication service is not configured') throw new Error('Firebase Admin не налаштований на бекенді. Додайте FIREBASE_SERVICE_ACCOUNT_JSON у змінні середовища backend на Vercel і виконайте новий деплой.')
      if (!response.ok) throw new Error(result.error ?? 'Не вдалося надати доступ.')
      setEmail('')
    } catch (err) { setError(errorMessage(err)) } finally { setBusy(false) }
  }
  return <section className="admin-panel"><h2>Адміністратори</h2><p>Користувач спочатку реєструється або входить на сайт. Вкажіть його email, щоб надати доступ до редагування.</p><form onSubmit={grant}><fieldset disabled={busy || !ready}><div className="admin-two-columns"><label>Email користувача<input value={email} type="email" required maxLength={320} onChange={event=>setEmail(event.target.value)} /></label></div><button type="submit" className="primary-button">Додати адміністратора</button></fieldset></form>{!ready && !error && <p role="status">Завантаження списку…</p>}<ul className="admin-members">{members.map(member=><li key={member.uid}><div><strong>{member.email}</strong><code>{member.uid}</code><small>{member.enabled ? 'Доступ активний' : 'Доступ вимкнено'}</small></div><button className="admin-danger" disabled={busy} onClick={async()=>{if(!db || !window.confirm(`Відкликати доступ для ${member.email}?`))return;setBusy(true);setError('');try{await deleteDoc(doc(db,'admins',member.uid))}catch(err){setError(errorMessage(err))}finally{setBusy(false)}}}>Відкликати доступ</button></li>)}</ul>{ready && !members.length && <p className="admin-hint">Адміністраторів поки немає. Ваш доступ власника зберігається окремо.</p>}{error && <p className="admin-error" role="alert">{error}</p>}</section>
}
