import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function FertilizerSection({ user }) {
  const { t } = useTranslation()
  const [fertilizers, setFertilizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showShopOwnerContact, setShowShopOwnerContact] = useState(false)
  const API_BASE = 'http://localhost:8081/api/marketplace'

  useEffect(() => {
    fetchFertilizers()
  }, [])

  const fetchFertilizers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/fertilizers`)
      if (res.ok) setFertilizers(await res.json())
    } catch (error) {
      console.error('Error fetching fertilizers:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDetails = (item) => {
    setSelectedItem(item)
    setShowShopOwnerContact(false)
  }

  const closeDetails = () => {
    setSelectedItem(null)
    setShowShopOwnerContact(false)
  }

  return (
    <div className="page-background fade-in pb-5" style={{ minHeight: '100vh' }}>
      <div className="marketplace-hero bg-info text-white py-5 mb-5 shadow-sm text-center bg-gradient">
        <div className="container">
          <h1 className="fw-bold mb-3">{t('marketplace.fertilizerListings')}</h1>
          <p className="lead mb-0">Discover high-quality local fertilizers and soil enhancers from trusted local shops.</p>
        </div>
      </div>

      <div className="container px-4">
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">{t('marketplace.loading')}</span>
            </div>
          </div>
        ) : fertilizers.length === 0 ? (
          <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm border">
            <i className="bi bi-shop-window display-1 text-muted d-block mb-3"></i>
            <h4 className="text-muted">No fertilizers currently listed in your area.</h4>
          </div>
        ) : (
          <div className="row g-4">
            {fertilizers.map((item) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item.id}>
                <div className="card h-100 shadow border-0 rounded-4 overflow-hidden hover-lift border-top border-info border-4">
                  {item.imageUrl && (
                    <img 
                      src={`http://localhost:8081${item.imageUrl}`} 
                      alt={item.fertilizerName} 
                      className="card-img-top object-fit-cover" 
                      style={{ height: '220px' }} 
                    />
                  )}
                  <div className="card-body d-flex flex-column p-4">
                    <h5 className="card-title fw-bold text-dark mb-0">{item.fertilizerName}</h5>
                    <div className="text-info fw-bold fs-5 mb-2">₹{item.price}</div>
                    <div className="text-muted small mb-3">
                      <i className="bi bi-geo-alt me-1 text-danger"></i> {item.location || 'India'}
                    </div>
                    <p className="text-muted small mb-4 line-clamp-2">{item.description}</p>
                    <button 
                      type="button" 
                      className="btn btn-outline-info w-100 mt-auto rounded-pill fw-bold border-2" 
                      onClick={() => openDetails(item)}
                    >
                      View Details & Enquiry
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="modal show d-block fade" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 text-white bg-info">
                <h5 className="modal-title fw-bold">Fertilizer Product Info</h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeDetails}></button>
              </div>
              
              <div className="modal-body p-0 bg-light">
                {selectedItem.imageUrl && (
                  <img 
                    src={`http://localhost:8081${selectedItem.imageUrl}`} 
                    alt={selectedItem.fertilizerName} 
                    className="img-fluid w-100 object-fit-contain bg-dark" 
                    style={{ maxHeight: '380px' }} 
                  />
                )}
                
                <div className="p-4 p-md-5 bg-white">
                  <h2 className="mb-4 fw-bold text-info">{selectedItem.fertilizerName}</h2>
                  
                  <div className="row g-4">
                    <div className="col-sm-12">
                      <label className="text-muted small text-uppercase mb-1">Description</label>
                      <p className="fs-6 text-dark leading-relaxed">{selectedItem.description || 'No detailed description provided.'}</p>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small text-uppercase mb-1">Price</label>
                      <div className="fs-3 fw-bold text-info">₹{selectedItem.price}</div>
                    </div>
                    <div className="col-sm-6">
                      <label className="text-muted small text-uppercase mb-1">Location / Availability</label>
                      <div className="fs-5 fw-medium text-dark"><i className="bi bi-geo-alt-fill text-danger me-1"></i> {selectedItem.location || 'India'}</div>
                    </div>
                    
                    <div className="col-12 mt-4 pt-4 border-top">
                      {!showShopOwnerContact && (
                         <button className="btn btn-info btn-lg rounded-pill w-100 shadow text-white fw-bold" onClick={() => setShowShopOwnerContact(true)}>
                            <i className="bi bi-shop me-2"></i> Query the Shop Owner
                         </button>
                      )}
                      
                      {showShopOwnerContact && (
                        <div className="bg-info bg-opacity-10 border border-info border-opacity-25 rounded-4 p-4 text-center fade-in">
                          <h5 className="text-info-emphasis fw-bold mb-3">Shop Contact Details</h5>
                          <div className="fs-5 mb-2"><i className="bi bi-person-badge text-muted me-2"></i> <strong>{selectedItem.shopOwnerName}</strong></div>
                          <div className="fs-4 fw-bold text-dark mb-2"><i className="bi bi-telephone-fill text-success me-2"></i> {selectedItem.shopOwnerMobile}</div>
                          <div className="fs-6 text-muted"><i className="bi bi-envelope-fill me-2"></i> {selectedItem.shopOwnerEmail}</div>
                          <a href={`tel:${selectedItem.shopOwnerMobile}`} className="btn btn-info rounded-pill px-4 mt-3 shadow-sm mx-1 text-white">Call Now</a>
                        </div>
                      )}
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

export default FertilizerSection
