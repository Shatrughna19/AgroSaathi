import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Marketplace({ user, onNavigate }) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('listings')
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState('')
  const [showFarmerContact, setShowFarmerContact] = useState(false)
  const [contactByFarmer, setContactByFarmer] = useState(false)

  const API_BASE = 'http://localhost:8081/api/marketplace'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const listingsRes = await fetch(`${API_BASE}/listings`)
        const ordersRes = await fetch(`${API_BASE}/orders`)
        
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
    if (user && user.role === 'Farmer') {
      setActiveTab('listings')
    }
  }, [user])

  const openDetails = (item, type) => {
    setSelectedItem(item)
    setModalType(type)
    setShowFarmerContact(false)
    setContactByFarmer(false)
  }

  const closeDetails = () => {
    setSelectedItem(null)
    setModalType('')
    setShowFarmerContact(false)
    setContactByFarmer(false)
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      alert(t('marketplace.pleaseLoin'))
      return
    }
    if (user.role === 'Farmer') {
      alert(t('marketplace.farmersCannotOrder'))
      return
    }
    try {
      const response = await fetch(`${API_BASE}/orders/place?listingId=${selectedItem.id}&buyerId=${user.id}&buyerName=${user.name}&buyerMobile=${user.mobile}&buyerEmail=${user.email}`, {
        method: 'POST'
      })
      if (response.ok) {
        alert(t('marketplace.orderPlacedSuccess'))
        closeDetails()
      }
    } catch (error) {
      alert(t('marketplace.failedToPlaceOrder') + ': ' + error.message)
    }
  }

  const handleContactSeller = async () => {
    if (!user) {
      alert(t('marketplace.pleaseLoginContact'))
      return
    }
    try {
      await fetch(`${API_BASE}/contact/send?recipientId=${selectedItem.farmerId}&senderId=${user.id}&senderName=${user.name}&senderMobile=${user.mobile}&senderEmail=${user.email}&senderRole=${user.role}&cropName=${selectedItem.cropName}`, {
        method: 'POST'
      })
      setShowFarmerContact(true)
    } catch (error) {
      alert(t('marketplace.failedToContact') + ': ' + error.message)
    }
  }

  const handleContactBuyer = async () => {
    if (!user) {
      alert(t('marketplace.pleaseLoginContact'))
      return
    }
    try {
      await fetch(`${API_BASE}/contact/send?recipientId=${selectedItem.buyerId}&senderId=${user.id}&senderName=${user.name}&senderMobile=${user.mobile}&senderEmail=${user.email}&senderRole=${user.role}&cropName=${selectedItem.cropName}`, {
        method: 'POST'
      })
      setContactByFarmer(true)
    } catch (error) {
      alert('Failed to send contact info: ' + error.message)
    }
  }

  const handleOfferFulfillment = async () => {
    if (!user || user.role !== 'Farmer') return
    try {
      const response = await fetch(`${API_BASE}/orders/buyer/${selectedItem.id}/fulfill?farmerId=${user.id}&farmerName=${user.name}&farmerMobile=${user.mobile}&farmerEmail=${user.email}`, {
        method: 'PUT'
      })
      if (response.ok) {
        alert('Fulfillment offer sent to buyer!')
        // Update local state
        setOrders(orders.map(o => o.id === selectedItem.id ? { ...o, status: 'FULFILLED', fulfilledByFarmerId: user.id } : o))
        closeDetails()
      }
    } catch (error) {
      alert('Failed to send fulfillment offer: ' + error.message)
    }
  }

  const handleAcceptFulfillment = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/buyer/${selectedItem.id}/accept-fulfillment`, {
        method: 'PUT'
      })
      if (response.ok) {
        alert('Fulfillment accepted! Transaction completed.')
        // Update local state
        setOrders(orders.map(o => o.id === selectedItem.id ? { ...o, status: 'ACCEPTED' } : o))
        closeDetails()
      }
    } catch (error) {
      alert('Failed to accept fulfillment: ' + error.message)
    }
  }

  const getRequirementStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning-subtle text-warning-emphasis border-warning-subtle'
      case 'FULFILLED': return 'bg-info-subtle text-info-emphasis border-info-subtle'
      case 'ACCEPTED': return 'bg-success-subtle text-success-emphasis border-success-subtle'
      default: return 'bg-secondary-subtle'
    }
  }

  return (
    <div className="fade-in-up">
      <div className="market-hero container px-3">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
          <div>
            <h1 className="fw-extrabold">Agro Marketplace — Local, Fair, Direct</h1>
            <p className="mb-0">Buy directly from farmers or list produce to reach buyers across your region.</p>
          </div>
          <div className="mt-3 mt-md-0 d-flex gap-2">
            <button 
              className={`btn-modern ${activeTab === 'listings' ? 'btn-modern-primary text-white' : 'btn-modern-outline'}`}
              onClick={() => setActiveTab('listings')}
            >
              <i className="bi bi-shop"></i> <span>Storefront</span>
            </button>
            <button 
              className={`btn-modern ${activeTab === 'orders' ? 'btn-modern-primary text-white' : 'btn-modern-outline'}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-lightning-charge"></i> <span>Market Demands</span>
            </button>
          </div>
        </div>
      </div>
      {/* Page Header */}
      <header className="page-header-modern">
        <div>
          <h1 className="page-title-modern">Agro Marketplace</h1>
          <p className="page-subtitle-modern">Direct trade between local farmers and quality buyers.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className={`btn-modern ${activeTab === 'listings' ? 'btn-modern-primary text-white' : 'btn-modern-outline'}`}
            onClick={() => setActiveTab('listings')}
          >
            <i className="bi bi-shop"></i> <span>Storefront</span>
          </button>
          <button 
            className={`btn-modern ${activeTab === 'orders' ? 'btn-modern-primary text-white' : 'btn-modern-outline'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-lightning-charge"></i> <span>Market Demands</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="container px-3">
        {loading ? (
          <div className="d-flex justify-content-center my-5 py-5">
            <div className="spinner-grow text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div>
          <div className="market-grid">
            {activeTab === 'listings' && listings.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-5 shadow-sm border">
                <i className="bi bi-cart-x display-1 text-slate-300 d-block mb-3"></i>
                <h4 className="text-slate-500">No Listings Available</h4>
              </div>
            )}

            {activeTab === 'listings' && listings.map((item) => (
              <div className="market-card" key={item.id}>
                {item.imageUrl ? (
                  <img src={`http://localhost:8081${item.imageUrl}`} alt={item.cropName} className="media" />
                ) : (
                  <div className="bg-slate-100 d-flex align-items-center justify-content-center text-slate-400" style={{ height: '180px' }}>
                    <i className="bi bi-image fs-1"></i>
                  </div>
                )}
                <div className="p-3 d-flex flex-column h-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="fw-bold text-slate-900 mb-1">{item.cropName}</h5>
                    <span className="badge-modern badge-success-modern">₹{item.pricePerUnit}/unit</span>
                  </div>
                  <div className="text-slate-500 small mb-2 d-flex align-items-center gap-1">
                    <i className="bi bi-person-circle"></i> {item.farmerName}
                  </div>

                  <div className="bg-slate-50 rounded-3 p-2 mb-3 mt-auto border border-slate-100">
                    <div className="d-flex justify-content-between text-slate-600 small">
                      <span>Availability</span>
                      <span className="fw-bold text-slate-900">{item.quantity}</span>
                    </div>
                  </div>

                  <button className="btn-modern btn-modern-outline w-100" onClick={() => openDetails(item, 'listing')}>
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {activeTab === 'orders' && orders.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-5 shadow-sm border">
                <i className="bi bi-lightning display-1 text-slate-300 d-block mb-3"></i>
                <h4 className="text-slate-500">No active demands.</h4>
              </div>
            )}
            
            {activeTab === 'orders' && orders.map((item) => (
              <div className="market-card p-3" key={item.id}>
                <div className={`d-flex flex-column h-100 ${item.status === 'PENDING' ? '' : ''}`}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-slate-900 mb-0">{item.cropName}</h5>
                    <span className={`badge-modern ${getRequirementStatusBadge(item.status)}`}>{item.status}</span>
                  </div>
                  <div className="text-slate-500 small mb-3">Requested by <strong className="text-slate-700">{item.buyerName}</strong></div>
                  <div className="mb-3 bg-amber-50 rounded-3 p-2" style={{ backgroundColor: '#fffbeb' }}>
                    <div className="d-flex justify-content-between small"><span>Qty</span><span className="fw-bold">{item.requiredQuantity}</span></div>
                    <div className="d-flex justify-content-between small"><span>Budget</span><span className="fw-bold text-amber-700">₹{item.targetPrice}</span></div>
                  </div>
                  <button className="btn-modern btn-modern-primary w-100 mt-auto" onClick={() => openDetails(item, 'order')}>Fulfill Demand</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Modern Details Modal */}
      {selectedItem && (
        <div className="modal show d-block fade" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-premium rounded-5 overflow-hidden">
              <div className="modal-body p-0">
                <div className="row g-0">
                  {modalType === 'listing' && (
                    <div className="col-lg-5 bg-dark d-none d-lg-block">
                      {selectedItem.imageUrl ? (
                        <img src={`http://localhost:8081${selectedItem.imageUrl}`} alt={selectedItem.cropName} className="w-100 h-100 object-fit-cover opacity-90" />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white-50">
                          <i className="bi bi-image display-1"></i>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={modalType === 'listing' ? "col-lg-7" : "col-12"}>
                    <div className="p-4 p-md-5">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <span className={`badge border rounded-pill px-3 py-2 mb-2 fw-bold ${modalType === 'listing' ? 'bg-success-subtle text-success' : getRequirementStatusBadge(selectedItem.status)}`}>
                            {modalType === 'listing' ? 'Available' : selectedItem.status}
                          </span>
                          <h2 className="display-6 fw-bold text-dark">{selectedItem.cropName}</h2>
                        </div>
                        <button type="button" className="btn-close" onClick={closeDetails}></button>
                      </div>

                      <div className="row g-4 mb-5">
                        <div className="col-6">
                          <label className="text-muted small text-uppercase fw-bold letter-spacing-1 mb-1">{modalType === 'listing' ? 'Producer' : 'Requestor'}</label>
                          <div className="h5 fw-bold text-dark">{modalType === 'listing' ? selectedItem.farmerName : selectedItem.buyerName}</div>
                        </div>
                        <div className="col-6">
                          <label className="text-muted small text-uppercase fw-bold letter-spacing-1 mb-1">Quantity</label>
                          <div className="h5 fw-bold text-dark">{modalType === 'listing' ? selectedItem.quantity : selectedItem.requiredQuantity}</div>
                        </div>
                        <div className="col-12">
                          <div className="p-3 bg-light rounded-4 border-white border">
                            <label className="text-muted small text-uppercase fw-bold letter-spacing-1 mb-1">{modalType === 'listing' ? 'Price per Unit' : 'Target Price'}</label>
                            <div className={`display-5 fw-bold ${modalType === 'listing' ? 'text-success' : 'text-warning-emphasis'}`}>₹{modalType === 'listing' ? selectedItem.pricePerUnit : selectedItem.targetPrice}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Interface */}
                      <div className="pt-4 border-top">
                        {modalType === 'listing' ? (
                          <div className="d-flex flex-column gap-3">
                            {user && user.role !== 'Farmer' && (
                              <button className="btn btn-success btn-lg rounded-pill fw-bold py-3 shadow" onClick={handlePlaceOrder}>
                                <i className="bi bi-cart-plus-fill me-2"></i> Purchase Now
                              </button>
                            )}
                            {user && (
                              <button className="btn btn-outline-dark btn-lg rounded-pill fw-bold py-3" onClick={handleContactSeller}>
                                <i className="bi bi-person-lines-fill me-2"></i> {showFarmerContact ? 'Contact Shown Below' : 'Get Farmer Contact'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {user && user.role === 'Farmer' && selectedItem.status === 'PENDING' && (
                              <button className="btn btn-warning btn-lg rounded-pill fw-bold py-3 shadow text-dark" onClick={handleOfferFulfillment}>
                                <i className="bi bi-check-lg me-2"></i> Offer Fulfillment
                              </button>
                            )}
                            
                            {user && user.id === selectedItem.buyerId && selectedItem.status === 'FULFILLED' && (
                              <div className="alert alert-info rounded-4 border-0 shadow-sm p-4 text-center">
                                <h5 className="fw-bold mb-3">Fulfillment Offered!</h5>
                                <p className="mb-4 text-muted">A farmer has offered to fulfill your requirement. Confirm once you receive the produce.</p>
                                <button className="btn btn-success btn-lg rounded-pill fw-bold w-100 shadow-sm" onClick={handleAcceptFulfillment}>
                                  <i className="bi bi-check2-all me-2"></i> Accept Fulfillment
                                </button>
                              </div>
                            )}

                            {user && user.role === 'Farmer' && (
                              <button className="btn btn-outline-dark btn-lg rounded-pill fw-bold py-3" onClick={handleContactBuyer}>
                                <i className="bi bi-person-lines-fill me-2"></i> {contactByFarmer ? 'Contact Shown Below' : 'Get Buyer Contact'}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {(showFarmerContact || contactByFarmer) && (
                          <div className="mt-4 p-4 bg-dark text-white rounded-4 fade-in shadow-lg">
                            <h5 className="fw-bold mb-3 border-bottom border-secondary pb-2">Direct Communications</h5>
                            <div className="d-flex align-items-center gap-3 mb-3">
                              <div className="bg-success p-2 rounded-circle"><i className="bi bi-telephone-fill"></i></div>
                              <div className="fs-4 fw-bold">{modalType === 'listing' ? selectedItem.farmerMobile : selectedItem.buyerMobile}</div>
                            </div>
                            <div className="text-secondary small mb-3">
                              <i className="bi bi-envelope-fill me-2"></i> {modalType === 'listing' ? selectedItem.farmerEmail : selectedItem.buyerEmail}
                            </div>
                            <div className="d-flex gap-2">
                              <a href={`tel:${modalType === 'listing' ? selectedItem.farmerMobile : selectedItem.buyerMobile}`} className="btn btn-success rounded-pill flex-grow-1 fw-bold">Call Now</a>
                              <a href={`mailto:${modalType === 'listing' ? selectedItem.farmerEmail : selectedItem.buyerEmail}`} className="btn btn-outline-light rounded-pill px-4">Email</a>
                            </div>
                          </div>
                        )}

                        {!user && (
                          <button className="btn btn-dark btn-lg rounded-pill w-100 fw-bold py-3 shadow" onClick={() => onNavigate('login')}>
                            Join to Interact
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Marketplace
