import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CropVerification({ crop, officer, onBack, onVerificationComplete }) {
  const { t } = useTranslation()
  const [feedback, setFeedback] = useState('')
  const [grade, setGrade] = useState('A')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApprove = async () => {
    if (!feedback.trim()) {
      setError(t('verification.feedbackRequired'))
      return
    }
    await submitVerification('VERIFIED')
  }

  const handleReject = async () => {
    if (!feedback.trim()) {
      setError(t('verification.feedbackRequired'))
      return
    }
    await submitVerification('REJECTED')
  }

  const submitVerification = async (verificationStatus) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8081/api/verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropListingId: crop.id.toString(),
          officerId: officer.officerId,
          status: verificationStatus,
          feedback: feedback,
          grade: grade,
          surveyerName: officer.name,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onVerificationComplete(verificationStatus)
      } else {
        setError(data.message || t('verification.errorSubmitting'))
      }
    } catch (err) {
      setError(t('verification.cannotConnect'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in container pb-5">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-custom p-2 rounded-circle" onClick={onBack} style={{ width: '45px', height: '45px' }}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h4 className="fw-bold text-dark mb-0">{t('verification.verifyCrop')}</h4>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="stat-card mb-4">
            <div className="row">
               {crop.imageUrl && (
                  <div className="col-md-4 mb-3 mb-md-0">
                     <img 
                        src={`http://localhost:8081${crop.imageUrl}`} 
                        alt={crop.cropName} 
                        className="img-fluid rounded-4 shadow-sm h-100 object-fit-cover"
                        style={{ minHeight: '150px' }}
                     />
                  </div>
               )}
               <div className={crop.imageUrl ? "col-md-8" : "col-12"}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h2 className="fw-black text-primary mb-1">{crop.cropName}</h2>
                      <span className="badge rounded-pill bg-light text-dark border px-3 py-1">#{crop.id}</span>
                    </div>
                    <div className="text-end">
                      <div className="h4 fw-bold text-success mb-0">₹{crop.pricePerUnit}</div>
                      <span className="text-muted small">per unit</span>
                    </div>
                  </div>
                  
                  <div className="row g-3 py-3 border-top border-bottom">
                    <div className="col-sm-6">
                      <label className="text-muted small fw-bold text-uppercase">{t('verification.farmer')}</label>
                      <p className="fw-bold mb-0 text-dark">{crop.farmerName}</p>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small fw-bold text-uppercase">{t('verification.quantity')}</label>
                      <p className="fw-bold mb-0 text-dark">{crop.quantity}</p>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small fw-bold text-uppercase">Mobile</label>
                      <p className="mb-0 text-dark">{crop.farmerMobile || 'N/A'}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="mt-4">
                <label className="text-muted small fw-bold text-uppercase mb-2">{t('verification.description')}</label>
                <p className="text-dark leading-relaxed">
                  {crop.description || crop.descripton || t('common.notProvided')}
                </p>
            </div>
          </div>

          <div className="stat-card">
            <h5 className="fw-bold text-dark mb-4 border-bottom pb-3">{t('verification.assessment')}</h5>
            
            <div className="row g-4 mb-4">
               <div className="col-md-4">
                 <label className="form-label fw-bold small">{t('verification.grade')}</label>
                 <select className="form-select admin-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Good)</option>
                    <option value="C">Grade C (Standard)</option>
                    <option value="D">Grade D (Below Par)</option>
                 </select>
               </div>
               <div className="col-md-8">
                 <label className="form-label fw-bold small">{t('verification.feedback')}</label>
                 <textarea
                    className="admin-input form-control"
                    rows="3"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t('verification.feedbackPlaceholder')}
                 />
               </div>
            </div>

            {error && (
              <div className="alert alert-danger rounded-4 border-0 shadow-sm d-flex align-items-center gap-2 mb-4">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}

            <div className="d-flex gap-3">
              <button
                className="admin-btn flex-grow-1 py-3"
                style={{ background: 'var(--grad-emerald)' }}
                onClick={handleApprove}
                disabled={loading || !feedback.trim()}
              >
                {loading ? (
                   <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                   <i className="bi bi-check-circle-fill me-2"></i>
                )}
                {t('verification.approve')}
              </button>
              <button
                className="btn btn-outline-danger border-2 rounded-4 flex-grow-1 fw-bold"
                onClick={handleReject}
                disabled={loading || !feedback.trim()}
              >
                <i className="bi bi-x-circle-fill me-2"></i>
                {t('verification.reject')}
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="stat-card sticky-top" style={{ top: '6rem' }}>
            <h5 className="fw-bold text-dark mb-4 border-bottom pb-2">Verification Summary</h5>
            <div className="space-y-4">
              <div className="bg-light p-3 rounded-4 mb-3">
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Verifying Officer</small>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <div className="bg-primary-light text-primary rounded-circle p-1" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <strong className="text-dark">{officer.name}</strong>
                </div>
              </div>

               <div className="ps-2 space-y-3">
                  <div className="mb-2">
                    <small className="text-muted d-block">{t('verification.designation')}:</small>
                    <span className="text-dark fw-bold">{officer.designation || 'Verification Officer'}</span>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">{t('verification.officerId')}:</small>
                    <span className="text-dark fw-bold font-monospace">{officer.officerId}</span>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted d-block">District:</small>
                    <span className="text-dark fw-bold">{officer.district || 'Assigned Sector'}</span>
                  </div>
               </div>
            </div>
            
            <hr className="my-4 opacity-10" />
            
            <button
              className="btn btn-light w-100 rounded-pill fw-bold text-secondary"
              onClick={onBack}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
