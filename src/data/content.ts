import { isYouTubeChannelUrl } from '../lib/youtube'
import { z } from 'zod'
import { isEarthProjectUrl, myMapsEmbedUrl } from '../lib/routeMaps'
import { reports, videoSearchUrl } from './reports'

export interface ContentField { key: string; label: string; section: string; type: 'text' | 'image'; value: string }
const text = (section: string, key: string, label: string, value: string): ContentField => ({ section, key, label, value, type:'text' })
const image = (section: string, key: string, label: string, value: string): ContentField => ({ section, key, label, value, type:'image' })
export const contentFields: ContentField[] = [
  text('Перший екран','hero.eyebrow','Надзаголовок','ГОРИ КЛИЧУТЬ ДАЛІ'),
  text('Перший екран','hero.title','Головний заголовок','За межами\nтрас.'),
  text('Перший екран','hero.description','Опис','Фрірайд, експедиції та люди,\nякі живуть горами.'),
  text('Перший екран','hero.cta','Кнопка пригоди','Обрати пригоду'),
  text('Перший екран','hero.video','Кнопка відео','Дивитись відео'),
  text('Перший екран','hero.join','Кнопка приєднання','Приєднатись'),
  image('Перший екран','hero.image','Основне зображення','/images/hero.png'),
  image('Перший екран','hero.background','Шар: гори','/images/hero-background.png'),
  image('Перший екран','hero.rider','Шар: сноубордист (PNG з прозорістю)','/images/hero-rider.png'),
  image('Перший екран','hero.snow','Шар: передній сніг (PNG з прозорістю)','/images/hero-snow.png'),
  text('Напрямки','directions.eyebrow','Надзаголовок','НАПРЯМКИ'),
  text('Напрямки','directions.title','Заголовок','Чим ми займаємось'),
  text('Напрямки','directions.all','Посилання','УСІ НАПРЯМКИ'),
  text('Напрямки','directions.riding.title','Фрірайд: заголовок','Фрірайд-тури'),
  text('Напрямки','directions.riding.description','Фрірайд: опис','Експедиції в дикі куточки гір. Нові лінії, нові горизонти, справжні емоції.'),
  image('Напрямки','directions.riding.image','Фрірайд: фото','/images/hero.png'),
  text('Напрямки','directions.training.title','Навчання: заголовок','Навчання'),
  text('Напрямки','directions.training.description','Навчання: опис','Від перших кроків до впевненого фрірайду. З досвідченими гідами.'),
  image('Напрямки','directions.training.image','Навчання: фото','/images/hiking.png'),
  text('Напрямки','directions.rental.title','Прокат: заголовок','Прокат спорядження'),
  text('Напрямки','directions.rental.description','Прокат: опис','Сучасне та надійне спорядження для твоїх пригод.'),
  image('Напрямки','directions.rental.image','Прокат: фото','/images/gear.png'),
  text('Про нас','about.eyebrow','Надзаголовок','ПРО НАС'),
  text('Про нас','about.title','Заголовок','Проєкт, що об’єднує.'),
  text('Про нас','about.intro','Вступ','FREERIDE PROJECT — це спільнота людей, яких надихає свобода, гори та рух.'),
  text('Про нас','about.description','Опис','Ми організовуємо фрірайд-тури, експедиції, навчання та події, щоб ділитися досвідом і відкривати нові горизонти разом.'),
  image('Про нас','about.image','Фонове фото','/images/hiking.png'),
  text('Відео','film.eyebrow','Надзаголовок','ВІДЧУЙ АТМОСФЕРУ'),
  text('Відео','film.title','Заголовок','З гір — у кадр.'),
  text('Відео','film.description','Опис','Дивись, як ми шукаємо нові лінії, досліджуємо дикі гори та проживаємо справжню зиму.'),
  image('Відео','film.image','Обкладинка відео','/images/hiking.png'),
  text('Події','events.eyebrow','Надзаголовок','ЖИТИ ЯСКРАВІШЕ'),
  text('Події','events.title','Заголовок на головній','Останні події'),
  text('Події','events.pageTitle','Заголовок сторінки подій','Події та звіти'),
  text('Події','events.description','Підзаголовок','Наші виїзди. Наші історії.'),
  image('Події','events.image','Фон сторінки подій','/images/hero.png'),
  text('Події','events.videoTitle','Заголовок відеоблоку','Відео з наших виїздів'),
  text('Звіти','report.storyTitle','Заголовок тексту','Як це було'),
  text('Звіти','report.videoTitle','Заголовок відео','Відеозвіт'),
  text('Звіти','report.photoTitle','Заголовок галереї','Фотозвіт'),
  text('Звіти','report.impressionsTitle','Заголовок відгуку','Враження команди'),
  text('Звіти','report.location','Локація','Карпати'),
  text('Звіти','report.format','Формат','командний виїзд'),
  text('Звіти','report.author','Автор відгуку','З гір — у серця'),
  text('Звіти','report.authorDescription','Підпис автора','Історія нашої спільноти'),
  text('Звіти','report.quote','Відгук','Це був один із тих виїздів, які надовго залишаються в пам’яті. Неймовірні люди, дика природа і відчуття повної свободи. Карпати знову показали свою силу.'),
  image('Звіти','report.avatar','Фото автора','/images/hero.png'),
]

const shortText = z.string().trim().min(1, 'Поле не може бути порожнім').max(500)
export const imageUrlSchema = z.string().max(2048).refine(value => /^\/images\/[A-Za-z0-9_./-]+$/.test(value) || (() => { try { const url = new URL(value); return (url.protocol === 'https:' || (import.meta.env?.DEV && import.meta.env.VITE_FIREBASE_EMULATORS === 'true' && url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.port === '9199')) && !url.username && !url.password } catch { return false } })(), 'Фото: потрібне посилання https:// або шлях /images/...')
export const routeSchema = z.object({
  earthUrl:z.string().max(4096).refine(value => value === '' || isEarthProjectUrl(value), 'Вставте посилання на проєкт https://earth.google.com/earth/d/...'),
  mapUrl:z.string().max(2048).refine(value => value === '' || myMapsEmbedUrl(value) !== null, 'Вставте посилання Google My Maps із параметром mid'),
  previewImage:z.union([z.literal(''),imageUrlSchema]),
  description:z.string().max(2000),
  name:z.string().max(200).optional(),
  demo:z.boolean().optional(),
  track:z.array(z.object({lat:z.number().finite().min(-90).max(90),lng:z.number().finite().min(-180).max(180)})).max(5000).refine(points=>points.length===0 || points.length>=2, 'Маршрут має містити щонайменше дві точки').optional(),
}).refine(route => !route.previewImage || !!route.earthUrl || !!route.mapUrl || (route.track?.length ?? 0)>=2, 'Додайте посилання на маршрут для його обкладинки')
export const reportSchema = z.object({
  slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Адреса: малі латинські літери, цифри й дефіси').max(100),
  title:shortText, description:z.string().trim().min(1).max(2000), image:imageUrlSchema,
  position:z.string().max(100), date:shortText,
  paragraphs:z.array(z.string().trim().min(1).max(10000)).min(1).max(30),
  photos:z.array(z.object({src:imageUrlSchema,alt:shortText})).min(1).max(30),
  route:routeSchema.optional(),
})
export const siteContentSchema = z.object({
  texts:z.record(z.string().max(10000)), images:z.record(imageUrlSchema),
  reports:z.array(reportSchema).min(1).max(30).refine(items => new Set(items.map(item => item.slug)).size === items.length, 'Адреси звітів мають бути унікальними'),
  videoUrl:z.string().url().max(2048).refine(value => { try {const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password} catch {return false} }, 'Посилання має починатися з https://'),
  heroLayers:z.boolean(),
}).refine(content=>!content.texts['video.channelUrl'] || isYouTubeChannelUrl(content.texts['video.channelUrl']),{message:'Вставте посилання на канал YouTube',path:['texts','video.channelUrl']})
export type SiteContent = z.infer<typeof siteContentSchema>
export const defaultContent: SiteContent = {
  texts:Object.fromEntries(contentFields.filter(field => field.type === 'text').map(field => [field.key,field.value])),
  images:Object.fromEntries(contentFields.filter(field => field.type === 'image').map(field => [field.key,field.value])),
  reports, videoUrl:videoSearchUrl, heroLayers:true,
}
