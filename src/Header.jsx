import { useState } from 'react'
import './App.css'

function Header({ activePage, onNavigate, user }) {
  const [isNavOpen, setIsNavOpen] = useState(false)

  const handleNavClick = (page) => {
    onNavigate(page)
    setIsNavOpen(false)
  }

  return (
    <header className="agro-header shadow-sm position-relative">
      <div className="container d-flex align-items-center justify-content-between py-2">
        <div className="d-flex align-items-center gap-2">
          <div className="logo-circle d-flex align-items-center justify-content-center">
            <span className="logo-text">AS</span>
          </div>
          <div>
            <h1 className="brand-title mb-0">Agro Saathi</h1>
            <small className="brand-subtitle text-light">Your partner in smart farming</small>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="btn d-md-none border-0 text-success fs-3 p-0 pe-2" 
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        {/* Desktop Navigation */}
        <nav className="d-none d-md-flex gap-2">
          <button
            type="button"
            className={`btn btn-sm btn-outline-light agro-nav-btn ${
              activePage === 'home' ? 'active' : ''
            }`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          
          {!user ? (
            <>
              <button
                type="button"
                className={`btn btn-sm btn-outline-light agro-nav-btn ${
                  activePage === 'register' ? 'active' : ''
                }`}
                onClick={() => onNavigate('register')}
              >
                Register
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-outline-light agro-nav-btn ${
                  activePage === 'login' ? 'active' : ''
                }`}
                onClick={() => onNavigate('login')}
              >
                Login
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`btn btn-sm btn-outline-light agro-nav-btn ${
                  activePage === 'profile' ? 'active' : ''
                }`}
                onClick={() => onNavigate('profile')}
              >
                Profile
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-warning agro-nav-btn ${
                  activePage === 'marketplace' ? 'active' : ''
                }`}
                onClick={() => onNavigate('marketplace')}
              >
                Marketplace
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isNavOpen && (
        <div className="d-md-none position-absolute top-100 start-0 w-100 bg-white shadow bg-body-tertiary rounded-bottom z-3 p-3 border-top" style={{zIndex: 1050}}>
          <div className="d-flex flex-column gap-2">
            <button
              type="button"
              className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                activePage === 'home' ? 'active' : ''
              }`}
              onClick={() => handleNavClick('home')}
            >
              Home
            </button>
            
            {!user ? (
              <>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                    activePage === 'register' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('register')}
                >
                  Register
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                    activePage === 'login' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('login')}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`btn btn-sm btn-outline-light agro-nav-btn text-start ${
                    activePage === 'profile' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('profile')}
                >
                  Profile
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-warning agro-nav-btn text-start ${
                    activePage === 'marketplace' ? 'active' : ''
                  }`}
                  onClick={() => handleNavClick('marketplace')}
                >
                  Marketplace
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

