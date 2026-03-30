import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Register({ onBackToLogin }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    aadharno: '',
    password: '',
    role: 'Farmer',
  })

  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    if (!formData.name || !formData.mobile || !formData.email || !formData.aadharno || !formData.password) {
      setStatus({ type: 'error', message: t('register.pleaseFillAll') })
      return
    }

    if (formData.aadharno.length !== 12) {
      setStatus({ type: 'error', message: t('register.aadharMust12') })
      return
    }

    if (formData.password.length < 6) {
      setStatus({ type: 'error', message: t('register.passwordMinimum') })
      return
    }

    setLoading(true)
    let response
    try {
      response = await fetch('http://localhost:8081/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
    } catch (networkError) {
      // This block only runs when the server is unreachable (backend not started)
      setStatus({ type: 'error', message: t('register.cannotConnect') })
      setLoading(false)
      return
    }

    try {
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        // Server responded with an error (e.g. email already registered)
        setStatus({ type: 'error', message: data.message || t('register.registrationFailed') })
        return
      }
      setStatus({ type: 'success', message: t('register.success') })
      setFormData({ name: '', mobile: '', email: '', aadharno: '', password: '', role: 'Farmer' })
    } catch (error) {
      setStatus({ type: 'error', message: t('register.unexpectedError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-background fade-in">
      <div className="container py-5 d-flex align-items-center justify-content-center">
        <div className="auth-card shadow-lg rounded-4 p-4 p-md-5 hover-lift">
          <h2 className="mb-4 text-center text-success">{t('register.title')}</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                {t('register.firstName')}
              </label>
              <input
                id="name"
                name="name"
                className="form-control agro-input"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('register.firstName')}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mobile" className="form-label">
                {t('register.mobile')}
              </label>
              <input
                id="mobile"
                className="form-control agro-input"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder={t('register.mobile')}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                {t('register.email')}
              </label>
              <input
                id="email"
                className="form-control agro-input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('register.email')}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="aadharno" className="form-label">
                {t('register.aadharNumber')}
              </label>
              <input
                id="aadharno"
                className="form-control agro-input"
                name="aadharno"
                type="text"
                maxLength={12}
                value={formData.aadharno}
                onChange={handleChange}
                placeholder={t('register.aadharNumber')}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                {t('register.role')}
              </label>
              <select
                id="role"
                name="role"
                className="form-select agro-input"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Farmer">{t('register.farmer')}</option>
                <option value="Buyer">{t('register.buyer')}</option>
                <option value="Shop Owner">{t('register.shopOwner')}</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                {t('register.password')}
              </label>
              <input
                id="password"
                className="form-control agro-input"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register.password')}
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100 agro-btn" disabled={loading}>
              {loading ? t('register.submitting') : t('register.submit')}
            </button>

            {status.message && (
              <div
                className={`alert mt-3 mb-0 ${status.type === 'error' ? 'alert-danger' : 'alert-success'
                  } py-2 small`}
                role="alert"
              >
                {status.message}
              </div>
            )}
          </form>

          {onBackToLogin && (
            <button
              type="button"
              className="btn btn-link w-100 mt-3 text-decoration-none text-success"
              onClick={onBackToLogin}
            >
              {t('register.goToLogin')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register