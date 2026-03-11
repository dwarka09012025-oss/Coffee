import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CoffeeCard from '../components/CoffeeCard'
import { getCoffees } from '../supabase'
import './Home.css'

const ROAST_LEVELS = ['All', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark']
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc',   label: 'Name: A-Z' },
]
const FEATURES = [
  { icon: 'FREE', emoji: true, text: 'Free Shipping' },
  { icon: '🌿', text: 'Ethically Sourced' },
  { icon: '🔥', text: 'Freshly Roasted' },
  { icon: '⭐', text: 'Premium Quality' },
  { icon: '🔒', text: 'Secure Payment' },
]
const DEMO_COFFEES = [
  { id: '1', name: 'Ethiopian Yirgacheffe', description: 'A bright, floral coffee with notes of bergamot and lemon. Light body with a clean, lingering finish.', price: 1599, origin: 'Ethiopia', roast_level: 'Light', image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500' },
  { id: '2', name: 'Colombian Supremo', description: 'Rich and balanced with caramel sweetness and nutty undertones. Perfect for everyday drinking.', price: 1299, origin: 'Colombia', roast_level: 'Medium', image_url: 'https://images.unsplash.com/photo-1578374173705-d3e4e5bb73c5?w=500' },
  { id: '3', name: 'Sumatra Mandheling', description: 'Full-bodied with earthy, herbal notes. Low acidity with a syrupy, velvety mouthfeel.', price: 1499, origin: 'Indonesia', roast_level: 'Dark', image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=500' },
  { id: '4', name: 'Costa Rican Tarrazu', description: 'Crisp acidity with chocolate and citrus notes. A hallmark Central American classic.', price: 1399, origin: 'Costa Rica', roast_level: 'Medium', image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
  { id: '5', name: 'Kenyan AA', description: 'Wine-like acidity with blackcurrant and berry flavors. Complex, vibrant and unforgettable.', price: 1699, origin: 'Kenya', roast_level: 'Medium-Light', image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=500' },
  { id: '6', name: 'Brazilian Santos', description: 'Smooth and mellow with chocolate and nutty flavors. Low acidity, ideal for espresso blends.', price: 1199, origin: 'Brazil', roast_level: 'Medium-Dark', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500' },
]

const Home = () => {
  const [coffees, setCoffees]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [searchQuery, setSearch]    = useState('')
  const [selectedRoast, setRoast]   = useState('All')
  const [selectedOrigin, setOrigin] = useState('All')
  const [maxPrice, setMaxPrice]     = useState(5000)
  const [priceLimit, setPriceLimit] = useState(5000)
  const [sortBy, setSortBy]         = useState('newest')
  const [showFilters, setFilters]   = useState(false)

  useEffect(() => { loadCoffees() }, [])

  const loadCoffees = async () => {
    try {
      setLoading(true)
      const data = await getCoffees()
      const list = data.length > 0 ? data : DEMO_COFFEES
      const top  = Math.max(...list.map(c => c.price || 0), 5000)
      setCoffees(list); setMaxPrice(top); setPriceLimit(top)
    } catch {
      const top = Math.max(...DEMO_COFFEES.map(c => c.price), 5000)
      setCoffees(DEMO_COFFEES); setMaxPrice(top); setPriceLimit(top)
    } finally { setLoading(false) }
  }

  const origins = useMemo(() => {
    const u = [...new Set(coffees.map(c => c.origin).filter(Boolean))].sort()
    return ['All', ...u]
  }, [coffees])

  const filtered = useMemo(() => {
    let r = coffees.filter(c => {
      const q = searchQuery.toLowerCase()
      const ms = !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.origin?.toLowerCase().includes(q)
      return ms && (selectedRoast === 'All' || c.roast_level === selectedRoast) && (selectedOrigin === 'All' || c.origin === selectedOrigin) && (c.price || 0) <= priceLimit
    })
    if (sortBy === 'price_asc')  r = [...r].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') r = [...r].sort((a, b) => b.price - a.price)
    if (sortBy === 'name_asc')   r = [...r].sort((a, b) => a.name.localeCompare(b.name))
    return r
  }, [coffees, searchQuery, selectedRoast, selectedOrigin, priceLimit, sortBy])

  const hasFilters = searchQuery || selectedRoast !== 'All' || selectedOrigin !== 'All' || sortBy !== 'newest' || priceLimit < maxPrice

  const clearFilters = () => {
    setSearch(''); setRoast('All'); setOrigin('All'); setPriceLimit(maxPrice); setSortBy('newest')
  }

  return (
    <div className="home">
      <Navbar />

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <span className="hero-badge">Premium Collection 2026</span>
          <h1 className="hero-title">Discover the <em>World's Finest</em> Coffee</h1>
          <p className="hero-subtitle">
            Handcrafted beans sourced ethically from the world's most renowned coffee regions
          </p>
          <div className="hero-search-bar">
            <span className="hero-search-icon">&#x1F50D;</span>
            <input
              type="text"
              placeholder="Search by name, origin, roast level..."
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
              className="hero-search-input"
            />
          </div>
          <a href="#gallery" className="hero-cta">Explore the Collection</a>
        </div>
      </section>

      <div className="features-strip">
        {[['🛍️','Free Shipping'],['🌿','Ethically Sourced'],['🔥','Freshly Roasted'],['⭐','Premium Quality'],['🔒','Secure Payment']].map(([icon, text]) => (
          <div key={text} className="feature-item">
            <span>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <section id="gallery" className="gallery-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Our Coffee Collection</h2>
            <p className="section-sub">Every cup tells a story — from the farm to your table</p>
          </div>

          <div className="filters-bar">
            <div className="filters-left">
              <div className="search-box">
                <span className="sb-icon">&#x1F50D;</span>
                <input
                  type="text"
                  placeholder="Search coffees..."
                  value={searchQuery}
                  onChange={e => setSearch(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearch('')}>&#x2715;</button>
                )}
              </div>
              <button
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setFilters(v => !v)}
              >
                Filters{hasFilters && <span className="filter-dot" />}
              </button>
            </div>
            <div className="filters-right">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="results-count">{filtered.length} products</span>
            </div>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label className="filter-label">Roast Level</label>
                <div className="filter-chips">
                  {ROAST_LEVELS.map(r => (
                    <button key={r} className={`filter-chip ${selectedRoast === r ? 'active' : ''}`} onClick={() => setRoast(r)}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Origin</label>
                <select value={selectedOrigin} onChange={e => setOrigin(e.target.value)} className="origin-select">
                  {origins.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Max Price: &#x20B9;{priceLimit.toLocaleString('en-IN')}</label>
                <input type="range" min="0" max={maxPrice} step="100" value={priceLimit} onChange={e => setPriceLimit(+e.target.value)} className="price-range-slider" />
                <div className="price-range-labels"><span>&#x20B9;0</span><span>&#x20B9;{maxPrice.toLocaleString('en-IN')}</span></div>
              </div>
              {hasFilters && <button className="clear-all-btn" onClick={clearFilters}>Clear All Filters</button>}
            </div>
          )}

          {loading ? (
            <div className="skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" /><div className="skeleton-line short" /><div className="skeleton-line" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">&#x2615;</div>
              <h3>No coffees found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="reset-btn" onClick={clearFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="coffee-grid">
              {filtered.map(coffee => <CoffeeCard key={coffee.id} coffee={coffee} />)}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home

