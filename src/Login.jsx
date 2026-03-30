import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Login({ onBackToRegister, onLoginSuccess }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    aadharno: '',
    password: '',
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

    if (!formData.aadharno || !formData.password) {
      setStatus({ type: 'error', message: t('login.pleaseFillAll') })
      return
    }

    if (formData.aadharno.length !== 12) {
      setStatus({ type: 'error', message: t('login.aadharMust12') })
      return
    }

    setLoading(true)
    let response
    try {
      response = await fetch('http://localhost:8081/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
    } catch (networkError) {
      // Only runs when backend is completely unreachable
      setStatus({ type: 'error', message: t('login.cannotConnect') })
      setLoading(false)
      return
    }

    try {
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        // Server responded with a proper error (wrong credentials, user not found, etc.)
        setStatus({ type: 'error', message: data.message || t('login.loginFailed') })
        setLoading(false)
        return
      }

      setStatus({ type: 'success', message: data.message || 'Login successful!' })
      if (onLoginSuccess && data.user) {
        onLoginSuccess(data.user)
      }
      setFormData({ aadharno: '', password: '' })
    } catch (error) {
      setStatus({ type: 'error', message: t('login.unexpectedError') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-background fade-in">
      <div className="container py-5 d-flex align-items-center justify-content-center">
        <div className="auth-card shadow-lg rounded-4 p-4 p-md-5 hover-lift">
          <h2 className="mb-4 text-center text-success">{t('login.title')}</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="aadharno" className="form-label">
                {t('login.aadharNumber')}
              </label>
              <input
                id="aadharno"
                className="form-control agro-input"
                name="aadharno"
                type="text"
                maxLength={12}
                value={formData.aadharno}
                onChange={handleChange}
                placeholder={t('login.aadharNumber')}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                {t('login.password')}
              </label>
              <input
                id="password"
                className="form-control agro-input"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login.password')}
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100 agro-btn" disabled={loading}>
              {loading ? t('login.loggingIn') : t('login.submit')}
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

          {onBackToRegister && (
            <button
              type="button"
              className="btn btn-link w-100 mt-3 text-decoration-none text-success"
              onClick={onBackToRegister}
            >
              {t('login.backToRegister')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login

