import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors]     = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Enter a valid email'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 6) e.password = 'Password must be at least 6 characters'
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
    setServerError('')
    try {
      const { data, error } = await signInWithEmail(formData.email, formData.password)
      if (error) { setServerError(error.message); return }
      navigate('/')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="auth-page">
        <div className="auth-split">
          <div className="auth-visual">
            <div className="auth-visual-content">
              <h2>Welcome Back</h2>
              <p>Sign in to access your orders, wishlist, and exclusive offers.</p>
              <div className="auth-quote">"Coffee is a language in itself."</div>
            </div>
          </div>

          <div className="auth-form-side">
            <div className="auth-card">
              <div className="auth-header">
                <span className="auth-icon">☕</span>
                <h1>Sign In</h1>
                <p>Welcome back to Artisan Coffee</p>
              </div>

              {serverError && (
                <div className="server-error">
                  <span>&#9888;</span> {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className={`form-field ${errors.password ? 'has-error' : ''}`}>
                  <label htmlFor="password">Password</label>
                  <div className="password-wrap">
                    <input
                      type={showPass ? 'text' : 'password'} id="password" name="password"
                      value={formData.password} onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Sign In'}
                </button>
              </form>

              <div className="auth-divider"><span>New to Artisan Coffee?</span></div>
              <Link to="/register" className="auth-switch-btn">Create an Account</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Login

