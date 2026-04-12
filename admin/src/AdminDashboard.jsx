import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import CropVerification from './CropVerification'

export default function AdminDashboard({ officer }) {
  const { t } = useTranslation()
  const [crops, setCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPendingCrops()
  }, [])

  const fetchPendingCrops = async () => {
    try {
      // Changed to the new admin-specific endpoint to bypassing storefront filters
      const response = await fetch('http://localhost:8081/api/marketplace/admin/listings')
      const data = await response.json()
      
      if (response.ok) {
        // Filter for unverified crops
        const unverified = data.filter(crop => crop.verificationStatus === 'UNVERIFIED' || !crop.verificationStatus)
        setCrops(unverified)
      } else {
        setError(t('dashboard.errorFetchingCrops'))
      }
    } catch (err) {
      setError(t('dashboard.cannotConnect'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationComplete = (status) => {
    setCrops(crops.filter(crop => crop.id !== selectedCrop.id))
    setSelectedCrop(null)
    alert(t('dashboard.verificationSubmitted'))
  }

  if (selectedCrop) {
    return (
      <CropVerification
        crop={selectedCrop}
        officer={officer}
        onBack={() => setSelectedCrop(null)}
        onVerificationComplete={handleVerificationComplete}
      />
    )
  }

  return (
    <div className="fade-in container py-5">
      <div className="dashboard-hero mb-5 shadow-lg">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge bg-white text-success px-3 py-2 rounded-pill fw-bold mb-3">{t('admin.role')}</span>
            <h2 className="display-4 fw-extrabold text-white mb-2">{t('dashboard.welcome')}, {officer.name}</h2>
            <p className="lead text-white-50 opacity-75 mb-0">
              <i className="bi bi-person-badge me-2"></i>
              {t('dashboard.officerId')}: {officer.officerId}
            </p>
          </div>
          <div className="col-lg-4 text-lg-end d-none d-lg-block">
             <i className="bi bi-shield-check display-1 text-white opacity-25"></i>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="icon-box bg-warning-subtle text-warning p-3 rounded-4">
                <i className="bi bi-hourglass-split h4 mb-0"></i>
              </div>
              <h5 className="text-secondary fw-bold mb-0">{t('dashboard.totalPending')}</h5>
            </div>
            <h2 className="display-5 fw-black text-dark mb-0">{crops.length}</h2>
            <p className="text-muted small mt-2">{t('dashboard.requiresAttention') || 'Requires immediate attention'}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center gap-3 p-4 mb-4 fade-in">
          <i className="bi bi-exclamation-octagon h3 mb-0"></i>
          <div>
            <div className="fw-bold">{t('dashboard.error')}</div>
            <div className="small">{error}</div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">{t('dashboard.pendingListings')}</h3>
          <p className="text-muted mb-0">Review and verify new crop listings from farmers</p>
        </div>
        <button className="btn btn-outline-custom" onClick={fetchPendingCrops}>
          <i className="bi bi-arrow-clockwise me-2"></i> {t('common.refresh')}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">{t('common.loading')}...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-5 opacity-50">
          <i className="bi bi-cloud-slash display-1 mb-3 d-block"></i>
          <p>{t('dashboard.checkConnection') || 'Please check your connection to the server.'}</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="stat-card text-center py-5">
          <i className="bi bi-check-circle-fill display-1 text-success opacity-25 mb-4 d-block"></i>
          <h4 className="fw-bold text-dark">{t('dashboard.noPendingCrops')}</h4>
          <p className="text-muted">All clear! Check back later for new submissions.</p>
        </div>
      ) : (
        <div className="row g-4">
          {crops.map((crop) => (
            <div key={crop.id} className="col-md-6 col-lg-4">
              <div className="crop-card">
                <div className="mb-4 d-flex justify-content-between align-items-start">
                   <h5 className="crop-title mb-0">{crop.cropName}</h5>
                   <span className="badge rounded-pill bg-light text-dark px-2 py-1 small border">ID: {crop.id}</span>
                </div>
                
                <div className="space-y-3 flex-grow-1">
                  <div className="d-flex justify-content-between border-bottom pb-2">
                    <span className="text-muted small">{t('dashboard.farmer')}</span>
                    <span className="fw-bold text-dark">{crop.farmerName}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mt-2">
                    <span className="text-muted small">{t('dashboard.quantity')}</span>
                    <span className="fw-bold text-dark">{crop.quantity}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mt-2">
                    <span className="text-muted small">{t('dashboard.price')}</span>
                    <span className="fw-bold text-success">₹{crop.pricePerUnit} / unit</span>
                  </div>
                </div>

                <div className="mt-4 pt-3">
                  <button
                    className="admin-btn w-100"
                    onClick={() => setSelectedCrop(crop)}
                  >
                    <i className="bi bi-clipboard-check me-2"></i>
                    {t('verification.verifyCrop')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
