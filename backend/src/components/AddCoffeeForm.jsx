import React, { useState } from 'react'
import { addCoffee } from '../supabase'
import './AddCoffeeForm.css'

const INITIAL = {
  name: '', description: '', price: '', origin: '',
  roast_level: 'Medium', image_url: ''
}

const AddCoffeeForm = ({ onCoffeeAdded }) => {
  const [formData, setFormData] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const validate = () => {
    const e = {}
    if (!formData.name.trim()) e.name = 'Name is required'
    if (!formData.origin.trim()) e.origin = 'Origin is required'
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0)
      e.price = 'Enter a valid price'
    if (!formData.description.trim()) e.description = 'Description is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setMessage('')

    try {
      await addCoffee({ ...formData, price: parseFloat(formData.price) })
      setMessage('✓ Coffee added successfully!')
      setFormData(INITIAL)
      setErrors({})
      if (onCoffeeAdded) onCoffeeAdded()
      setTimeout(() => setMessage(''), 4000)
    } catch (err) {
      console.error('Error adding coffee:', err)
      setMessage('⚠️ Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-coffee-form">
      <h2>Add New Coffee</h2>
      
      {message && (
        <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Coffee Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
            placeholder="e.g., Ethiopian Yirgacheffe"
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="origin">Origin *</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              className={errors.origin ? 'input-error' : ''}
              placeholder="e.g., Ethiopia"
            />
            {errors.origin && <span className="field-error">{errors.origin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'input-error' : ''}
              step="1"
              min="0"
              placeholder="1299"
            />
            {errors.price && <span className="field-error">{errors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="roast_level">Roast Level *</label>
            <select
              id="roast_level"
              name="roast_level"
              value={formData.roast_level}
              onChange={handleChange}
            >
              <option value="Light">Light</option>
              <option value="Medium-Light">Medium-Light</option>
              <option value="Medium">Medium</option>
              <option value="Medium-Dark">Medium-Dark</option>
              <option value="Dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'input-error' : ''}
            rows="4"
            placeholder="Describe the flavor profile, aroma, and characteristics…"
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          <small>Leave empty for default image</small>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Adding…' : '+ Add Coffee'}
        </button>
      </form>
    </div>
  )
}

export default AddCoffeeForm
