import { useState, useEffect } from 'react'
import './App.css'

function Marketplace({ user }) {
  const [activeTab, setActiveTab] = useState('listings') // 'listings' or 'orders'
  const [listings, setListings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [listingForm, setListingForm] = useState({ cropName: '', quantity: '', pricePerUnit: '' })
  const [orderForm, setOrderForm] = useState({ cropName: '', requiredQuantity: '', targetPrice: '' })
  
  const API_BASE = 'http://localhost:8081/api/marketplace'

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let listingsUrl = `${API_BASE}/listings`
        let ordersUrl = `${API_BASE}/orders`
        
        if (user && user.role === 'Farmer') {
          listingsUrl = `${API_BASE}/listings/farmer/${user.id}`
        } else if (user && user.role === 'Buyer') {
          ordersUrl = `${API_BASE}/orders/buyer/${user.id}`
        }

        const [listingsRes, ordersRes] = await Promise.all([
          fetch(listingsUrl),
          fetch(ordersUrl)
        ])
        if (listingsRes.ok) setListings(await listingsRes.json())
        if (ordersRes.ok) setOrders(await ordersRes.json())
      } catch (error) {
        console.error('Error fetching marketplace data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  // Set default active tab based on role
  useEffect(() => {
    if (user && user.role === 'Farmer') {
      setActiveTab('orders')
    } else {
      setActiveTab('listings')
    }
  }, [user])

  // Handlers
  const handleListingChange = (e) => {
    const { name, value } = e.target
    setListingForm(prev => ({ ...prev, [name]: value }))
  }

  const handleOrderChange = (e) => {
    const { name, value } = e.target
    setOrderForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateListing = async (e) => {
    e.preventDefault()
    if (!user) return alert("Please log in to list crops")
    
    const payload = {
      farmerId: user.id,
      farmerName: user.name,
      cropName: listingForm.cropName,
      quantity: listingForm.quantity,
      pricePerUnit: parseFloat(listingForm.pricePerUnit)
    }

    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const newListing = await res.json()
        setListings([newListing, ...listings])
        setListingForm({ cropName: '', quantity: '', pricePerUnit: '' })
        alert('Crop listed successfully!')
      }
    } catch (error) {
      alert('Failed to list crop')
    }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    if (!user) return alert("Please log in to place orders")

    const payload = {
      buyerId: user.id,
      buyerName: user.name,
      cropName: orderForm.cropName,
      requiredQuantity: orderForm.requiredQuantity,
      targetPrice: parseFloat(orderForm.targetPrice)
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const newOrder = await res.json()
        setOrders([newOrder, ...orders])
        setOrderForm({ cropName: '', requiredQuantity: '', targetPrice: '' })
        alert('Order placed successfully!')
      }
    } catch (error) {
      alert('Failed to place order')
    }
  }

  return (
    <div className="page-background fade-in">
      <div className="container py-5">
        <div className="row mb-5">
          <div className="col-lg-12">
            <h2 className="mb-2 fw-semibold text-success text-center">Agro Saathi Marketplace</h2>
            <p className="text-center text-muted mb-4">
              Connect directly. Fair prices. Transparent trade.
            </p>
          </div>
        </div>

        {/* Action Forms based on Role */}
        {user && user.role === 'Farmer' && (
          <div className="row mb-5 justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm border-0 rounded-4 p-4">
                <h5 className="text-success mb-3">List Your Crop for Sale</h5>
                <form onSubmit={handleCreateListing} className="row g-3">
                  <div className="col-md-4">
                    <input type="text" name="cropName" className="form-control agro-input" placeholder="Crop Name (e.g. Rice)" value={listingForm.cropName} onChange={handleListingChange} required />
                  </div>
                  <div className="col-md-3">
                    <input type="text" name="quantity" className="form-control agro-input" placeholder="Quantity (e.g. 50 kg)" value={listingForm.quantity} onChange={handleListingChange} required />
                  </div>
                  <div className="col-md-3">
                    <input type="number" step="0.01" name="pricePerUnit" className="form-control agro-input" placeholder="Price (₹/unit)" value={listingForm.pricePerUnit} onChange={handleListingChange} required />
                  </div>
                  <div className="col-md-2">
                    <button type="submit" className="btn btn-success agro-btn w-100 h-100">List</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {user && user.role === 'Buyer' && (
          <div className="row mb-5 justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm border-0 rounded-4 p-4">
                <h5 className="text-warning mb-3">Place a Bulk Order Requirement</h5>
                <form onSubmit={handleCreateOrder} className="row g-3">
                  <div className="col-md-4">
                    <input type="text" name="cropName" className="form-control agro-input" placeholder="Crop Needed (e.g. Wheat)" value={orderForm.cropName} onChange={handleOrderChange} required />
                  </div>
                  <div className="col-md-3">
                    <input type="text" name="requiredQuantity" className="form-control agro-input" placeholder="Required Quantity" value={orderForm.requiredQuantity} onChange={handleOrderChange} required />
                  </div>
                  <div className="col-md-3">
                    <input type="number" step="0.01" name="targetPrice" className="form-control agro-input" placeholder="Target Price (₹)" value={orderForm.targetPrice} onChange={handleOrderChange} required />
                  </div>
                  <div className="col-md-2">
                    <button type="submit" className="btn btn-warning agro-btn w-100 h-100">Order</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="d-flex justify-content-center mb-4">
          <div className="btn-group shadow-sm" role="group">
            {(!user || user.role === 'Buyer') && (
              <button 
                type="button" 
                className={`btn agro-btn ${activeTab === 'listings' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setActiveTab('listings')}
              >
                Available Crops (Farmer Listings)
              </button>
            )}
            {user && user.role === 'Farmer' && (
              <button 
                type="button" 
                className={`btn agro-btn ${activeTab === 'listings' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setActiveTab('listings')}
              >
                My Listings
              </button>
            )}

            {(!user || user.role === 'Farmer') && (
              <button 
                type="button" 
                className={`btn agro-btn ${activeTab === 'orders' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setActiveTab('orders')}
              >
                Current Demands (Buyer Orders)
              </button>
            )}
            {user && user.role === 'Buyer' && (
              <button 
                type="button" 
                className={`btn agro-btn ${activeTab === 'orders' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setActiveTab('orders')}
              >
                My Requirements
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center text-muted my-5">Loading marketplace data...</div>
        ) : (
          <div className="row g-4">
            {activeTab === 'listings' && listings.length === 0 && (
              <div className="col-12 text-center text-muted">No crop listings available at the moment.</div>
            )}
            {activeTab === 'listings' && listings.map((item) => (
              <div className="col-md-4" key={item.id}>
                <div className="card crop-card shadow-sm hover-lift crop-card-rice">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{item.cropName}</h5>
                      <span className="badge bg-success small fw-semibold">For Sale</span>
                    </div>
                    <p className="card-subtitle text-muted mb-3 small">Listed by: {item.farmerName}</p>
                    <ul className="list-unstyled text-dark small mb-3">
                      <li><strong>Available Qty:</strong> {item.quantity}</li>
                      <li><strong>Price:</strong> ₹{item.pricePerUnit} per unit</li>
                      <li><strong>Listed on:</strong> {new Date(item.createdAt).toLocaleDateString()}</li>
                    </ul>
                    {user && user.role === 'Buyer' && (
                      <button type="button" className="btn btn-outline-success btn-sm w-100 agro-btn">
                        Contact Farmer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'orders' && orders.length === 0 && (
              <div className="col-12 text-center text-muted">No buyer orders available at the moment.</div>
            )}
            {activeTab === 'orders' && orders.map((item) => (
              <div className="col-md-4" key={item.id}>
                <div className="card crop-card shadow-sm hover-lift crop-card-mango">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{item.cropName}</h5>
                      <span className="badge bg-warning text-dark small fw-semibold">Demand</span>
                    </div>
                    <p className="card-subtitle text-muted mb-3 small">Required by: {item.buyerName}</p>
                    <ul className="list-unstyled text-dark small mb-3">
                      <li><strong>Required Qty:</strong> {item.requiredQuantity}</li>
                      <li><strong>Target Price:</strong> ₹{item.targetPrice} per unit</li>
                      <li><strong>Posted on:</strong> {new Date(item.createdAt).toLocaleDateString()}</li>
                    </ul>
                    {user && user.role === 'Farmer' && (
                      <button type="button" className="btn btn-outline-warning text-dark btn-sm w-100 agro-btn">
                        Fulfill Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace

