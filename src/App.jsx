import { useState } from 'react'
import './App.css'
import Register from './Register.jsx'
import Login from './Login.jsx'
import Marketplace from './Marketplace.jsx'
import Sidebar from './Sidebar.jsx'
import Profile from './Profile.jsx'
import OrdersSection from './OrdersSection.jsx'
import FertilizerSection from './FertilizerSection.jsx'

function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  
  const [activePage, setActivePage] = useState('marketplace')

  const handleLoginSuccess = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setActivePage('profile')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    setUser(null)
    setActivePage('marketplace')
  }

  const handleUpdateUser = (updatedData) => {
    sessionStorage.setItem('user', JSON.stringify(updatedData))
    setUser(updatedData)
  }

  const renderContent = () => {
    if (activePage === 'register') {
      return <Register onBackToLogin={() => setActivePage('login')} />
    }

    if (activePage === 'login') {
      return <Login onBackToRegister={() => setActivePage('register')} onLoginSuccess={handleLoginSuccess} />
    }

    if (user) {
      if (activePage === 'profile') {
        return <Profile user={user} onLogout={handleLogout} onUpdate={handleUpdateUser} />
      }
      if (activePage === 'orders') {
        return <OrdersSection user={user} />
      }
      if (activePage === 'fertilizer' && user.role === 'Farmer') {
        return <FertilizerSection user={user} />
      }
    }

    return <Marketplace user={user} onNavigate={setActivePage} />
  }

  return (
    <div className="app-shell">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
        user={user} 
        onLogout={handleLogout} 
      />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
