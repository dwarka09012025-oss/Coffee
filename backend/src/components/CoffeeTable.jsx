import React, { useState } from 'react'
import { deleteCoffee, updateCoffee } from '../supabase'
import './CoffeeTable.css'

const ROAST_LEVELS = ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark']

const CoffeeTable = ({ coffees, onCoffeeDeleted, onCoffeeUpdated }) => {
  const [search, setSearch] = useState('')
  const [roastFilter, setRoastFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const filtered = coffees.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.origin || '').toLowerCase().includes(search.toLowerCase())
    const matchRoast = roastFilter === 'all' || c.roast_level === roastFilter
    return matchSearch && matchRoast
  })

  const startEdit = (coffee) => {
    setEditingId(coffee.id)
    setEditData({ ...coffee })
    setMessage('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await updateCoffee(editingId, {
        name: editData.name,
        origin: editData.origin,
        roast_level: editData.roast_level,
        price: parseFloat(editData.price),
        description: editData.description,
        image_url: editData.image_url
      })
      setEditingId(null)
      setMessage('✓ Coffee updated successfully!')
      if (onCoffeeUpdated) onCoffeeUpdated()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error updating coffee:', err)
      setMessage('⚠️ Failed to update: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (id) => {
    try {
      await deleteCoffee(id)
      setDeleteConfirm(null)
      setMessage('✓ Coffee deleted!')
      if (onCoffeeDeleted) onCoffeeDeleted()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting coffee:', err)
      setMessage('⚠️ Failed to delete: ' + err.message)
      setDeleteConfirm(null)
    }
  }

  return (
    <div className="coffee-table-container">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <h2>Coffee Inventory ({filtered.length}{filtered.length !== coffees.length ? ` of ${coffees.length}` : ''})</h2>
        </div>
        <div className="toolbar-right">
          <input
            type="text"
            className="table-search"
            placeholder="🔍 Search by name or origin…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="table-filter"
            value={roastFilter}
            onChange={e => setRoastFilter(e.target.value)}
          >
            <option value="all">All Roasts</option>
            {ROAST_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {message && (
        <div className={`table-message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {coffees.length === 0 ? (
        <div className="empty-table">
          <p>No coffees added yet. Add your first coffee using the form above!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-table">
          <p>No coffees match your search. <button className="link-btn" onClick={() => { setSearch(''); setRoastFilter('all') }}>Clear filters</button></p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="coffee-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Origin</th>
                <th>Roast</th>
                <th>Price (₹)</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coffee) => (
                <tr key={coffee.id} className={editingId === coffee.id ? 'editing-row' : ''}>
                  {editingId === coffee.id ? (
                    <>
                      <td>
                        <input
                          className="edit-input small"
                          type="text"
                          value={editData.image_url || ''}
                          onChange={e => setEditData(d => ({ ...d, image_url: e.target.value }))}
                          placeholder="Image URL"
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          type="text"
                          value={editData.name || ''}
                          onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input small"
                          type="text"
                          value={editData.origin || ''}
                          onChange={e => setEditData(d => ({ ...d, origin: e.target.value }))}
                        />
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editData.roast_level || 'Medium'}
                          onChange={e => setEditData(d => ({ ...d, roast_level: e.target.value }))}
                        >
                          {ROAST_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>
                        <input
                          className="edit-input small"
                          type="number"
                          value={editData.price || ''}
                          onChange={e => setEditData(d => ({ ...d, price: e.target.value }))}
                          min="0"
                        />
                      </td>
                      <td>
                        <textarea
                          className="edit-textarea"
                          value={editData.description || ''}
                          onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                          rows={2}
                        />
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="save-button" onClick={saveEdit} disabled={saving}>
                            {saving ? '…' : '✓ Save'}
                          </button>
                          <button className="cancel-button" onClick={cancelEdit}>✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <img
                          src={coffee.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100'}
                          alt={coffee.name}
                          className="table-image"
                        />
                      </td>
                      <td className="coffee-name">{coffee.name}</td>
                      <td>{coffee.origin}</td>
                      <td><span className="roast-badge">{coffee.roast_level}</span></td>
                      <td className="price">₹{coffee.price?.toLocaleString('en-IN')}</td>
                      <td className="description">{coffee.description?.substring(0, 60)}{coffee.description?.length > 60 ? '…' : ''}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-button" onClick={() => startEdit(coffee)}>✏️ Edit</button>
                          <button className="delete-button" onClick={() => setDeleteConfirm(coffee)}>🗑️ Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Delete Coffee?</h3>
            <p>Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>? This cannot be undone.</p>
            <div className="modal-actions">
              <button className="delete-button" onClick={() => confirmDelete(deleteConfirm.id)}>Yes, Delete</button>
              <button className="cancel-button" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoffeeTable

