import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function Profile({ user, onLogout, onUpdate }) {
  const { t } = useTranslation()
  if (!user) return null

  const [activeTab, setActiveTab] = useState('details') // 'details', 'manage'
  const [isEditing, setIsEditing] = useState(false)
  const [scrollToBankOnEdit, setScrollToBankOnEdit] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    mobile: user.mobile || '',
    address: user.address || '',
    cropsGrown: user.cropsGrown || '',
    season: user.season || '',
    bankAccountNumber: user.bankAccountNumber || '',
    bankIfscCode: user.bankIfscCode || '',
    bankName: user.bankName || '',
    bankAccountHolderName: user.bankAccountHolderName || ''
  })
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [myItems, setMyItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(false)
  
  // Creation Forms
  const [listingForm, setListingForm] = useState({ cropName: 'Rice', season: 'Kharif (Monsoon)', quantity: '', pricePerUnit: '', image: null })
  const [orderForm, setOrderForm] = useState({ cropName: 'Rice', requiredQuantity: '', targetPrice: '' })
  const [fertForm, setFertForm] = useState({ fertilizerName: '', description: '', price: '', location: '', image: null })

  const API_BASE = 'http://localhost:8081/api'
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
      if (user.role === 'Farmer') url = `${API_BASE}/marketplace/listings/farmer/${user.id}`;
      else if (user.role === 'Shop Owner') url = `${API_BASE}/marketplace/fertilizers/shop/${user.id}`;
      else url = `${API_BASE}/marketplace/orders/buyer/${user.id}`;
      
      const res = await fetch(url)
      if (res.ok) setMyItems(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoadingItems(false) }
  }

  const handleProfileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

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
        setScrollToBankOnEdit(false)
        alert('Profile updated successfully!')
      }
    } catch (error) { alert('Network error') }
  }

  const handleEditBankDetails = () => {
    setIsEditing(true)
    setScrollToBankOnEdit(true)
  }

  // Scroll to bank section after entering edit mode
  useEffect(() => {
    if (isEditing && scrollToBankOnEdit) {
      setTimeout(() => {
        const el = document.getElementById('bank-details-section')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [isEditing, scrollToBankOnEdit])

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
      farmerId: user.id, farmerName: user.name, farmerMobile: user.mobile, farmerEmail: user.email,
      cropName: listingForm.cropName, season: listingForm.season, quantity: listingForm.quantity, pricePerUnit: parseFloat(listingForm.pricePerUnit)
    }
    const mFormData = new FormData();
    mFormData.append("listing", JSON.stringify(payload));
    if (listingForm.image) mFormData.append("image", listingForm.image);

    try {
      const res = await fetch(`${API_BASE}/marketplace/listings`, { method: 'POST', body: mFormData })
      if (res.ok) {
        setMyItems([await res.json(), ...myItems])
        setListingForm({ cropName: 'Rice', season: 'Kharif (Monsoon)', quantity: '', pricePerUnit: '', image: null })
        alert('Crop listed successfully!')
      }
    } catch (e) { alert('Error listing crop') }
  }

  const handleCreateOrder = async (e) => {
    e.preventDefault()
    const payload = {
      buyerId: user.id, buyerName: user.name, buyerMobile: user.mobile, buyerEmail: user.email,
      cropName: orderForm.cropName, requiredQuantity: orderForm.requiredQuantity, targetPrice: parseFloat(orderForm.targetPrice)
    }
    try {
      const res = await fetch(`${API_BASE}/marketplace/orders`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (res.ok) {
        setMyItems([await res.json(), ...myItems])
        setOrderForm({ cropName: 'Rice', requiredQuantity: '', targetPrice: '' })
        alert('Demand posted successfully!')
      }
    } catch (e) { alert('Error posting demand') }
  }

  const handleCreateFertilizer = async (e) => {
    e.preventDefault()
    const payload = {
      shopOwnerId: user.id, shopOwnerName: user.name, shopOwnerMobile: user.mobile, shopOwnerEmail: user.email,
      fertilizerName: fertForm.fertilizerName, description: fertForm.description, location: fertForm.location, price: parseFloat(fertForm.price)
    }
    const mFormData = new FormData();
    mFormData.append("listing", JSON.stringify(payload));
    if (fertForm.image) mFormData.append("image", fertForm.image);

    try {
      const res = await fetch(`${API_BASE}/marketplace/fertilizers`, { method: 'POST', body: mFormData })
      if (res.ok) {
        setMyItems([await res.json(), ...myItems])
        setFertForm({ fertilizerName: '', description: '', price: '', location: '', image: null })
        alert('Fertilizer added!')
      }
    } catch (e) { alert('Error adding fertilizer') }
  }

  const getRoleTheme = () => {
    if (user.role === 'Farmer') return { class: 'emerald', icon: 'bi-flower2' }
    if (user.role === 'Shop Owner') return { class: 'indigo', icon: 'bi-shop' }
    return { class: 'amber', icon: 'bi-megaphone' }
  }

  const theme = getRoleTheme()

  return (
    <div className="fade-in-up">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 fade-in-up">
        <div>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight">My Dashboard</h2>
          <p className="text-on-surface-variant mt-2 text-lg">Manage your profile and agricultural business activities.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Profile Sidebar Card */}
        <div className="xl:col-span-4">
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-stone-100 h-full flex flex-col">
            <div className="text-center mb-5">
              <div className="position-relative d-inline-block mb-4">
                <div style={{ width: '120px', height: '120px' }}>
                  {user.profilePhoto ? (
                    <img src={`http://localhost:8081${user.profilePhoto}`} alt="Profile" className="rounded-circle shadow-lg w-100 h-100 object-fit-cover border border-4 border-white" />
                  ) : (
                    <div className={`icon-box-modern icon-box-${theme.class} rounded-circle w-100 h-100 fs-1 shadow-sm`}>
                      <i className={`bi ${theme.icon}`}></i>
                    </div>
                  )}
                </div>
                <button 
                  className="btn-modern btn-modern-primary position-absolute bottom-0 end-0 p-2 rounded-circle shadow"
                  style={{ width: '36px', height: '36px' }}
                  onClick={() => document.getElementById('profilePhotoInput').click()}
                >
                  <i className="bi bi-camera-fill" style={{ fontSize: '0.8rem' }}></i>
                </button>
                <input id="profilePhotoInput" type="file" accept="image/*" className="d-none" onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const form = new FormData(); form.append('image', file)
                  try {
                    const res = await fetch(`http://localhost:8081/api/users/${user.id}/photo`, { method: 'PUT', body: form })
                    if (res.ok) {
                      const data = await res.json()
                      if (data.user) onUpdate(data.user)
                    }
                  } catch (e) { alert('Upload failed') }
                }} />
              </div>
              <h3 className="fw-bold text-slate-900 mb-1">{user.name}</h3>
              <p className="text-slate-500 small mb-4">{user.email}</p>
              <span className={`badge-modern badge-${theme.class === 'emerald' ? 'success' : theme.class === 'indigo' ? 'info' : 'warning'}-modern`}>
                {user.role} Account
              </span>
            </div>

            <div className="nav-group mb-5">
              <button className={`nav-item ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
                <i className="bi bi-person-circle"></i> <span>Profile Information</span>
              </button>
              <button className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`} onClick={() => setActiveTab('manage')}>
                <i className={`bi ${theme.icon}`}></i> 
                <span>{user.role === 'Shop Owner' ? 'Inventory Store' : user.role === 'Farmer' ? 'My Crop Listings' : 'My Demand Postings'}</span>
              </button>
            </div>

            <div className="sidebar-footer pt-4 mt-auto">
              <button onClick={onLogout} className="btn-modern btn-modern-outline w-100 text-danger border-danger-subtle">
                <i className="bi bi-box-arrow-left"></i> Logout Securely
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-8">
          {activeTab === 'details' && (
            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-stone-100 fade-in">
              <div className="d-flex justify-content-between align-items-center mb-5 pb-3 border-bottom border-slate-100">
                <h4 className="fw-bold text-slate-900 mb-0">Personal Information</h4>
                {!isEditing && (
                  <button className="btn-modern btn-modern-outline btn-sm" onClick={() => { setScrollToBankOnEdit(false); setIsEditing(true) }}>
                    <i className="bi bi-pencil-square"></i> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="row g-4">
                  <div className="col-md-6 form-group-modern">
                    <label className="label-modern">Full Name</label>
                    <input type="text" className="input-modern" name="name" value={formData.name} onChange={handleProfileChange} />
                  </div>
                  <div className="col-md-6 form-group-modern">
                    <label className="label-modern">Mobile Number</label>
                    <input type="text" className="input-modern" name="mobile" value={formData.mobile} onChange={handleProfileChange} />
                  </div>
                  <div className="col-12 form-group-modern">
                    <label className="label-modern">Address / Operation Base</label>
                    <textarea className="input-modern textarea-modern" name="address" value={formData.address} onChange={handleProfileChange}></textarea>
                  </div>
                  {user.role === 'Farmer' && (
                    <>
                      <div className="col-md-6 form-group-modern">
                        <label className="label-modern">Crops Typically Grown</label>
                        <input type="text" className="input-modern" name="cropsGrown" value={formData.cropsGrown} onChange={handleProfileChange} />
                      </div>
                      <div className="col-md-6 form-group-modern">
                        <label className="label-modern">Dominant Season</label>
                        <input type="text" className="input-modern" name="season" value={formData.season} onChange={handleProfileChange} />
                      </div>

                      {/* Bank Details Section */}
                      <div className="col-12 mt-3" id="bank-details-section">
                        <div className="p-4 rounded-4 border" style={{background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderColor: '#a7f3d0'}}>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <i className="bi bi-bank2 text-emerald-600 fs-5"></i>
                            <h5 className="fw-bold text-emerald-800 mb-0">Bank Details</h5>
                            <span className="badge bg-amber-100 text-amber-700 rounded-pill px-2 py-1 small ms-2" style={{backgroundColor: '#fef3c7', color: '#92400e'}}>Required for payments</span>
                          </div>
                          <p className="text-slate-500 small mb-3">Buyers will see these details when paying for your crops.</p>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="label-modern">Account Holder Name</label>
                              <input type="text" className="input-modern" name="bankAccountHolderName" placeholder="Full name on bank account" value={formData.bankAccountHolderName} onChange={handleProfileChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="label-modern">Account Number</label>
                              <input type="text" className="input-modern" name="bankAccountNumber" placeholder="Enter account number" value={formData.bankAccountNumber} onChange={handleProfileChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="label-modern">IFSC Code</label>
                              <input type="text" className="input-modern" name="bankIfscCode" placeholder="e.g. SBIN0001234" value={formData.bankIfscCode} onChange={handleProfileChange} />
                            </div>
                            <div className="col-md-6">
                              <label className="label-modern">Bank Name</label>
                              <input type="text" className="input-modern" name="bankName" placeholder="e.g. State Bank of India" value={formData.bankName} onChange={handleProfileChange} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="col-12 d-flex gap-2 justify-content-end pt-4 mt-2">
                    <button className="btn-modern btn-modern-outline" onClick={() => { setIsEditing(false); setScrollToBankOnEdit(false) }}>Cancel</button>
                    <button className="btn-modern btn-modern-primary px-5" onClick={handleSaveProfile}>Update Profile</button>
                  </div>
                </div>
              ) : (
                <div className="row g-4">
                  {/* ── Bank Details Warning Banner (Farmers without bank info) ── */}
                  {user.role === 'Farmer' && !user.bankAccountNumber && (
                    <div className="col-12">
                      <div className="p-4 rounded-4 border-2 d-flex align-items-start gap-3"
                        style={{ background: 'linear-gradient(135deg, #fef3c7, #fffbeb)', borderColor: '#f59e0b', borderStyle: 'solid' }}>
                        <div className="flex-shrink-0">
                          <div className="icon-box-modern rounded-3 mb-0" style={{ background: '#fef3c7', color: '#b45309', width: '48px', height: '48px' }}>
                            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1" style={{ color: '#92400e' }}>
                            ⚠️ Your listings are hidden from the Storefront
                          </h6>
                          <p className="small mb-3" style={{ color: '#b45309' }}>
                            Buyers cannot see or order your crops until you add your bank details. This ensures payments can be processed securely.
                          </p>
                          <button
                            className="btn-modern btn-modern-primary btn-sm px-4 py-2 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
                            onClick={handleEditBankDetails}
                          >
                            <i className="bi bi-bank2 me-2"></i>Add Bank Details Now
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="col-md-6 p-4 rounded-4 bg-slate-50 border border-slate-100">
                    <label className="label-modern mb-2">Identification</label>
                    <div className="fw-bold text-slate-900 mb-1">{user.name}</div>
                    <div className="text-slate-500 small">Aadhar: {user.aadharno}</div>
                  </div>
                  <div className="col-md-6 p-4 rounded-4 bg-slate-50 border border-slate-100">
                    <label className="label-modern mb-2">Communication</label>
                    <div className="fw-bold text-slate-900 mb-1">{user.mobile}</div>
                    <div className="text-slate-500 small">{user.email}</div>
                  </div>
                  <div className="col-12 p-4 rounded-4 bg-slate-50 border border-slate-100">
                    <label className="label-modern mb-2">Primary Location</label>
                    <div className="text-slate-700 leading-relaxed">{user.address || 'Address not listed.'}</div>
                  </div>
                  {user.role === 'Farmer' && (
                    <>
                      <div className="col-12 p-4 rounded-4 bg-emerald-50 bg-opacity-30 border border-emerald-100">
                        <div className="row g-3">
                          <div className="col-6">
                            <label className="label-modern mb-1">Crops</label>
                            <div className="fw-bold text-emerald-800">{user.cropsGrown || '—'}</div>
                          </div>
                          <div className="col-6">
                            <label className="label-modern mb-1">Season</label>
                            <div className="fw-bold text-emerald-800">{user.season || '—'}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-12 p-4 rounded-4 border" style={{background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)', borderColor: '#a7f3d0'}}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-bank2 text-emerald-600 fs-5"></i>
                          <h6 className="fw-bold text-emerald-800 mb-0">Bank Details</h6>
                          {user.bankAccountNumber ? (
                            <span className="badge rounded-pill px-2 py-1 small ms-auto" style={{backgroundColor: '#d1fae5', color: '#065f46'}}><i className="bi bi-check-circle-fill me-1"></i>Configured</span>
                          ) : (
                            <span className="badge rounded-pill px-2 py-1 small ms-auto" style={{backgroundColor: '#fef3c7', color: '#92400e'}}><i className="bi bi-exclamation-triangle-fill me-1"></i>Not Set</span>
                          )}
                        </div>
                        {user.bankAccountNumber ? (
                          <div className="row g-2">
                            <div className="col-md-6">
                              <label className="label-modern mb-1">Account Holder</label>
                              <div className="fw-bold text-slate-800">{user.bankAccountHolderName}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="label-modern mb-1">Account Number</label>
                              <div className="fw-bold text-slate-800 font-monospace">{user.bankAccountNumber}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="label-modern mb-1">IFSC</label>
                              <div className="fw-bold text-slate-800 font-monospace">{user.bankIfscCode}</div>
                            </div>
                            <div className="col-md-6">
                              <label className="label-modern mb-1">Bank</label>
                              <div className="fw-bold text-slate-800">{user.bankName}</div>
                            </div>
                            <div className="col-12 mt-2">
                              <button
                                className="btn-modern btn-modern-outline btn-sm px-3 py-1"
                                onClick={handleEditBankDetails}
                              >
                                <i className="bi bi-pencil-square me-1"></i>Update Bank Details
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-between">
                            <p className="text-slate-500 small mb-0">
                              <i className="bi bi-info-circle me-1"></i>
                              Bank details are required for buyers to pay you.
                            </p>
                            <button
                              className="btn-modern btn-modern-primary btn-sm px-4 ms-3 flex-shrink-0"
                              onClick={handleEditBankDetails}
                            >
                              <i className="bi bi-plus-lg me-1"></i>Add Now
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="fade-in space-y-6">
              {/* Creator Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-stone-100">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className={`icon-box-modern icon-box-${theme.class} mb-0`}>
                    <i className="bi bi-plus-lg"></i>
                  </div>
                  <h4 className="fw-bold text-slate-900 mb-0">
                    {user.role === 'Farmer' ? 'List New Crop Harvest' : user.role === 'Shop Owner' ? 'Add Fertilizer Product' : 'Broadcast Market Demand'}
                  </h4>
                </div>

                {user.role === 'Farmer' && !user.bankAccountNumber && (
                  <div className="mb-4 p-4 rounded-4 border-2 d-flex align-items-start gap-3"
                    style={{ background: 'linear-gradient(135deg, #fffbeb, #fff7ed)', borderColor: '#fbbf24', borderStyle: 'solid' }}>
                    <div className="flex-shrink-0">
                      <div className="icon-box-modern rounded-3 mb-0" style={{ background: '#fef3c7', color: '#b45309', width: '40px', height: '40px' }}>
                        <i className="bi bi-info-circle-fill"></i>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <p className="small mb-1 text-amber-900 fw-bold">Bank Details Required</p>
                      <p className="small mb-0 text-amber-800">
                        Notice: You can list your crops, but they will <strong>not be visible</strong> in the marketplace until you add your bank details in the 'Profile Information' tab.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={user.role === 'Farmer' ? handleCreateListing : user.role === 'Shop Owner' ? handleCreateFertilizer : handleCreateOrder}>
                  <div className="row g-4">
                    {user.role === 'Farmer' && (
                      <>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Crop Variety</label>
                          <select className="input-modern select-modern" name="cropName" value={listingForm.cropName} onChange={(e) => handleFormChange(e, 'listing')} required>
                            {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Season</label>
                          <select className="input-modern select-modern" name="season" value={listingForm.season} onChange={(e) => handleFormChange(e, 'listing')} required>
                            {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Quantity</label>
                          <input type="text" name="quantity" className="input-modern" placeholder="e.g. 500 kg" value={listingForm.quantity} onChange={(e) => handleFormChange(e, 'listing')} required />
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Expected Price (₹)</label>
                          <input type="number" step="0.01" name="pricePerUnit" className="input-modern" placeholder="Per unit" value={listingForm.pricePerUnit} onChange={(e) => handleFormChange(e, 'listing')} required />
                        </div>
                        <div className="col-12 form-group-modern">
                          <label className="label-modern">Crop Imagery (Optional)</label>
                          <input type="file" className="input-modern" accept="image/*" name="image" onChange={(e) => handleFormChange(e, 'listing')} />
                        </div>
                      </>
                    )}

                    {user.role === 'Shop Owner' && (
                      <>
                        <div className="col-12 form-group-modern">
                          <label className="label-modern">Product Name</label>
                          <input type="text" name="fertilizerName" className="input-modern" value={fertForm.fertilizerName} onChange={(e) => handleFormChange(e, 'fertilizer')} required />
                        </div>
                        <div className="col-12 form-group-modern">
                          <label className="label-modern">Detailed Description</label>
                          <textarea name="description" className="input-modern textarea-modern" value={fertForm.description} onChange={(e) => handleFormChange(e, 'fertilizer')} required></textarea>
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Unit Price (₹)</label>
                          <input type="number" name="price" className="input-modern" value={fertForm.price} onChange={(e) => handleFormChange(e, 'fertilizer')} required />
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Availability Location</label>
                          <input type="text" name="location" className="input-modern" value={fertForm.location} onChange={(e) => handleFormChange(e, 'fertilizer')} required />
                        </div>
                        <div className="col-12 form-group-modern">
                          <label className="label-modern">Product Image</label>
                          <input type="file" className="input-modern" name="image" onChange={(e) => handleFormChange(e, 'fertilizer')} />
                        </div>
                      </>
                    )}

                    {user.role === 'Buyer' && (
                      <>
                        <div className="col-12 form-group-modern">
                          <label className="label-modern">Crop Required</label>
                          <select name="cropName" className="input-modern select-modern" value={orderForm.cropName} onChange={(e) => handleFormChange(e, 'order')} required>
                            {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Target Quantity</label>
                          <input type="text" name="requiredQuantity" className="input-modern" value={orderForm.requiredQuantity} onChange={(e) => handleFormChange(e, 'order')} required />
                        </div>
                        <div className="col-md-6 form-group-modern">
                          <label className="label-modern">Budget per Unit (₹)</label>
                          <input type="number" name="targetPrice" className="input-modern" value={orderForm.targetPrice} onChange={(e) => handleFormChange(e, 'order')} required />
                        </div>
                      </>
                    )}
                    
                    <div className="col-12 text-end">
                      <button type="submit" className={`btn-modern btn-modern-primary px-5 py-3 shadow`}>
                        {user.role === 'Buyer' ? 'Post to Market' : 'Publish to Storefront'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Listings / Items Table-style cards */}
              <h5 className="fw-bold text-slate-900 mb-4 px-2">Published Active Records</h5>
              {loadingItems ? (
                <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-5 bg-slate-50 rounded-4 border border-dashed border-slate-200">
                  <p className="text-slate-400 mb-0">No records found. Start by creating a listing above.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {myItems.map(item => (
                    <div className="col-12" key={item.id}>
                      <div className="card-modern p-3 border-0 shadow-sm d-flex align-items-center gap-3 hover-reveal">
                        <div className="rounded-4 bg-slate-50 d-flex align-items-center justify-content-center border border-slate-100" style={{ width: '64px', height: '64px', flexShrink: 0, overflow: 'hidden' }}>
                          {item.imageUrl ? (
                            <img src={`http://localhost:8081${item.imageUrl}`} className="w-100 h-100 object-fit-cover transition-transform" alt="" />
                          ) : (
                            <i className={`bi ${theme.icon} text-slate-300 fs-3`}></i>
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <div className="fw-bold text-slate-900 text-truncate">{item.cropName || item.fertilizerName}</div>
                            {item.verificationStatus === 'UNVERIFIED' || item.verificationStatus === 'PENDING' ? (
                                <span className="bg-amber-100 text-amber-800 rounded-full py-0 px-2 fw-bold" style={{ fontSize: '0.6rem' }}>Verification Pending</span>
                            ) : item.verificationStatus === 'REJECTED' ? (
                                <span className="bg-red-100 text-red-800 rounded-full py-0 px-2 fw-bold" style={{ fontSize: '0.6rem' }}>Rejected</span>
                            ) : (
                                <span className="bg-emerald-100 text-emerald-800 rounded-full py-0 px-2 fw-bold" style={{ fontSize: '0.6rem' }}>Active / Verified</span>
                            )}
                          </div>
                          <div className="text-slate-500 x-small d-flex align-items-center gap-3">
                             <span><i className="bi bi-stack me-1"></i> {item.quantity || item.requiredQuantity || 'In Stock'}</span>
                             {item.season && <span><i className="bi bi-calendar3 me-1"></i> {item.season}</span>}
                          </div>
                        </div>
                        <div className="text-end ps-3 border-start border-slate-100">
                          <div className="text-slate-400 x-small text-uppercase fw-bold mb-1">Market Price</div>
                          <div className="fw-bold text-primary">₹{(item.pricePerUnit || item.targetPrice || item.price)?.toLocaleString()}</div>
                        </div>
                        <div className="ms-2">
                           <button className="btn-modern btn-modern-outline p-2 rounded-circle" style={{ width: '32px', height: '32px' }}>
                              <i className="bi bi-three-dots-vertical"></i>
                           </button>
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
  )
}

export default Profile

