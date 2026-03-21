import { useState } from 'react'
import './App.css'
import Register from './Register.jsx'
import Login from './Login.jsx'
import Marketplace from './Marketplace.jsx'
import Header from './Header.jsx'
import Profile from './Profile.jsx'

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  
  const [activePage, setActivePage] = useState(user ? 'profile' : 'home')

  const handleLoginSuccess = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setActivePage('profile')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    setUser(null)
    setActivePage('home')
  }

  const renderContent = () => {
    if (activePage === 'register') {
      return <Register onBackToLogin={() => setActivePage('login')} />
    }

    if (activePage === 'login') {
      return <Login onBackToRegister={() => setActivePage('register')} onLoginSuccess={handleLoginSuccess} />
    }

    if (activePage === 'profile' && user) {
      return <Profile user={user} onLogout={handleLogout} />
    }

    if (activePage === 'marketplace') {
      if (!user) {
        return (
          <div className="page-background fade-in">
            <div className="container py-5 text-center">
              <div className="auth-card shadow-lg rounded-4 p-4 p-md-5 mx-auto">
                <h3 className="text-danger mb-3">Access Denied</h3>
                <p className="text-muted">You must be logged in to view the marketplace.</p>
                <button className="btn btn-success mt-3 agro-btn w-100" onClick={() => setActivePage('login')}>
                  Login Now
                </button>
              </div>
            </div>
          </div>
        )
      }
      return <Marketplace user={user} />
    }

    return (
      <div className="page-background fade-in">
        <div className="container py-5 d-flex align-items-center justify-content-center">
          <div className="home-card text-center shadow-lg rounded-4 p-4 p-md-5 hover-lift">
            <h2 className="mb-3 text-success">Welcome to Agro Saathi</h2>
            <p className="text-muted mb-4">
              A single place to manage registrations, secure logins and connect bulk buyers with trusted farmers.
            </p>

            <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
              {!user ? (
                <>
                  <button
                    type="button"
                    className="btn btn-success agro-btn flex-fill"
                    onClick={() => setActivePage('register')}
                  >
                    Register New Farmer / User
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success agro-btn flex-fill"
                    onClick={() => setActivePage('login')}
                  >
                    Login (Existing User)
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-success agro-btn flex-fill"
                  onClick={() => setActivePage('profile')}
                >
                  View My Profile
                </button>
              )}
            </div>

            <hr className="my-4" />

            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <div className="text-start">
                <h6 className="mb-1 text-success">Looking to buy in bulk?</h6>
                <p className="mb-0 small text-muted">
                  Explore rice, cashew and mango lots directly from farms and FPO networks.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-warning agro-btn flex-shrink-0"
                onClick={() => {
                  if (user) {
                    setActivePage('marketplace')
                  } else {
                    alert('Please login to access the marketplace')
                    setActivePage('login')
                  }
                }}
              >
                Explore Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-root">
      <Header activePage={activePage} onNavigate={setActivePage} user={user} />
      {renderContent()}
    </div>
  )
}

export default App
