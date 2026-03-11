import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './CoffeeCard.css'

const ROAST_COLORS = {
  'Light': '#a8c5da',
  'Medium-Light': '#c4956a',
  'Medium': '#8B5E3C',
  'Medium-Dark': '#6F4E37',
  'Dark': '#3e2723',
}

const CoffeeCard = ({ coffee }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const [addedToCart, setAddedToCart] = useState(false)
  const wishlisted = isInWishlist(coffee.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(coffee)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2200)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(coffee)
  }

  const roastColor = ROAST_COLORS[coffee.roast_level] || '#6F4E37'

  return (
    <div className="coffee-card">
      <Link to={`/coffee/${coffee.id}`} className="coffee-card-link">
        <div className="coffee-image-wrap">
          <img
            src={coffee.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500'}
            alt={coffee.name}
            className="coffee-image"
            loading="lazy"
          />
          <div className="coffee-overlay">
            <span className="view-details-btn">View Details →</span>
          </div>
          <button className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`} onClick={handleWishlist} title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            {wishlisted ? '♥' : '♡'}
          </button>
          <span className="roast-tag" style={{ background: roastColor }}>
            {coffee.roast_level}
          </span>
        </div>

        <div className="coffee-info">
          <div className="coffee-origin-row">
            <span className="coffee-origin">📍 {coffee.origin}</span>
          </div>
          <h3 className="coffee-name">{coffee.name}</h3>
          <p className="coffee-desc">{coffee.description?.substring(0, 75)}…</p>
          <div className="coffee-footer">
            <span className="coffee-price">₹{coffee.price?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Link>

      <button
        className={`card-add-btn ${addedToCart ? 'added' : ''}`}
        onClick={handleAddToCart}
      >
        {addedToCart ? '✓ Added to Cart!' : '🛒 Add to Cart'}
      </button>
    </div>
  )
}

export default CoffeeCard

