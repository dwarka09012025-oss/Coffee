import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { onAuthStateChange, signOut } from '../supabase'
import './Navbar.css'

const Navbar = () => {
  const { getCartCount, isInWishlist, wishlist } = useCart()
  const cartCount = getCartCount()
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((u) => setUser(u))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await signOut()
    setUser(null)
    navigate('/')
  }

  const scrollToFooter = (e) => {
    e.preventDefault()
    const footer = document.getElementById('about')
    if (footer) footer.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          <span className="logo-icon">☕</span>
          <span className="logo-text">Artisan<span className="logo-accent"> Coffee</span></span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
          <a href="#about" onClick={scrollToFooter} className="nav-link">About</a>

          <Link to="/cart" className="nav-link cart-link">
            <span className="cart-icon">🛒</span>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <Link to="/wishlist" className={`nav-link wishlist-link ${wishlist.length > 0 ? 'wishlist-active' : ''}`} title={`Wishlist (${wishlist.length})`}>
            <span className="wishlist-icon">{wishlist.length > 0 ? '♥' : '♡'}</span>
            {wishlist.length > 0 && <span className="cart-badge wishlist-badge">{wishlist.length}</span>}
          </Link>

          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <div className="user-avatar" onClick={() => setDropdownOpen(o => !o)}>{user.email?.[0]?.toUpperCase()}</div>
              <div className={`user-dropdown${dropdownOpen ? ' user-dropdown-open' : ''}`}>
                <span className="user-email-text">{user.email}</span>
                <Link to="/orders" className="dropdown-item">📦 My Orders</Link>
                <button onClick={handleLogout} className="dropdown-item logout-item">🚪 Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn-register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
