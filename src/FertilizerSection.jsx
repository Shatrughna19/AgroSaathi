import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from './utils/marketUtils'
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
    <div className="fade-in-up">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 fade-in-up">
        <div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight">{t('marketplace.fertilizerListings')}</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Discover quality fertilizers from trusted local suppliers. Optimize Your Yield.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-bold text-sm">
            <span className="material-symbols-outlined text-sm">shield</span> Verified
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high text-on-surface rounded-full font-bold text-sm">
            <span className="material-symbols-outlined text-sm">local_shipping</span> Local Delivery
          </div>
        </div>
      </section>

      {loading ? (
        <div className="d-flex justify-content-center my-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : fertilizers.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-5 shadow-sm border">
          <i className="bi bi-shop-window display-1 text-slate-200 d-block mb-3"></i>
          <h4 className="text-slate-500">No fertilizers currently listed in your area.</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up">
          {fertilizers.map((item) => (
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full" key={item.id}>
              {item.imageUrl ? (
                <img src={`http://localhost:8081${item.imageUrl}`} alt={item.fertilizerName} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-stone-100 flex items-center justify-center text-stone-300">
                  <span className="material-symbols-outlined text-6xl">storefront</span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1 h-full">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="font-bold text-xl text-on-surface">{item.fertilizerName}</h5>
                  <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold">{formatCurrency(item.price)}</span>
                </div>
                <div className="text-stone-500 text-sm mb-3 flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-sm">location_on</span> {item.location || 'Regional Store'}
                </div>
                <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{item.description}</p>
                <div className="mt-auto">
                    <button className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-3 rounded-lg transition-transform active:scale-95" onClick={() => openDetails(item)}>
                    View & Enquire
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="modal show d-block fade" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content-premium border-0">
              <div className="modal-body-premium">
                <div className="row g-0">
                  <div className="col-lg-5 bg-dark d-none d-lg-block position-relative">
                    {selectedItem.imageUrl ? (
                      <img src={`http://localhost:8081${selectedItem.imageUrl}`} alt={selectedItem.fertilizerName} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white-50 bg-slate-800">
                        <i className="bi bi-shop-window display-1"></i>
                      </div>
                    )}
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-to-t from-dark to-transparent opacity-50"></div>
                  </div>
                  <div className="col-lg-7">
                    <div className="p-4 p-lg-5">
                      <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                          <span className="badge-modern badge-success-modern mb-2">Verified Listing</span>
                          <h2 className="display-6 fw-bold text-slate-900">{selectedItem.fertilizerName}</h2>
                        </div>
                        <button type="button" className="btn-close shadow-none" onClick={closeDetails}></button>
                      </div>

                      <div className="mb-4">
                        <label className="label-modern mb-1">Product Description</label>
                        <p className="text-slate-600 leading-relaxed small">{selectedItem.description || 'No detailed description provided.'}</p>
                      </div>

                      <div className="row g-4 mb-5">
                        <div className="col-6">
                          <label className="label-modern mb-1">Price Point</label>
                          <div className="h4 fw-bold text-primary mb-0">{formatCurrency(selectedItem.price)}</div>
                          <span className="text-slate-400 x-small">Inclusive of all taxes</span>
                        </div>
                        <div className="col-6 text-end">
                          <label className="label-modern mb-1">Store Location</label>
                          <div className="fw-semibold text-slate-700">
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i> {selectedItem.location || 'Regional Outlet'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-top border-slate-100">
                        {!showShopOwnerContact ? (
                           <button className="btn-modern btn-modern-primary w-100 py-3 shadow-lg" onClick={() => setShowShopOwnerContact(true)}>
                              <i className="bi bi-chat-dots-fill"></i> Get Supplier Details
                           </button>
                        ) : (
                          <div className="bg-slate-900 text-white rounded-4 p-4 fade-in-up border border-slate-800 shadow-xl">
                            <div className="d-flex align-items-center gap-3 mb-4">
                              <div className="brand-logo-modern bg-primary border-0" style={{ width: '48px', height: '48px' }}>
                                <i className="bi bi-person-badge"></i>
                              </div>
                              <div>
                                <div className="text-slate-400 x-small text-uppercase fw-bold">Authorized Merchant</div>
                                <h5 className="fw-bold mb-0">{selectedItem.shopOwnerName}</h5>
                              </div>
                            </div>
                            
                            <div className="d-flex align-items-center justify-content-between p-3 bg-slate-800 rounded-3 mb-3 border border-slate-700">
                              <div className="d-flex align-items-center gap-3">
                                <div className="text-primary fs-4"><i className="bi bi-telephone-fill"></i></div>
                                <div className="fs-5 fw-bold font-monospace">{selectedItem.shopOwnerMobile}</div>
                              </div>
                              <button className="btn-modern btn-modern-primary p-2 rounded-circle" style={{ width: '40px', height: '40px' }} onClick={() => window.open(`tel:${selectedItem.shopOwnerMobile}`)}>
                                <i className="bi bi-telephone-outbound"></i>
                              </button>
                            </div>
                            
                            <p className="text-slate-400 small mb-0"><i className="bi bi-info-circle me-1"></i> Quote 'Agro Saathi' for direct partnership pricing.</p>
                          </div>
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

export default FertilizerSection

