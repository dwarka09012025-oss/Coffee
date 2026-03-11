import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => (
  <footer className="footer" id="about">
    <div className="footer-container">
      <div className="footer-brand">
        <div className="footer-logo">
          <span>&#x2615;</span>
          <span>Artisan Coffee</span>
        </div>
        <p className="footer-tagline">Premium beans, ethically sourced from the finest farms around the world.</p>
        <div className="footer-social">
          <a href="#" aria-label="Facebook" className="social-link">f</a>
          <a href="#" aria-label="Instagram" className="social-link">&#x1d4ae;</a>
          <a href="#" aria-label="Twitter" className="social-link">t</a>
        </div>
      </div>

      <div className="footer-section">
        <h4>Shop</h4>
        <ul>
          <li><Link to="/">All Coffees</Link></li>
          <li><Link to="/?roast=Light">Light Roasts</Link></li>
          <li><Link to="/?roast=Medium">Medium Roasts</Link></li>
          <li><Link to="/?roast=Dark">Dark Roasts</Link></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Account</h4>
        <ul>
          <li><Link to="/login">Sign In</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/orders">My Orders</Link></li>
          <li><Link to="/cart">Cart</Link></li>
        </ul>
      </div>

      <div className="footer-section">
        <h4>Contact</h4>
        <ul>
          <li><span>&#128140; info@artisancoffee.com</span></li>
          <li><span>&#128222; +91 98765 43210</span></li>
          <li><span>&#128205; Mumbai, India</span></li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; 2026 Artisan Coffee. All rights reserved.</p>
      <div className="footer-badges">
        <span>&#128274; Secure</span>
        <span>&#9989; Verified</span>
      </div>
    </div>
  </footer>
)

export default Footer

