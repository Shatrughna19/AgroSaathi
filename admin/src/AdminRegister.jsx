import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function AdminRegister({ onRegisterSuccess, onSwitchToLogin }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedId, setGeneratedId] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError(t('register.pleaseFilAll'))
      return
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordMinChars'))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordNotMatch'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8081/api/officers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          designation: formData.designation,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedId(data.officerId)
        // Show success state for a moment before switching to login
        setTimeout(() => {
          onRegisterSuccess({ name: formData.name, email: formData.email })
        }, 3000)
      } else {
        setError(data.message || t('register.registrationFailed'))
      }
    } catch (err) {
      setError(t('register.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  if (generatedId) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card auth-card text-center p-5">
            <div className="alert alert-success">
              {t('register.success')} <strong>{generatedId}</strong>
            </div>
            <p className="text-muted mb-0">
              {t('register.successDescription')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card auth-card p-5 fade-in">
          <h2 className="text-center mb-4 text-dark">{t('register.title')}</h2>

          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label text-dark">{t('register.name')}</label>
              <input
                type="text"
                name="name"
                className="admin-input form-control"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('register.name')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-dark">{t('register.email')}</label>
              <input
                type="email"
                name="email"
                className="admin-input form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('register.email')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-dark">{t('register.designation')}</label>
              <input
                type="text"
                name="designation"
                className="admin-input form-control"
                value={formData.designation}
                onChange={handleChange}
                placeholder={t('register.designation')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-dark">{t('register.phone')}</label>
              <input
                type="tel"
                name="phone"
                className="admin-input form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('register.phone')}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-dark">{t('register.password')}</label>
              <input
                type="password"
                name="password"
                className="admin-input form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register.password')}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-dark">{t('register.confirmPassword')}</label>
              <input
                type="password"
                name="confirmPassword"
                className="admin-input form-control"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('register.confirmPassword')}
              />
            </div>

            <button
              type="submit"
              className="admin-btn btn btn-success w-100 mb-3"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('register.submit')}
            </button>

            <div className="text-center">
              <span className="text-dark">{t('register.haveAccount')}</span>
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={onSwitchToLogin}
              >
                {t('register.loginHere')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
