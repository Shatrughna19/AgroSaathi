import { useTranslation } from 'react-i18next'

export default function AdminHeader({ officer, onLogout }) {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <header className="admin-header shadow-sm">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
           <div className="bg-success text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <i className="bi bi-shield-check h4 mb-0"></i>
           </div>
           <div>
              <h1 className="admin-title mb-0" style={{ fontSize: '1.4rem' }}>AgroSaathi <span className="text-muted fw-light">प्रशासन</span></h1>
              <p className="small text-muted mb-0 d-none d-md-block" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verify and Manage Crop Listings</p>
           </div>
        </div>

        <div className="d-flex gap-4 align-items-center">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle rounded-pill px-3"
              type="button"
              id="languageDropdown"
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-translate me-1"></i>
              {i18n.language.toUpperCase()}
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4" aria-labelledby="languageDropdown">
              <li>
                <a
                  className="dropdown-item py-2 px-3"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    changeLanguage('en')
                  }}
                >
                  <span className={i18n.language === 'en' ? 'fw-bold text-success' : ''}>English</span>
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item py-2 px-3"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    changeLanguage('mr')
                  }}
                >
                   <span className={i18n.language === 'mr' ? 'fw-bold text-success' : ''}>मराठी (Marathi)</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="vertical-divider d-none d-md-block" style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>

          <div className="d-flex align-items-center gap-3">
             <div className="text-end d-none d-lg-block">
                <div className="fw-bold text-dark small leading-none">{officer.name}</div>
                <div className="text-muted" style={{ fontSize: '0.65rem' }}>{t('admin.role')}</div>
             </div>
             <button
               className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
               onClick={onLogout}
             >
               <i className="bi bi-box-arrow-right me-1"></i>
               {t('dashboard.logout')}
             </button>
          </div>
        </div>
      </div>
    </header>
  )
}
