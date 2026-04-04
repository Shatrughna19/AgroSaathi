import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function OrdersSection({ user }) {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = 'http://localhost:8081/api/marketplace'
  const CROP_ORDER_BASE = 'http://localhost:8081/api/crop-orders'

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const endpoint = user.role === 'Farmer'
        ? `${API_BASE}/orders/crop/farmer/${user.id}`
        : `${API_BASE}/orders/crop/buyer/${user.id}`

      const res = await fetch(endpoint)
      if (res.ok) {
        setOrders(await res.json())
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Keep existing general status update for admin-style updates
      const res = await fetch(`${API_BASE}/orders/crop/${orderId}/status?status=${newStatus}`, { method: 'PUT' })
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update order status')
    }
  }

  const handleFarmerAccept = async (orderId) => {
    try {
      const res = await fetch(`${CROP_ORDER_BASE}/${orderId}/farmer/accept?farmerId=${user.id}`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map(o => o.id === orderId ? updated : o))
      }
    } catch (e) { console.error(e); alert('Failed to accept order') }
  }

  const handleBuyerAccept = async (orderId) => {
    try {
      const res = await fetch(`${CROP_ORDER_BASE}/${orderId}/buyer/accept?buyerId=${user.id}`, { method: 'PUT' })
      if (res.ok) {
        const updated = await res.json()
        setOrders(orders.map(o => o.id === orderId ? updated : o))
      }
    } catch (e) { console.error(e); alert('Failed to accept offer') }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning-modern'
      case 'ACCEPTED': return 'badge-success-modern'
      case 'REJECTED': return 'badge-danger-modern'
      case 'CANCELLED': return 'badge-danger-modern'
      case 'COMPLETED': return 'badge-info-modern'
      default: return 'badge-info-modern'
    }
  }

  return (
    <div className="fade-in-up">
      <header className="page-header-modern">
        <div>
          <h1 className="page-title-modern">{user.role === 'Farmer' ? 'Sales Pipeline' : 'Purchase Orders'}</h1>
          <p className="page-subtitle-modern">Track and manage your agricultural transactions.</p>
        </div>
      </header>

      {loading ? (
        <div className="d-flex justify-content-center my-5 py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-5 shadow-sm border">
          <i className="bi bi-box-seam display-1 text-slate-200 d-block mb-3"></i>
          <h4 className="text-slate-500">No transactions recorded yet.</h4>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div className="col-12 col-md-6 col-xl-4" key={order.id}>
              <div className="card-modern">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h5 className="fw-bold text-slate-900 mb-1">{order.cropName}</h5>
                    <span className="text-slate-500 small">#{order.id.toString().padStart(5, '0')}</span>
                  </div>
                  <span className={`badge-modern ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <label className="text-slate-400 small text-uppercase fw-bold letter-spacing-1" style={{ fontSize: '0.65rem' }}>
                      {user.role === 'Farmer' ? 'Customer' : 'Supplier'}
                    </label>
                    <div className="fw-semibold text-slate-700 text-truncate">
                      {user.role === 'Farmer' ? order.buyerName : order.farmerName}
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <label className="text-slate-400 small text-uppercase fw-bold letter-spacing-1" style={{ fontSize: '0.65rem' }}>
                      Quantity
                    </label>
                    <div className="fw-semibold text-slate-700">{order.quantity}</div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center p-3 bg-slate-50 rounded-3 border border-slate-100">
                      <span className="text-slate-600 small">Total Value</span>
                      <span className="h5 fw-bold text-slate-900 mb-0">₹{order.totalPrice || (order.price * order.quantity)}</span>
                    </div>
                  </div>
                </div>

                {user.role === 'Farmer' && order.status === 'PENDING' && !order.farmerAccepted && (
                  <div className="d-flex gap-2 pt-3 border-top border-slate-100">
                    <button className="btn-modern btn-modern-primary flex-grow-1" onClick={() => handleFarmerAccept(order.id)}>
                      <i className="bi bi-check2"></i> Accept Order
                    </button>
                    <button className="btn-modern btn-modern-outline text-danger" style={{ padding: '0.75rem' }} onClick={() => handleStatusUpdate(order.id, 'REJECTED')}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                )}

                {user.role === 'Buyer' && order.farmerAccepted && !order.buyerAccepted && (
                  <div className="d-flex gap-2 pt-3 border-top border-slate-100">
                    <button className="btn-modern btn-modern-primary flex-grow-1" onClick={() => handleBuyerAccept(order.id)}>
                      <i className="bi bi-hand-thumbs-up"></i> Confirm Farmer Offer
                    </button>
                  </div>
                )}
                
                {order.status !== 'PENDING' && (
                  <div className="text-center pt-2">
                    <span className="text-slate-400 small italic">
                      {order.status === 'ACCEPTED' ? '✓ Transaction confirmed' : '✕ Transaction cancelled'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersSection
