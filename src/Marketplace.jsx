import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency, parseQuantityNumber } from './utils/marketUtils'
import './App.css'

function Marketplace({ user, onNavigate }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState('')       // 'listing' | 'order'
  const [modalStep, setModalStep] = useState('details') // 'details' | 'payment'
  const [showFarmerContact, setShowFarmerContact] = useState(false)
  const [contactByFarmer, setContactByFarmer] = useState(false)
  const [orderPlacing, setOrderPlacing] = useState(false)
  const [farmerProfile, setFarmerProfile] = useState(null)
  const [loadingFarmer, setLoadingFarmer] = useState(false)
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)

  // Bid states
  const [bidPrice, setBidPrice] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [bidSeason, setBidSeason] = useState('')
  const [bidQuantity, setBidQuantity] = useState('')
  const [bids, setBids] = useState([])

  // Requirement modal
  const [showRequirementModal, setShowRequirementModal] = useState(false)
  const [newReq, setNewReq] = useState({ cropName: '', requiredQuantity: '', targetPrice: '' })

  const API_BASE = 'http://localhost:8081/api/marketplace'
  const USER_BASE = 'http://localhost:8081/api/users'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [listingsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/listings`),
          fetch(`${API_BASE}/orders`)
        ])
        if (listingsRes.ok) setListings(await listingsRes.json())
        if (ordersRes.ok) setOrders(await ordersRes.json())
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    // If buyer, defaults to listings, but they can switch to demands
    // If farmer, defaults to listings (storefront) to see their competition, or demands to fulfillment
    if (user && user.role === 'Farmer' && activeTab === 'listings') {
      // Keep it as is or auto-switch
    }
  }, [user])

  useEffect(() => {
    if (selectedItem && modalType === 'order') fetchBids(selectedItem.id)
  }, [selectedItem, modalType])

  // ─── Helpers ─────────────────────────────────────────────────────

  const openDetails = (item, type) => {
    if (!user) {
      alert(t('common.loginRequired') || 'Please login to view details.');
      if (onNavigate) onNavigate('login');
      return;
    }
    setSelectedItem(item)
    setModalType(type)
    setModalStep('details')
    setShowFarmerContact(false)
    setContactByFarmer(false)
    setOrderPlacing(false)
    setFarmerProfile(null)
  }

  const closeDetails = () => {
    setSelectedItem(null)
    setModalType('')
    setModalStep('details')
    setShowFarmerContact(false)
    setContactByFarmer(false)
    setOrderPlacing(false)
    setFarmerProfile(null)
  }

  // ─── Fetch farmer profile (bank details) ─────────────────────────

  const fetchFarmerProfile = async (farmerId) => {
    setLoadingFarmer(true)
    try {
      const res = await fetch(`${USER_BASE}/${farmerId}`)
      if (res.ok) {
        const data = await res.json()
        setFarmerProfile(data)
      }
    } catch (e) { console.error('Failed to fetch farmer profile', e) }
    finally { setLoadingFarmer(false) }
  }

  // ─── Place Order → Goes to payment step ──────────────────────────

  const handlePlaceOrder = async () => {
    if (!user) { alert('Please login first'); return }
    if (user.role === 'Farmer') { alert('Farmers cannot place orders'); return }

    // Fetch farmer bank details before showing payment
    await fetchFarmerProfile(selectedItem.farmerId)
    setModalStep('payment')
  }

  // ─── Submit 50% payment and create order ─────────────────────────

  const handleSubmitPayment = async () => {
    if (!user) return
    setPaymentSubmitting(true)
    try {
      // 1. Place the order
      const response = await fetch(
        `${API_BASE}/orders/place?listingId=${selectedItem.id}&buyerId=${user.id}&buyerName=${encodeURIComponent(user.name)}&buyerMobile=${user.mobile}&buyerEmail=${encodeURIComponent(user.email)}`,
        { method: 'POST' }
      )

      if (response.ok) {
        // 2. Now pay 50% advance on the freshly created order
        // Get the order just created for this buyer
        const ordersRes = await fetch(`${API_BASE}/orders/crop/buyer/${user.id}`)
        if (ordersRes.ok) {
          const buyerOrders = await ordersRes.json()
          // Find the latest order for this listing
          const latestOrder = buyerOrders.find(o => o.listingId === selectedItem.id)
          if (latestOrder) {
            const payRes = await fetch(`${API_BASE}/orders/crop/${latestOrder.id}/pay-partial`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                payerId: user.id,
                payerName: user.name
              })
            })
            if (payRes.ok) {
              setModalStep('success')
              return
            }
          }
        }
        // If payment step failed, still show success for order
        setModalStep('success')
      } else {
        alert('Failed to place order. Please try again.')
      }
    } catch (error) {
      alert('Network error: ' + error.message)
    } finally {
      setPaymentSubmitting(false)
    }
  }

  // ─── Contact ─────────────────────────────────────────────────────

  const handleContactSeller = async () => {
    if (!user) { alert('Please login to contact'); return }
    try {
      await fetch(`${API_BASE}/contact/send?recipientId=${selectedItem.farmerId}&senderId=${user.id}&senderName=${encodeURIComponent(user.name)}&senderMobile=${user.mobile}&senderEmail=${encodeURIComponent(user.email)}&senderRole=${user.role}&cropName=${encodeURIComponent(selectedItem.cropName)}`, {
        method: 'POST'
      })
      setShowFarmerContact(true)
    } catch (error) {
      alert('Failed to contact: ' + error.message)
    }
  }

  const handleContactBuyer = async () => {
    if (!user) { alert('Please login to contact'); return }
    try {
      await fetch(`${API_BASE}/contact/send?recipientId=${selectedItem.buyerId}&senderId=${user.id}&senderName=${encodeURIComponent(user.name)}&senderMobile=${user.mobile}&senderEmail=${encodeURIComponent(user.email)}&senderRole=${user.role}&cropName=${encodeURIComponent(selectedItem.cropName)}`, {
        method: 'POST'
      })
      setContactByFarmer(true)
    } catch (error) {
      alert('Failed to send contact info: ' + error.message)
    }
  }

  // ─── Bids ────────────────────────────────────────────────────────

  const fetchBids = async (orderId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/buyer/${orderId}/bids`)
      if (res.ok) setBids(await res.json())
    } catch (e) { console.error('Failed to fetch bids', e) }
  }

  const handleSubmitBid = async () => {
    if (!user || user.role !== 'Farmer') return alert('Only farmers can place offers')
    const price = parseFloat(bidPrice)
    if (isNaN(price)) return alert('Enter a valid price')
    try {
      const res = await fetch(`${API_BASE}/orders/buyer/${selectedItem.id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerOrderId: selectedItem.id, farmerId: user.id, farmerName: user.name,
          farmerMobile: user.mobile, farmerEmail: user.email,
          offeredPrice: price, message: bidMessage, seasonType: bidSeason, suppliedQuantity: bidQuantity
        })
      })
      if (res.ok) {
        alert('Offer sent to buyer!')
        setBidPrice(''); setBidMessage(''); setBidSeason(''); setBidQuantity('')
        fetchBids(selectedItem.id)
      }
    } catch (e) { alert('Failed to submit offer: ' + e.message) }
  }

  const handleAcceptBid = async (bidId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/buyer/${selectedItem.id}/bids/${bidId}/accept`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map(o => o.id === updated.id ? updated : o))
        alert('Offer accepted! Contract stored on blockchain. Farmer notified.')
        closeDetails()
      }
    } catch (e) { alert('Failed to accept offer: ' + e.message) }
  }

  const handleAcceptFulfillment = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/buyer/${selectedItem.id}/accept-fulfillment`, { method: 'PUT' })
      if (response.ok) {
        setOrders(orders.map(o => o.id === selectedItem.id ? { ...o, status: 'ACCEPTED' } : o))
        closeDetails()
      }
    } catch (error) { alert('Failed to accept fulfillment: ' + error.message) }
  }

  const handlePostRequirement = async (e) => {
    e.preventDefault()
    if (!user) return alert('Please login first')
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReq, buyerId: user.id, buyerName: user.name,
          buyerMobile: user.mobile, buyerEmail: user.email, status: 'PENDING'
        })
      })
      if (res.ok) {
        const saved = await res.json()
        setOrders([saved, ...orders])
        setShowRequirementModal(false)
        setNewReq({ cropName: '', requiredQuantity: '', targetPrice: '' })
        alert('Requirement posted successfully!')
      }
    } catch (error) { alert('Failed to post requirement') }
  }

  const getRequirementStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning-subtle text-warning-emphasis'
      case 'FULFILLED': return 'bg-info-subtle text-info-emphasis'
      case 'ACCEPTED': return 'bg-success-subtle text-success-emphasis'
      case 'COMPLETED': return 'bg-primary-subtle text-primary-emphasis'
      default: return 'bg-secondary-subtle'
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER: Product Listing Card
  // ═══════════════════════════════════════════════════════════════════

  const renderListingCard = (item) => {
    return (
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full" key={item.id}>
        <div className="relative">
          <img className="w-full h-56 object-cover" alt={item.cropName} src={item.imageUrl ? `http://localhost:8081${item.imageUrl}` : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"} />
          <div className="absolute top-4 right-4">
            <span className="bg-success text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
              {item.status || 'Active'}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4">
            <h4 className="text-2xl font-black text-on-surface mb-1 leading-tight">{item.cropName}</h4>
            <div className="flex items-center gap-2 text-stone-500 text-sm">
              <i className="bi bi-person-circle"></i>
              <span>{item.farmerName}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500 text-sm mt-1">
              <i className="bi bi-box-seam"></i>
              <span>Quantity: {item.quantity}</span>
            </div>
          </div>

          <div className="mt-auto pt-5 border-t border-stone-100 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-xs text-stone-400 font-bold uppercase tracking-tighter">Price per unit</span>
              <span className="text-2xl font-black text-primary leading-none mt-1">
                {formatCurrency(item.pricePerUnit)}
              </span>
            </div>
            <button
              className="bg-primary text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all active:scale-95"
              onClick={() => openDetails(item, 'listing')}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER: Product Detail Modal — Step: DETAILS
  // ═══════════════════════════════════════════════════════════════════

  const renderDetailStep = () => {
    const totalPrice = parseQuantityNumber(selectedItem.quantity) * (selectedItem.pricePerUnit || 0)
    return (
      <div className="p-0 flex flex-col">
        {/* Modal Header inside Body */}
        <div className="p-6 pb-2 flex justify-between items-center bg-white sticky-top z-10">
          <span className="bg-success-50 text-success border border-success-200 px-3 py-2 rounded-full font-bold uppercase tracking-widest text-[10px]">
            <i className="bi bi-patch-check-fill me-1"></i> VERIFIED & AVAILABLE
          </span>
          <button type="button" className="text-stone-400 hover:text-stone-900 transition-colors" onClick={closeDetails}><i className="bi bi-x-lg text-xl"></i></button>
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Main Title & Price */}
          <div className="d-flex justify-content-between align-items-top mb-6">
            <div className="max-w-[70%]">
              <h2 className="text-4xl font-black text-on-surface tracking-tighter leading-none mb-2">{selectedItem.cropName}</h2>
              <p className="text-stone-400 font-medium">Fresh harvest from the farms of {selectedItem.farmerName}</p>
            </div>
            <div className="text-end">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">List Price</p>
              <h3 className="text-3xl font-black text-primary leading-none">{formatCurrency(selectedItem.pricePerUnit)}</h3>
              <p className="text-xs text-stone-500 mt-1">per unit</p>
            </div>
          </div>

          {/* Attributes Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                  <i className="bi bi-box-seam fs-5"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Quantity</p>
                  <p className="font-bold text-on-surface leading-tight mt-0.5">{selectedItem.quantity}</p>
                </div>
              </div>
            </div>
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <i className="bi bi-calendar3 fs-5"></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Season</p>
                  <p className="font-bold text-on-surface leading-tight mt-0.5">{selectedItem.season || 'Year-round'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary Breakdown */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-6 rounded-3xl text-white mb-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 opacity-80">Full Order Value</p>
                <h4 className="text-3xl font-black">{formatCurrency(totalPrice)}</h4>
                <p className="text-xs text-stone-400 mt-1">Includes all taxes and handling</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <i className="bi bi-receipt text-3xl opacity-50"></i>
              </div>
            </div>
            {/* Background design elements */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
          </div>

          {/* Policies Alert Field */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/50 mb-6 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center flex-shrink-0">
              <i className="bi bi-info-circle-fill fs-5"></i>
            </div>
            <div>
              <p className="font-bold text-amber-900 mb-1">Standard Fulfillment Terms</p>
              <ul className="m-0 p-0 text-amber-800 text-xs space-y-1 list-none opacity-90">
                <li className="flex gap-2"><span>•</span> 50% advance payment required to confirm</li>
                <li className="flex gap-2"><span>•</span> Guaranteed dispatch within 4 business days</li>
                <li className="flex gap-2"><span>•</span> Balance payment upon verification of delivery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Tray */}
        <div className="p-6 pt-2 bg-white border-t border-stone-100 flex flex-col gap-3">
          {user && user.role !== 'Farmer' && (
            <button
              className="bg-primary hover:bg-primary-dark text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 w-full"
              onClick={handlePlaceOrder}
            >
              <i className="bi bi-cart-plus-fill"></i>
              Place New Order
            </button>
          )}

          <div className="flex gap-3 w-full">
            {user && (
              <button
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                onClick={handleContactSeller}
              >
                <i className="bi bi-person-lines-fill"></i>
                {showFarmerContact ? 'Details Below' : 'Contact Farmer'}
              </button>
            )}
            {!user && (
              <button
                className="w-full bg-stone-900 text-white font-black py-4 rounded-2xl shadow-xl transition-all"
                onClick={() => onNavigate('login')}
              >
                Login to Purchase
              </button>
            )}
          </div>

          {showFarmerContact && (
            <div className="animate-in fade-in slide-in-from-bottom-2 p-4 bg-primary text-white rounded-2xl flex items-center justify-between shadow-lg mt-2">
              <div>
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Verified Contact</p>
                <p className="font-black text-xl">{selectedItem.farmerMobile}</p>
              </div>
              <a href={`tel:${selectedItem.farmerMobile}`} className="bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <i className="bi bi-telephone-fill fs-5"></i>
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }


  // ═══════════════════════════════════════════════════════════════════
  //  RENDER: Payment Step — Farmer's Bank Details + 50% Payment
  // ═══════════════════════════════════════════════════════════════════

  const renderPaymentStep = () => {
    const totalPrice = parseQuantityNumber(selectedItem.quantity) * (selectedItem.pricePerUnit || 0)
    const advanceAmount = totalPrice * 0.5
    const hasBankDetails = farmerProfile && farmerProfile.bankAccountNumber

    return (
      <div className="p-4 p-md-5">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <button className="btn btn-sm btn-outline-secondary rounded-pill mb-2" onClick={() => setModalStep('details')}>
              <i className="bi bi-arrow-left me-1"></i> Back to Details
            </button>
            <h3 className="fw-bold text-slate-900">Complete 50% Advance Payment</h3>
            <p className="text-slate-500 mb-0">Pay to the farmer's bank account below to confirm your order</p>
          </div>
          <button type="button" className="btn-close" onClick={closeDetails}></button>
        </div>

        {loadingFarmer ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-slate-500 mt-3">Loading farmer's bank details...</p>
          </div>
        ) : (
          <>
            {/* Order Summary */}
            <div className="p-4 rounded-4 bg-slate-50 border border-slate-100 mb-4">
              <div className="row text-center">
                <div className="col-4">
                  <div className="small text-slate-500 fw-bold text-uppercase">Crop</div>
                  <div className="fw-bold text-slate-900">{selectedItem.cropName}</div>
                </div>
                <div className="col-4 border-start border-end">
                  <div className="small text-slate-500 fw-bold text-uppercase">Total Price</div>
                  <div className="fw-bold text-slate-900">{formatCurrency(totalPrice)}</div>
                </div>
                <div className="col-4">
                  <div className="small text-slate-500 fw-bold text-uppercase">50% Advance</div>
                  <div className="h5 fw-extrabold text-indigo-600 mb-0">{formatCurrency(advanceAmount)}</div>
                </div>
              </div>
            </div>

            {/* Farmer's Bank Details Card */}
            <div className="p-4 rounded-4 border mb-4" style={{ background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderColor: '#a7f3d0' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-bank2 text-emerald-600 fs-4"></i>
                <h5 className="fw-bold text-emerald-800 mb-0">Farmer's Bank Details</h5>
              </div>

              {hasBankDetails ? (
                <div className="row g-3">
                  <div className="col-12">
                    <label className="small text-emerald-600 fw-bold text-uppercase">Account Holder</label>
                    <div className="fw-bold text-slate-900 fs-5">{farmerProfile.bankAccountHolderName}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="small text-emerald-600 fw-bold text-uppercase">Account Number</label>
                    <div className="fw-bold text-slate-900 font-monospace fs-5">{farmerProfile.bankAccountNumber}</div>
                  </div>
                  <div className="col-md-3">
                    <label className="small text-emerald-600 fw-bold text-uppercase">IFSC Code</label>
                    <div className="fw-bold text-slate-900 font-monospace">{farmerProfile.bankIfscCode}</div>
                  </div>
                  <div className="col-md-3">
                    <label className="small text-emerald-600 fw-bold text-uppercase">Bank Name</label>
                    <div className="fw-bold text-slate-900">{farmerProfile.bankName}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-exclamation-circle text-amber-500 fs-3 d-block mb-2"></i>
                  <p className="text-slate-600 mb-1">Farmer has not added bank details yet.</p>
                  <p className="text-slate-500 small mb-0">You can still place the order. Payment details will be shared soon.</p>
                </div>
              )}
            </div>

            {/* 4-Day Deadline Notice */}
            <div className="d-flex align-items-start gap-3 p-4 rounded-4 mb-4" style={{ background: '#fef2f2', border: '2px solid #fca5a5' }}>
              <i className="bi bi-exclamation-triangle-fill text-red-600 fs-4 mt-1"></i>
              <div>
                <div className="fw-bold text-red-800 mb-2">⏱ Critical: 4-Day Completion Window</div>
                <div className="small text-red-700 mb-2">
                  <strong>What must happen within 4 days:</strong>
                </div>
                <ul className="small text-red-700 mb-0" style={{ paddingLeft: '1.2rem', margin: 0 }}>
                  <li><strong>Farmer:</strong> Must dispatch produce immediately</li>
                  <li><strong>Logistics:</strong> Produce must reach you</li>
                  <li><strong>You:</strong> Must pay remaining <strong>{formatCurrency(advanceAmount)}</strong> (50%) upon delivery</li>
                  <li><strong>Deadline:</strong> {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</li>
                </ul>
                <div className="mt-2 p-2 rounded" style={{ backgroundColor: 'rgba(220,38,38,0.1)', borderLeft: '3px solid #dc2626' }}>
                  <small><strong>Penalty:</strong> Non-compliance may result in order cancellation and dispute resolution.</small>
                </div>
              </div>
            </div>

            {/* Confirm & Pay Button */}
            <button
              className="btn-modern btn-modern-primary w-100 py-3 fs-5 shadow-lg"
              style={{ background: 'var(--grad-indigo)' }}
              onClick={handleSubmitPayment}
              disabled={paymentSubmitting}
            >
              {paymentSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing Payment...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  Confirm Order & Pay {formatCurrency(advanceAmount)} (50% Advance)
                </>
              )}
            </button>

            <p className="text-center text-slate-400 small mt-3">
              <i className="bi bi-lock-fill me-1"></i>
              Secure transaction. Farmer will be notified immediately.
            </p>
          </>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER: Payment Success Step
  // ═══════════════════════════════════════════════════════════════════

  const renderSuccessStep = () => {
    const totalPrice = parseQuantityNumber(selectedItem.quantity) * (selectedItem.pricePerUnit || 0)
    const advanceAmount = totalPrice * 0.5
    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + 4)
    const remainingAmount = totalPrice - advanceAmount

    return (
      <div className="p-5 text-center">
        <div className="mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle shadow-lg" style={{ width: '96px', height: '96px', background: 'var(--grad-emerald)' }}>
            <i className="bi bi-check-lg text-white display-4"></i>
          </div>
        </div>
        <h2 className="fw-extrabold text-slate-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-slate-500 mb-4 fs-5">50% advance payment of {formatCurrency(advanceAmount)} confirmed</p>

        <div className="bg-slate-50 rounded-4 p-4 mx-auto mb-4 border border-slate-100 text-start" style={{ maxWidth: '400px' }}>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-slate-400">Crop</span>
            <span className="text-slate-900 fw-bold">{selectedItem.cropName}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-slate-400">Farmer</span>
            <span className="text-slate-900 fw-bold">{selectedItem.farmerName}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-slate-400">Advance Paid</span>
            <span className="text-emerald-700 fw-bold">{formatCurrency(advanceAmount)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-slate-400">Remaining Due</span>
            <span className="text-amber-700 fw-bold">{formatCurrency(remainingAmount)}</span>
          </div>
          <div className="border-top pt-2 mt-2 d-flex justify-content-between">
            <span className="text-slate-400">Delivery Deadline</span>
            <span className="text-red-600 fw-bold">{deadlineDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Key deadlines notice */}
        <div className="d-flex flex-column gap-3 mx-auto mb-4" style={{ maxWidth: '450px' }}>
          {/* Timeline notice */}
          <div className="p-4 rounded-4 border shadow-sm" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
            <h6 className="fw-bold text-slate-800 mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-hourglass-split text-blue-600"></i> 4-Day Timeline
            </h6>
            <div className="d-flex flex-column gap-2 small text-slate-700">
              <div className="d-flex align-items-start gap-2">
                <span className="badge bg-blue-200 text-blue-800 rounded-pill px-2 py-1 flex-shrink-0" style={{ minWidth: 'max-content' }}>Day 0</span>
                <span>Your advance payment (50%) is confirmed. Farmer gets notified.</span>
              </div>
              <div className="d-flex align-items-start gap-2">
                <span className="badge bg-blue-200 text-blue-800 rounded-pill px-2 py-1 flex-shrink-0" style={{ minWidth: 'max-content' }}>Days 1-4</span>
                <span>Farmer dispatches produce. You must pay remaining 50%.</span>
              </div>
              <div className="d-flex align-items-start gap-2">
                <span className="badge bg-green-200 text-green-800 rounded-pill px-2 py-1 flex-shrink-0" style={{ minWidth: 'max-content' }}>By Day 4</span>
                <span><strong>Order MUST be delivered and fully paid</strong> ({formatCurrency(remainingAmount)} outstanding).</span>
              </div>
            </div>
          </div>

          {/* Payment requirement */}
          <div className="d-flex align-items-start gap-2 p-3 rounded-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <i className="bi bi-exclamation-circle text-red-500 mt-1"></i>
            <small className="text-red-700">
              <strong>Critical:</strong> Non-compliance with the 4-day deadline may result in order cancellation and dispute. Ensure payment is made upon delivery.
            </small>
          </div>

          {/* Farmer notification */}
          <div className="d-flex align-items-start gap-2 p-3 rounded-3 mb-2" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <i className="bi bi-bell-fill text-emerald-600 mt-1"></i>
            <small className="text-emerald-700">
              The farmer has been <strong>notified</strong> of your order with your contact details ({selectedItem.farmerMobile}, {selectedItem.farmerEmail}). Produce must reach you by <strong>{deadlineDate.toLocaleDateString('en-IN')}</strong>.
            </small>
          </div>
        </div>

        <button className="btn-modern btn-modern-primary px-5 py-3 rounded-pill shadow-lg" onClick={closeDetails}>
          <i className="bi bi-house me-2"></i> Back to Marketplace
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER: Demand Card
  // ═══════════════════════════════════════════════════════════════════

  const renderDemandCard = (item) => {
    const isOtherBuyer = user && user.role === 'Buyer' && user.id !== item.buyerId;

    return (
      <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl" key={item.id}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary font-bold">
            {item.buyerName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-on-surface">{item.cropName}</p>
            <p className="text-xs text-stone-500">{item.buyerName} - {item.requiredQuantity} | {formatCurrency(item.targetPrice)}</p>
          </div>
        </div>
        <button
          className={`font-bold text-sm bg-white px-4 py-2 rounded-lg ${isOtherBuyer ? 'text-stone-400 bg-stone-100 cursor-not-allowed' : 'text-primary'}`}
          onClick={() => {
            if (!isOtherBuyer) openDetails(item, 'order');
          }}
          disabled={isOtherBuyer}
        >
          {isOtherBuyer ? 'View Only' : (user && user.role === 'Farmer' ? 'Offer' : 'Details')}
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════
  //  MAIN RETURN
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-10 pb-20 relative">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 fade-in-up">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-primary tracking-tighter leading-tight">
            नमस्ते, {user ? user.name : 'Guest'}
          </h2>
          <p className="text-stone-500 mt-2 text-lg font-medium">Your harvest is reaching its peak potential this season.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-xl shadow-primary/20" onClick={() => {
            if (!user) {
              alert(t('common.loginRequired') || 'Please login to post a requirement.');
              if (onNavigate) onNavigate('login');
              return;
            }
            setShowRequirementModal(true);
          }}>
            <span className="material-symbols-outlined">add</span>
            Post a Requirement
          </button>
        </div>
      </section>

      {/* Modern Tabs */}
      <div className="flex p-1.5 bg-stone-100 rounded-2xl w-full max-w-md mx-auto md:mx-0 shadow-inner">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all ${activeTab === 'listings' ? 'bg-white text-primary shadow-sm scale-[1.02]' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <i className="bi bi-shop"></i>
            Storefront
          </div>
        </button>
        <button
          onClick={() => setActiveTab('demands')}
          className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all ${activeTab === 'demands' ? 'bg-white text-primary shadow-sm scale-[1.02]' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <i className="bi bi-graph-up-arrow"></i>
            Market Demand
          </div>
        </button>
      </div>

      <div className="fade-in-up">
        {activeTab === 'listings' ? (
          <section className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-6 md:p-10 border border-stone-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-stone-100 pb-8">
              <div>
                <h3 className="text-4xl font-black text-primary tracking-tighter leading-none mb-2">Active Storefront</h3>
                <p className="text-stone-500 font-medium">Directly available produce from local farmers</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                 <div className="flex-1 md:flex-none relative">
                    <select className="appearance-none w-full bg-stone-50 border-2 border-stone-100 px-6 py-3 rounded-2xl font-bold text-stone-600 focus:border-primary focus:bg-white outline-none transition-all cursor-pointer pr-12 text-sm">
                       <option>Sort by: Newest</option>
                       <option>Price: Low to High</option>
                       <option>Price: High to Low</option>
                       <option>Quantity: High to Low</option>
                    </select>
                    <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"></i>
                 </div>
                 <button className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <i className="bi bi-sliders"></i> Filters
                 </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {listings.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <i className="bi bi-inbox text-5xl text-stone-300"></i>
                    <h5 className="text-stone-500 font-bold mt-4">No Listings Available At This Moment</h5>
                  </div>
                ) : (
                  listings.map(renderListingCard)
                )}
              </div>
            )}
          </section>
        ) : (
          <section className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-6 md:p-10 border border-stone-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-stone-100 pb-8">
              <div>
                <h3 className="text-4xl font-black text-primary tracking-tighter leading-none mb-2">Market Demand</h3>
                <p className="text-stone-500 font-medium">Immediate requirements from verified buyers</p>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                 <div className="flex-1 md:flex-none relative">
                    <select className="appearance-none w-full bg-stone-50 border-2 border-stone-100 px-6 py-3 rounded-2xl font-bold text-stone-600 focus:border-primary focus:bg-white outline-none transition-all cursor-pointer pr-12 text-sm">
                       <option>Sort by: Urgency</option>
                       <option>Budget: Low to High</option>
                       <option>Budget: High to Low</option>
                       <option>Quantity: High to Low</option>
                    </select>
                    <i className="bi bi-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"></i>
                 </div>
                 <button className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                    <i className="bi bi-sliders"></i> Filters
                 </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                    <i className="bi bi- megaphone text-5xl text-stone-300"></i>
                    <h5 className="text-stone-500 font-bold mt-4">No active demands currently posted.</h5>
                  </div>
                ) : (
                  orders.map(renderDemandCard)
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ═══ PRODUCT DETAIL / PAYMENT MODAL ═══ */}
      {selectedItem && modalType === 'listing' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in"
          style={{ backgroundColor: 'rgba(23, 29, 22, 0.4)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDetails() }}>
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
            <button
              className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-stone-900 hover:bg-white transition-colors border border-stone-100 shadow-md"
              onClick={closeDetails}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {modalStep === 'details' && (
              <div className="w-full md:w-5/12 h-64 md:h-auto overflow-hidden">
                <img
                  src={selectedItem.imageUrl ? `http://localhost:8081${selectedItem.imageUrl}` : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"}
                  alt={selectedItem.cropName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className={`w-full ${modalStep === 'details' ? 'md:w-7/12' : 'col-12'} overflow-y-auto custom-scrollbar bg-white`}>
              {modalStep === 'details' && renderDetailStep()}
              {modalStep === 'payment' && renderPaymentStep()}
              {modalStep === 'success' && renderSuccessStep()}
            </div>
          </div>
        </div>
      )}

      {/* ═══ DEMAND DETAIL MODAL ═══ */}
      {selectedItem && modalType === 'order' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in"
          style={{ backgroundColor: 'rgba(23, 29, 22, 0.4)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDetails() }}>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-y-auto custom-scrollbar relative p-8 md:p-12">
            <button
              className="absolute top-8 right-8 z-50 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 hover:bg-stone-200 transition-colors"
              onClick={closeDetails}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            <div className="mb-8">
              <span className="inline-block bg-primary/10 text-primary font-black px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-4">
                {selectedItem.status}
              </span>
              <h2 className="text-5xl font-black text-primary tracking-tighter leading-tight">{selectedItem.cropName}</h2>
            </div>

            {/* Requirement info */}
            <div className="p-4 rounded-3 mb-5" style={{ backgroundColor: '#f5fcef' }}>
              <div className="row">
                <div className="col-md-7">
                  <label className="fw-bold mb-2 small" style={{ color: '#171d16', opacity: 0.7, textTransform: 'uppercase' }}>Requirement Summary</label>
                  <h3 className="fw-bold fs-4 mb-3" style={{ color: '#171d16' }}>{selectedItem.cropName}</h3>
                  <div className="flex gap-4 font-bold text-stone-900/80">
                    <span className="flex items-center gap-2"><i className="bi bi-person-circle text-primary"></i>{selectedItem.buyerName}</span>
                    <span className="flex items-center gap-2"><i className="bi bi-box-seam text-primary"></i>{selectedItem.requiredQuantity}</span>
                  </div>
                </div>
                <div className="col-md-5 text-md-end mt-4 mt-md-0 d-flex flex-column justify-content-center">
                  <label className="fw-bold mb-2 small" style={{ color: '#171d16', opacity: 0.7, textTransform: 'uppercase' }}>Target Budget (Total)</label>
                  <div className="fw-extrabold" style={{ fontSize: '2rem', color: '#9a4600' }}>{formatCurrency(selectedItem.targetPrice)}</div>
                </div>
              </div>
            </div>

            {/* Farmer bid form */}
            {user && user.role === 'Farmer' && selectedItem.status === 'PENDING' && (
              <div className="card mb-4" style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '0.375rem', boxShadow: '0 8px 32px rgba(23, 29, 22, 0.06)' }}>
                <div className="card-header pt-4 px-4" style={{ backgroundColor: '#eff6e9', border: 'none', borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}>
                  <h5 className="fw-bold mb-0" style={{ color: '#154212', fontFamily: 'Manrope, sans-serif' }}>Submit Your Fulfillment Offer</h5>
                  <p className="small mt-1" style={{ color: '#171d16', opacity: 0.8 }}>Provide your price and details to the buyer.</p>
                </div>
                <div className="card-body p-4" style={{ backgroundColor: '#f5fcef', borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="fw-bold mb-2 small" style={{ color: '#171d16' }}>Your Total Price (₹)</label>
                      <input type="number" value={bidPrice} onChange={e => setBidPrice(e.target.value)} placeholder="0.00" className="form-control" style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '0.375rem', borderBottom: '2px solid #154212', padding: '12px 16px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="fw-bold mb-2 small" style={{ color: '#171d16' }}>Quantity You Can Supply</label>
                      <input type="text" value={bidQuantity} onChange={e => setBidQuantity(e.target.value)} placeholder="e.g. 500 KG" className="form-control" style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '0.375rem', borderBottom: '2px solid #154212', padding: '12px 16px' }} />
                    </div>
                    <div className="col-12">
                      <label className="fw-bold mb-2 small" style={{ color: '#171d16' }}>Harvest Season</label>
                      <select value={bidSeason} onChange={e => setBidSeason(e.target.value)} className="form-select" style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '0.375rem', borderBottom: '2px solid #154212', padding: '12px 16px' }}>
                        <option value="">Select Season</option>
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Zaid">Zaid</option>
                        <option value="Year-round">Year-round</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="fw-bold mb-2 small" style={{ color: '#171d16' }}>Message to Buyer</label>
                      <textarea value={bidMessage} onChange={e => setBidMessage(e.target.value)} className="form-control" placeholder="Any additional notes..." rows="2" style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '0.375rem', padding: '12px 16px' }}></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button
                        className="btn w-100 fw-bold py-3"
                        onClick={handleSubmitBid}
                        style={{
                          borderRadius: '0.75rem',
                          background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontFamily: 'Manrope, sans-serif'
                        }}
                      >
                        Send Fulfillment Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer sees bids */}
            {user && user.id === selectedItem.buyerId && (
              <div className="card" style={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '0.375rem', boxShadow: '0 8px 32px rgba(23, 29, 22, 0.06)' }}>
                <div className="card-header pt-4 px-4 flex justify-between items-center bg-white border-none">
                  <div>
                    <h5 className="font-bold text-primary mb-0" style={{ fontFamily: 'Manrope, sans-serif' }}>Farmer Responses</h5>
                    <p className="text-stone-500 text-xs mt-1">Select a farmer to create a blockchain contract.</p>
                  </div>
                  <span className="bg-stone-100 text-primary px-3 py-1.5 rounded-full font-bold text-xs">{bids.length} Offers</span>
                </div>
                <div className="card-body p-4 pt-0">
                  {selectedItem.status === 'FULFILLED' && (
                    <div className="alert rounded-3 border-0 p-4 text-center mb-4" style={{ backgroundColor: '#eff6e9' }}>
                      <button
                        className="btn w-100 fw-bold py-3"
                        onClick={handleAcceptFulfillment}
                        style={{
                          borderRadius: '0.75rem',
                          background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontFamily: 'Manrope, sans-serif'
                        }}
                      >
                        Accept Fulfillment
                      </button>
                    </div>
                  )}
                  {bids.length === 0 ? (
                    <div className="text-center py-5 rounded-3" style={{ backgroundColor: '#f5fcef' }}>
                      <div className="small fw-bold" style={{ color: '#171d16', opacity: 0.6 }}>Waiting for farmer offers...</div>
                    </div>
                  ) : (
                    bids.map(b => (
                      <div key={b.id} className="p-4 mb-3 rounded-3" style={{ backgroundColor: '#eff6e9' }}>
                        <div className="row align-items-center">
                          <div className="col-md-7">
                            <div className="d-flex align-items-center gap-3 mb-2">
                              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#154212', color: '#ffffff' }}>
                                {b.farmerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-bold fs-5" style={{ color: '#154212' }}>{formatCurrency(b.offeredPrice)}</div>
                                <div className="small" style={{ color: '#171d16', opacity: 0.8 }}>by {b.farmerName}</div>
                              </div>
                            </div>
                            <div className="d-flex flex-wrap gap-2 mt-2">
                              {b.seasonType && <span className="badge rounded-pill px-2 py-1 small" style={{ backgroundColor: '#ffffff', color: '#171d16' }}><i className="bi bi-calendar-event me-1 text-success"></i> {b.seasonType}</span>}
                              {b.suppliedQuantity && <span className="badge rounded-pill px-2 py-1 small" style={{ backgroundColor: '#ffffff', color: '#171d16' }}><i className="bi bi-box-seam me-1 text-success"></i> {b.suppliedQuantity}</span>}
                            </div>
                            {b.message && <p className="small mt-2 mb-0 fst-italic" style={{ color: '#171d16', opacity: 0.8 }}>"{b.message}"</p>}
                          </div>
                          <div className="col-md-5 mt-3 mt-md-0 text-md-end">
                            {!b.accepted ? (
                              <button
                                className="btn btn-sm px-4 fw-bold"
                                onClick={() => handleAcceptBid(b.id)}
                                style={{
                                  borderRadius: '0.75rem',
                                  padding: '12px 24px',
                                  background: 'linear-gradient(135deg, #154212 0%, #2d5a27 100%)',
                                  color: '#ffffff',
                                  border: 'none'
                                }}
                              >
                                Select Farmer
                              </button>
                            ) : (
                              <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: '#2d5a27', color: '#ffffff' }}>✓ Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Farmer contact buyer */}
            {user && user.role === 'Farmer' && (
              <button className="btn-modern btn-modern-outline w-100 py-3 mt-3" onClick={handleContactBuyer}>
                <i className="bi bi-chat-left-text me-2"></i> {contactByFarmer ? 'Contact Details Below ↓' : 'Message Buyer'}
              </button>
            )}
            {contactByFarmer && (
              <div className="mt-3 p-4 bg-dark text-white rounded-4 shadow-lg">
                <h6 className="fw-bold mb-3 border-bottom border-secondary pb-2">Buyer Contact</h6>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-success p-2 rounded-full text-white flex items-center justify-center w-10 h-10"><i className="bi bi-telephone-fill"></i></div>
                  <div className="text-xl font-black">{selectedItem.buyerMobile}</div>
                </div>
                <div className="text-secondary small"><i className="bi bi-envelope-fill me-2"></i>{selectedItem.buyerEmail}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ POST REQUIREMENT MODAL ═══ */}
      {showRequirementModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in"
      style={{ backgroundColor: 'rgba(23, 29, 22, 0.4)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowRequirementModal(false) }}>
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden p-8 relative">
        <button
          className="absolute top-8 right-8 z-50 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 hover:bg-stone-200 transition-colors"
          onClick={() => setShowRequirementModal(false)}
        >
          <i className="bi bi-x-lg"></i>
        </button>
        <h4 className="text-3xl font-black text-primary tracking-tighter mb-8 italic">Post New Requirement</h4>
        <form onSubmit={handlePostRequirement} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Crop Name</label>
            <input
              type="text"
              className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold"
              value={newReq.cropName}
              onChange={e => setNewReq({ ...newReq, cropName: e.target.value })}
              required
              placeholder="e.g. Basmati Rice"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Quantity Needed</label>
            <input
              type="text"
              className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold"
              value={newReq.requiredQuantity}
              onChange={e => setNewReq({ ...newReq, requiredQuantity: e.target.value })}
              required
              placeholder="e.g. 500 KG"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Target Price (Total Budget ₹)</label>
            <input
              type="number"
              className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold"
              value={newReq.targetPrice}
              onChange={e => setNewReq({ ...newReq, targetPrice: e.target.value })}
              required
              placeholder="0.00"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            Broadcast to Network
          </button>
        </form>
      </div>
    </div>
  )}
    </div>
  )
}

export default Marketplace
