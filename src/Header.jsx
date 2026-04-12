import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function Header({ activePage, onNavigate, user }) {
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const API_BASE = 'http://localhost:8081/api/marketplace'

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const notifRes = await fetch(`${API_BASE}/notifications/user/${user.id}/unread`)
          if (notifRes.ok) {
            setNotifications(await notifRes.json())
          }
        } catch (error) {
          console.error(error)
        }
      }
      fetchNotifications()
    }
  }, [user, activePage])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-stone-50/80 backdrop-blur-md shadow-sm flex justify-between items-center px-6 h-20">
      
      {/* Left: Mobile home + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile-only home button */}
        <button
          className="md:hidden text-emerald-800 shrink-0"
          onClick={() => onNavigate('marketplace')}
          title="Home"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.6rem' }}>home</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-xl focus:ring-2 focus:ring-emerald-900/20 text-sm"
            placeholder="Search crops, buyers, or prices..."
            type="text"
          />
        </div>
      </div>

      {/* Right: Nav + Auth */}
      <div className="flex items-center gap-4 ml-4 relative">
        {/* Desktop nav */}
        <div className="hidden md:flex gap-5 items-center">
          <span
            onClick={() => onNavigate('marketplace')}
            className={`font-bold text-sm cursor-pointer transition-colors ${activePage === 'marketplace' ? 'text-emerald-900 border-b-2 border-emerald-800' : 'text-stone-600 hover:text-emerald-700'}`}
          >
            Home
          </span>
          {user && (
            <span
              onClick={() => onNavigate('orders')}
              className={`font-bold text-sm cursor-pointer transition-colors ${activePage === 'orders' ? 'text-emerald-900 border-b-2 border-emerald-800' : 'text-stone-600 hover:text-emerald-700'}`}
            >
              Orders
            </span>
          )}
        </div>

        {/* Icons + auth */}
        <div className="flex items-center gap-3 text-emerald-900">
          {/* Language toggle */}
          <span
            className="material-symbols-outlined cursor-pointer hover:text-emerald-700 transition-colors"
            title="Translate"
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'mr' : 'en')}
          >
            translate
          </span>

          {/* Notifications (logged in only) */}
          {user && (
            <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
              <span className="material-symbols-outlined hover:text-emerald-700 transition-colors">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
          )}

          {/* ── GUEST: Login + Register ── */}
          {!user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: '#14532d',
                  background: 'white',
                  border: '2px solid #15803d',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('register')}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'white',
                  background: 'linear-gradient(135deg, #15803d, #16a34a)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Register
              </button>
            </div>
          )}

          {/* ── LOGGED IN: Profile ── */}
          {user && (
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onNavigate('profile')}
              title="My Profile"
            >
              <span className="material-symbols-outlined hover:text-emerald-700 transition-colors" style={{ fontSize: '1.7rem' }}>account_circle</span>
              <span
                className="hidden md:block font-bold text-sm text-emerald-900"
                style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {user.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Notifications dropdown */}
        {showNotifications && user && (
          <div className="absolute top-12 right-0 w-80 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 bg-emerald-900 text-white rounded-t-xl font-bold flex justify-between items-center">
              <span>Notifications</span>
              <button
                onClick={() => setShowNotifications(false)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <div className="p-2 space-y-2 text-sm">
              {notifications.length === 0 ? (
                <p className="text-stone-500 text-center py-4">No new notifications</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 bg-stone-50 rounded-lg">
                    <p className="font-bold text-stone-800">{n.senderName}</p>
                    <p className="text-stone-600 mb-1">{n.message}</p>
                    <p className="text-xs text-stone-400">{n.senderMobile}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
