import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, firebaseConfigured } from '../firebaseConfig'
import { useAuth } from '../context/AuthContext'
import { useSiteContent } from '../context/ContentContext'
import { contentFields, siteContentSchema } from '../data/content'
import type { SiteContent } from '../data/content'
import type { Report, ReportRoute } from '../data/reports'
import { publishContent } from '../lib/contentService'
import { errorMessage } from '../lib/errors'
import { createDemoRoute } from '../data/demoRoutes'
import ImageField from '../components/ImageField'
import AdminMembers from '../components/AdminMembers'
import Brand from '../components/Brand'

function ContentEditor() {
  const {content,revision,error:contentError} = useSiteContent()
  const {user,isOwner} = useAuth()
  const draftKey = `freeride-draft:${user?.uid}`
  const [initial] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(draftKey) ?? 'null')
      const parsed = siteContentSchema.safeParse(stored?.content)
      if (parsed.success && typeof stored.baseline === 'string' && Number.isInteger(stored.revision) && stored.revision >= 0) return {content:parsed.data,baseline:stored.baseline,revision:stored.revision,restored:true}
    } catch { /* Use published content if this browser cannot retain a draft. */ }
    return {content:structuredClone(content),baseline:JSON.stringify(content),revision,restored:false}
  })
  const [draft,setDraft] = useState<SiteContent>(initial.content)
  const [baseline,setBaseline] = useState(initial.baseline)
  const [baseRevision,setBaseRevision] = useState(initial.revision)
  const [section,setSection] = useState('Перший екран')
  const [reportIndex,setReportIndex] = useState(0)
  const [saving,setSaving] = useState(false), [uploads,setUploads] = useState(0)
  const [error,setError] = useState(''), [message,setMessage] = useState(initial.restored ? 'Відновлено вашу неопубліковану чернетку в цьому браузері.' : '')
  const dirty = JSON.stringify(draft) !== baseline
  const onBusy = useCallback((change:number)=>setUploads(count=>count+change),[])
  const sections = [...new Set(contentFields.map(field=>field.section)),'Історії','Посилання',...(isOwner ? ['Адміністратори'] : [])]
  const report = draft.reports[reportIndex] ?? draft.reports[0]
  const updateReport = (update:Partial<Report> | ((current:Report)=>Partial<Report>)) => setDraft(previous=>({...previous,reports:previous.reports.map((item,index)=>index===reportIndex ? {...item,...(typeof update==='function'?update(item):update)} : item)}))
  const route: ReportRoute = report.route ?? {earthUrl:'',mapUrl:'',previewImage:'',description:''}
  const updateRoute = (update:Partial<ReportRoute>) => updateReport(current => ({route:{earthUrl:'',mapUrl:'',previewImage:'',description:'',...current.route,...update}}))
  useEffect(() => {
    try {
      if (dirty) sessionStorage.setItem(draftKey,JSON.stringify({content:draft,baseline,revision:baseRevision}))
      else sessionStorage.removeItem(draftKey)
    } catch { /* Publishing remains available when session storage is full. */ }
  },[draft,baseline,baseRevision,dirty,draftKey])
  useEffect(()=>{
    if(!dirty)return
    const unload=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue=''}
    const click=(event:MouseEvent)=>{
      const link=event.target instanceof Element ? event.target.closest('a') : null
      if(!link || link.target==='_blank' || !link.href || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return
      if(new URL(link.href).pathname==='/admin')return
      if(!window.confirm('Є неопубліковані зміни. Залишити сторінку без збереження?')){event.preventDefault();event.stopPropagation()}
    }
    window.addEventListener('beforeunload',unload);document.addEventListener('click',click,true)
    return()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',click,true)}
  },[dirty])
  const refresh = () => {
    if(dirty && !window.confirm('Відкинути неопубліковані зміни та завантажити поточний контент?'))return
    setDraft(structuredClone(content));setBaseline(JSON.stringify(content));setBaseRevision(revision);setReportIndex(0);setError('');setMessage('Чернетку оновлено.')
  }
  const publish = async () => {
    setError('');setMessage('')
    const validated=siteContentSchema.safeParse(draft)
    if(!validated.success){setError(validated.error.issues.map(issue=>`${issue.path.join('.')}: ${issue.message}`).slice(0,5).join('\n'));return}
    setSaving(true)
    try{await publishContent(validated.data,baseRevision);setDraft(validated.data);setBaseline(JSON.stringify(validated.data));setBaseRevision(baseRevision+1);setMessage('Зміни опубліковано. Відвідувачі вже бачать новий контент.')}catch(err){setError(errorMessage(err))}finally{setSaving(false)}
  }
  return <main className="admin-page admin-wide"><header className="admin-top"><div><Link className="admin-brand" to="/" aria-label="FREERIDE PROJECT — на головну"><Brand /></Link><p className="auth-kicker">ТВОЯ НАСТУПНА ПРИГОДА</p><h1>Керування сайтом</h1><p>{user?.email} · {isOwner ? 'Власник' : 'Адміністратор'}</p></div><div className="admin-actions"><Link className="admin-secondary" to="/" target="_blank">Переглянути сайт ↗</Link><button className="admin-secondary" disabled={saving || uploads>0} onClick={()=>{if(dirty&&!window.confirm('Вийти без збереження змін?'))return;if(auth)void signOut(auth).catch(err=>setError(errorMessage(err)))}}>Вийти</button></div></header>
    <div className="admin-layout"><nav className="admin-sidebar" aria-label="Розділи редагування">{sections.map(item=><button key={item} className={item===section?'selected':''} disabled={saving||uploads>0} onClick={()=>setSection(item)}>{item}</button>)}</nav><div className="admin-editor">
      <div className="admin-save-bar"><span>{dirty?'Є неопубліковані зміни':`Версія ${baseRevision} · ${baseRevision===0?'Початковий контент':'Збережено'}`}</span><button className="admin-secondary" disabled={saving||uploads>0||!!contentError} onClick={refresh}>Оновити чернетку</button><button className="primary-button" disabled={saving||uploads>0||!!contentError||(!dirty&&baseRevision>0)} onClick={()=>void publish()}>{saving?'Публікація…':uploads>0?'Завантаження фото…':'Опублікувати зміни'}</button></div>
      {contentError && <p className="admin-error" role="alert">{contentError}</p>}{revision!==baseRevision && <p className="admin-notice">Контент змінився в іншій сесії. Оновіть чернетку перед публікацією, щоб не перезаписати чужі зміни.</p>}{error&&<p className="admin-error" role="alert">{error}</p>}{message&&<p className="admin-success" role="status">{message}</p>}
      {section==='Адміністратори' && isOwner ? <AdminMembers /> : <fieldset className="admin-panel" disabled={saving}><h2>{section}</h2>
        {contentFields.filter(field=>field.section===section).map(field=>field.type==='image'?<ImageField key={field.key} label={field.label} value={draft.images[field.key]} onBusy={onBusy} onChange={value=>setDraft(previous=>({...previous,images:{...previous.images,[field.key]:value},heroLayers:field.key==='hero.image'?false:previous.heroLayers}))} />:<label key={field.key}>{field.label}<textarea value={draft.texts[field.key]} maxLength={10000} rows={field.key.endsWith('description')||field.key.endsWith('quote')?4:2} onChange={event=>{const value=event.target.value;setDraft(previous=>({...previous,texts:{...previous.texts,[field.key]:value}}))}} /></label>)}
        {section==='Перший екран'&&<label className="admin-checkbox"><input type="checkbox" checked={draft.heroLayers} onChange={event=>setDraft(previous=>({...previous,heroLayers:event.target.checked}))} />Увімкнути 3D-паралакс із трьома шарами<span>Для шарів використовуйте фото однакового розміру. Сноубордист і сніг мають мати прозорий фон. Заміна основного фото вимикає шари.</span></label>}
        {section==='Посилання'&&<><label>Посилання на відео YouTube<input type="url" required value={draft.videoUrl} onChange={event=>setDraft(previous=>({...previous,videoUrl:event.target.value}))} /></label><p className="admin-hint">Для плеєра вставте адресу конкретного відео: youtube.com/watch?v=… або youtu.be/…. Посилання на пошук чи канал не запускає відео.</p><label>Канал YouTube (необов’язково)<input type="url" placeholder="https://www.youtube.com/@вашканал" value={draft.texts['video.channelUrl'] ?? ''} onChange={event=>setDraft(previous=>({...previous,texts:{...previous.texts,['video.channelUrl']:event.target.value}}))} /></label></>}
        {section==='Історії'&&<><div className="admin-report-tools"><label>Оберіть звіт<select value={reportIndex} disabled={uploads>0} onChange={event=>setReportIndex(Number(event.target.value))}>{draft.reports.map((item,index)=><option key={index} value={index}>{item.title}</option>)}</select></label><button className="admin-secondary" disabled={uploads>0||draft.reports.length>=30} onClick={()=>{setDraft(previous=>({...previous,reports:[...previous.reports,{...previous.reports[0],slug:`report-${Date.now()}`,title:'Новий звіт',description:'Опис нової пригоди',paragraphs:['Розкажіть про виїзд.'],date:'Дата виїзду',route:{earthUrl:'',mapUrl:'',previewImage:'',description:''}}]}));setReportIndex(draft.reports.length)}}>Додати звіт</button><button className="admin-danger" disabled={uploads>0||draft.reports.length<=1} onClick={()=>{if(!window.confirm(`Видалити зі списку «${report.title}»? Зміна набуде чинності після публікації.`))return;setDraft(previous=>({...previous,reports:previous.reports.filter((_,index)=>index!==reportIndex)}));setReportIndex(0)}}>Видалити звіт</button></div>
          {(['title','slug','date','description'] as const).map(key=><label key={key}>{{title:'Заголовок',slug:'Адреса звіту (slug)',date:'Дата',description:'Короткий опис'}[key]}<input value={report[key]} onChange={event=>updateReport({[key]:event.target.value})} /></label>)}<p className="admin-hint">Зміна адреси звіту змінює його посилання на сайті.</p>
          <ImageField key={`cover-${reportIndex}`} label="Обкладинка" value={report.image} onBusy={onBusy} onChange={value=>updateReport({image:value})} /><label>Позиція фото (наприклад, center 45%)<input value={report.position} onChange={event=>updateReport({position:event.target.value})} /></label><label>Текст звіту — абзаци розділяйте порожнім рядком<textarea rows={10} value={report.paragraphs.join('\n\n')} onChange={event=>updateReport({paragraphs:event.target.value.split(/\n\s*\n/)})} /></label>
          <section className="admin-route-fields"><h3>Пройдений маршрут</h3><p className="admin-hint">3D-проєкт відкривається у Google Earth. Для карти всередині сайту використовуйте публічну Google My Maps із тим самим маршрутом.</p>
          <div className="admin-demo-route"><p>{route.track?.length ? `${route.demo ? 'Демонстраційний' : 'Збережений'} трек: ${route.track.length} точок` : 'Локальний трек не додано'}</p><button className="admin-secondary" onClick={()=>{if(route.track?.length&&!window.confirm('Замінити поточний трек демонстраційним?'))return;const sample=createDemoRoute(reportIndex);updateRoute({track:sample.track,demo:true,name:sample.name,description:sample.description})}}>Додати тестовий маршрут</button>{!!route.track?.length && <button className="admin-secondary" onClick={()=>updateRoute({track:[],demo:false})}>Прибрати трек</button>}</div>
          <label>Посилання на проєкт Google Earth<input type="url" placeholder="https://earth.google.com/earth/d/…" value={route.earthUrl} onChange={event=>updateRoute({earthUrl:event.target.value.trim()})} /></label>
          <label>Google My Maps — інтерактивна карта на сайті<input type="url" placeholder="https://www.google.com/maps/d/viewer?mid=…" value={route.mapUrl} onChange={event=>updateRoute({mapUrl:event.target.value.trim()})} /></label>
          <p className="admin-hint">У My Maps зробіть карту публічною та скопіюйте посилання з «Поділитися» або адресу src з «Вбудувати на сайт». Повний код iframe вставляти не потрібно.</p>
          <label>Опис маршруту<textarea rows={3} maxLength={2000} placeholder="Де проходив маршрут, ключові точки та особливості виїзду" value={route.description} onChange={event=>updateRoute({description:event.target.value})} /></label>
          <ImageField key={`route-${reportIndex}`} label="Знімок маршруту (необов’язково)" value={route.previewImage} onBusy={onBusy} onChange={value=>updateRoute({previewImage:value})} />
          {route.previewImage && <button className="admin-secondary" disabled={uploads>0} onClick={()=>updateRoute({previewImage:''})}>Прибрати знімок маршруту</button>}
          </section>
          <h3>Фотогалерея</h3>{report.photos.map((photo,index)=><div className="admin-photo" key={`${reportIndex}-${index}`}><ImageField label={`Фото ${index+1}`} value={photo.src} onBusy={onBusy} onChange={src=>updateReport(current=>({photos:current.photos.map((item,i)=>i===index?{...item,src}:item)}))} /><label>Опис фото<input value={photo.alt} onChange={event=>updateReport(current=>({photos:current.photos.map((item,i)=>i===index?{...item,alt:event.target.value}:item)}))} /></label><button className="admin-danger" disabled={uploads>0||report.photos.length<=1} onClick={()=>updateReport({photos:report.photos.filter((_,i)=>i!==index)})}>Прибрати фото</button></div>)}<button className="admin-secondary" disabled={uploads>0||report.photos.length>=30} onClick={()=>updateReport({photos:[...report.photos,{src:report.image,alt:'Фото з виїзду'}]})}>Додати фото до галереї</button>
        </>}
      </fieldset>}
    </div></div>
  </main>
}

export default function AdminPage() {
  const {user,loading,isAdmin,error} = useAuth()
  const {loading:contentLoading} = useSiteContent()
  if(!firebaseConfigured)return <main className="admin-page"><div className="auth-card"><h1>Адмін-панель</h1><div className="admin-notice"><h2>Потрібне підключення Firebase</h2><p>У проєкті ще немає налаштувань для входу та збереження контенту. Після підключення власник зможе призначати адміністраторів і публікувати зміни.</p></div><Link className="admin-secondary" to="/">← На сайт</Link></div></main>
  if(loading||contentLoading)return <main className="admin-page"><p role="status">Перевіряємо доступ і завантажуємо контент…</p></main>
  if(!user)return <Navigate to="/login" replace />
  if(!isAdmin)return <main className="admin-page"><div className="auth-card"><h1>Доступ до редагування</h1><p>Ваш акаунт ще не має прав адміністратора. Передайте власнику сайту email, з яким ви увійшли.</p><label>UID<input readOnly value={user.uid} onFocus={event=>event.target.select()} /></label>{error&&<p className="admin-error" role="alert">{error}</p>}<Link className="admin-secondary" to="/login">Керування акаунтом</Link></div></main>
  return <ContentEditor key={user.uid} />
}
