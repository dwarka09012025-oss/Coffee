import React, { useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './Analytics.css'

const COLORS = ['#6F4E37', '#C9A84C', '#3e2723', '#a0785a', '#e8c99a', '#8B4513']
const STATUS_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#3b82f6',
  processing: '#8b5cf6',
  shipped:    '#06b6d4',
  delivered:  '#10b981',
  cancelled:  '#ef4444',
}

const fmt = (val) => `₹${Number(val).toLocaleString('en-IN')}`

const Analytics = ({ orders, coffees, discountCodes }) => {

  // Revenue by day (last 14 days)
  const revenueByDay = useMemo(() => {
    const map = {}
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      map[key] = 0
    }
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      const d = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at)
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      if (key in map) map[key] += (o.total || 0)
    })
    return Object.entries(map).map(([date, revenue]) => ({ date, revenue }))
  }, [orders])

  // Orders by status (pie)
  const ordersByStatus = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      map[o.status] = (map[o.status] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [orders])

  // Top products by revenue (bar)
  const topProducts = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      if (o.status === 'cancelled') return
      ;(o.items || []).forEach(item => {
        const key = item.name || 'Unknown'
        map[key] = (map[key] || 0) + (item.price || 0) * (item.quantity || 1)
      })
    })
    return Object.entries(map)
      .map(([name, revenue]) => ({ name: name.split(' ').slice(0, 2).join(' '), revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
  }, [orders])

  // Orders per day (last 14 days)
  const ordersPerDay = useMemo(() => {
    const map = {}
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      map[key] = 0
    }
    orders.forEach(o => {
      const d = o.created_at?.toDate ? o.created_at.toDate() : new Date(o.created_at)
      const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      if (key in map) map[key] += 1
    })
    return Object.entries(map).map(([date, count]) => ({ date, count }))
  }, [orders])

  // Roast level distribution
  const roastDist = useMemo(() => {
    const map = {}
    coffees.forEach(c => {
      const r = c.roast_level || 'Unknown'
      map[r] = (map[r] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [coffees])

  // Summary KPIs
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0)
  const avgOrderValue = orders.length ? (totalRevenue / orders.filter(o => o.status !== 'cancelled').length || 0) : 0
  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const conversionRate = orders.length ? ((deliveredCount / orders.length) * 100).toFixed(1) : 0

  const CustomTooltipRevenue = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{fmt(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const CustomTooltipOrders = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{payload[0].value} orders</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="analytics">

      {/* KPI Row */}
      <div className="analytics-kpis">
        <div className="kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-info">
            <span className="kpi-value">{fmt(totalRevenue)}</span>
            <span className="kpi-label">Total Revenue</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-info">
            <span className="kpi-value">{orders.length}</span>
            <span className="kpi-label">Total Orders</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">📦</div>
          <div className="kpi-info">
            <span className="kpi-value">{fmt(Math.round(avgOrderValue))}</span>
            <span className="kpi-label">Avg. Order Value</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">✅</div>
          <div className="kpi-info">
            <span className="kpi-value">{conversionRate}%</span>
            <span className="kpi-label">Delivery Rate</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">☕</div>
          <div className="kpi-info">
            <span className="kpi-value">{coffees.length}</span>
            <span className="kpi-label">Products</span>
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon">🎫</div>
          <div className="kpi-info">
            <span className="kpi-value">{discountCodes.filter(c => c.is_active).length}</span>
            <span className="kpi-label">Active Coupons</span>
          </div>
        </div>
      </div>

      {/* Row 1: Revenue line + Orders line */}
      <div className="charts-row">
        <div className="chart-card wide">
          <h3>Revenue — Last 14 Days</h3>
          {orders.length === 0 ? <div className="chart-empty">No order data yet</div> : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={revenueByDay} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={1} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Line type="monotone" dataKey="revenue" stroke="#6F4E37" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Orders — Last 14 Days</h3>
          {orders.length === 0 ? <div className="chart-empty">No order data yet</div> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ordersPerDay} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={1} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltipOrders />} />
                <Bar dataKey="count" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Orders by status pie + Top products bar */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Orders by Status</h3>
          {ordersByStatus.length === 0 ? <div className="chart-empty">No order data yet</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {ordersByStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} orders`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card wide">
          <h3>Top Products by Revenue</h3>
          {topProducts.length === 0 ? <div className="chart-empty">No sales data yet</div> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(val) => [fmt(val), 'Revenue']} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Roast level pie */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Products by Roast Level</h3>
          {roastDist.length === 0 ? <div className="chart-empty">No products yet</div> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={roastDist}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {roastDist.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card wide">
          <h3>Product Pricing Overview</h3>
          {coffees.length === 0 ? <div className="chart-empty">No products yet</div> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={[...coffees].sort((a, b) => b.price - a.price).slice(0, 8).map(c => ({
                  name: c.name.split(' ').slice(0, 2).join(' '),
                  price: c.price
                }))}
                margin={{ top: 5, right: 20, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tickFormatter={v => `₹${v}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [fmt(val), 'Price']} />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {coffees.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}

export default Analytics
