import { collection, doc, getDocFromServer, getDocsFromServer, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from '../firebaseConfig'
import { reportSchema, siteContentSchema } from '../data/content'
import type { SiteContent } from '../data/content'
import { contentStorageVersion, migrateLocalImages, splitContent } from './contentPersistence'

export async function publishContent(content:SiteContent,expectedRevision:number) {
  if (!db || !auth?.currentUser) throw new Error('Спочатку увійдіть у свій акаунт.')
  const database = db
  const document = doc(database,'site','main')
  const uid = auth.currentUser.uid
  const current = await getDocFromServer(document)
  if ((current.exists() ? current.data().revision : 0) !== expectedRevision) throw new Error('Інший адміністратор уже змінив контент. Оновіть чернетку.')
  const validated = await migrateLocalImages(siteContentSchema.parse(content), async path => {
    const response = await fetch(path)
    if (!response.ok) throw new Error(`Не вдалося перенести фото ${path} у Firebase.`)
    const blob = await response.blob()
    return uploadImage(new File([blob],path.split('/').pop()!,{type:blob.type}))
  })
  const {settings,reports} = splitContent(validated)
  const existing = await getDocsFromServer(collection(database,'reports'))
  const previous = new Map(existing.docs.map(item=>[item.id,item.data()]))
  const next = new Map(reports.map(item=>[item.report.slug,item]))
  const changed = reports.filter(item=> {
    const old = previous.get(item.report.slug)
    return !old || old.order !== item.order || JSON.stringify(reportSchema.parse(old.report)) !== JSON.stringify(item.report)
  })
  const removed = existing.docs.filter(item=>!next.has(item.id))
  if (changed.length + removed.length > 450) throw new Error('Забагато змін за одну публікацію. Публікуйте зміни звітів частинами (до 450).')
  await runTransaction(database,async transaction => {
    const snapshot = await transaction.get(document)
    const actualRevision = snapshot.exists() ? snapshot.data().revision : 0
    if (actualRevision !== expectedRevision) throw new Error('Інший адміністратор уже змінив контент. Оновіть чернетку й повторіть свої зміни.')
    transaction.set(document,{content:settings,storageVersion:contentStorageVersion,revision:expectedRevision + 1,updatedAt:serverTimestamp(),updatedBy:uid})
    for (const item of changed) transaction.set(doc(database,'reports',item.report.slug),{...item,revision:expectedRevision+1,updatedAt:serverTimestamp(),updatedBy:uid})
    for (const item of removed) transaction.delete(item.ref)
  })
  return validated
}

export async function uploadImage(file:File):Promise<string> {
  if (!storage || !auth?.currentUser) throw new Error('Спочатку увійдіть у свій акаунт.')
  if (!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)) throw new Error('Оберіть JPEG, PNG, WebP або AVIF.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Фото має бути не більшим за 10 МБ.')
  const bitmap = await createImageBitmap(file).catch(() => {throw new Error('Файл не вдалося прочитати як зображення.')})
  const width = bitmap.width, height = bitmap.height
  bitmap.close()
  if (width > 12000 || height > 12000) throw new Error('Розмір фото не має перевищувати 12000 пікселів по кожній стороні.')
  const extension = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif'}[file.type]
  const reference = ref(storage,`content/${auth.currentUser.uid}/${crypto.randomUUID()}.${extension}`)
  await uploadBytes(reference,file,{contentType:file.type,cacheControl:'public,max-age=31536000,immutable'})
  return getDownloadURL(reference)
}
