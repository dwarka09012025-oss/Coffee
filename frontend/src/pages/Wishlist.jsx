import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/Toast'
import './Wishlist.css'

const Wishlist = () => {
  const { wishlist, toggleWishlist, addToCart } = useCart()
  const { showToast } = useToast()

  const handleRemove = (coffee) => {
    toggleWishlist(coffee)
    showToast(`Removed ${coffee.name} from wishlist`, 'info')
  }

  const handleAddToCart = (coffee) => {
    addToCart(coffee, 1)
    showToast(`${coffee.name} added to cart!`, 'success')
  }

  const handleAddAllToCart = () => {
    wishlist.forEach(c => addToCart(c, 1))
    showToast(`${wishlist.length} items added to cart!`, 'success')
  }

  const roastColor = (level) => {
    const map = { Light: '#f59e0b', 'Medium-Light': '#d97706', Medium: '#b45309', 'Medium-Dark': '#92400e', Dark: '#3e2723' }
    return map[level] || '#6F4E37'
  }

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>♡ My Wishlist</h1>
            <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">♡</div>
              <h2>Your wishlist is empty</h2>
              <p>Save coffees you love by clicking the heart icon on any product.</p>
              <Link to="/" className="wishlist-browse-btn">Browse Coffees</Link>
            </div>
          ) : (
            <>
              <div className="wishlist-actions-bar">
                <span>{wishlist.length} saved coffee{wishlist.length > 1 ? 's' : ''}</span>
                <button className="add-all-btn" onClick={handleAddAllToCart}>
                  🛒 Add All to Cart
                </button>
              </div>

              <div className="wishlist-grid">
                {wishlist.map(coffee => (
                  <div key={coffee.id} className="wishlist-card">
                    <div className="wishlist-card-image">
                      <Link to={`/coffee/${coffee.id}`}>
                        <img
                          src={coffee.image_url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80'}
                          alt={coffee.name}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80' }}
                        />
                      </Link>
                      <button
                        className="wishlist-remove-btn"
                        onClick={() => handleRemove(coffee)}
                        title="Remove from wishlist"
                      >
                        ♥
                      </button>
                    </div>

                    <div className="wishlist-card-body">
                      <div className="wishlist-card-meta">
                        <span className="wishlist-origin">{coffee.origin}</span>
                        {coffee.roast_level && (
                          <span className="wishlist-roast" style={{ background: roastColor(coffee.roast_level) }}>
                            {coffee.roast_level}
                          </span>
                        )}
                      </div>

                      <Link to={`/coffee/${coffee.id}`} className="wishlist-card-name">
                        {coffee.name}
                      </Link>

                      <p className="wishlist-card-desc">
                        {coffee.description?.slice(0, 80)}{coffee.description?.length > 80 ? '…' : ''}
                      </p>

                      <div className="wishlist-card-footer">
                        <span className="wishlist-price">₹{coffee.price?.toLocaleString('en-IN')}</span>
                        <button
                          className="wishlist-add-cart-btn"
                          onClick={() => handleAddToCart(coffee)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Wishlist
