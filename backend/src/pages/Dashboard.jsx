import React, { useEffect, useState } from 'react'
import AddCoffeeForm from '../components/AddCoffeeForm'
import CoffeeTable from '../components/CoffeeTable'
import AddDiscountCodeForm from '../components/AddDiscountCodeForm'
import DiscountCodesTable from '../components/DiscountCodesTable'
import Analytics from '../components/Analytics'
import { getCoffees, getDiscountCodes, getOrders, updateOrderStatus } from '../supabase'
import './Dashboard.css'

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const statusBadge = (status) => {
  const map = {
    pending:    { bg: '#FFF3CD', color: '#856404' },
    confirmed:  { bg: '#D1ECF1', color: '#0C5460' },
    processing: { bg: '#D4EDDA', color: '#155724' },
    shipped:    { bg: '#CCE5FF', color: '#004085' },
    delivered:  { bg: '#D4EDDA', color: '#155724' },
    cancelled:  { bg: '#F8D7DA', color: '#721C24' },
  }
  const s = map[status] || map.pending
  return <span style={{ background: s.bg, color: s.color, padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize' }}>{status}</span>
}

const formatDate = (ts) => {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const Dashboard = ({ user, onSignOut }) => {
  const [coffees, setCoffees] = useState([])
  const [discountCodes, setDiscountCodes] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('coffees')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')

  useEffect(() => {
    loadCoffees()
    loadDiscountCodes()
    loadOrders()
  }, [])

  useEffect(() => {
    if (activeTab === 'orders') loadOrders()
  }, [activeTab])

  const loadCoffees = async () => {
    try {
      setLoading(true)
      const data = await getCoffees()
      setCoffees(data)
      setError(null)
    } catch (err) {
      console.error('Error loading coffees:', err)
      setError('Failed to connect to Firebase. Check your configuration.')
      setCoffees([])
    } finally {
      setLoading(false)
    }
  }

  const loadDiscountCodes = async () => {
    try {
      const data = await getDiscountCodes()
      setDiscountCodes(data)
    } catch (err) {
      console.error('Error loading discount codes:', err)
      setDiscountCodes([])
    }
  }

  const loadOrders = async () => {
    try {
      setOrdersLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error('Error loading orders:', err)
      setOrders([])
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !orderSearch ||
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.user_email || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.shipping_address?.name || '').toLowerCase().includes(orderSearch.toLowerCase())
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>☕ Coffee Admin Panel</h1>
          <p>Manage your store — products, discounts & orders</p>
        </div>
        <div className="header-actions">
          <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="view-site-button">
            🌐 View Store
          </a>
          {onSignOut && (
            <button className="signout-btn" onClick={onSignOut} title={`Signed in as ${user?.email || ''}`}>
              🚪 Sign Out
            </button>
          )}
        </div>
      </header>

      <div className="dashboard-container">
        {error && (
          <div className="error-banner">
            <p>⚙️ <strong>Firebase Not Configured</strong></p>
            <p>{error}</p>
          </div>
        )}

        <div className="dashboard-stats-row">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{coffees.length}</h3>
              <p>Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <h3>{discountCodes.filter(c => c.is_active).length}</h3>
              <p>Active Discounts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{totalRevenue.toLocaleString('en-IN')}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <button className={`tab-button ${activeTab === 'coffees' ? 'active' : ''}`} onClick={() => setActiveTab('coffees')}>
            ☕ Coffee Products
          </button>
          <button className={`tab-button ${activeTab === 'discounts' ? 'active' : ''}`} onClick={() => setActiveTab('discounts')}>
            🎫 Discount Codes
          </button>
          <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            🛒 Orders
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="tab-badge">{orders.filter(o => o.status === 'pending').length}</span>
            )}
          </button>
          <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            📊 Analytics
          </button>
        </div>

        {activeTab === 'coffees' && (
          <>
            <div className="dashboard-grid">
              <div className="form-section">
                <AddCoffeeForm onCoffeeAdded={loadCoffees} />
              </div>
              <div className="stats-section">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>{coffees.length}</h3>
                    <p>Total Products</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>₹{coffees.reduce((sum, c) => sum + (c.price || 0), 0).toLocaleString('en-IN')}</h3>
                    <p>Catalog Value</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🌍</div>
                  <div className="stat-info">
                    <h3>{new Set(coffees.map(c => c.origin)).size}</h3>
                    <p>Origins</p>
                  </div>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="loading-state">Loading products…</div>
            ) : (
              <CoffeeTable coffees={coffees} onCoffeeDeleted={loadCoffees} onCoffeeUpdated={loadCoffees} />
            )}
          </>
        )}

        {activeTab === 'discounts' && (
          <>
            <div className="dashboard-grid">
              <div className="form-section full-width">
                <AddDiscountCodeForm onCodeAdded={loadDiscountCodes} />
              </div>
              <div className="stats-section">
                <div className="stat-card">
                  <div className="stat-icon">🎫</div>
                  <div className="stat-info">
                    <h3>{discountCodes.length}</h3>
                    <p>Total Codes</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>{discountCodes.filter(c => c.is_active).length}</h3>
                    <p>Active Codes</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3>{discountCodes.reduce((sum, c) => sum + (c.usage_count || 0), 0)}</h3>
                    <p>Total Usage</p>
                  </div>
                </div>
              </div>
            </div>
            <DiscountCodesTable codes={discountCodes} onCodeUpdated={loadDiscountCodes} />
          </>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="orders-toolbar">
              <input
                type="text"
                className="orders-search"
                placeholder="🔍 Search by order ID, email or name…"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
              />
              <select
                className="orders-status-filter"
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button className="refresh-btn" onClick={loadOrders} title="Refresh orders">↻</button>
            </div>

            {ordersLoading ? (
              <div className="loading-state">Loading orders…</div>
            ) : filteredOrders.length === 0 ? (
              <div className="empty-table">
                <p>No orders found{orderSearch || orderStatusFilter !== 'all' ? ' matching your filters' : ''}.</p>
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td className="order-id-cell">#{order.id.slice(-8).toUpperCase()}</td>
                        <td>
                          <div className="customer-info">
                            <span className="customer-name">{order.shipping_address?.name || '—'}</span>
                            <span className="customer-email">{order.user_email || '—'}</span>
                          </div>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{order.items?.length || 0}</td>
                        <td className="price-cell">₹{order.total?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className="payment-badge">
                            {order.payment_method === 'cod' ? '🏠 COD' : '💳 Online'}
                          </span>
                        </td>
                        <td>{statusBadge(order.status)}</td>
                        <td>
                          <select
                            className="status-select"
                            value={order.status || 'pending'}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                          >
                            {ORDER_STATUSES.map(s => (
                              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="orders-summary-row">
              <span>Showing {filteredOrders.length} of {orders.length} orders</span>
              <span>Pending: <strong>{orders.filter(o => o.status === 'pending').length}</strong></span>
              <span>Delivered: <strong>{orders.filter(o => o.status === 'delivered').length}</strong></span>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Analytics orders={orders} coffees={coffees} discountCodes={discountCodes} />
        )}
      </div>
    </div>
  )
}

export default Dashboard

