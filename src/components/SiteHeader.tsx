import { useState } from 'react'
import { Link } from 'react-router-dom'
import Brand from './Brand'
import AccountLink from './AccountLink'

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  return <header className="header wrap editorial-header">
    <Brand />
    <button className="menu-toggle" aria-expanded={open} aria-controls="editorial-navigation" onClick={() => setOpen(!open)}>{open ? 'Закрити ✕' : 'Меню ☰'}</button>
    <nav id="editorial-navigation" className={`navigation${open ? ' open' : ''}`} aria-label="Головна навігація">
      <Link to="/#about" onClick={() => setOpen(false)}>Про проєкт</Link><Link to="/#rental" onClick={() => setOpen(false)}>Прокат</Link><Link to="/#about" onClick={() => setOpen(false)}>Команда</Link><Link to="/events" className="active" aria-current="page" onClick={() => setOpen(false)}>Події</Link>
      <AccountLink onNavigate={() => setOpen(false)} />
    </nav>
  </header>
}
