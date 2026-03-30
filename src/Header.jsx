import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import notifIcon from './assets/notification-icon.svg'
import userIcon from './assets/user.png'
import homeIcon from './assets/home.png'

function Header({ activePage, onNavigate, user }) {
  const { t, i18n } = useTranslation()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const API_BASE = 'http://localhost:8081/api/marketplace'

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setShowLanguageMenu(false)
  }

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const notifRes = await fetch(`${API_BASE}/notifications/user/${user.id}`)
          if (notifRes.ok) {
            const data = await notifRes.json();
            setNotifications(data);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error)
        }
      }
      fetchNotifications()
    }
  }, [user])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleNavClick = (page) => {
    onNavigate(page)
    setIsNavOpen(false)
  }

  const markAsRead = async (notifId) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/${notifId}/read`, { method: 'PUT' })
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n))
      }
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  return (
    <header className="agro-header shadow-sm position-relative">
      <div className="container d-flex align-items-center justify-content-between py-2">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-circle d-flex align-items-center justify-content-center">
            <span className="logo-text">AS</span>
          </div>
          <div>
            <h1 className="brand-title mb-0">Agro Saathi</h1>
            <small className="brand-subtitle text-light">{t('home.subtitle')}</small>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="btn d-md-none border-0 text-success fs-3 p-0 pe-2" 
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* Desktop Navigation */}
        <nav className="d-none d-md-flex gap-3 align-items-center">
          <button
            type="button"
            className={`btn btn-link border-0 p-0 d-flex align-items-center justify-content-center ${
              activePage === 'home' ? 'active' : ''
            }`}
            title={t('header.home')}
            onClick={() => onNavigate('home')}
            style={{ background: 'none', textDecoration: 'none', width: '40px', height: '40px', overflow: 'hidden' }}
          >
            <img src={homeIcon} alt="Home" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
          </button>
          
          {!user ? (
            <>
              <button
                type="button"
                className={`btn btn-sm btn-outline-light agro-nav-btn ${
                  activePage === 'register' ? 'active' : ''
                }`}
                onClick={() => onNavigate('register')}
              >
                {t('header.register')}
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-outline-light agro-nav-btn ${
                  activePage === 'login' ? 'active' : ''
                }`}
                onClick={() => onNavigate('login')}
              >
                {t('header.login')}
              </button>
            </>
          ) : (
            <>
              {/* Notifications Bell */}
              <div className="position-relative" style={{ cursor: 'pointer' }}>
                <button 
                  className="btn btn-link border-0 p-0 position-relative d-flex align-items-center justify-content-center"
                  title={t('header.notifications')}
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ background: 'none', textDecoration: 'none', width: '40px', height: '40px', overflow: 'hidden' }}
                >
                  <img src={notifIcon} alt="Notifications" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                className={`btn btn-sm btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center ${
                  activePage === 'profile' ? 'active bg-white' : ''
                }`}
                title={t('header.profile')}
                onClick={() => onNavigate('profile')}
                style={{ width: '40px', height: '40px', overflow: 'hidden' }}
              >
                <img src={userIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>

              {user.role === 'Farmer' && (
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn ${
                    activePage === 'fertilizer' ? 'active' : ''
                  }`}
                  onClick={() => onNavigate('fertilizer')}
                >
                  {t('header.marketplace')}
                </button>
              )}

              {(user.role === 'Farmer' || user.role === 'Buyer') && (
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn ${
                    activePage === 'orders' ? 'active' : ''
                  }`}
                  onClick={() => onNavigate('orders')}
                >
                  {t('header.orders')}
                </button>
              )}
            </>
          )}

          {/* Language Selector */}
          <div className="position-relative">
            <button 
              className="btn btn-sm btn-outline-light rounded-pill px-3"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              title={t('header.language')}
            >
              🌐 {i18n.language.toUpperCase()}
            </button>
            {showLanguageMenu && (
              <div className="position-absolute top-100 end-0 mt-2 bg-white shadow rounded p-2" style={{ minWidth: '120px', zIndex: 1050 }}>
                <button 
                  className={`btn btn-sm btn-block w-100 text-start mb-1 ${i18n.language === 'en' ? 'btn-success' : 'btn-light'}`}
                  onClick={() => changeLanguage('en')}
                >
                  🇬🇧 English
                </button>
                <button 
                  className={`btn btn-sm btn-block w-100 text-start ${i18n.language === 'mr' ? 'btn-success' : 'btn-light'}`}
                  onClick={() => changeLanguage('mr')}
                >
                  🇮🇳 मराठी
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isNavOpen && (
        <div className="d-md-none position-absolute top-100 start-0 w-100 bg-white shadow bg-body-tertiary rounded-bottom z-3 p-3 border-top" style={{zIndex: 1050}}>
          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                activePage === 'home' ? 'active' : ''
              }`}
              onClick={() => handleNavClick('home')}
            >
              {t('header.home')}
            </button>
            
            {!user ? (
              <>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                    activePage === 'register' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('register')}
                >
                  {t('header.register')}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                    activePage === 'login' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('login')}
                >
                  {t('header.login')}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`btn btn-sm btn-link text-start w-100 mb-2`}
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ textDecoration: 'none', color: 'white' }}
                >
                  <img src={notifIcon} alt="Notifications" className="me-2" style={{ width: '20px' }} />
                  {t('header.notifications')} {unreadCount > 0 && `(${unreadCount})`}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                    activePage === 'profile' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('profile')}
                >
                  <i className="bi bi-person-circle me-2"></i> {t('header.profile')}
                </button>

                {user.role === 'Farmer' && (
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                      activePage === 'fertilizer' ? 'active' : ''
                    }`}
                    onClick={() => handleNavClick('fertilizer')}
                  >
                    {t('header.marketplace')}
                  </button>
                )}

                {(user.role === 'Farmer' || user.role === 'Buyer') && (
                  <button
                    type="button"
                    className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                      activePage === 'orders' ? 'active' : ''
                    }`}
                    onClick={() => handleNavClick('orders')}
                  >
                    {t('header.orders')}
                  </button>
                )}

                {/* Language Selector Mobile */}
                <hr className="my-2" />
                <div className="d-flex flex-column gap-2">
                  <small className="text-muted">{t('header.selectLanguage')}</small>
                  <button 
                    className={`btn btn-sm btn-block w-100 text-start ${i18n.language === 'en' ? 'btn-success' : 'btn-light'}`}
                    onClick={() => { changeLanguage('en'); handleNavClick(''); }}
                  >
                    🇬🇧 English
                  </button>
                  <button 
                    className={`btn btn-sm btn-block w-100 text-start ${i18n.language === 'mr' ? 'btn-success' : 'btn-light'}`}
                    onClick={() => { changeLanguage('mr'); handleNavClick(''); }}
                  >
                    🇮🇳 मराठी
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && user && (
        <div className="position-absolute top-100 end-0 mt-2 me-3 card border-2 border-success shadow-lg rounded-4" style={{ width: '350px', maxHeight: '400px', overflowY: 'auto', zIndex: 1050 }}>
          <div className="card-header bg-success text-white rounded-top-4 p-3">
            <h6 className="mb-0"><i className="bi bi-bell me-2"></i> {t('header.notifications')}</h6>
          </div>
          <div className="card-body p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted">
                <p className="mb-0">{t('common.info')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className={`p-3 border-bottom ${notification.isRead ? 'bg-light' : 'bg-warning-subtle'}`}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">{notification.senderName}</h6>
                      <p className="mb-2 text-muted small">{notification.message}</p>
                      {notification.type === 'ORDER_PLACED' && (
                        <div className="small text-dark">
                          <i className="bi bi-info-circle me-1"></i> {t('marketplace.cropName')}: <strong>{notification.cropName}</strong> | {t('marketplace.quantity')}: {notification.quantity} | ₹{notification.price}
                        </div>
                      )}
                    </div>
                    <div className="d-flex flex-column align-items-end gap-2">
                      <span className={`badge ${notification.isRead ? 'bg-secondary' : 'bg-success'} rounded-pill`}>
                        {notification.type === 'ORDER_PLACED' ? t('orders.title') : t('header.contact')}
                      </span>
                      {!notification.isRead && (
                        <button 
                          className="btn btn-sm btn-link p-0 text-success small fw-bold" 
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                          style={{ fontSize: '11px', textDecoration: 'none' }}
                        >
                          {t('common.info')}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-muted small mb-2">
                    📱 {notification.senderMobile} | 📧 {notification.senderEmail}
                  </div>
                  <div className="d-flex gap-2">
                    <a href={`tel:${notification.senderMobile}`} className="btn btn-sm btn-success rounded-pill px-2">
                      {t('common.contact')}
                    </a>
                    <a href={`mailto:${notification.senderEmail}`} className="btn btn-sm btn-outline-success rounded-pill px-2">
                      Email
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

