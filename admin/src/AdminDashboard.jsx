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
      const response = await fetch('http://localhost:8081/api/marketplace/listings')
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
    // Remove verified crop from list
    setCrops(crops.filter(crop => crop.id !== selectedCrop.id))
    setSelectedCrop(null)
    // Optionally show success notification
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
    <div className="fade-in">
      <div className="dashboard-hero p-5 text-white">
        <h2 className="mb-2">{t('dashboard.welcome')}, {officer.name}</h2>
        <p className="mb-0">{t('dashboard.officerId')}: {officer.officerId}</p>
      </div>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm">
            <h5 className="text-muted mb-2">{t('dashboard.totalPending')}</h5>
            <h2 className="text-success">{crops.length}</h2>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">{t('common.loading')}...</span>
          </div>
        </div>
      ) : crops.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          {t('dashboard.noPendingCrops')}
        </div>
      ) : (
        <div className="row">
          {crops.map((crop) => (
            <div key={crop.id} className="col-md-6 col-lg-4 mb-4">
              <div className="crop-card p-4">
                <h5 className="mb-3">{crop.cropName}</h5>
                <div className="mb-2">
                  <small className="text-muted">{t('dashboard.farmer')}:</small>
                  <p className="mb-0">{crop.farmerName}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">{t('dashboard.quantity')}:</small>
                  <p className="mb-0">{crop.quantity} {crop.unit}</p>
                </div>
                <div className="mb-3">
                  <small className="text-muted">{t('dashboard.price')}:</small>
                  <p className="mb-0">₹{crop.pricePerUnit}/{crop.unit}</p>
                </div>
                <button
                  className="admin-btn btn btn-success w-100"
                  onClick={() => setSelectedCrop(crop)}
                >
                  {t('verification.verifyCrop')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
