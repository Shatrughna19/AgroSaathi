import { useState } from 'react'
import './App.css'

function Register({ onBackToLogin }) {
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

    if (!formData.name || !formData.mobile || !formData.email || !formData.password) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8081/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Connection Unsuccessful')
      }

      setStatus({ type: 'success', message: 'User registered successfully!' })
      setFormData({ name: '', mobile: '', email: '', aadharno: '', password: '', role: 'Farmer' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-background fade-in">
      <div className="container py-5 d-flex align-items-center justify-content-center">
        <div className="auth-card shadow-lg rounded-4 p-4 p-md-5 hover-lift">
          <h2 className="mb-4 text-center text-success">Register</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                id="name"
                name="name"
                className="form-control agro-input"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="mobile" className="form-label">
                Mobile Number
              </label>
              <input
                id="mobile"
                className="form-control agro-input"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                className="form-control agro-input"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="aadharno" className="form-label">
                Aadhar Number
              </label>
              <input
                id="aadharno"
                className="form-control agro-input"
                name="aadharno"
                type="text"
                maxLength={12}
                value={formData.aadharno}
                onChange={handleChange}
                placeholder="Enter your Aadhar Number"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="form-select agro-input"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Farmer">Farmer</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                className="form-control agro-input"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-success w-100 agro-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
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
              ← Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register