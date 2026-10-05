import { useState } from 'react'
import { uploadImage } from '../lib/contentService'
import { errorMessage } from '../lib/errors'

interface Props {label:string;value:string;onChange:(url:string) => void;onBusy:(change:number) => void}
export default function ImageField({label,value,onChange,onBusy}:Props) {
  const [busy,setBusy] = useState(false), [error,setError] = useState('')
  return <div className="admin-image-field"><label>{label}<input value={value} onChange={event => onChange(event.target.value)} placeholder="https://… або /images/…" maxLength={2048} disabled={busy} /></label><div className="admin-image-row">{value ? <img src={value} alt={label} /> : <div className="admin-image-empty">Фото не вибрано</div>}<label className="admin-upload">{busy ? 'Завантаження…' : 'Завантажити фото'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={async event => {const file=event.target.files?.[0];event.target.value='';if(!file)return;setBusy(true);onBusy(1);setError('');try{onChange(await uploadImage(file))}catch(err){setError(errorMessage(err))}finally{setBusy(false);onBusy(-1)}}} /></label><span className="admin-hint">JPEG, PNG, WebP, AVIF · до 10 МБ</span></div>{error && <p className="admin-error" role="alert">{error}</p>}</div>
}
