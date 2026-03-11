import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Cart.css'

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleRemove = (item) => {
    removeFromCart(item.id)
    addToast(`"${item.name}" removed from cart`, 'info')
  }

  const handleClearCart = () => {
    clearCart()
    addToast('Cart cleared', 'info')
  }

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-page">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious coffee to get started!</p>
            <Link to="/" className="btn-primary">
              Browse Coffee Collection
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">Shopping Cart</h1>
          
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <Link to={`/coffee/${item.id}`} className="cart-item-img-link">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200'} alt={item.name} className="cart-item-image" />
                  </Link>
                  
                  <div className="cart-item-details">
                    <Link to={`/coffee/${item.id}`} className="cart-item-name">{item.name}</Link>
                    <p className="cart-item-origin">📍 {item.origin}</p>
                    {item.roast_level && (
                      <span className="cart-item-roast">{item.roast_level} Roast</span>
                    )}
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    
                    <p className="cart-item-subtotal">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    
                    <button 
                      onClick={() => handleRemove(item)}
                      className="remove-btn"
                      title="Remove from cart"
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-actions-bottom">
                <button onClick={handleClearCart} className="clear-cart-btn">
                  Clear Cart
                </button>
                <Link to="/" className="continue-shopping">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-row">
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>

              <p className="cart-note">🔒 Secure checkout — taxes included</p>

              <button 
                onClick={() => navigate('/checkout')}
                className="checkout-btn"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Cart
