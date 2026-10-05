import { Link } from 'react-router-dom'

export default function Brand() {
  return <Link className="brand" to="/" aria-label="Freeride Project — головна">
    <svg viewBox="0 0 76 46" fill="none" aria-hidden="true"><path d="M3 39 36 5 70 39 49 29 37 17 25 30Z" stroke="currentColor" strokeWidth="5"/><path d="m19 38 17-16 15 14M7 36l15-5m32 0 17 8" stroke="currentColor" strokeWidth="4"/></svg>
    <span>FREERIDE<small>PROJECT</small></span>
  </Link>
}
