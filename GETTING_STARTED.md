# 🚀 Quick Start Guide

## 1️⃣ Install Dependencies

```bash
# In frontend folder
cd frontend
npm install

# In backend folder (open a new terminal)
cd backend
npm install
```

## 2️⃣ Configure Supabase (Optional - works with demo data without this)

### Create Supabase Project:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key

### Update .env file:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Create Database Table:
Run this SQL in Supabase SQL Editor:

```sql
-- Create coffees table
create table coffees (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  origin text,
  roast_level text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table coffees enable row level security;

-- Create policy to allow all operations (for development)
create policy "Enable all operations for all users"
  on coffees
  for all
  using (true)
  with check (true);
```

## 3️⃣ Run the Applications

### Start Frontend (Customer Site):
```bash
cd frontend
npm run dev
```
Opens at: **http://localhost:5173**

### Start Backend (Admin Panel):
```bash
cd backend
npm run dev
```
Opens at: **http://localhost:5174**

## 4️⃣ Using the Admin Panel

1. Open http://localhost:5174
2. Fill in the coffee form with:
   - Name (e.g., "Ethiopian Yirgacheffe")
   - Origin (e.g., "Ethiopia")
   - Price (e.g., 18.99)
   - Roast Level (select from dropdown)
   - Description (flavor profile)
   - Image URL (optional - uses default if empty)
3. Click "Add Coffee"
4. View your coffee in the table below
5. Check the customer site to see it displayed beautifully!

## ✨ Features

### Customer Website (Frontend):
- ✅ Beautiful hero section with gradient background
- ✅ Responsive coffee card gallery
- ✅ Detailed product pages
- ✅ Smooth animations and hover effects
- ✅ Professional typography with Google Fonts
- ✅ Mobile-friendly design

### Admin Panel (Backend):
- ✅ Add new coffee products
- ✅ View inventory in a table
- ✅ Delete products
- ✅ Real-time statistics (total products, value, origins)
- ✅ Clean, modern dashboard UI
- ✅ Form validation

## 🎨 Customization

### Change Colors:
- Frontend: Edit the gradient values in CSS files
- Backend: Modify colors in Dashboard.css

### Add More Features:
- Edit coffee products (add update functionality)
- User authentication
- Shopping cart
- Order management
- Image upload to Supabase Storage

## 📝 Notes

- The app works with demo data even without Supabase configured
- Both apps run independently on different ports
- Changes in admin panel reflect immediately on customer site
- Uses Vite for fast development and hot reload

Enjoy your coffee website! ☕
