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
        onLoginSuccess({ 
          name: data.name, 
          email: data.email, 
          officerId: data.officerId,
          designation: data.designation,
          district: data.district 
        })
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
    <div className="row justify-content-center pt-5">
      <div className="col-md-5">
        <div className="stat-card fade-in border-top border-5 border-success p-5 shadow-lg">
          <div className="text-center mb-5">
            <div className="bg-success-subtle text-success p-3 rounded-circle d-inline-block mb-3">
              <i className="bi bi-shield-lock display-6"></i>
            </div>
            <h2 className="fw-black text-dark mb-1">{t('login.title')}</h2>
            <p className="text-muted">{t('admin.tagline')}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="form-label text-dark fw-bold small uppercase">{t('login.officerId')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-4">
                  <i className="bi bi-person-badge text-muted"></i>
                </span>
                <input
                  type="text"
                  name="officerId"
                  className="admin-input form-control rounded-end-4"
                  value={formData.officerId}
                  onChange={handleChange}
                  placeholder="ID Number"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="form-label text-dark fw-bold small uppercase">{t('login.password')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0 rounded-start-4">
                  <i className="bi bi-key text-muted"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="admin-input form-control rounded-end-4"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="admin-btn w-100 mb-4 py-3"
              disabled={loading}
              style={{ background: 'var(--grad-emerald)' }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-box-arrow-in-right me-2"></i>
              )}
              {t('login.submit')}
            </button>

            <div className="text-center">
              <span className="text-muted small">{t('login.noAccount')}</span>
              <button
                type="button"
                className="btn btn-link text-success fw-bold text-decoration-none small"
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
