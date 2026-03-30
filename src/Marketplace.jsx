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

  return (
    <div className="page-background fade-in pb-5">
      {/* Hero Section */}
      <div className="marketplace-hero bg-success text-white py-5 mb-5 shadow-sm text-center bg-gradient">
        <div className="container">
          <h1 className="fw-bold mb-3">{t('marketplace.storefront')}</h1>
          <p className="lead mb-0">{t('marketplace.discoverFresh')}</p>
        </div>
      </div>

      <div className="container px-4">
        {/* Tab Navigation */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mb-5 border-bottom pb-4">
          <button 
            type="button" 
            className={`btn px-4 py-2 rounded-pill fw-medium ${activeTab === 'listings' ? 'btn-success shadow' : 'btn-outline-success border-2'}`}
            onClick={() => setActiveTab('listings')}
          >
            <i className="bi bi-cart me-2"></i> {t('marketplace.freshProduce')}
          </button>
          <button 
            type="button" 
            className={`btn px-4 py-2 rounded-pill fw-medium ${activeTab === 'orders' ? 'btn-warning shadow text-dark' : 'btn-outline-warning border-2 text-dark'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-clipboard-data me-2"></i> {t('marketplace.marketDemands')}
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">{t('marketplace.loading')}</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {activeTab === 'listings' && listings.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="bi bi-cart-x display-1 text-muted d-block mb-3"></i>
                <h4 className="text-muted">{t('marketplace.loading')}</h4>
              </div>
            )}
            
            {activeTab === 'listings' && listings.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-lift">
                  {item.imageUrl && <img src={`http://localhost:8081${item.imageUrl}`} alt={item.cropName} className="card-img-top object-fit-cover" style={{ height: '220px' }} />}
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title fw-bold text-success mb-0">{item.cropName}</h5>
                    <div className="text-muted small mb-3">
                      <i className="bi bi-person me-1"></i> {item.farmerName}
                    </div>
                    <div className="d-flex justify-content-between mb-3 bg-light rounded-3 p-3">
                      <div>
                        <div className="small text-muted mb-1">Quantity</div>
                        <div className="fw-semibold text-dark">{item.quantity}</div>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted mb-1">Price</div>
                        <div className="fw-semibold text-success">₹{item.pricePerUnit}</div>
                      </div>
                    </div>
                    <button type="button" className="btn btn-outline-success w-100 mt-auto rounded-pill fw-medium" onClick={() => openDetails(item, 'listing')}>View Full Details</button>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'orders' && orders.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="bi bi-clipboard-x display-1 text-muted d-block mb-3"></i>
                <h4 className="text-muted">No buyer demands at the moment.</h4>
              </div>
            )}
            
            {activeTab === 'orders' && orders.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-lift border-top border-warning border-4">
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title fw-bold mb-0">{item.cropName}</h5>
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1 small mb-3">WANTED</span>
                    <div className="text-muted small mb-3">
                      <i className="bi bi-person me-1"></i> {item.buyerName}
                    </div>
                    <div className="d-flex justify-content-between mb-4 bg-light rounded-3 p-3 mt-auto">
                      <div>
                        <div className="small text-muted mb-1">Required</div>
                        <div className="fw-semibold text-dark">{item.requiredQuantity}</div>
                      </div>
                      <div className="text-end">
                        <div className="small text-muted mb-1">Willing Price</div>
                        <div className="fw-semibold text-warning-emphasis">₹{item.targetPrice}</div>
                      </div>
                    </div>
                    <button type="button" className="btn btn-warning w-100 text-dark fw-medium rounded-pill shadow-sm" onClick={() => openDetails(item, 'order')}>View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Details Modal */}
      {selectedItem && (
        <div className="modal show d-block fade" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className={`modal-header border-0 text-white 
                ${modalType === 'listing' ? 'bg-success' : 'bg-warning text-dark'}`}>
                <h5 className="modal-title fw-bold">
                  {modalType === 'listing' ? 'Crop Listing Details' : 'Buyer Requirement Details'}
                </h5>
                <button type="button" className={`btn-close ${modalType === 'order' ? '' : 'btn-close-white'}`} onClick={closeDetails}></button>
              </div>
              
              <div className="modal-body p-0 bg-light">
                {modalType === 'listing' && selectedItem.imageUrl && (
                  <img src={`http://localhost:8081${selectedItem.imageUrl}`} alt={selectedItem.cropName} className="img-fluid w-100 object-fit-contain bg-dark" style={{ maxHeight: '380px' }} />
                )}
                
                <div className="p-4 p-md-5 bg-white">
                  <h2 className={`mb-4 fw-bold 
                    ${modalType === 'listing' ? 'text-success' 
                     : 'text-warning-emphasis'}`}>
                    {selectedItem.cropName}
                  </h2>
                  
                  <div className="row g-4">
                    {/* LISTING DETAILS */}
                    {modalType === 'listing' && (
                      <>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Farmer Name</label>
                          <div className="fs-5 fw-medium text-dark">{selectedItem.farmerName}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Available Quantity</label>
                          <div className="fs-5 fw-medium text-dark">{selectedItem.quantity}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Price per Unit</label>
                          <div className="fs-5 fw-medium text-success">₹{selectedItem.pricePerUnit}</div>
                        </div>
                        {selectedItem.season && (
                          <div className="col-sm-6">
                            <label className="text-muted small text-uppercase mb-1">Season</label>
                            <div className="fs-5 fw-medium text-dark">{selectedItem.season}</div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="col-12 mt-4 pt-4 border-top">
                          <div className="d-flex gap-2 mb-3">
                            {user && user.role !== 'Farmer' && (
                              <>
                                <button className="btn btn-success btn-lg rounded-pill flex-grow-1 shadow" onClick={handlePlaceOrder}>
                                  <i className="bi bi-cart-plus me-2"></i> Place Order
                                </button>
                                {!showFarmerContact && (
                                  <button className="btn btn-outline-success btn-lg rounded-pill flex-grow-1" onClick={handleContactSeller}>
                                    <i className="bi bi-telephone me-2"></i> Contact Farmer
                                  </button>
                                )}
                              </>
                            )}
                            {!user && (
                              <button className="btn btn-warning btn-lg rounded-pill w-100 shadow" onClick={() => onNavigate('login')}>
                                <i className="bi bi-box-arrow-in-right me-2"></i> Login to Order
                              </button>
                            )}
                          </div>

                          {showFarmerContact && (
                            <div className="bg-success bg-opacity-10 border border-success border-opacity-25 rounded-4 p-4 text-center fade-in mt-3">
                              <h5 className="text-success fw-bold mb-3">Farmer Contact Details</h5>
                              <div className="fs-5 mb-2"><i className="bi bi-person-badge text-muted me-2"></i> <strong>{selectedItem.farmerName}</strong></div>
                              <div className="fs-4 fw-bold text-dark mb-2"><i className="bi bi-telephone-fill text-success me-2"></i> {selectedItem.farmerMobile}</div>
                              <div className="fs-6 text-muted"><i className="bi bi-envelope-fill me-2"></i> {selectedItem.farmerEmail}</div>
                              <a href={`tel:${selectedItem.farmerMobile}`} className="btn btn-success rounded-pill px-4 mt-3 shadow-sm mx-1">Call Now</a>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* ORDER DETAILS */}
                    {modalType === 'order' && (
                      <>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Buyer Name</label>
                          <div className="fs-5 fw-medium text-dark">{selectedItem.buyerName}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Required Quantity</label>
                          <div className="fs-5 fw-medium text-dark">{selectedItem.requiredQuantity}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Target Price per Unit</label>
                          <div className="fs-5 fw-medium text-warning-emphasis">₹{selectedItem.targetPrice}</div>
                        </div>

                        {/* Farmer Contact Button */}
                        <div className="col-12 mt-4 pt-4 border-top">
                          {user && user.role === 'Farmer' && (
                            <>
                              {!contactByFarmer && (
                                <button className="btn btn-warning btn-lg rounded-pill w-100 text-dark shadow" onClick={handleContactBuyer}>
                                  <i className="bi bi-telephone me-2"></i> Contact Buyer
                                </button>
                              )}

                              {contactByFarmer && (
                                <div className="bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-4 p-4 text-center fade-in mt-3">
                                  <h5 className="text-warning-emphasis fw-bold mb-3">Buyer Contact Details</h5>
                                  <div className="fs-5 mb-2"><i className="bi bi-person-badge text-muted me-2"></i> <strong>{selectedItem.buyerName}</strong></div>
                                  <div className="fs-4 fw-bold text-dark mb-2"><i className="bi bi-telephone-fill text-success me-2"></i> {selectedItem.buyerMobile}</div>
                                  <div className="fs-6 text-muted"><i className="bi bi-envelope-fill me-2"></i> {selectedItem.buyerEmail}</div>
                                  <a href={`tel:${selectedItem.buyerMobile}`} className="btn btn-warning rounded-pill px-4 mt-3 shadow-sm mx-1 text-dark">Call Now</a>
                                </div>
                              )}
                            </>
                          )}
                          {user && user.role !== 'Farmer' && (
                            <div className="alert alert-info mb-0">
                              <i className="bi bi-info-circle me-2"></i> Only farmers can contact buyers for this demand
                            </div>
                          )}
                          {!user && (
                            <button className="btn btn-warning btn-lg rounded-pill w-100 shadow text-dark" onClick={() => onNavigate('login')}>
                              <i className="bi bi-box-arrow-in-right me-2"></i> Login to Contact
                            </button>
                          )}
                        </div>
                      </>
                    )}
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
