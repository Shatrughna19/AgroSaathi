import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
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
      // Refresh notifications every minute
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [user])

  const unreadCount = notifications.length

  const NavItem = ({ page, icon, label, badge }) => (
    <button 
      className={`nav-item ${activePage === page ? 'active' : ''}`}
      onClick={() => onNavigate(page)}
    >
      <i className={`bi bi-${icon}`}></i>
      <span>{label}</span>
      {badge > 0 && <span className="badge rounded-pill bg-danger ms-auto px-2 py-1" style={{ fontSize: '0.7rem' }}>{badge}</span>}
    </button>
  )

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-modern">AS</div>
        <h1 className="brand-name-modern">Agro Saathi</h1>
      </div>

      <nav className="nav-group">
        <NavItem page="marketplace" icon="shop" label={t('marketplace.storefront') || 'Storefront'} />
        
        {user && user.role === 'Farmer' && (
          <NavItem page="fertilizer" icon="flower1" label={t('header.marketplace') || 'Supplies'} />
        )}
        
        {user && (
          <NavItem page="orders" icon="clipboard-data" label={t('header.orders') || 'My Orders'} />
        )}
        
        {user && (
          <NavItem page="profile" icon="person-circle" label={t('header.profile') || 'Profile'} />
        )}

        {!user && (
          <>
            <NavItem page="login" icon="box-arrow-in-right" label={t('header.login') || 'Login'} />
            <NavItem page="register" icon="person-plus" label={t('header.register') || 'Register'} />
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="d-flex align-items-center gap-3 p-2 mb-3 bg-slate-50 rounded-4">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '40px', height: '40px', minWidth: '40px' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow-1 overflow-hidden">
              <div className="fw-bold text-slate-900 text-truncate">{user.name}</div>
              <div className="text-slate-500 small text-truncate">{user.role}</div>
            </div>
            <button className="btn btn-link text-slate-400 p-0 hover:text-danger" title="Logout" onClick={onLogout}>
              <i className="bi bi-box-arrow-right fs-5"></i>
            </button>
          </div>
        )}

        <div className="d-flex gap-2 p-1 bg-slate-100 rounded-pill">
          <button 
            className={`btn btn-sm flex-grow-1 rounded-pill fw-bold ${i18n.language === 'en' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
            onClick={() => changeLanguage('en')}
            style={{ fontSize: '0.75rem', border: 'none' }}
          >
            EN
          </button>
          <button 
            className={`btn btn-sm flex-grow-1 rounded-pill fw-bold ${i18n.language === 'mr' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
            onClick={() => changeLanguage('mr')}
            style={{ fontSize: '0.75rem', border: 'none' }}
          >
            MR
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
