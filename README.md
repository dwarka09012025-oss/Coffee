# ☕ Coffee Website

A beautiful coffee showcase website with customer-facing frontend and admin panel.

## Features

- **Frontend**: Browse coffee products with beautiful gallery
- **Backend**: Admin panel to add and manage coffee products
- **Supabase**: Cloud database for storing coffee data

## Setup

1. Install dependencies:
   ```bash
   # In frontend folder
   cd frontend
   npm install
   
   # In backend folder
   cd ../backend
   npm install
   ```

2. Configure Supabase (optional - works with demo data):
   - Add your Supabase URL and API Key to `.env` file in the root

3. Run the applications:
   ```bash
   # Frontend (Customer site) - http://localhost:5173
   cd frontend
   npm run dev
   
   # Backend (Admin panel) - http://localhost:5174
   cd backend
   npm run dev
   ```

## Database Schema

Create a table named `coffees` in Supabase with:
- `id` (uuid, primary key)
- `name` (text)
- `description` (text)
- `price` (numeric)
- `image_url` (text)
- `origin` (text)
- `roast_level` (text)
- `created_at` (timestamp)
