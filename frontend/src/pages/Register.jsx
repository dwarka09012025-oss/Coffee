import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUpWithEmail } from '../supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Login.css'

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors]     = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!formData.name.trim()) e.name = 'Full name is required'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 6) e.password = 'At least 6 characters'
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
    setServerError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data, error } = await signUpWithEmail(formData.email, formData.password)
      if (error) { setServerError(error.message); return }
      navigate('/')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const strengthLevel = () => {
    const p = formData.password
    if (!p) return 0
    let s = 0
    if (p.length >= 6) s++
    if (p.length >= 10) s++
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
    if (/\d/.test(p)) s++
    if (/[^a-zA-Z0-9]/.test(p)) s++
    return Math.min(s, 4)
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']
  const strength = strengthLevel()

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-visual">
            <div className="auth-visual-content">
              <h2>Join Our Community</h2>
              <p>Create an account to track your orders, save favourites, and get exclusive access to new arrivals.</p>
              <div className="auth-quote">"Good coffee is a pleasure, great coffee is a passion."</div>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-card">
              <div className="auth-header">
                <span className="auth-icon">☕</span>
                <h1>Create Account</h1>
                <p>Join the Artisan Coffee community</p>
              </div>

              {serverError && (
                <div className="server-error">
                  <span>&#9888;</span> {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" autoComplete="email" />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className={`form-field ${errors.password ? 'has-error' : ''}`}>
                  <label htmlFor="password">Password</label>
                  <div className="password-wrap">
                    <input type={showPass ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" />
                    <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="strength-bar" style={{ background: i <= strength ? strengthColors[strength] : '#e2d5cc' }} />
                        ))}
                      </div>
                      <span style={{ color: strengthColors[strength], fontSize: '0.75rem', fontWeight: 600 }}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className={`form-field ${errors.confirmPassword ? 'has-error' : ''}`}>
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" />
                  {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Create Account'}
                </button>
              </form>

              <div className="auth-divider"><span>Already have an account?</span></div>
              <Link to="/login" className="auth-switch-btn">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Register

