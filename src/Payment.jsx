import { useState, useEffect } from 'react'
import { formatCurrency } from './utils/marketUtils'
import './App.css'

function Payment({ data, onComplete, onCancel }) {
  const { orderId, type, amount, cropName } = data
  const [paymentStep, setPaymentStep] = useState('selection')
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [processingProgress, setProcessingProgress] = useState(0)

  const API_BASE = 'http://localhost:8081/api/marketplace'

  useEffect(() => {
    if (paymentStep === 'processing') {
      const interval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            handlePaymentCompletion()
            return 100
          }
          return prev + 5
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [paymentStep])

  const handlePaymentCompletion = async () => {
    try {
      const endpoint = type === 'partial' 
        ? `${API_BASE}/orders/crop/${orderId}/pay-partial`
        : `${API_BASE}/orders/crop/${orderId}/complete`
      
      const res = await fetch(endpoint, { method: 'PUT' })
      if (res.ok) {
        setPaymentStep('success')
      } else {
        alert('Payment processed but failed to update status. Please contact support.')
        setPaymentStep('selection')
      }
    } catch (e) {
      console.error(e)
      alert('Network error during payment processing.')
      setPaymentStep('selection')
    }
  }

  const renderSelection = () => (
    <div className="fade-in-up">
      <div className="payment-card shadow-premium p-4 p-md-5 rounded-5 bg-white border border-slate-100">
        <div className="text-center mb-5">
            <div className="icon-box-modern bg-indigo-50 text-indigo-600 mx-auto mb-3" style={{width: '64px', height: '64px'}}>
                <i className="bi bi-shield-lock-fill fs-3"></i>
            </div>
          <h2 className="fw-bold text-slate-900">Secure Payment</h2>
          <p className="text-slate-500">Completing transaction for {cropName}</p>
        </div>

        <div className="bg-slate-50 rounded-4 p-4 mb-5 border border-slate-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-slate-500 fw-medium">Order Reference</span>
            <span className="text-slate-900 fw-bold">#ORD-{orderId?.padStart(5, '0')}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="text-slate-500 fw-medium">Payment Type</span>
            <span className="badge-modern bg-indigo-100 text-indigo-700">{type === 'partial' ? '50% Advance' : 'Full Payment'}</span>
          </div>
          <div className="border-top border-slate-200 pt-3 d-flex justify-content-between align-items-center">
            <span className="h5 fw-bold text-slate-900 mb-0">Payable Amount</span>
            <span className="display-6 fw-extrabold text-indigo-600">{formatCurrency(amount)}</span>
          </div>
        </div>

        <h6 className="fw-bold text-slate-700 mb-4">Select Payment Method</h6>
        <div className="payment-methods d-grid gap-3 mb-5">
          {[
            { id: 'upi', name: 'UPI (GPay, PhonePe)', icon: 'bi-qr-code-scan' },
            { id: 'card', name: 'Credit / Debit Card', icon: 'bi-credit-card' },
            { id: 'net', name: 'Net Banking', icon: 'bi-bank' }
          ].map(method => (
            <div 
              key={method.id}
              className={`p-4 rounded-4 border-2 cursor-pointer d-flex align-items-center gap-3 transition-all ${selectedMethod === method.id ? 'border-primary bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white hover-bg-slate-50'}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className={`p-2 rounded-3 ${selectedMethod === method.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                <i className={`bi ${method.icon}`}></i>
              </div>
              <span className={`fw-bold ${selectedMethod === method.id ? 'text-indigo-900' : 'text-slate-600'}`}>{method.name}</span>
              {selectedMethod === method.id && <i className="bi bi-check-circle-fill text-indigo-600 ms-auto fs-5"></i>}
            </div>
          ))}
        </div>

        <button 
          className="btn-modern btn-modern-primary w-100 py-3 fs-5 shadow-lg"
          onClick={() => setPaymentStep('processing')}
        >
          Proceed to Pay {formatCurrency(amount)}
        </button>
        <button 
          className="btn btn-link w-100 mt-3 text-slate-400 text-decoration-none small"
          onClick={() => onCancel()}
        >
          Cancel and return
        </button>
      </div>
    </div>
  )

  const renderProcessing = () => (
    <div className="text-center py-5 fade-in">
        <div className="payment-loader mb-5 position-relative d-inline-block">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--primary-indigo)" strokeWidth="8" 
                    strokeDasharray="339.29" 
                    strokeDashoffset={339.29 - (339.29 * processingProgress / 100)}
                    style={{ transition: 'stroke-dashoffset 0.1s ease' }}
                />
            </svg>
            <div className="position-absolute top-50 start-50 translate-middle">
                <span className="h4 fw-bold text-slate-700">{processingProgress}%</span>
            </div>
        </div>
      <h2 className="fw-bold text-slate-900">Verifying Transaction</h2>
      <p className="text-slate-500">Please do not refresh or close the page...</p>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center py-5 fade-in-up">
      <div className="success-icon-container mb-4">
        <div className="icon-box-modern bg-success text-white mx-auto shadow-lg pulse-animation" style={{width: '96px', height: '96px', borderRadius: '50%'}}>
          <i className="bi bi-check-lg display-4"></i>
        </div>
      </div>
      <h1 className="fw-extrabold text-slate-900 mb-2">Payment Successful!</h1>
      <p className="text-slate-500 mb-5 fs-5">Your transaction has been verified and the order is updated.</p>
      
      <div className="bg-slate-50 rounded-5 p-4 max-w-400 mx-auto border border-slate-100 mb-5">
        <div className="d-flex justify-content-between mb-2">
            <span className="text-slate-400">Transaction ID</span>
            <span className="text-slate-900 fw-bold font-monospace">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
        </div>
        <div className="d-flex justify-content-between">
            <span className="text-slate-400">Amount Paid</span>
            <span className="text-slate-900 fw-bold">{formatCurrency(amount)}</span>
        </div>
      </div>

      <button className="btn-modern btn-modern-primary px-5 py-3 rounded-pill shadow-lg" onClick={() => onComplete()}>
        Back to Dashboard
      </button>
    </div>
  )

  return (
    <div className="payment-outer-container py-5 d-flex align-items-center justify-content-center min-vh-100 bg-slate-50">
      <div className="container" style={{ maxWidth: '600px' }}>
        {paymentStep === 'selection' && renderSelection()}
        {paymentStep === 'processing' && renderProcessing()}
        {paymentStep === 'success' && renderSuccess()}
      </div>
    </div>
  )
}

export default Payment
