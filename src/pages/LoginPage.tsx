import { useState } from 'react'
import type { FormEvent } from 'react'
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, sendPasswordResetEmail } from 'firebase/auth'
import { Link } from 'react-router-dom'
import { auth, firebaseConfigured } from '../firebaseConfig'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../lib/errors'
import Brand from '../components/Brand'

export default function LoginPage() {
  const { user,isAdmin,loading,error:roleError } = useAuth()
  const [email,setEmail] = useState(''), [password,setPassword] = useState('')
  const [register,setRegister] = useState(false), [busy,setBusy] = useState(false)
  const [error,setError] = useState(''), [message,setMessage] = useState('')
  const run = async (action:() => Promise<unknown>) => {
    setBusy(true);setError('');setMessage('')
    try {await action()} catch (err) {setError(errorMessage(err))} finally {setBusy(false)}
  }
  const submit = (event:FormEvent) => {
    event.preventDefault()
    if (!auth) return
    const authentication = auth
    void run(() => register ? createUserWithEmailAndPassword(authentication,email,password) : signInWithEmailAndPassword(authentication,email,password))
  }
  return <main className="auth-page">
    <div className="auth-landscape" aria-hidden="true" />
    <Link className="auth-back" to="/">← <span>Повернутися до гір</span></Link>
    <section className="auth-card" aria-labelledby="auth-title">
      <header className="auth-brand"><Brand /><p>ГОРИ КЛИЧУТЬ ДАЛІ</p></header>
      <div className="auth-body"><p className="auth-kicker">ТВОЯ НАСТУПНА ПРИГОДА</p><h1 id="auth-title">{user ? 'Твій акаунт' : register ? 'Приєднуйся до нас' : 'Раді бачити знову'}</h1>
      {loading ? <p className="auth-feedback" role="status">Перевіряємо доступ…</p> : user ? <div className="auth-account"><p>Ви увійшли як <strong>{user.email ?? user.displayName}</strong>.</p>{isAdmin ? <Link className="primary-button" to="/admin">Відкрити адмін-панель →</Link> : <><p>Щоб отримати доступ до редагування, передайте власнику сайту свій ідентифікатор.</p><label>Ваш UID<input value={user.uid} readOnly onFocus={event => event.target.select()} /></label></>}<button className="auth-google" onClick={() => auth && void run(() => signOut(auth!))} disabled={busy}>Вийти</button></div> : <form onSubmit={submit} className="auth-form"><fieldset disabled={busy || !firebaseConfigured}>
        <label>Email<input type="email" autoComplete="email" placeholder="Твій email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <label>Пароль<input type="password" autoComplete={register ? 'new-password' : 'current-password'} placeholder="Твій пароль" minLength={register ? 8 : undefined} required value={password} onChange={event => setPassword(event.target.value)} /></label>
        <div className="auth-links"><button type="button" disabled={busy} onClick={() => {setRegister(!register);setError('');setMessage('')}}>{register ? 'Уже маєш акаунт?' : 'Створити акаунт'}</button><span aria-hidden="true">·</span><button type="button" disabled={busy || !email} onClick={() => { if (auth) {const authentication=auth;void run(async () => {await sendPasswordResetEmail(authentication,email);setMessage('Якщо акаунт існує, лист для відновлення пароля буде надіслано.')})} }}>Забули пароль?</button></div>
        <div className="auth-divider"><span />або<span /></div>
        <button type="button" className="auth-google" onClick={() => auth && void run(() => signInWithPopup(auth!,new GoogleAuthProvider()))}><span className="auth-google-icon" aria-hidden="true">G</span>Увійти через Google</button>
        <div className="auth-submit-wrap"><button className="auth-submit" type="submit" aria-label={busy ? 'Зачекайте…' : register ? 'Створити акаунт' : 'Увійти'}><svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button><span>{busy ? 'Зачекайте…' : register ? 'Створити акаунт' : 'Увійти'}</span></div>
      </fieldset></form>}
      {!firebaseConfigured && <p className="auth-feedback" role="status">Вхід тимчасово недоступний. Незабаром зустрінемось у горах.</p>}
      {(error || roleError) && <p className="auth-feedback auth-error" role="alert">{error || roleError}</p>}{message && <p className="auth-feedback auth-success" role="status">{message}</p>}
      </div>
      <p className="auth-signoff">З ГІР — У СЕРЦЯ <span aria-hidden="true">♡</span></p>
    </section>
    <p className="auth-landscape-caption">СВОБОДА. ЛЮДИ. ГОРИ.</p>
  </main>
}
