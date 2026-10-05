import { useLayoutEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Location } from 'react-router-dom'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import { useReducedMotionPreference } from './hooks/useReducedMotionPreference'
import Hero from './components/Hero'
import Sections from './components/Sections'
import Brand from './components/Brand'
import EventsPage from './pages/EventsPage'
import ReportPage from './pages/ReportPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ContentProvider } from './context/ContentContext'

function PageNavigation({ location }: { location: Location }) {
  const { pathname, hash } = location
  // Run only when the incoming page mounts, after the outgoing animation finishes.
  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        const page = target.closest('.page-transition')
        const translateY = page ? new DOMMatrixReadOnly(getComputedStyle(page).transform).m42 : 0
        target.scrollIntoView({ behavior:'instant' })
        window.scrollBy({ top:-translateY, behavior:'instant' })
      }
    }
    else window.scrollTo({ top:0, behavior:'instant' })
    document.title = pathname === '/' ? 'Freeride Project' : pathname === '/events' ? 'Події та звіти — Freeride Project' : `${document.querySelector('main h1')?.textContent ?? 'Звіт'} — Freeride Project`
  }, [pathname, hash])
  return null
}

function Footer() {
  const {isAdmin,user} = useAuth()
  return <footer className="footer"><div className="wrap footer-inner"><Brand /><nav aria-label="Навігація внизу сторінки"><Link to="/#about">Про проєкт</Link><Link to="/#rental">Прокат</Link><Link to="/#about">Команда</Link><Link to="/events">Події</Link><Link to={isAdmin?'/admin':'/login'}>{isAdmin?'Адмінка':user?'Акаунт':'Вхід'}</Link></nav><Link className="footer-contact" to="/events">З гір — у серця <span>♡</span></Link></div></footer>
}

function AnimatedPages() {
  const location = useLocation()
  const reducedMotion = useReducedMotionPreference()

  return <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={location.pathname}
      className="page-transition"
      initial={{ opacity:reducedMotion ? 1 : 0, y:reducedMotion ? 0 : 18 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:reducedMotion ? 1 : 0, y:reducedMotion ? 0 : -10 }}
      transition={{ duration:reducedMotion ? 0 : 0.22, ease:[0.22, 1, 0.36, 1] }}
    >
      <Routes location={location}>
        <Route path="/" element={<><Hero /><Sections /></>} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<ReportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<div className="wrap missing-page"><h1>Сторінку не знайдено</h1><Link className="outline-button" to="/">← На головну</Link></div>} />
      </Routes>
      {location.pathname !== '/login' && <Footer />}
      <PageNavigation location={location} />
    </motion.div>
  </AnimatePresence>
}

export default function App() {
  return <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AuthProvider><ContentProvider><AnimatedPages /></ContentProvider></AuthProvider></BrowserRouter>
}
