import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AdminLogin({ onLoginSuccess, onSwitchToRegister }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    officerId: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.officerId || !formData.password) {
      setError(t('login.pleaseFillAll'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8081/api/officers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId: formData.officerId,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onLoginSuccess({ name: data.name, email: data.email, officerId: data.officerId })
      } else {
        setError(data.message || t('login.invalidCredentials'))
      }
    } catch (err) {
      setError(t('login.cannotConnect'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card auth-card p-5 fade-in">
          <h2 className="text-center mb-4 text-dark">{t('login.title')}</h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label text-dark">{t('login.officerId')}</label>
              <input
                type="text"
                name="officerId"
                className="admin-input form-control"
                value={formData.officerId}
                onChange={handleChange}
                placeholder={t('login.officerId')}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-dark">{t('login.password')}</label>
              <input
                type="password"
                name="password"
                className="admin-input form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login.password')}
              />
            </div>

            <button
              type="submit"
              className="admin-btn btn btn-success w-100 mb-3"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('login.submit')}
            </button>

            <div className="text-center">
              <span className="text-dark">{t('login.noAccount')}</span>
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={onSwitchToRegister}
              >
                {t('login.registerHere')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
