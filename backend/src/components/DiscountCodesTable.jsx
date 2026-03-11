import React, { useState } from 'react'
import { deleteDiscountCode, updateDiscountCode } from '../supabase'
import './DiscountCodesTable.css'

const DiscountCodesTable = ({ codes, onCodeUpdated }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [message, setMessage] = useState('')

  const showMsg = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3500)
  }

  const handleDelete = async (id) => {
    try {
      await deleteDiscountCode(id)
      setDeleteConfirm(null)
      onCodeUpdated()
      showMsg('✓ Discount code deleted!')
    } catch (err) {
      console.error('Error deleting discount code:', err)
      showMsg('⚠️ Failed to delete discount code')
      setDeleteConfirm(null)
    }
  }

  const handleToggleActive = async (code) => {
    try {
      await updateDiscountCode(code.id, { ...code, is_active: !code.is_active })
      onCodeUpdated()
      showMsg(`✓ Code "${code.code}" ${!code.is_active ? 'activated' : 'deactivated'}`)
    } catch (err) {
      console.error('Error updating discount code:', err)
      showMsg('⚠️ Failed to update discount code')
    }
  }

  if (codes.length === 0) {
    return (
      <div className="discount-codes-table-container">
        <h2>Discount Codes</h2>
        <p className="no-codes">No discount codes found. Create one above!</p>
      </div>
    )
  }

  return (
    <div className="discount-codes-table-container">
      <div className="dc-table-header">
        <h2>Discount Codes ({codes.length})</h2>
        <div className="dc-stats">
          <span className="dc-stat active">✅ {codes.filter(c => c.is_active).length} Active</span>
          <span className="dc-stat inactive">⛔ {codes.filter(c => !c.is_active).length} Inactive</span>
        </div>
      </div>

      {message && (
        <div className={`dc-message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="table-wrapper">
        <table className="discount-codes-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Max Discount</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.id}>
                <td className="code-cell">
                  <span className="code-badge">{code.code}</span>
                </td>
                <td>
                  {code.discount_type === 'percentage' ? (
                    <span className="type-badge percentage">% Percentage</span>
                  ) : (
                    <span className="type-badge flat">₹ Flat</span>
                  )}
                </td>
                <td className="value-cell">
                  {code.discount_type === 'percentage' 
                    ? `${code.discount_value}%` 
                    : `₹${code.discount_value?.toLocaleString('en-IN')}`}
                </td>
                <td>{code.min_order_value ? `₹${code.min_order_value?.toLocaleString('en-IN')}` : '—'}</td>
                <td>{code.max_discount ? `₹${code.max_discount?.toLocaleString('en-IN')}` : '—'}</td>
                <td className="usage-cell">
                  <span className="usage-count">{code.usage_count || 0}</span>
                </td>
                <td>
                  <button
                    className={`status-toggle ${code.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(code)}
                  >
                    {code.is_active ? '✓ Active' : '✕ Inactive'}
                  </button>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => setDeleteConfirm(code)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete Discount Code?</h3>
            <p>Are you sure you want to delete <strong>"{deleteConfirm.code}"</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={() => handleDelete(deleteConfirm.id)}>Yes, Delete</button>
              <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscountCodesTable
