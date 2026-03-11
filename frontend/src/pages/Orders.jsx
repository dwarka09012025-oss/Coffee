import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getCurrentUser, getUserOrders } from '../supabase'
import './Orders.css'

const statusColors = {
  pending:    { bg: '#FFF3CD', color: '#856404', label: 'Pending' },
  confirmed:  { bg: '#D1ECF1', color: '#0C5460', label: 'Confirmed' },
  processing: { bg: '#D4EDDA', color: '#155724', label: 'Processing' },
  shipped:    { bg: '#CCE5FF', color: '#004085', label: 'Shipped' },
  delivered:  { bg: '#D4EDDA', color: '#155724', label: 'Delivered' },
  cancelled:  { bg: '#F8D7DA', color: '#721C24', label: 'Cancelled' },
}

const formatDate = (ts) => {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const Orders = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) { navigate('/login'); return }
        const data = await getUserOrders(user.id)
        setOrders(data)
      } catch (err) {
        console.error('Error loading orders:', err)
        setError('Could not load your orders. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [navigate])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="orders-page">
          <div className="orders-loading">
            <div className="orders-spinner"></div>
            <p>Loading your orders…</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="orders-page">
          <div className="orders-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <Navbar />
        <div className="orders-page">
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders. Start exploring our premium coffee collection today.</p>
            <Link to="/" className="btn-primary">Browse Collection</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>My Orders</h1>
            <p className="orders-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="orders-list">
            {orders.map((order) => {
              const status = statusColors[order.status] || statusColors.pending
              const isExpanded = expandedOrder === order.id

              return (
                <div key={order.id} className="order-card">
                  <div
                    className="order-summary"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    role="button"
                    aria-expanded={isExpanded}
                  >
                    <div className="order-meta">
                      <div className="order-id">
                        <span className="meta-label">Order ID</span>
                        <span className="meta-value">#{order.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="order-date">
                        <span className="meta-label">Placed</span>
                        <span className="meta-value">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="order-total">
                        <span className="meta-label">Total</span>
                        <span className="meta-value total-amount">₹{order.total?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="order-items-count">
                        <span className="meta-label">Items</span>
                        <span className="meta-value">{order.items?.length || 0}</span>
                      </div>
                    </div>

                    <div className="order-right">
                      <span
                        className="status-badge"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                      <span className={`expand-icon ${isExpanded ? 'open' : ''}`}>▾</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="order-details">
                      <div className="order-details-grid">
                        <div className="order-items-list">
                          <h4>Items Ordered</h4>
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <img
                                src={item.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=80'}
                                alt={item.name}
                                className="order-item-img"
                              />
                              <div className="order-item-info">
                                <span className="order-item-name">{item.name}</span>
                                <span className="order-item-qty">Qty: {item.quantity}</span>
                              </div>
                              <span className="order-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>

                        <div className="order-address">
                          <h4>Delivery Address</h4>
                          {order.shipping_address ? (
                            <address>
                              <strong>{order.shipping_address.name}</strong><br />
                              {order.shipping_address.address}<br />
                              {order.shipping_address.city} — {order.shipping_address.pincode}
                            </address>
                          ) : (
                            <p className="text-muted">—</p>
                          )}

                          <h4 style={{ marginTop: '1.2rem' }}>Payment</h4>
                          <p className="payment-method">
                            {order.payment_method === 'cod' ? '🏠 Cash on Delivery' : '💳 Online Payment'}
                          </p>

                          <div className="price-breakdown">
                            <div className="pb-row">
                              <span>Subtotal</span>
                              <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="pb-row discount">
                                <span>Discount</span>
                                <span>− ₹{order.discount?.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            <div className="pb-row">
                              <span>Shipping</span>
                              <span className="free-tag">FREE</span>
                            </div>
                            <div className="pb-row grand-total">
                              <span>Total</span>
                              <span>₹{order.total?.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Orders
