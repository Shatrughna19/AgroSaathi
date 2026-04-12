import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const API_BASE = 'http://localhost:8081/api/marketplace'

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await fetch(`${API_BASE}/notifications/user/${user.id}/unread`)
          if (res.ok) setNotifications(await res.json())
        } catch (error) {
          console.error('Error fetching notifications:', error)
        }
      }
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const unreadCount = notifications.length

  const NavItem = ({ page, icon, label, badge }) => {
    const isActive = activePage === page
    return (
      <div
        className={`rounded-xl mx-2 px-4 py-3 flex items-center gap-3 transition-all duration-200 ease-in-out cursor-pointer ${isActive ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}
        style={{ fontSize: '0.97rem' }}
        onClick={() => onNavigate(page)}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1.3rem' }}>{icon}</span>
        <span className="flex-1">{label}</span>
        {badge > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">{badge}</span>
        )}
      </div>
    )
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col h-screen w-64 bg-stone-50 border-r border-stone-200 font-['Inter'] font-medium text-sm py-6 sticky top-0"
        style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}
      >
        {/* Brand */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg,#15803d,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 900, fontSize: '1.15rem',
            boxShadow: '0 4px 12px rgba(22,163,74,0.3)', flexShrink: 0
          }}>A</div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532d', lineHeight: 1.2 }}>Agro Saathi</h1>
            <p style={{ fontSize: '0.72rem', color: '#78716c', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {user ? `${user.role} Dashboard` : 'Marketplace'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          <NavItem page="marketplace" icon="storefront" label="Marketplace" />

          {user && user.role === 'Farmer' && (
            <NavItem page="fertilizer" icon="psychiatry" label="Fertilizers" />
          )}

          {user && (
            <NavItem page="orders" icon="shopping_basket" label="Orders & Demands" />
          )}

          {user && (
            <NavItem page="profile" icon="person" label="My Profile" badge={unreadCount} />
          )}

          {/* Guest: Login / Register */}
          {!user && (
            <>
              <NavItem page="login"    icon="login"      label="Login" />
              <NavItem page="register" icon="person_add" label="Register" />
            </>
          )}
        </nav>

        {/* Lang toggle */}
        <div className="mx-4 flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${i18n.language === 'en' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}
            onClick={() => changeLanguage('en')}
          >EN</button>
          <button
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${i18n.language === 'mr' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}
            onClick={() => changeLanguage('mr')}
          >MR</button>
        </div>

        {/* Logout */}
        {user && (
          <div className="px-4 py-2">
            <button
              onClick={onLogout}
              className="w-full bg-red-50 text-red-700 hover:bg-red-100 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95"
              style={{ fontSize: '0.95rem' }}
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* ── MOBILE BOTTOM BAR ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex bg-white border-t border-stone-200"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
      >
        {/* Always show Marketplace */}
        <MobileTab icon="storefront" label="Market" active={activePage === 'marketplace'} onClick={() => onNavigate('marketplace')} />

        {/* Logged in: Orders, Profile */}
        {user && (
          <>
            <MobileTab icon="shopping_basket" label="Orders" active={activePage === 'orders'} onClick={() => onNavigate('orders')} />
            {user.role === 'Farmer' && (
              <MobileTab icon="psychiatry" label="Fertilizer" active={activePage === 'fertilizer'} onClick={() => onNavigate('fertilizer')} />
            )}
            <MobileTab icon="person" label="Profile" active={activePage === 'profile'} onClick={() => onNavigate('profile')} badge={unreadCount} />
          </>
        )}

        {/* Guest: Login, Register */}
        {!user && (
          <>
            <MobileTab icon="login"      label="Login"    active={activePage === 'login'}    onClick={() => onNavigate('login')} />
            <MobileTab icon="person_add" label="Register" active={activePage === 'register'} onClick={() => onNavigate('register')} />
          </>
        )}
      </nav>
    </>
  )
}

function MobileTab({ icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: '0.5rem 0.25rem',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: active ? '#15803d' : '#78716c',
        fontWeight: active ? 700 : 500,
        fontSize: '0.62rem',
        position: 'relative',
        transition: 'color 0.2s',
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>{icon}</span>
      <span>{label}</span>
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: 6, right: '50%', transform: 'translateX(10px)',
          background: '#ef4444', color: 'white', borderRadius: 99,
          fontSize: '0.6rem', padding: '1px 5px', fontWeight: 700, lineHeight: 1.4
        }}>{badge}</span>
      )}
    </button>
  )
}

export default Sidebar
