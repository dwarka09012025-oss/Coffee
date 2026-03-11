import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getCoffeeById } from '../supabase'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import './ProductDetail.css'

const roastColors = {
  'Light':       { bg: '#EEF4FB', color: '#4a6fa5' },
  'Medium-Light':{ bg: '#FFF8E7', color: '#b8860b' },
  'Medium':      { bg: '#FFF3E0', color: '#e65100' },
  'Medium-Dark': { bg: '#FBE9E7', color: '#bf360c' },
  'Dark':        { bg: '#3e2723', color: '#d7ccc8' },
}

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const { addToast } = useToast()
  const [coffee, setCoffee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    loadCoffee()
  }, [id])

  const loadCoffee = async () => {
    try {
      setLoading(true)
      const data = await getCoffeeById(id)
      setCoffee(data)
    } catch (err) {
      console.error('Error loading coffee:', err)
      setCoffee({
        id,
        name: 'Sample Coffee',
        description: 'This is a sample coffee. Configure Firebase to see real data.',
        price: 1299,
        origin: 'Unknown',
        roast_level: 'Medium',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(coffee)
    setAddedToCart(true)
    addToast(`${quantity}× "${coffee.name}" added to cart`, 'success')
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleWishlist = () => {
    toggleWishlist(coffee)
    const msg = isInWishlist(coffee.id)
      ? `"${coffee.name}" removed from wishlist`
      : `"${coffee.name}" added to wishlist`
    addToast(msg, 'info')
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="detail-skeleton">
          <div className="skeleton-img"></div>
          <div className="skeleton-info">
            <div className="skeleton-line w60"></div>
            <div className="skeleton-line w40"></div>
            <div className="skeleton-line w80"></div>
            <div className="skeleton-line w80"></div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!coffee) {
    return (
      <>
        <Navbar />
        <div className="error-detail">
          <h2>Coffee not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">← Back to Shop</button>
        </div>
        <Footer />
      </>
    )
  }

  const roastStyle = roastColors[coffee.roast_level] || roastColors['Medium']
  const inWishlist = isInWishlist(coffee.id)

  return (
    <div className="product-detail-page">
      <Navbar />
      
      <div className="detail-container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Collection
        </button>
        
        <div className="detail-content">
          <div className="detail-image-wrapper">
            <img 
              src={coffee.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800'} 
              alt={coffee.name}
              className="detail-image"
            />
            <button
              className={`wishlist-btn-detail ${inWishlist ? 'wishlisted' : ''}`}
              onClick={handleWishlist}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {inWishlist ? '♥' : '♡'}
            </button>
          </div>
          
          <div className="detail-info">
            {coffee.roast_level && (
              <span
                className="detail-roast-tag"
                style={{ background: roastStyle.bg, color: roastStyle.color }}
              >
                {coffee.roast_level} Roast
              </span>
            )}

            <h1 className="detail-title">{coffee.name}</h1>
            
            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Origin</span>
                <span className="meta-value">📍 {coffee.origin}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Roast</span>
                <span className="meta-value">🔥 {coffee.roast_level}</span>
              </div>
            </div>

            <p className="detail-description">{coffee.description}</p>

            <div className="detail-price-section">
              <span className="detail-price">₹{coffee.price?.toLocaleString('en-IN')}</span>
              <span className="price-unit">/ 250g bag</span>
            </div>

            <div className="detail-qty-row">
              <label className="qty-label">Quantity</label>
              <div className="qty-controls">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn" disabled={quantity <= 1}>−</button>
                <span className="qty-val">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="qty-btn">+</button>
              </div>
            </div>

            <div className="detail-buttons">
              <button 
                className={`add-to-cart-button ${addedToCart ? 'added' : ''}`}
                onClick={handleAddToCart}
              >
                {addedToCart ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
              <button
                className={`wishlist-btn-detail-text ${inWishlist ? 'wishlisted' : ''}`}
                onClick={handleWishlist}
              >
                {inWishlist ? '♥ Wishlisted' : '♡ Add to Wishlist'}
              </button>
            </div>

            <div className="product-features">
              <div className="feature-item"><span>✓</span> Single-origin beans</div>
              <div className="feature-item"><span>✓</span> Ethically sourced</div>
              <div className="feature-item"><span>✓</span> Freshly roasted to order</div>
              <div className="feature-item"><span>✓</span> Free shipping on all orders</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ProductDetail

