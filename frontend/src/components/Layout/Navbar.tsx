import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Coins } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getInitials } from '../../lib/utils'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/transactions', label: 'Transações' },
  { path: '/categories', label: 'Categorias' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 text-primary-700">
            <Coins size={26} />
            <span className="font-bold text-lg tracking-widest">FINANCY</span>
          </Link>

          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.path
                    ? 'text-primary-700'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 hover:bg-gray-300 transition-colors"
          >
            {user ? getInitials(user.name) : '?'}
          </button>
        </div>
      </div>
    </header>
  )
}
