import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const { initializeApp } = require('./frontend/node_modules/firebase/app/dist/index.cjs.js')
const { getAuth, createUserWithEmailAndPassword } = require('./frontend/node_modules/firebase/auth/dist/index.cjs.js')

const firebaseConfig = {
  apiKey: "AIzaSyBvl-IYJmoFY__MAiFhWSjfWCp2xeNywi4",
  authDomain: "coffee-85d20.firebaseapp.com",
  projectId: "coffee-85d20",
  storageBucket: "coffee-85d20.firebasestorage.app",
  messagingSenderId: "825754108199",
  appId: "1:825754108199:web:5736645a886c75c3392902"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// ── Admin credentials ──────────────────────────────
const ADMIN_EMAIL    = "admin@coffeeshop.com"
const ADMIN_PASSWORD = "Admin@1234"
// ──────────────────────────────────────────────────

async function createAdmin() {
  try {
    const result = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
    console.log('\n✅ Admin user created successfully!')
    console.log(`   Email   : ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`   UID     : ${result.user.uid}`)
    console.log('\n👉 Use these credentials to log into the admin panel.')
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('\n✅ Admin user already exists.')
      console.log(`   Email   : ${ADMIN_EMAIL}`)
      console.log(`   Password: ${ADMIN_PASSWORD}`)
    } else {
      console.error('\n❌ Error:', err.message)
    }
  }
  process.exit(0)
}

createAdmin()
