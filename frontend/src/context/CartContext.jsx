import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('coffeeCart')
    const savedWishlist = localStorage.getItem('coffeeWishlist')
    if (savedCart) setCart(JSON.parse(savedCart))
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
  }, [])

  useEffect(() => { localStorage.setItem('coffeeCart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('coffeeWishlist', JSON.stringify(wishlist)) }, [wishlist])

  const addToCart = (coffee, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === coffee.id)
      if (existing) {
        return prev.map(item =>
          item.id === coffee.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { ...coffee, quantity }]
    })
  }

  const removeFromCart = (coffeeId) => setCart(prev => prev.filter(item => item.id !== coffeeId))

  const updateQuantity = (coffeeId, quantity) => {
    if (quantity <= 0) { removeFromCart(coffeeId); return }
    setCart(prev => prev.map(item => item.id === coffeeId ? { ...item, quantity } : item))
  }

  const clearCart = () => setCart([])

  const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0)

  // Wishlist
  const toggleWishlist = (coffee) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === coffee.id)
      return exists ? prev.filter(item => item.id !== coffee.id) : [...prev, coffee]
    })
  }

  const isInWishlist = (coffeeId) => wishlist.some(item => item.id === coffeeId)

  return (
    <CartContext.Provider value={{
      cart, wishlist,
      addToCart, removeFromCart, updateQuantity, clearCart,
      getCartTotal, getCartCount,
      toggleWishlist, isInWishlist
    }}>
      {children}
    </CartContext.Provider>
  )
}
