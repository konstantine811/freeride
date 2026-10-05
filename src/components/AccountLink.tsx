import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AccountLink({ onNavigate }: { onNavigate?: () => void }) {
  const { user, isAdmin } = useAuth()
  return <Link className="account-link" to={isAdmin ? '/admin' : '/login'} onClick={onNavigate}>
    {isAdmin ? 'Адмінка' : user ? 'Акаунт' : 'Вхід'}
  </Link>
}
