import { createDemoRoute } from './demoRoutes'

export interface ReportPhoto {
  src: string
  alt: string
}

export interface ReportRoute {
  earthUrl: string
  mapUrl: string
  previewImage: string
  description: string
  name?: string
  track?: {lat:number;lng:number}[]
  demo?: boolean
}

export interface Report {
  slug: string
  title: string
  description: string
  image: string
  position: string
  date: string
  paragraphs: string[]
  photos: ReportPhoto[]
  route?: ReportRoute
}

const photos: ReportPhoto[] = [
  { src: '/images/hero.png', alt: 'Сноубордист прокладає лінію у свіжому снігу' },
  { src: '/images/hiking.png', alt: 'Команда вирушає у засніжені гори на світанку' },
  { src: '/images/hero-background.png', alt: 'Зимова панорама Карпат і туман у долинах' },
  { src: '/images/gear.png', alt: 'Спорядження для гірської пригоди' },
]

export const reports: Report[] = [
  {
    route:createDemoRoute(0), slug: 'freeride-carpathians', title: 'Фрірайд у Карпатах',
    description: 'Глибокий сніг, нові лінії та справжня свобода в серці українських гір.',
    image: '/images/hero.png', position: 'center 45%', date: '12–19 лютого 2024',
    paragraphs: [
      'Три дні серед диких карпатських хребтів, свіжого снігу та неймовірних краєвидів. Ми шукали нові лінії, катали у незайманих місцях і знову відчули, чому гори об’єднують людей.',
      'Цей виїзд — про команду, довіру, підтримку і свободу. Про ранкові підйоми, довгі підходи, і той момент, коли ти стоїш на вершині й бачиш перед собою цілий світ.',
    ], photos,
  },
  {
    route:createDemoRoute(1), slug: 'day-off-piste', title: 'День поза трасами',
    description: 'Ранній підйом, сліди на снігу та світанок, заради якого варто йти далі.',
    image: '/images/hiking.png', position: 'center 45%', date: '20 лютого 2024',
    paragraphs: ['День почався ще до сходу сонця. Попереду — засніжений хребет, тиша лісу та маршрут, який ми відкривали крок за кроком.', 'На вершині зробили паузу, щоб вдихнути холодне повітря й побачити, як світло змінює гори. Потім — спуск, гарячий чай і розмови про наступну пригоду.'], photos: [photos[1], photos[2], photos[0], photos[3]],
  },
  {
    route:createDemoRoute(2), slug: 'snow-and-new-lines', title: 'Сніг і нові лінії',
    description: 'Свіжий сніг і спуски, які надовго залишаються у пам’яті.',
    image: '/images/hero.png', position: 'left 65%', date: '15–22 березня 2024',
    paragraphs: ['Свіжий сніг змінив знайомі схили. Кожен поворот відкривав новий краєвид, а кожен спуск давав привід усміхнутися.', 'Ми обирали лінії разом, ділилися досвідом і підтримували одне одного. Так народжуються історії, які хочеться розповідати після повернення.'], photos,
  },
  {
    route:createDemoRoute(3), slug: 'team-expedition', title: 'Командний виїзд',
    description: 'Разом до вершини. Разом назустріч новим горизонтам.',
    image: '/images/hiking.png', position: 'right 65%', date: '2–4 березня 2024',
    paragraphs: ['У горах особливо відчуваєш, що таке команда. Спільний темп, простягнута рука на підйомі та радість, яку хочеться розділити.', 'Цей виїзд зібрав людей з різним досвідом і однією любов’ю до гір. Повернулися з новими планами та відчуттям, що наступна зустріч уже близько.'], photos: [photos[1], photos[3], photos[2], photos[0]],
  },
  {
    route:createDemoRoute(4), slug: 'mountain-stories', title: 'Історії з гір',
    description: 'Тиша над хмарами, зимові горизонти та моменти, які залишаються з нами.',
    image: '/images/hero-background.png', position: 'center 55%', date: '10 березня 2024',
    paragraphs: ['Іноді найкраща частина подорожі — просто зупинитися. Подивитися на туман у долині, засніжений ліс і світло на далеких вершинах.', 'З таких маленьких моментів складаються великі спогади. Ми збираємо їх у фотографіях і повертаємося до них, коли гори знову кличуть.'], photos: [photos[2], photos[1], photos[3], photos[0]],
  },
]

export const videoSearchUrl = 'https://www.youtube.com/results?search_query=freeride+carpathians'
