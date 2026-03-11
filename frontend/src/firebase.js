import { initializeApp } from 'firebase/app'
import {
  getFirestore, collection, getDocs, getDoc, doc,
  addDoc, updateDoc, deleteDoc, query, orderBy,
  where, increment, serverTimestamp
} from 'firebase/firestore'
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut as firebaseSignOut, onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:000000000000'
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

// ===== Coffee Operations =====
export const getCoffees = async () => {
  try {
    const q = query(collection(db, 'coffees'), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('getCoffees error:', err)
    throw err
  }
}

export const getCoffeeById = async (id) => {
  const snap = await getDoc(doc(db, 'coffees', id))
  if (!snap.exists()) throw new Error('Coffee not found')
  return { id: snap.id, ...snap.data() }
}

export const addCoffee = async (coffee) => {
  const docRef = await addDoc(collection(db, 'coffees'), {
    ...coffee,
    created_at: serverTimestamp()
  })
  return { id: docRef.id, ...coffee }
}

export const updateCoffee = async (id, updates) => {
  await updateDoc(doc(db, 'coffees', id), { ...updates, updated_at: serverTimestamp() })
  return { id, ...updates }
}

export const deleteCoffee = async (id) => {
  await deleteDoc(doc(db, 'coffees', id))
}

// ===== Discount Code Operations =====
export const getDiscountCodes = async () => {
  try {
    const q = query(collection(db, 'discount_codes'), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('getDiscountCodes error:', err)
    throw err
  }
}

export const getDiscountCodeByCode = async (code) => {
  const q = query(
    collection(db, 'discount_codes'),
    where('code', '==', code.toUpperCase()),
    where('is_active', '==', true)
  )
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Discount code not found or inactive')
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export const addDiscountCode = async (discountCode) => {
  const docRef = await addDoc(collection(db, 'discount_codes'), {
    ...discountCode,
    code: discountCode.code.toUpperCase(),
    created_at: serverTimestamp()
  })
  return { id: docRef.id, ...discountCode }
}

export const updateDiscountCode = async (id, updates) => {
  await updateDoc(doc(db, 'discount_codes', id), updates)
  return { id, ...updates }
}

export const deleteDiscountCode = async (id) => {
  await deleteDoc(doc(db, 'discount_codes', id))
}

export const incrementCodeUsage = async (id) => {
  await updateDoc(doc(db, 'discount_codes', id), {
    usage_count: increment(1)
  })
}

// ===== Orders =====
export const addOrder = async (order) => {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'pending',
    created_at: serverTimestamp()
  })
  return { id: docRef.id, ...order, status: 'pending' }
}

export const getOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('created_at', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('getOrders error:', err)
    throw err
  }
}

export const getUserOrders = async (userId) => {
  try {
    // Use only where() to avoid needing a composite Firestore index,
    // then sort client-side by created_at descending
    const q = query(
      collection(db, 'orders'),
      where('user_id', '==', userId)
    )
    const snap = await getDocs(q)
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return docs.sort((a, b) => {
      const ta = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0)
      const tb = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0)
      return tb - ta
    })
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('getUserOrders error:', err)
    throw err
  }
}

export const updateOrderStatus = async (id, status) => {
  await updateDoc(doc(db, 'orders', id), { status, updated_at: serverTimestamp() })
}

// ===== Firebase Authentication =====
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return {
      data: { user: { id: result.user.uid, uid: result.user.uid, email: result.user.email } },
      error: null
    }
  } catch (err) {
    const messages = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
    }
    return { data: null, error: { message: messages[err.code] || err.message } }
  }
}

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return {
      data: { user: { id: result.user.uid, uid: result.user.uid, email: result.user.email } },
      error: null
    }
  } catch (err) {
    const messages = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/invalid-credential': 'Invalid email or password.',
    }
    return { data: null, error: { message: messages[err.code] || err.message } }
  }
}

export const signOut = async () => {
  await firebaseSignOut(auth)
  return { error: null }
}

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        resolve({ id: user.uid, uid: user.uid, email: user.email })
      } else {
        resolve(null)
      }
    })
  })
}

export const onAuthStateChange = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback(user ? { id: user.uid, uid: user.uid, email: user.email } : null)
  })
  return { data: { subscription: { unsubscribe } } }
}
