import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from '../firebaseConfig'
import { siteContentSchema } from '../data/content'
import type { SiteContent } from '../data/content'

export async function publishContent(content:SiteContent,expectedRevision:number) {
  if (!db || !auth?.currentUser) throw new Error('Спочатку увійдіть у свій акаунт.')
  const validated = siteContentSchema.parse(content)
  const document = doc(db,'site','main')
  const uid = auth.currentUser.uid
  await runTransaction(db,async transaction => {
    const snapshot = await transaction.get(document)
    const actualRevision = snapshot.exists() ? snapshot.data().revision : 0
    if (actualRevision !== expectedRevision) throw new Error('Інший адміністратор уже змінив контент. Оновіть чернетку й повторіть свої зміни.')
    transaction.set(document,{content:validated,revision:expectedRevision + 1,updatedAt:serverTimestamp(),updatedBy:uid})
  })
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
