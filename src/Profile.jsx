import React, { useState, useEffect } from 'react'
import './App.css'

function Profile({ user, onLogout, onUpdate }) {
  if (!user) return null

  const [activeTab, setActiveTab] = useState('details') // 'details', 'manage'
  
  // Profile Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    mobile: user.mobile || '',
    address: user.address || '',
    cropsGrown: user.cropsGrown || '',
    season: user.season || ''
  })

  // Marketplace states
  const [myItems, setMyItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)
  
  // Forms
  const [listingForm, setListingForm] = useState({ cropName: 'Rice', season: 'Kharif (Monsoon)', quantity: '', pricePerUnit: '', image: null })
  const [orderForm, setOrderForm] = useState({ cropName: 'Rice', requiredQuantity: '', targetPrice: '' })
  const [fertForm, setFertForm] = useState({ fertilizerName: '', description: '', price: '', location: '', image: null })

  const API_BASE = 'http://localhost:8081/api'

  // Options
  const cropOptions = ['Rice', 'Wheat', 'Mango', 'Cashew', 'Coconut', 'Sugarcane', 'Millets', 'Vegetables (Assorted)']
  const seasonOptions = ['Kharif (Monsoon)', 'Rabi (Winter)', 'Zaid (Summer)', 'Year-round']

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchMyItems()
    }
  }, [activeTab])

  const fetchMyItems = async () => {
    setLoadingItems(true)
    try {
      let url;
      if (user.role === 'Farmer') {
        url = `${API_BASE}/marketplace/listings/farmer/${user.id}`;
      } else if (user.role === 'Shop Owner') {
        url = `${API_BASE}/marketplace/fertilizers/shop/${user.id}`;
      } else {
        url = `${API_BASE}/marketplace/orders/buyer/${user.id}`;
      }
      
      const res = await fetch(url)
      if (res.ok) {
        let items = await res.json()
        setMyItems(items)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingItems(false)
    }
  }

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const data = await res.json()
        onUpdate(data.user)
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        const err = await res.json()
        alert(err.message || 'Error updating profile')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  // Listing / Order / Fertilizer handlers
  const handleFormChange = (e, formType) => {
    const { name, value, files } = e.target
    if (formType === 'listing') {
      if (name === 'image') setListingForm(prev => ({ ...prev, image: files[0] }))
      else setListingForm(prev => ({ ...prev, [name]: value }))
    } else if (formType === 'order') {
      setOrderForm(prev => ({ ...prev, [name]: value }))
    } else if (formType === 'fertilizer') {
      if (name === 'image') setFertForm(prev => ({ ...prev, image: files[0] }))
      else setFertForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCreateListing = async (e) => {
    e.preventDefault()
    
    const payload = {
      farmerId: user.id,
      farmerName: user.name,
      cropName: listingForm.cropName,
      season: listingForm.season,
      quantity: listingForm.quantity,
      pricePerUnit: parseFloat(listingForm.pricePerUnit)
    }

    const mFormData = new FormData();
    mFormData.append("listing", JSON.stringify(payload));
    if (listingForm.image) mFormData.append("image", listingForm.image);

    try {
      const res = await fetch(`${API_BASE}/marketplace/listings`, {
        method: 'POST', body: mFormData
      })
      if (res.ok) {
        const newListing = await res.json()
        setMyItems([newListing, ...myItems])
        setListingForm({ cropName: 'Rice', season: 'Kharif (Monsoon)', quantity: '', pricePerUnit: '', image: null })
        const fileInput = document.getElementById('imageInput')
        if(fileInput) fileInput.value = ''
        alert('Crop listed successfully!')
      } else {
        alert('Failed to list crop. Please try again.')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()

    const payload = {
      buyerId: user.id,
      buyerName: user.name,
      cropName: orderForm.cropName,
      requiredQuantity: orderForm.requiredQuantity,
      targetPrice: parseFloat(orderForm.targetPrice)
    }

    try {
      const res = await fetch(`${API_BASE}/marketplace/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const newOrder = await res.json()
        setMyItems([newOrder, ...myItems])
        setOrderForm({ cropName: 'Rice', requiredQuantity: '', targetPrice: '' })
        alert('Order placed successfully!')
      } else {
        alert('Failed to place order')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  const handleCreateFertilizer = async (e) => {
    e.preventDefault()

    const payload = {
      shopOwnerId: user.id,
      shopOwnerName: user.name,
      shopOwnerMobile: user.mobile,
      shopOwnerEmail: user.email,
      fertilizerName: fertForm.fertilizerName,
      description: fertForm.description,
      location: fertForm.location,
      price: parseFloat(fertForm.price)
    }

    const mFormData = new FormData();
    mFormData.append("listing", JSON.stringify(payload));
    if (fertForm.image) mFormData.append("image", fertForm.image);

    try {
      const res = await fetch(`${API_BASE}/marketplace/fertilizers`, {
        method: 'POST', body: mFormData
      })
      if (res.ok) {
        const newFert = await res.json()
        setMyItems([newFert, ...myItems])
        setFertForm({ fertilizerName: '', description: '', price: '', location: '', image: null })
        const fileInput = document.getElementById('fertImageInput')
        if(fileInput) fileInput.value = ''
        alert('Fertilizer listed successfully for enquiries!')
      } else {
        alert('Failed to add fertilizer')
      }
    } catch (error) {
      alert('Network error')
    }
  }

  return (
    <div className="page-background fade-in">
      <div className="container py-5">
        <div className="row justify-content-center">
          
          <div className="col-12 col-lg-3 mb-4">
            <div className={`card shadow-sm rounded-4 border-0 h-100 border-top ${user.role === 'Shop Owner' ? 'border-primary' : 'border-success'} border-4`}>
              <div className="card-body p-4 text-center">
                <div className={`${user.role === 'Shop Owner' ? 'bg-primary' : 'bg-success'} text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow`} style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  <i className={user.role === 'Shop Owner' ? 'bi bi-shop' : 'bi bi-person-fill'}></i>
                </div>
                <h4 className="fw-bold text-dark">{user.name}</h4>
                <p className={`text-muted small badge ${user.role === 'Shop Owner' ? 'bg-primary-subtle text-primary border-primary' : 'bg-success-subtle text-success border-success'} border px-3 py-2 rounded-pill mt-2`}>
                  {user.role} Account
                </p>
                
                <hr className="my-4" />
                
                <div className="d-flex flex-column gap-2 text-start">
                  <button 
                    className={`btn text-start px-3 py-2 fw-medium rounded-pill ${activeTab === 'details' ? (user.role === 'Shop Owner' ? 'btn-primary text-white shadow-sm' : 'btn-success shadow-sm') : 'btn-light'}`}
                    onClick={() => setActiveTab('details')}
                  >
                    <i className="bi bi-person-lines-fill me-2"></i> My Profile Info
                  </button>
                  <button 
                    className={`btn text-start px-3 py-2 fw-medium rounded-pill ${activeTab === 'manage' ? (user.role === 'Shop Owner' ? 'btn-primary text-white shadow-sm' : 'btn-success shadow-sm') : 'btn-light'}`}
                    onClick={() => setActiveTab('manage')}
                  >
                    <i className={`bi ${user.role === 'Shop Owner' ? 'bi-flower3' : user.role === 'Farmer' ? 'bi-tags-fill' : 'bi-bag-check-fill'} me-2`}></i> 
                    {user.role === 'Shop Owner' ? 'Manage Fertilizers' : user.role === 'Farmer' ? 'Manage Listings' : 'Manage Demands'}
                  </button>
                  
                  <button type="button" className="btn btn-outline-danger mt-4 rounded-pill fw-bold" onClick={onLogout}>
                    <i className="bi bi-box-arrow-left me-2"></i> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            {activeTab === 'details' && (
              <div className="profile-card shadow-lg rounded-4 p-4 p-md-5 w-100">
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                  <h3 className="mb-0 text-dark fw-bold">Personal Information</h3>
                  {!isEditing && (
                    <button className="btn btn-sm btn-outline-secondary fw-bold rounded-pill px-3" onClick={() => setIsEditing(true)}>
                      <i className="bi bi-pencil-square me-1"></i> Edit Details
                    </button>
                  )}
                </div>
                
                <div className="profile-details mb-4">
                  {isEditing ? (
                    <div className="row g-4 bg-light p-4 rounded-4 shadow-sm border">
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase mb-1 fw-bold">Name</label>
                        <input type="text" className="form-control rounded-3" name="name" value={formData.name} onChange={handleProfileChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase mb-1 fw-bold">Mobile</label>
                        <input type="text" className="form-control rounded-3" name="mobile" value={formData.mobile} onChange={handleProfileChange} />
                      </div>
                      <div className="col-12">
                        <label className="form-label text-muted small text-uppercase mb-1 fw-bold">Full Address / Location</label>
                        <textarea className="form-control rounded-3" name="address" rows="3" value={formData.address} onChange={handleProfileChange}></textarea>
                      </div>
                      
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase mb-1 fw-bold">Types of Crops (If farming)</label>
                        <input type="text" className="form-control rounded-3" name="cropsGrown" value={formData.cropsGrown} onChange={handleProfileChange} placeholder="e.g. Rice, Wheat" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small text-uppercase mb-1 fw-bold">Preferred Season</label>
                        <input type="text" className="form-control rounded-3" name="season" value={formData.season} onChange={handleProfileChange} placeholder="e.g. Kharif" />
                      </div>
                      <div className="col-12 d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                        <button className="btn btn-light rounded-pill px-4 fw-medium" onClick={() => setIsEditing(false)}>Cancel</button>
                        <button className={`btn ${user.role === 'Shop Owner' ? 'btn-primary' : 'btn-success'} shadow rounded-pill px-4 fw-medium`} onClick={handleSaveProfile}>Save Changes</button>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-0 rounded-4 overflow-hidden border">
                      <div className="col-md-6 p-4 border-end border-bottom bg-white">
                        <div className="text-secondary small text-uppercase fw-bold mb-1"><i className="bi bi-telephone me-1"></i> Mobile</div>
                        <div className="fs-5 text-dark fw-medium">{user.mobile}</div>
                      </div>
                      <div className="col-md-6 p-4 border-bottom bg-light">
                        <div className="text-secondary small text-uppercase fw-bold mb-1"><i className="bi bi-envelope me-1"></i> Email</div>
                        <div className="fs-5 text-dark fw-medium text-break">{user.email}</div>
                      </div>
                      <div className="col-md-6 p-4 border-end border-bottom bg-light">
                        <div className="text-secondary small text-uppercase fw-bold mb-1"><i className="bi bi-upc-scan me-1"></i> Aadhar Number</div>
                        <div className="fs-5 text-dark fw-medium">{user.aadharno}</div>
                      </div>
                      <div className="col-md-6 p-4 border-bottom bg-white">
                        <div className="text-secondary small text-uppercase fw-bold mb-1"><i className="bi bi-thermometer-sun me-1"></i> Primary Season</div>
                        <div className="fs-5 text-dark fw-medium">{user.season || 'Not specified'}</div>
                      </div>
                      <div className="col-12 p-4 bg-light">
                        <div className="text-secondary small text-uppercase fw-bold mb-1"><i className="bi bi-house me-1"></i> Address</div>
                        <div className="fs-5 text-dark fw-medium">{user.address || 'Not specified'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FARMER MANAGE VIEW */}
            {activeTab === 'manage' && user.role === 'Farmer' && (
              <div className="fade-in">
                <div className="card shadow-lg border-0 rounded-4 mb-5 overflow-hidden">
                  <div className="card-header bg-success text-white px-4 py-3">
                    <h4 className="mb-0 fw-bold"><i className="bi bi-plus-circle me-2"></i> Create New Crop Listing</h4>
                  </div>
                  <div className="card-body p-4 p-md-5 bg-white">
                    <form onSubmit={handleCreateListing}>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Local Crop Name</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-success"><i className="bi bi-flower2"></i></span>
                            <select name="cropName" className="form-select bg-light" value={listingForm.cropName} onChange={(e) => handleFormChange(e, 'listing')} required>
                              {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        
                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Harvest Season</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-success"><i className="bi bi-cloud-sun"></i></span>
                            <select name="season" className="form-select bg-light" value={listingForm.season} onChange={(e) => handleFormChange(e, 'listing')} required>
                              {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Available Quantity</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light"><i className="bi bi-box"></i></span>
                            <input type="text" name="quantity" className="form-control" placeholder="e.g. 50 kg or 10 Quintals" value={listingForm.quantity} onChange={(e) => handleFormChange(e, 'listing')} required />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Price Expected (per unit)</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-success fw-bold">₹</span>
                            <input type="number" step="0.01" name="pricePerUnit" className="form-control" placeholder="1200.00" value={listingForm.pricePerUnit} onChange={(e) => handleFormChange(e, 'listing')} required />
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label text-dark fw-semibold">Upload Crop Photo</label>
                          <div className="p-4 border border-2 border-dashed rounded-4 text-center bg-light">
                            <input type="file" id="imageInput" name="image" className="form-control d-none" accept="image/*" onChange={(e) => handleFormChange(e, 'listing')} />
                            <button type="button" className="btn btn-outline-success rounded-pill px-4 fw-medium mb-2" onClick={() => document.getElementById('imageInput').click()}>
                              {listingForm.image ? 'Change Photo' : 'Select Photo from Device'}
                            </button>
                            <div className="text-muted small mt-1">
                              {listingForm.image ? <span className="text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i> {listingForm.image.name} selected</span> : "Upload a clear photo for better pricing."}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-12 mt-4 text-end border-top pt-4">
                          <button type="submit" className="btn btn-success rounded-pill px-5 fw-bold shadow-lg btn-lg">Publish Listing to Marketplace</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                <h4 className="text-success fw-bold mb-4 border-bottom pb-2">My Active Crop Listings</h4>
                {loadingItems ? (
                  <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                ) : myItems.length === 0 ? (
                  <div className="card border-0 bg-light rounded-4 p-5 text-center shadow-sm"><h5 className="text-muted">You haven't listed any crops yet.</h5></div>
                ) : (
                  <div className="row g-4">
                    {myItems.map(item => (
                      <div className="col-12 col-md-6" key={item.id}>
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
                          {item.imageUrl && (
                            <img src={`${API_BASE.replace('/api', '')}${item.imageUrl}`} alt={item.cropName} className="card-img-top object-fit-cover" style={{ height: '180px' }} />
                          )}
                          <div className="card-body p-4 bg-white">
                            <h5 className="fw-bold text-success mb-1">{item.cropName}</h5>
                            <span className="badge bg-light text-dark mb-3"><i className="bi bi-cloud-sun"></i> {item.season}</span>
                            <div className="d-flex justify-content-between text-muted small mt-2">
                              <span><strong>Qty:</strong> {item.quantity}</span><span className="text-success fw-bold">₹{item.pricePerUnit}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SHOP OWNER MANAGE VIEW */}
            {activeTab === 'manage' && user.role === 'Shop Owner' && (
              <div className="fade-in">
                <div className="card shadow-lg border-0 border-top border-primary border-4 rounded-4 mb-5 overflow-hidden">
                  <div className="card-header bg-white px-4 py-3 border-bottom">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-flower3 text-primary me-2"></i> Add Fertilizer Product</h4>
                  </div>
                  <div className="card-body p-4 p-md-5 bg-white">
                    <form onSubmit={handleCreateFertilizer}>
                      <div className="row g-4">
                        <div className="col-md-12">
                          <label className="form-label text-dark fw-semibold">Product Name / Brand</label>
                          <input type="text" name="fertilizerName" className="form-control py-2 bg-light border-0" placeholder="e.g. Urea 46%, NPK" value={fertForm.fertilizerName} onChange={(e) => handleFormChange(e, 'fertilizer')} required />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label text-dark fw-semibold">Product Description</label>
                          <textarea name="description" className="form-control bg-light border-0" rows="3" placeholder="Describe the nutrients, usage, quantity per bag..." value={fertForm.description} onChange={(e) => handleFormChange(e, 'fertilizer')} required></textarea>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Price Expected (₹)</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">₹</span>
                            <input type="number" step="1" name="price" className="form-control bg-light border-0" placeholder="e.g. 500" value={fertForm.price} onChange={(e) => handleFormChange(e, 'fertilizer')} required />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Location (City / State)</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0"><i className="bi bi-geo-alt"></i></span>
                            <input type="text" name="location" className="form-control bg-light border-0" placeholder="e.g. Pune, Maharashtra" value={fertForm.location} onChange={(e) => handleFormChange(e, 'fertilizer')} required />
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label text-dark fw-semibold">Upload Product Image</label>
                          <input type="file" id="fertImageInput" name="image" className="form-control bg-light border-0" accept="image/*" onChange={(e) => handleFormChange(e, 'fertilizer')} />
                        </div>
                        
                        <div className="col-12 mt-4 text-end">
                          <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm">Post to Marketplace</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                <h4 className="text-primary fw-bold mb-4 border-bottom pb-2">My E-Commerce Products</h4>
                {loadingItems ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : myItems.length === 0 ? (
                  <div className="card bg-light border-0 rounded-4 p-4 text-center">
                    <p className="text-muted mb-0">You haven't added any products to the store yet.</p>
                  </div>
                ) : (
                  <div className="row g-4">
                    {myItems.map(item => (
                      <div className="col-12 col-md-6" key={item.id}>
                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
                          {item.imageUrl && (
                            <img src={`${API_BASE.replace('/api', '')}${item.imageUrl}`} alt={item.fertilizerName} className="card-img-top object-fit-cover" style={{ height: '180px' }} />
                          )}
                          <div className="card-body p-4 bg-white">
                            <h5 className="fw-bold text-dark mb-1 line-clamp-1">{item.fertilizerName}</h5>
                            <div className="text-primary fw-bold fs-5 mb-2">₹{item.price}</div>
                            <div className="small text-muted line-clamp-2">{item.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* BUYER MANAGE VIEW */}
            {activeTab === 'manage' && user.role === 'Buyer' && (
              <div className="fade-in">
                <div className="card shadow-lg border-0 border-top border-warning border-4 rounded-4 mb-5 overflow-hidden">
                  <div className="card-header bg-white px-4 py-3 border-bottom">
                    <h4 className="mb-0 fw-bold text-dark"><i className="bi bi-megaphone text-warning me-2"></i> Post Buyer Requirement</h4>
                  </div>
                  <div className="card-body p-4 p-md-5 bg-light">
                    <form onSubmit={handleCreateOrder}>
                      <div className="row g-4">
                        <div className="col-md-12">
                          <label className="form-label text-dark fw-semibold">Local Crop Required</label>
                          <div className="input-group shadow-sm">
                            <span className="input-group-text bg-white text-warning"><i className="bi bi-flower1"></i></span>
                            <select name="cropName" className="form-select border-start-0 py-2" value={orderForm.cropName} onChange={(e) => handleFormChange(e, 'order')} required>
                              {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Required Quantity</label>
                          <input type="text" name="requiredQuantity" className="form-control py-2 shadow-sm" placeholder="e.g. 50 Tons" value={orderForm.requiredQuantity} onChange={(e) => handleFormChange(e, 'order')} required />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label text-dark fw-semibold">Target Price (per unit)</label>
                          <div className="input-group shadow-sm">
                            <span className="input-group-text bg-white text-dark fw-bold">₹</span>
                            <input type="number" step="0.01" name="targetPrice" className="form-control border-start-0 py-2" placeholder="Maximum willing to pay" value={orderForm.targetPrice} onChange={(e) => handleFormChange(e, 'order')} required />
                          </div>
                        </div>
                        
                        <div className="col-12 mt-4 text-end">
                          <button type="submit" className="btn btn-warning rounded-pill px-5 fw-bold shadow btn-lg text-dark">Broadcast Demand to Farmers</button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                <h4 className="text-warning-emphasis fw-bold mb-4 border-bottom pb-2">My Open Requirements</h4>
                {loadingItems ? (
                  <div className="text-center py-5"><div className="spinner-border text-warning"></div></div>
                ) : myItems.length === 0 ? (
                  <div className="card border-0 bg-light rounded-4 p-5 text-center shadow-sm">
                    <h5 className="text-muted">You don't have any active requirements.</h5>
                  </div>
                ) : (
                  <div className="row g-4">
                    {myItems.map(item => (
                      <div className="col-12 col-md-6" key={item.id}>
                        <div className="card shadow-sm border-0 border-start border-warning border-4 rounded-4 h-100 p-3 bg-white">
                          <h5 className="fw-bold mb-3">{item.cropName}</h5>
                          <div className="d-flex justify-content-between text-muted mb-2">
                            <span>Req Qty:</span><span className="text-dark fw-bold">{item.requiredQuantity}</span>
                          </div>
                          <div className="d-flex justify-content-between text-muted mb-3">
                            <span>Target Price:</span><span className="text-warning-emphasis fw-bold">₹{item.targetPrice} / unit</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
