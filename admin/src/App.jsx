import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AdminHeader from './AdminHeader'
import AdminRegister from './AdminRegister'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import './App.css'

export default function AdminApp() {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState('login')
  const [officerData, setOfficerData] = useState(null)

  // Check if officer is already logged in
  useEffect(() => {
    const storedOfficer = sessionStorage.getItem('adminOfficer')
    if (storedOfficer) {
      setOfficerData(JSON.parse(storedOfficer))
      setCurrentPage('dashboard')
    }
  }, [])

  const handleRegisterSuccess = (officer) => {
    setOfficerData(officer)
    sessionStorage.setItem('adminOfficer', JSON.stringify(officer))
    setCurrentPage('login')
  }

  const handleLoginSuccess = (officer) => {
    setOfficerData(officer)
    sessionStorage.setItem('adminOfficer', JSON.stringify(officer))
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setOfficerData(null)
    sessionStorage.removeItem('adminOfficer')
    setCurrentPage('login')
  }

  return (
    <div className="page-background" style={{ minHeight: '100vh' }}>
      {officerData && <AdminHeader officer={officerData} onLogout={handleLogout} />}

      <div className="container mt-5">
        {currentPage === 'login' && !officerData && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}

        {currentPage === 'register' && !officerData && (
          <AdminRegister
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'dashboard' && officerData && (
          <AdminDashboard officer={officerData} />
        )}
      </div>
    </div>
  )
}
