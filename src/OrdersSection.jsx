import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency, parseQuantityNumber } from './utils/marketUtils'
import './App.css'

function OrdersSection({ user, onStartPayment }) {
  const { t } = useTranslation()
  const [cropOrders, setCropOrders] = useState([])
  const [demandOrders, setDemandOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('crop')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [buyerProfile, setBuyerProfile] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState({ orderId: null, type: '', amount: 0, orderType: '' })
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '', ifscCode: '', bankName: '', accountHolderName: ''
  })

  const API_BASE = 'http://localhost:8081/api/marketplace'
  const CROP_ORDER_BASE = 'http://localhost:8081/api/crop-orders'
  const USER_BASE = 'http://localhost:8081/api/users'

  useEffect(() => {
    if (user) fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // Fetch crop orders
      const cropEndpoint = user.role === 'Farmer'
        ? `${API_BASE}/orders/crop/farmer/${user.id}`
        : `${API_BASE}/orders/crop/buyer/${user.id}`
      const cropRes = await fetch(cropEndpoint)
      if (cropRes.ok) setCropOrders(await cropRes.json())

      // Fetch demand orders for buyers
      if (user.role === 'Buyer') {
        const demandRes = await fetch(`${API_BASE}/orders/buyer/${user.id}`)
        if (demandRes.ok) setDemandOrders(await demandRes.json())
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBuyerProfile = async (buyerId) => {
    try {
      const res = await fetch(`${USER_BASE}/${buyerId}`)
      if (res.ok) {
        const data = await res.json()
        setBuyerProfile(data)
      }
    } catch (e) { console.error('Failed to fetch buyer profile', e) }
  }

  const handleFarmerAccept = async (orderId) => {
    try {
      const res = await fetch(`${CROP_ORDER_BASE}/${orderId}/farmer/accept?farmerId=${user.id}`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setCropOrders(cropOrders.map(o => o.id === orderId ? updated : o))
        setSelectedOrder(updated)
        alert('Order accepted! Contract created on blockchain.')
      }
    } catch (e) { console.error(e); alert('Failed to accept order') }
  }

  const handleFarmerReject = async (orderId) => {
    try {
      const res = await fetch(`${CROP_ORDER_BASE}/${orderId}/farmer/reject?farmerId=${user.id}`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setCropOrders(cropOrders.map(o => o.id === orderId ? updated : o))
        setSelectedOrder(null)
        alert('Order rejected.')
      }
    } catch (e) { console.error(e); alert('Failed to reject order') }
  }

  const handleBuyerAccept = async (orderId) => {
    try {
      const res = await fetch(`${CROP_ORDER_BASE}/${orderId}/buyer/accept?buyerId=${user.id}`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setCropOrders(cropOrders.map(o => o.id === orderId ? updated : o))
      }
    } catch (e) { console.error(e); alert('Failed to accept offer') }
  }

  const openPaymentForm = (orderId, type, amount, orderType) => {
    setPaymentInfo({ orderId, type, amount, orderType })
    setBankDetails({ accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '' })
    setShowPaymentForm(true)
  }

  const handleSubmitPayment = async () => {
    if (!bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName || !bankDetails.accountHolderName) {
      alert('Please fill all bank details')
      return
    }

    const { orderId, type, orderType } = paymentInfo
    let endpoint = ''

    if (orderType === 'CROP_ORDER') {
      endpoint = type === 'partial'
        ? `${API_BASE}/orders/crop/${orderId}/pay-partial`
        : `${API_BASE}/orders/crop/${orderId}/complete`
    } else {
      endpoint = type === 'partial'
        ? `${API_BASE}/orders/demand/${orderId}/pay-advance`
        : `${API_BASE}/orders/demand/${orderId}/complete`
    }

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerId: user.id,
          payerName: user.name,
          ...bankDetails
        })
      })

      if (res.ok) {
        const updated = await res.json()
        if (orderType === 'CROP_ORDER') {
          setCropOrders(cropOrders.map(o => o.id === orderId ? updated : o))
        } else {
          setDemandOrders(demandOrders.map(o => o.id === orderId ? updated : o))
        }
        setShowPaymentForm(false)
        setSelectedOrder(null)
        alert('Payment submitted successfully! Pending verification.')
      } else {
        alert('Payment failed. Please try again.')
      }
    } catch (e) {
      console.error(e)
      alert('Network error during payment.')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning-modern'
      case 'ACCEPTED': return 'badge-success-modern'
      case 'REJECTED': return 'badge-danger-modern'
      case 'CANCELLED': return 'badge-danger-modern'
      case 'COMPLETED': return 'badge-info-modern'
      case 'FULFILLED': return 'badge-info-modern'
      default: return 'badge-info-modern'
    }
  }

  const getVerificationBadge = (status) => {
    if (status === 'VERIFIED') return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'bi-patch-check-fill', label: 'Verified' }
    if (status === 'REJECTED') return { cls: 'bg-red-50 text-red-700 border-red-100', icon: 'bi-x-circle-fill', label: 'Rejected' }
    return { cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: 'bi-clock-fill', label: 'Pending Verification' }
  }

  // ─── Render Payment Form Modal ─────────────────────────────────────

  const renderPaymentModal = () => (
    <div className="modal show d-block fade" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-premium rounded-5 overflow-hidden">
          <div className="modal-body p-0">
            <div className="p-4 p-md-5">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <div className="icon-box-modern bg-indigo-50 text-indigo-600 mb-3" style={{width: '56px', height: '56px'}}>
                    <i className="bi bi-bank fs-4"></i>
                  </div>
                  <h3 className="fw-bold text-slate-900">Bank Transfer Payment</h3>
                  <p className="text-slate-500 mb-0">
                    {paymentInfo.type === 'partial' ? '50% Advance Payment' : 'Complete Remaining Payment'}
                  </p>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowPaymentForm(false)}></button>
              </div>

              {/* Amount Summary */}
              <div className="bg-slate-50 rounded-4 p-4 mb-4 border border-slate-100">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-slate-500 fw-medium">Amount to Pay</span>
                  <span className="h3 fw-extrabold text-indigo-600 mb-0">{formatCurrency(paymentInfo.amount)}</span>
                </div>
              </div>

              {/* Bank Details Form */}
              <div className="mb-3">
                <label className="label-modern mb-1">Account Holder Name</label>
                <input
                  type="text" className="form-control rounded-3"
                  placeholder="Full name as on bank account"
                  value={bankDetails.accountHolderName}
                  onChange={e => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="label-modern mb-1">Account Number</label>
                <input
                  type="text" className="form-control rounded-3"
                  placeholder="Enter account number"
                  value={bankDetails.accountNumber}
                  onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="label-modern mb-1">IFSC Code</label>
                  <input
                    type="text" className="form-control rounded-3"
                    placeholder="e.g. SBIN0001234"
                    value={bankDetails.ifscCode}
                    onChange={e => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                  />
                </div>
                <div className="col-6">
                  <label className="label-modern mb-1">Bank Name</label>
                  <input
                    type="text" className="form-control rounded-3"
                    placeholder="e.g. State Bank of India"
                    value={bankDetails.bankName}
                    onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}
                  />
                </div>
              </div>

              {/* Verification Notice */}
              <div className="d-flex align-items-start gap-2 p-3 bg-amber-50 rounded-3 mb-4 border border-amber-100" style={{backgroundColor: '#fffbeb'}}>
                <i className="bi bi-info-circle-fill text-amber-600 mt-1"></i>
                <small className="text-amber-800">
                  Payment will be marked as <strong>Pending Verification</strong>. Admin will verify and confirm within 24 hours.
                </small>
              </div>

              <button
                className="btn-modern btn-modern-primary w-100 py-3 fs-5 shadow-lg"
                onClick={handleSubmitPayment}
              >
                <i className="bi bi-shield-lock-fill me-2"></i>
                Submit Payment — {formatCurrency(paymentInfo.amount)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Render Order Detail Modal ─────────────────────────────────────

  const renderOrderDetail = () => {
    if (!selectedOrder) return null
    const isFarmer = user.role === 'Farmer'
    const vBadge = buyerProfile ? getVerificationBadge(buyerProfile.verificationStatus) : null

    return (
      <div className="modal show d-block fade" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-premium rounded-5 overflow-hidden">
            <div className="modal-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <span className={`badge-modern ${getStatusBadge(selectedOrder.status)} mb-2`}>{selectedOrder.status}</span>
                  <h2 className="display-6 fw-bold text-dark">{selectedOrder.cropName}</h2>
                  <span className="text-slate-400 font-monospace small">ORD-{selectedOrder.id.toString().padStart(5, '0')}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => { setSelectedOrder(null); setBuyerProfile(null) }}></button>
              </div>

              {/* Price & Quantity Card */}
              <div className="p-4 rounded-4 bg-slate-50 border border-slate-100 mb-4">
                <div className="row align-items-center">
                  <div className="col-md-4 text-center border-end">
                    <label className="text-muted small text-uppercase fw-bold">Quantity</label>
                    <div className="h4 fw-bold text-slate-900 mb-0">{selectedOrder.quantity}</div>
                  </div>
                  <div className="col-md-4 text-center border-end">
                    <label className="text-muted small text-uppercase fw-bold">Total Price</label>
                    <div className="h4 fw-bold text-emerald-700 mb-0">{formatCurrency(parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0))}</div>
                  </div>
                  <div className="col-md-4 text-center">
                    <label className="text-muted small text-uppercase fw-bold">Paid</label>
                    <div className="h4 fw-bold text-indigo-600 mb-0">{formatCurrency(selectedOrder.amountPaid || 0)}</div>
                  </div>
                </div>
              </div>

              {/* Blockchain Contract Info */}
              {selectedOrder.contractHash && (
                <div className="p-4 rounded-4 bg-dark text-white mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-shield-lock-fill text-emerald-400"></i>
                    <h6 className="fw-bold mb-0">Blockchain Contract</h6>
                    <span className="badge bg-emerald-600 rounded-pill ms-auto">Verified</span>
                  </div>
                  <div className="small" style={{wordBreak: 'break-all'}}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-slate-400">Hash</span>
                    </div>
                    <div className="font-monospace text-emerald-300 mb-2" style={{fontSize: '0.7rem'}}>{selectedOrder.contractHash}</div>
                  </div>
                </div>
              )}

              {/* Buyer Profile (for farmers) */}
              {isFarmer && buyerProfile && (
                <div className="p-4 rounded-4 border border-slate-200 mb-4 bg-white">
                  <h6 className="fw-bold text-slate-800 mb-3"><i className="bi bi-person-circle me-2"></i>Buyer Profile</h6>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="label-modern">Name</label>
                      <div className="fw-bold text-slate-700">{buyerProfile.name}</div>
                    </div>
                    <div className="col-6">
                      <label className="label-modern">Mobile</label>
                      <div className="fw-bold text-slate-700">{buyerProfile.mobile}</div>
                    </div>
                    <div className="col-6">
                      <label className="label-modern">Email</label>
                      <div className="fw-bold text-slate-700 text-truncate">{buyerProfile.email}</div>
                    </div>
                    <div className="col-6">
                      <label className="label-modern">Status</label>
                      <div className={`d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill small fw-bold border ${vBadge.cls}`}>
                        <i className={`bi ${vBadge.icon}`}></i> {vBadge.label}
                      </div>
                    </div>
                    {buyerProfile.address && (
                      <div className="col-12">
                        <label className="label-modern">Address</label>
                        <div className="fw-bold text-slate-700">{buyerProfile.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Status */}
              {selectedOrder.partialPaymentDone && (
                <div className="d-flex align-items-center gap-2 p-3 rounded-pill bg-emerald-50 text-emerald-700 mb-3 border border-emerald-100 fw-bold small">
                  <i className="bi bi-shield-check-fill"></i> 50% Advance Paid — {formatCurrency(parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0) * 0.5)}
                </div>
              )}
              {selectedOrder.fullPaymentDone && (
                <div className="d-flex align-items-center gap-2 p-3 rounded-pill bg-indigo-50 text-indigo-700 mb-3 border border-indigo-100 fw-bold small">
                  <i className="bi bi-check-all"></i> Full Payment Complete — {formatCurrency(parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-top border-slate-100">
                {/* Farmer: Accept/Reject */}
                {isFarmer && selectedOrder.status === 'PENDING' && !selectedOrder.farmerAccepted && (
                  <div className="d-flex gap-3">
                    <button className="btn-modern btn-modern-primary flex-grow-1 py-3 shadow" onClick={() => handleFarmerAccept(selectedOrder.id)}>
                      <i className="bi bi-check2-circle me-2"></i> Accept & Create Contract
                    </button>
                    <button className="btn-modern btn-modern-outline text-danger px-4" onClick={() => handleFarmerReject(selectedOrder.id)}>
                      <i className="bi bi-x-circle me-2"></i> Reject
                    </button>
                  </div>
                )}

                {/* Buyer: Pay 50% Advance */}
                {!isFarmer && selectedOrder.status === 'ACCEPTED' && !selectedOrder.partialPaymentDone && (
                  <button
                    className="btn-modern btn-modern-primary w-100 py-3 shadow-lg fs-5"
                    style={{ background: 'var(--grad-indigo)' }}
                    onClick={() => openPaymentForm(selectedOrder.id, 'partial', parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0) * 0.5, 'CROP_ORDER')}
                  >
                    <i className="bi bi-credit-card-2-front me-2"></i> Pay 50% Advance — {formatCurrency(parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0) * 0.5)}
                  </button>
                )}

                {/* Buyer: Complete Payment */}
                {!isFarmer && selectedOrder.partialPaymentDone && !selectedOrder.fullPaymentDone && (
                  <button
                    className="btn-modern btn-modern-primary w-100 py-3 shadow-lg"
                    onClick={() => openPaymentForm(selectedOrder.id, 'full', parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0) - (selectedOrder.amountPaid || 0), 'CROP_ORDER')}
                  >
                    <i className="bi bi-patch-check me-2"></i> Complete Payment — {formatCurrency(parseQuantityNumber(selectedOrder.quantity) * (selectedOrder.price || 0) - (selectedOrder.amountPaid || 0))}
                  </button>
                )}

                {/* Buyer: Confirm farmer offer */}
                {!isFarmer && selectedOrder.farmerAccepted && !selectedOrder.buyerAccepted && (
                  <button className="btn-modern btn-modern-primary w-100 py-3" onClick={() => handleBuyerAccept(selectedOrder.id)}>
                    <i className="bi bi-hand-thumbs-up me-2"></i> Confirm Offer
                  </button>
                )}

                {selectedOrder.status === 'COMPLETED' && (
                  <div className="text-center py-3">
                    <span className="badge-modern badge-info-modern w-100 py-3 fs-6">
                      <i className="bi bi-check-all me-2"></i> Transaction Complete
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render Order Card ─────────────────────────────────────────────

  const renderCropOrderCard = (order) => (
    <div className="bg-surface-container-lowest rounded-xl p-6 hover:shadow-md flex flex-col h-full gap-4 transition-all" key={order.id} onClick={() => {
        setSelectedOrder(order);
        if (user.role === 'Farmer' && order.buyerId) fetchBuyerProfile(order.buyerId);
    }}>
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-bold text-xl text-on-surface mb-1">{order.cropName}</h5>
          <span className="text-stone-400 font-mono text-xs">ORD-{order.id.toString().padStart(5, '0')}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'bg-primary-container text-on-primary-container'}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
        <div>
          <p className="text-xs text-stone-500 font-bold uppercase mb-1">{user.role === 'Farmer' ? 'Customer' : 'Supplier'}</p>
          <p className="font-bold text-on-surface truncate">{user.role === 'Farmer' ? order.buyerName : (order.farmerName || 'Pending')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500 font-bold uppercase mb-1">Quantity</p>
          <p className="font-bold text-on-surface">{order.quantity}</p>
        </div>
        <div className="col-span-2 pt-2 border-t border-stone-200 flex justify-between items-center">
            <span className="text-sm font-bold text-stone-500">Total Value</span>
            <span className="text-lg font-black text-primary">{formatCurrency(parseQuantityNumber(order.quantity) * (order.price || 0))}</span>
        </div>
      </div>

      <div className="mt-auto space-y-2">
        {order.contractHash && (
          <div className="flex items-center gap-2 text-xs font-bold bg-green-50 text-green-700 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-sm">shield</span> Blockchain Secured
          </div>
        )}
        <button className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2 rounded-lg transition-colors text-sm">
          View Details & Actions
        </button>
      </div>
    </div>
  )

  const renderDemandOrderCard = (order) => (
    <div className="bg-surface-container-lowest rounded-xl p-6 hover:shadow-md flex flex-col h-full gap-4 transition-all" key={`demand-${order.id}`}>
      <div className="flex justify-between items-start">
        <div>
          <h5 className="font-bold text-xl text-on-surface mb-1">{order.cropName}</h5>
          <span className="text-stone-400 font-mono text-xs">Demand #{order.id}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-800' : 'bg-primary-container text-on-primary-container'}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
        <div>
          <p className="text-xs text-stone-500 font-bold uppercase mb-1">Qty Needed</p>
          <p className="font-bold text-on-surface">{order.requiredQuantity}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-stone-500 font-bold uppercase mb-1">Budget</p>
          <p className="font-bold text-amber-700">{formatCurrency(order.targetPrice)}</p>
        </div>
        {order.farmerName && (
          <div className="col-span-2 pt-2 border-t border-stone-200">
            <p className="text-xs text-stone-500 font-bold uppercase mb-1">Fulfilled By</p>
            <p className="font-bold text-on-surface">{order.farmerName}</p>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-2">
        {order.contractHash && (
          <div className="flex items-center gap-2 text-xs font-bold bg-green-50 text-green-700 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-sm">shield</span> Blockchain Secured
          </div>
        )}
        {order.partialPaymentDone && (
          <div className="flex items-center gap-2 text-xs font-bold bg-green-50 text-green-700 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-sm">check_circle</span> 50% Advance Paid
          </div>
        )}
        
        {order.status === 'ACCEPTED' && !order.partialPaymentDone && (
          <button
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-2 rounded-lg transition-colors text-sm"
            onClick={() => openPaymentForm(order.id, 'partial', (order.targetPrice || 0) * 0.5, 'DEMAND_ORDER')}
          >
            Pay 50% Advance
          </button>
        )}
        {order.partialPaymentDone && !order.fullPaymentDone && (
          <button
            className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-2 rounded-lg transition-colors text-sm"
            onClick={() => openPaymentForm(order.id, 'full', (order.targetPrice || 0) - (order.amountPaid || 0), 'DEMAND_ORDER')}
          >
            Complete Payment
          </button>
        )}
        {order.status === 'COMPLETED' && (
          <div className="w-full bg-stone-100 text-stone-800 text-center font-bold py-2 rounded-lg text-sm">
            Complete
          </div>
        )}
      </div>
    </div>
  )

  // ─── Main Render ───────────────────────────────────────────────────

  return (
    <div className="fade-in-up">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 fade-in-up mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight">{user.role === 'Farmer' ? 'Sales Pipeline' : 'Purchase Orders'}</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Track and manage your agricultural transactions.</p>
        </div>
        {user.role === 'Buyer' && (
          <div className="flex gap-2">
            <button
              className={`px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 ${activeTab === 'crop' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-highest text-primary'}`}
              onClick={() => setActiveTab('crop')}
            >
               Crop Orders
            </button>
            <button
              className={`px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 ${activeTab === 'demand' ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-highest text-primary'}`}
              onClick={() => setActiveTab('demand')}
            >
               My Demands
            </button>
          </div>
        )}
      </section>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <>
          {/* Crop Orders Tab */}
          {(activeTab === 'crop' || user.role === 'Farmer') && (
            cropOrders.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-lowest rounded-2xl shadow-sm border border-stone-100 fade-in-up">
                <div className="w-20 h-20 bg-stone-50 text-stone-300 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                </div>
                <h4 className="font-bold text-stone-800 text-xl">No transactions recorded yet</h4>
                <p className="text-stone-400 mt-2">Your agricultural trade history will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cropOrders.map(renderCropOrderCard)}
              </div>
            )
          )}

          {/* Demand Orders Tab (Buyer only) */}
          {activeTab === 'demand' && user.role === 'Buyer' && (
            demandOrders.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-lowest rounded-2xl shadow-sm border border-stone-100 fade-in-up">
                <div className="w-20 h-20 bg-stone-50 text-stone-300 mx-auto mb-4 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">flash_on</span>
                </div>
                <h4 className="font-bold text-stone-800 text-xl">No demands posted yet</h4>
                <p className="text-stone-400 mt-2">Post a requirement in the marketplace to see it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demandOrders.map(renderDemandOrderCard)}
              </div>
            )
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && !showPaymentForm && renderOrderDetail()}

      {/* Payment Form Modal */}
      {showPaymentForm && renderPaymentModal()}
    </div>
  )
}

export default OrdersSection
