import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CropVerification({ crop, officer, onBack, onVerificationComplete }) {
  const { t } = useTranslation()
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('PENDING')
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
          cropListingId: crop.id,
          officerId: officer.officerId,
          status: verificationStatus,
          feedback: feedback,
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
    <div className="fade-in">
      <button className="btn btn-light mb-4" onClick={onBack}>
        ← {t('common.back')}
      </button>

      <div className="row">
        <div className="col-md-8">
          <div className="card crop-card p-5 mb-4">
            <h2 className="mb-4">{crop.cropName}</h2>

            <div className="row mb-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label text-muted">{t('verification.farmer')}</label>
                  <p className="font-weight-bold">{crop.farmerName}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">{t('verification.quantity')}</label>
                  <p className="font-weight-bold">{crop.quantity} {crop.unit}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label text-muted">{t('verification.price')}</label>
                  <p className="font-weight-bold">₹{crop.pricePerUnit}/{crop.unit}</p>
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted">{t('verification.description')}</label>
                  <p>{crop.descripton || crop.description || t('common.notProvided')}</p>
                </div>
              </div>
            </div>

            <hr />

            <div className="mb-4">
              <label className="form-label text-dark fw-bold">{t('verification.feedback')}</label>
              <textarea
                className="admin-input form-control"
                rows="5"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={t('verification.feedbackPlaceholder')}
              />
              <small className="text-muted">{t('verification.feedbackLengthInfo')}</small>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex gap-3">
              <button
                className="admin-btn btn btn-success flex-grow-1"
                onClick={handleApprove}
                disabled={loading || !feedback.trim()}
              >
                {loading ? t('common.processing') : t('verification.approve')}
              </button>
              <button
                className="admin-btn btn btn-danger flex-grow-1"
                onClick={handleReject}
                disabled={loading || !feedback.trim()}
              >
                {loading ? t('common.processing') : t('verification.reject')}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm">
            <h5 className="mb-3">{t('verification.summary')}</h5>
            <div className="mb-3">
              <small className="text-muted d-block">{t('verification.officer')}</small>
              <strong>{officer.name}</strong>
            </div>
            <div className="mb-3">
              <small className="text-muted d-block">{t('verification.designation')}</small>
              <strong>{officer.designation || t('common.notProvided')}</strong>
            </div>
            <div className="mb-3">
              <small className="text-muted d-block">{t('verification.officerId')}</small>
              <strong>{officer.officerId}</strong>
            </div>
            <hr />
            <button
              className="btn btn-outline-secondary w-100"
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
