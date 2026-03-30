import { useTranslation } from 'react-i18next'

export default function AdminHeader({ officer, onLogout }) {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  return (
    <header className="admin-header">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h1 className="admin-title">{t('admin.title')}</h1>
          <p className="admin-subtitle">{t('admin.tagline')}</p>
        </div>

        <div className="d-flex gap-3 align-items-center">
          <div className="dropdown">
            <button
              className="btn btn-sm btn-light dropdown-toggle"
              type="button"
              id="languageDropdown"
              data-bs-toggle="dropdown"
            >
              {i18n.language.toUpperCase()}
            </button>
            <ul className="dropdown-menu" aria-labelledby="languageDropdown">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    changeLanguage('en')
                  }}
                >
                  {t('common.english')}
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    changeLanguage('mr')
                  }}
                >
                  {t('common.marathi')}
                </a>
              </li>
            </ul>
          </div>

          <span className="text-white">{officer.name}</span>
          <button
            className="btn btn-light btn-sm"
            onClick={onLogout}
          >
            {t('dashboard.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
