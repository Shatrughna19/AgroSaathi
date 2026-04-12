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
        setTimeout(() => {
          onRegisterSuccess({ name: formData.name, email: formData.email })
        }, 5000)
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
      <div className="row justify-content-center pt-5">
        <div className="col-md-6">
          <div className="stat-card text-center p-5 fade-in border-top border-5 border-success shadow-lg">
            <div className="bg-success text-white p-3 rounded-circle d-inline-block mb-4 shadow-sm">
                <i className="bi bi-person-check-fill display-4"></i>
            </div>
            <h2 className="fw-black text-dark mb-3">{t('register.success')}</h2>
            <div className="bg-light p-4 rounded-4 mb-4">
               <p className="text-muted small mb-2 uppercase fw-bold tracking-wider">Your Official Officer ID</p>
               <h1 className="display-3 fw-black text-success mb-0">{generatedId}</h1>
            </div>
            <p className="text-muted mb-4 lead">
              {t('register.successDescription')}
            </p>
            <div className="alert alert-info rounded-4 border-0 small">
               Redirecting to login portal in a few seconds...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="row justify-content-center py-5">
      <div className="col-md-7">
        <div className="stat-card p-5 fade-in shadow-lg">
          <div className="text-center mb-5">
            <h2 className="fw-black text-dark mb-1">{t('register.title')}</h2>
            <p className="text-muted">Join the AgroSaathi Verification Network</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
               <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-exclamation-triangle"></i>
                  {error}
               </div>
            )}

            <div className="row g-4">
               <div className="col-md-6">
                 <label className="form-label text-dark fw-bold small uppercase">{t('register.name')}</label>
                 <input type="text" name="name" className="admin-input form-control" value={formData.name} onChange={handleChange} placeholder="First & Last Name" />
               </div>
               
               <div className="col-md-6">
                 <label className="form-label text-dark fw-bold small uppercase">{t('register.email')}</label>
                 <input type="email" name="email" className="admin-input form-control" value={formData.email} onChange={handleChange} placeholder="official@dept.gov" />
               </div>

               <div className="col-md-6">
                 <label className="form-label text-dark fw-bold small uppercase">{t('register.designation')}</label>
                 <input type="text" name="designation" className="admin-input form-control" value={formData.designation} onChange={handleChange} placeholder="e.g. Agri-Inspector" />
               </div>

               <div className="col-md-6">
                 <label className="form-label text-dark fw-bold small uppercase">{t('register.phone')}</label>
                 <input type="tel" name="phone" className="admin-input form-control" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
               </div>

               <div className="col-md-6">
                 <label className="form-label text-dark fw-bold small uppercase">{t('register.password')}</label>
                 <input type="password" name="password" className="admin-input form-control" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" />
               </div>

               <div className="col-md-6">
                 <label className="form-label text-dark fw-bold small uppercase">{t('register.confirmPassword')}</label>
                 <input type="password" name="confirmPassword" className="admin-input form-control" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
               </div>
            </div>

            <div className="mt-5">
              <button
                type="submit"
                className="admin-btn w-100 py-3"
                disabled={loading}
                style={{ background: 'var(--grad-emerald)' }}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-person-plus-fill me-2"></i>}
                {t('register.submit')}
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-muted small">{t('register.haveAccount')}</span>
              <button
                type="button"
                className="btn btn-link text-success fw-bold text-decoration-none small"
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
