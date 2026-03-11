import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getDiscountCodeByCode, incrementCodeUsage, addOrder, getCurrentUser } from '../supabase'
import { useToast } from '../components/Toast'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Checkout.css'

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [discountError, setDiscountError] = useState('')
  const [discountLoading, setDiscountLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    paymentMethod: 'cod'
  })

  const subtotal = getCartTotal()
  const shipping = 0 // Free shipping
  
  const calculateDiscount = () => {
    if (!appliedDiscount) return 0
    
    const { discount_type, discount_value, min_order_value, max_discount } = appliedDiscount
    
    if (min_order_value && subtotal < min_order_value) {
      return 0
    }
    
    let discount = 0
    if (discount_type === 'percentage') {
      discount = (subtotal * discount_value) / 100
      if (max_discount && discount > max_discount) {
        discount = max_discount
      }
    } else if (discount_type === 'flat') {
      discount = discount_value
    }
    
    return Math.min(discount, subtotal)
  }

  const discount = calculateDiscount()
  const total = subtotal - discount + shipping

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code')
      return
    }

    setDiscountLoading(true)
    setDiscountError('')

    try {
      const code = await getDiscountCodeByCode(discountCode.toUpperCase())
      
      if (!code) {
        setDiscountError('Invalid discount code')
        setAppliedDiscount(null)
        return
      }

      if (!code.is_active) {
        setDiscountError('This discount code is no longer active')
        setAppliedDiscount(null)
        return
      }

      if (code.min_order_value && subtotal < code.min_order_value) {
        setDiscountError(`Minimum order value of ₹${code.min_order_value} required`)
        setAppliedDiscount(null)
        return
      }

      setAppliedDiscount(code)
      setDiscountError('')
      addToast(`Discount code "${code.code}" applied!`, 'success')
    } catch (err) {
      console.error('Error applying discount:', err)
      setDiscountError('Invalid or expired discount code')
      setAppliedDiscount(null)
    } finally {
      setDiscountLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)

    try {
      const user = await getCurrentUser()

      if (appliedDiscount) {
        try { await incrementCodeUsage(appliedDiscount.id) } catch (_) {}
      }

      const orderData = {
        user_id: user?.id || 'guest',
        user_email: user?.email || formData.email,
        items: cart,
        subtotal,
        discount,
        total,
        shipping_address: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode
        },
        payment_method: formData.paymentMethod,
        discount_code: appliedDiscount?.code || null
      }

      await addOrder(orderData)
      clearCart()
      addToast('Order placed successfully! 🎉', 'success', 5000)
      navigate('/orders')
    } catch (err) {
      console.error('Error placing order:', err)
      addToast('Failed to place order. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart')
    }
  }, [cart, navigate])

  if (cart.length === 0) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="checkout-page">
        <div className="checkout-container">
          <h1 className="checkout-title">Checkout</h1>

          <div className="checkout-content">
            <div className="checkout-form-section">
              <h2>Shipping Information</h2>
              <form onSubmit={handleSubmit} className="checkout-form" noValidate>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'input-error' : ''}
                    placeholder="Rahul Sharma"
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'input-error' : ''}
                      placeholder="rahul@example.com"
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'input-error' : ''}
                      placeholder="9876543210"
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className={errors.address ? 'input-error' : ''}
                    placeholder="Flat / House No, Street, Area"
                  />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'input-error' : ''}
                      placeholder="Mumbai"
                    />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">Pincode *</label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={errors.pincode ? 'input-error' : ''}
                      placeholder="400001"
                      maxLength={6}
                    />
                    {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                      />
                      <span>💵 Cash on Delivery</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={formData.paymentMethod === 'online'}
                        onChange={handleInputChange}
                      />
                      <span>💳 Online Payment (Coming Soon)</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="place-order-btn" disabled={submitting}>
                  {submitting ? (
                    <><span className="btn-spinner"></span> Placing Order…</>
                  ) : (
                    `Place Order — ₹${total.toLocaleString('en-IN')}`
                  )}
                </button>
              </form>
            </div>

            <div className="checkout-summary-section">
              <div className="order-summary-card">
                <h2>Order Summary</h2>

                <div className="order-items">
                  {cart.map((item) => (
                    <div key={item.id} className="order-item">
                      <img src={item.image_url} alt={item.name} />
                      <div className="order-item-details">
                        <h4>{item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <span className="order-item-price">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="discount-code-section">
                  <h3>Discount Code</h3>
                  {appliedDiscount ? (
                    <div className="applied-discount">
                      <div className="discount-info">
                        <span className="discount-code-badge">{appliedDiscount.code}</span>
                        <span className="discount-amount">− ₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                      <button onClick={() => { setAppliedDiscount(null); setDiscountCode(''); setDiscountError('') }} className="remove-discount">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="discount-input-group">
                        <input
                          type="text"
                          placeholder="Enter code"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        />
                        <button 
                          onClick={handleApplyDiscount}
                          disabled={discountLoading}
                          type="button"
                        >
                          {discountLoading ? 'Applying…' : 'Apply'}
                        </button>
                      </div>
                      {discountError && <p className="discount-error">{discountError}</p>}
                    </>
                  )}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedDiscount && discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>− ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Checkout
