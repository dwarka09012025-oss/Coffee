import React, { useState } from 'react'
import { addDiscountCode } from '../supabase'
import './AddDiscountCodeForm.css'

const INITIAL = {
  code: '', discount_type: 'percentage', discount_value: '',
  min_order_value: '', max_discount: '', is_active: true
}

const AddDiscountCodeForm = ({ onCodeAdded }) => {
  const [formData, setFormData] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const validate = () => {
    const e = {}
    if (!formData.code.trim()) e.code = 'Code is required'
    else if (!/^[A-Z0-9_-]+$/i.test(formData.code)) e.code = 'Only letters, numbers, - and _ allowed'
    if (!formData.discount_value || isNaN(formData.discount_value) || Number(formData.discount_value) <= 0)
      e.discount_value = 'Enter a valid discount value'
    else if (formData.discount_type === 'percentage' && Number(formData.discount_value) > 100)
      e.discount_value = 'Percentage cannot exceed 100'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setMessage('')

    try {
      const codeData = {
        code: formData.code.toUpperCase().trim(),
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        is_active: formData.is_active,
        usage_count: 0
      }
      await addDiscountCode(codeData)
      setFormData(INITIAL)
      setErrors({})
      setMessage(`✓ Discount code "${codeData.code}" added!`)
      onCodeAdded()
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      console.error('Error adding discount code:', err)
      setMessage('⚠️ Failed to add discount code: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="discount-code-form-container">
      <h2>Add Discount Code</h2>

      {message && (
        <div className={`dc-form-message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="discount-code-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="code">Code *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="WELCOME10"
              className={errors.code ? 'input-error' : ''}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.code && <span className="field-error">{errors.code}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="discount_type">Discount Type *</label>
            <select
              id="discount_type"
              name="discount_type"
              value={formData.discount_type}
              onChange={handleChange}
              required
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="discount_value">
              Discount Value * ({formData.discount_type === 'percentage' ? '%' : '₹'})
            </label>
            <input
              type="number"
              id="discount_value"
              name="discount_value"
              value={formData.discount_value}
              onChange={handleChange}
              className={errors.discount_value ? 'input-error' : ''}
              placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
              min="0"
              step={formData.discount_type === 'percentage' ? '0.01' : '1'}
            />
            {errors.discount_value && <span className="field-error">{errors.discount_value}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="min_order_value">Min Order Value (₹)</label>
            <input
              type="number"
              id="min_order_value"
              name="min_order_value"
              value={formData.min_order_value}
              onChange={handleChange}
              placeholder="1000"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="max_discount">Max Discount (₹)</label>
            <input
              type="number"
              id="max_discount"
              name="max_discount"
              value={formData.max_discount}
              onChange={handleChange}
              placeholder="500"
              min="0"
              step="1"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Active immediately</span>
            </label>
          </div>
        </div>

        <button type="submit" className="submit-discount-btn" disabled={loading}>
          {loading ? 'Adding…' : '+ Add Discount Code'}
        </button>
      </form>
    </div>
  )
}

export default AddDiscountCodeForm
