import { useState, useEffect } from 'react'
import './App.css'

function Marketplace({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('listings') // 'listings', 'orders', 'fertilizers'
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [fertilizers, setFertilizers] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState('') // 'listing', 'order', 'fertilizer'
  const [showShopOwnerContact, setShowShopOwnerContact] = useState(false)

  const API_BASE = 'http://localhost:8081/api/marketplace'

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [listingsRes, ordersRes, fertsRes] = await Promise.all([
          fetch(`${API_BASE}/listings`),
          fetch(`${API_BASE}/orders`),
          fetch(`${API_BASE}/fertilizers`)
        ])
        
        if (listingsRes.ok) setListings(await listingsRes.json())
        if (ordersRes.ok) setOrders(await ordersRes.json())
        if (fertsRes.ok) setFertilizers(await fertsRes.json())
      } catch (error) {
        console.error('Error fetching marketplace data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Set default active tab based on role if needed (but it's e-commerce now)
  useEffect(() => {
    if (user && user.role === 'Shop Owner') {
      setActiveTab('fertilizers')
    } else if (user && user.role === 'Farmer') {
      setActiveTab('listings')
    }
  }, [user])

  const openDetails = (item, type) => {
    setSelectedItem(item)
    setModalType(type)
    setShowShopOwnerContact(false) // reset contact view
  }

  const closeDetails = () => {
    setSelectedItem(null)
    setModalType('')
    setShowShopOwnerContact(false)
  }

  return (
    <div className="page-background fade-in pb-5">
      {/* Hero Section */}
      <div className="marketplace-hero bg-success text-white py-5 mb-5 shadow-sm text-center bg-gradient">
        <div className="container">
          <h1 className="fw-bold mb-3">Agro Saathi Storefront</h1>
          <p className="lead mb-0">Discover fresh local produce, post demands, and browse high-quality local Fertilizers.</p>
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
              <i className="bi bi-cart me-2"></i> Fresh Produce
            </button>
            <button 
              type="button" 
              className={`btn px-4 py-2 rounded-pill fw-medium ${activeTab === 'orders' ? 'btn-warning shadow text-dark' : 'btn-outline-warning border-2 text-dark'}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="bi bi-clipboard-data me-2"></i> Market Demands
            </button>
            <button 
              type="button" 
              className={`btn px-4 py-2 rounded-pill fw-medium ${activeTab === 'fertilizers' ? 'btn-primary shadow text-white' : 'btn-outline-primary border-2 text-primary'}`}
              onClick={() => setActiveTab('fertilizers')}
            >
              <i className="bi bi-flower3 me-2"></i> Local Fertilizers
            </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {/* LISTINGS TAB */}
            {activeTab === 'listings' && listings.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="bi bi-cart-x display-1 text-muted d-block mb-3"></i>
                <h4 className="text-muted">No crops currently available for sale.</h4>
              </div>
            )}
            
            {activeTab === 'listings' && listings.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden hover-lift" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  {item.imageUrl ? (
                    <img src={`http://localhost:8081${item.imageUrl}`} alt={item.cropName} className="card-img-top object-fit-cover" style={{ height: '220px' }} />
                  ) : (
                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center text-muted" style={{ height: '220px' }}>
                      <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title fw-bold text-success mb-0">{item.cropName}</h5>
                    </div>
                    <div className="text-muted small mb-3">
                      <i className="bi bi-person me-1"></i> Farmer: <strong>{item.farmerName}</strong>
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
                    {item.season && (
                      <div className="mb-3 small text-muted"><i className="bi bi-cloud-sun me-1"></i> {item.season}</div>
                    )}
                    <button type="button" className="btn btn-outline-success w-100 mt-auto rounded-pill fw-medium" onClick={() => openDetails(item, 'listing')}>View Full Details</button>
                  </div>
                </div>
              </div>
            ))}

            {/* ORDERS TAB */}
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
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="card-title fw-bold mb-0">{item.cropName}</h5>
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-1 small">WANTED</span>
                    </div>
                    <div className="text-muted small mb-3">
                      <i className="bi bi-person me-1"></i> Buyer: <strong>{item.buyerName}</strong>
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
                    <button type="button" className="btn btn-warning w-100 text-dark fw-medium rounded-pill shadow-sm" onClick={() => openDetails(item, 'order')}>Fulfill Demand</button>
                  </div>
                </div>
              </div>
            ))}

            {/* FERTILIZERS TAB */}
            {activeTab === 'fertilizers' && fertilizers.length === 0 && (
              <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                <i className="bi bi-shop display-1 text-muted d-block mb-3"></i>
                <h4 className="text-muted">No fertilizers listed in your area right now.</h4>
              </div>
            )}
            
            {activeTab === 'fertilizers' && fertilizers.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                <div className="card h-100 shadow border-0 rounded-4 overflow-hidden hover-lift border-top border-primary border-4">
                  {item.imageUrl ? (
                    <img  src={`http://localhost:8081${item.imageUrl}`}  alt={item.fertilizerName} className="card-img-top object-fit-cover" style={{ height: '220px' }} />
                  ) : (
                    <div className="card-img-top bg-light d-flex align-items-center justify-content-center text-primary border-bottom" style={{ height: '220px' }}>
                      <i className="bi bi-flower3" style={{ fontSize: '4rem', opacity: 0.5 }}></i>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                       <h5 className="card-title fw-bold text-dark mb-0 line-clamp-2">{item.fertilizerName}</h5>
                    </div>
                    <div className="text-primary fw-bold fs-5 mb-2">₹{item.price}</div>
                    
                    <div className="text-muted small mb-3">
                      <i className="bi bi-geo-alt me-1 text-danger"></i> Nearby: <strong>{item.location || 'India'}</strong>
                    </div>
                    <div className="text-muted small mb-4 line-clamp-2">
                      {item.description}
                    </div>
                    
                    <button type="button" className="btn btn-outline-primary w-100 mt-auto rounded-pill fw-bold border-2" onClick={() => openDetails(item, 'fertilizer')}>View Details & Enquiry</button>
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
                ${modalType === 'listing' ? 'bg-success' : 
                  modalType === 'order' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                <h5 className="modal-title fw-bold">
                  {modalType === 'listing' ? 'Crop Listing Details' : 
                   modalType === 'order' ? 'Buyer Requirement Details' : 'Fertilizer Product Info'}
                </h5>
                <button type="button" className={`btn-close ${modalType === 'order' ? '' : 'btn-close-white'}`} onClick={closeDetails}></button>
              </div>
              
              <div className="modal-body p-0 bg-light">
                {['listing', 'fertilizer'].includes(modalType) && selectedItem.imageUrl && (
                  <img src={`http://localhost:8081${selectedItem.imageUrl}`} alt={selectedItem.cropName || selectedItem.fertilizerName} className="img-fluid w-100 object-fit-contain bg-dark" style={{ maxHeight: '380px' }} />
                )}
                
                <div className="p-4 p-md-5 bg-white">
                  <h2 className={`mb-4 fw-bold 
                    ${modalType === 'listing' ? 'text-success' 
                     : modalType === 'order' ? 'text-warning-emphasis' 
                     : 'text-primary'}`}>
                    {selectedItem.cropName || selectedItem.fertilizerName}
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
                      </>
                    )}

                    {/* FERTILIZER DETAILS */}
                    {modalType === 'fertilizer' && (
                      <>
                        <div className="col-sm-12">
                          <label className="text-muted small text-uppercase mb-1">Description</label>
                          <p className="fs-6 text-dark leading-relaxed">{selectedItem.description || 'No detailed description provided.'}</p>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Price</label>
                          <div className="fs-3 fw-bold text-primary">₹{selectedItem.price}</div>
                        </div>
                        <div className="col-sm-6">
                          <label className="text-muted small text-uppercase mb-1">Location / Availability</label>
                          <div className="fs-5 fw-medium text-dark"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {selectedItem.location || 'India'}</div>
                        </div>
                        
                        <div className="col-12 mt-4 pt-4 border-top">
                          {!showShopOwnerContact && (
                             <button className="btn btn-primary btn-lg rounded-pill w-100 shadow" onClick={() => setShowShopOwnerContact(true)}>
                                <i className="bi bi-shop me-2"></i> Query the Shop Owner
                             </button>
                          )}
                          
                          {showShopOwnerContact && (
                            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-4 p-4 text-center fade-in">
                              <h5 className="text-primary fw-bold mb-3">Shop Contact Details</h5>
                              <div className="fs-5 mb-2"><i className="bi bi-person-badge text-muted me-2"></i> <strong>{selectedItem.shopOwnerName}</strong></div>
                              <div className="fs-4 fw-bold text-dark mb-2"><i className="bi bi-telephone-fill text-success me-2"></i> {selectedItem.shopOwnerMobile}</div>
                              <div className="fs-6 text-muted"><i className="bi bi-envelope-fill me-2"></i> {selectedItem.shopOwnerEmail}</div>
                              
                              <a href={`tel:${selectedItem.shopOwnerMobile}`} className="btn btn-success rounded-pill px-4 mt-3 shadow-sm mx-1">Call Now</a>
                            </div>
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
