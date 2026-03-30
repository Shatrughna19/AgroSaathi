import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function OrdersSection({ user }) {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const API_BASE = 'http://localhost:8081/api/marketplace'

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning text-dark'
      case 'ACCEPTED': return 'bg-success'
      case 'REJECTED': return 'bg-danger'
      case 'COMPLETED': return 'bg-primary'
      default: return 'bg-secondary'
    }
  }

  return (
    <div className="page-background fade-in pb-5" style={{ minHeight: '100vh' }}>
      <div className="marketplace-hero bg-primary text-white py-5 mb-5 shadow-sm text-center bg-gradient">
        <div className="container">
          <h1 className="fw-bold mb-3">
            {user.role === 'Farmer' ? t('orders.myOrders') : t('orders.myOrders')}
          </h1>
          <p className="lead mb-0">
            {user.role === 'Farmer' 
              ? 'Track and manage orders placed by buyers for your crops.' 
              : 'Keep track of the fresh produce you have ordered.'}
          </p>
        </div>
      </div>

      <div className="container px-4">
        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-2 border-dashed">
            <i className="bi bi-box-seam display-1 text-muted d-block mb-3"></i>
            <h4 className="text-muted">No orders found.</h4>
            <p>Orders will appear here once buyers place them on listings.</p>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map((order) => (
              <div className="col-12" key={order.id}>
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden hover-lift">
                  <div className="card-body p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                      <div>
                        <span className={`badge ${getStatusBadgeClass(order.status)} rounded-pill px-3 py-2 mb-2`}>
                          {order.status}
                        </span>
                        <h4 className="fw-bold mb-0 text-dark">{order.cropName}</h4>
                        <small className="text-muted">Order ID: #{order.id} | Placed on {new Date(order.createdAt).toLocaleDateString()}</small>
                      </div>
                      <div className="text-end">
                        <div className="fs-3 fw-bold text-success">₹{order.price}</div>
                        <div className="text-muted">Qty: {order.quantity}</div>
                      </div>
                    </div>

                    <div className="row g-3 bg-light rounded-4 p-3 border">
                      <div className="col-md-6">
                        <h6 className="text-uppercase text-muted small fw-bold mb-2">
                          {user.role === 'Farmer' ? 'Buyer Information' : 'Shipping Information'}
                        </h6>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="bi bi-person text-primary"></i>
                          <span className="fw-medium">{order.buyerName}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="bi bi-telephone text-success"></i>
                          <span>{order.buyerMobile}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-envelope text-danger"></i>
                          <span>{order.buyerEmail}</span>
                        </div>
                      </div>
                      <div className="col-md-6 d-flex align-items-center justify-content-md-end gap-2">
                        <a href={`tel:${order.buyerMobile}`} className="btn btn-success rounded-pill px-4 shadow-sm">
                          <i className="bi bi-telephone-fill me-2"></i> Call Buyer
                        </a>
                        <a href={`mailto:${order.buyerEmail}`} className="btn btn-outline-primary rounded-pill px-4">
                          <i className="bi bi-envelope-fill me-2"></i> Email
                        </a>
                      </div>
                    </div>
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

export default OrdersSection
