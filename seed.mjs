// Run from the cofee root: node --experimental-require-module seed.mjs
// Or as CJS via frontend node_modules
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const { initializeApp } = require('./frontend/node_modules/firebase/app/dist/index.cjs.js')
const { getFirestore, collection, addDoc, serverTimestamp } = require('./frontend/node_modules/firebase/firestore/dist/index.cjs.js')

const firebaseConfig = {
  apiKey: "AIzaSyBvl-IYJmoFY__MAiFhWSjfWCp2xeNywi4",
  authDomain: "coffee-85d20.firebaseapp.com",
  projectId: "coffee-85d20",
  storageBucket: "coffee-85d20.firebasestorage.app",
  messagingSenderId: "825754108199",
  appId: "1:825754108199:web:5736645a886c75c3392902"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const COFFEES = [
  { name: "Ethiopian Yirgacheffe", origin: "Ethiopia", price: 1499, roast_level: "Light", description: "Bright and floral with notes of jasmine, bergamot, and a citrusy lemon finish.", image_url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Colombian Supremo", origin: "Colombia", price: 1299, roast_level: "Medium", description: "A classic well-balanced cup with caramel sweetness, mild nuttiness, and a clean smooth finish.", image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Sumatra Mandheling", origin: "Indonesia", price: 1399, roast_level: "Dark", description: "Full-bodied and earthy with notes of dark chocolate, cedar, and a lingering smoky finish.", image_url: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Kenya AA", origin: "Kenya", price: 1649, roast_level: "Medium-Light", description: "Vibrant and wine-like with blackcurrant, tomato, and bright acidity. One of the world's most distinctive coffees.", image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Guatemala Antigua", origin: "Guatemala", price: 1199, roast_level: "Medium", description: "Rich and spicy with notes of dark cocoa, brown sugar, and a subtle smokiness.", image_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Brazil Santos", origin: "Brazil", price: 999, roast_level: "Medium-Dark", description: "Mild and low-acid with notes of milk chocolate, peanut, and a smooth buttery body.", image_url: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Costa Rica Tarrazu", origin: "Costa Rica", price: 1549, roast_level: "Light", description: "Clean and bright with peach, honey, and a delicate floral sweetness. Grown at high altitude.", image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80", in_stock: true, weight_grams: 250 },
  { name: "Yemen Mocha", origin: "Yemen", price: 1899, roast_level: "Medium", description: "Ancient and complex with wild blueberry, dark chocolate, and wine overtones.", image_url: "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80", in_stock: true, weight_grams: 250 }
]

const DISCOUNT_CODES = [
  { code: "WELCOME10", discount_type: "percentage", discount_value: 10, min_order_value: 500, max_discount: 200, is_active: true, usage_count: 0 },
  { code: "FLAT200", discount_type: "flat", discount_value: 200, min_order_value: 1500, max_discount: 200, is_active: true, usage_count: 0 }
]

async function seed() {
  console.log('🚀 Seeding Firestore...\n')

  console.log('📦 Adding coffee products...')
  for (const coffee of COFFEES) {
    await addDoc(collection(db, 'coffees'), { ...coffee, created_at: serverTimestamp() })
    console.log(`  ✅ ${coffee.name}`)
  }

  console.log('\n🎫 Adding discount codes...')
  for (const code of DISCOUNT_CODES) {
    await addDoc(collection(db, 'discount_codes'), { ...code, created_at: serverTimestamp() })
    console.log(`  ✅ ${code.code}`)
  }

  console.log('\n🎉 Done! Firestore seeded successfully.')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
