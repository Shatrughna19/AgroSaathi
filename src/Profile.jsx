import React from 'react'

function Profile({ user, onLogout }) {
  if (!user) return null

  return (
    <div className="page-background fade-in">
      <div className="container py-5 d-flex align-items-center justify-content-center">
        <div className="profile-card shadow-lg rounded-4 p-4 p-md-5 w-100" style={{ maxWidth: '600px' }}>
          <h2 className="mb-4 text-center text-success">User Profile</h2>
          
          <div className="profile-details mb-4">
            <div className="mb-3 border-bottom pb-2">
              <span className="text-muted small text-uppercase">Name</span>
              <div className="fs-5 fw-medium">{user.name}</div>
            </div>
            <div className="mb-3 border-bottom pb-2">
              <span className="text-muted small text-uppercase">Role</span>
              <div className="fs-5 fw-medium">{user.role}</div>
            </div>
            <div className="mb-3 border-bottom pb-2">
              <span className="text-muted small text-uppercase">Mobile</span>
              <div className="fs-5 fw-medium">{user.mobile}</div>
            </div>
            <div className="mb-3 border-bottom pb-2">
              <span className="text-muted small text-uppercase">Email</span>
              <div className="fs-5 fw-medium">{user.email}</div>
            </div>
            <div className="mb-3 border-bottom pb-2">
              <span className="text-muted small text-uppercase">Aadhar Number</span>
              <div className="fs-5 fw-medium">{user.aadharno}</div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-outline-danger w-100 agro-btn mt-2" 
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
