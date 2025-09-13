# Free Play Florida - Deployment Guide

## 🚀 Deploy to Netlify & GitHub

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** in the top right → **"New repository"**
3. Repository settings:
   - **Repository name**: `freeplay-florida-manager`
   - **Description**: `Game management system for Free Play Florida events`
   - **Visibility**: Private (recommended) or Public
   - **Don't** initialize with README (we already have files)
4. Click **"Create repository"**

### Step 2: Push Code to GitHub

Copy and run these commands in your terminal:

```bash
# Add the GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/freeplay-florida-manager.git

# Push code to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your `freeplay-florida-manager` repository
6. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. Click **"Deploy site"**

### Step 4: Configure Environment Variables

In Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add these variables:
   - `VITE_SUPABASE_URL`: `https://rlevjeeykknyrvunqxem.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsZXZqZWV5a2tueXJ2dW5xeGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTk4MDMsImV4cCI6MjA3MzM3NTgwM30._H9LM9MredFBS4ock5-m3QOV9CBD-g3ScZA20fjr5Vc`

### Step 5: Update Supabase Settings

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/rlevjeeykknyrvunqxem
2. Go to **Authentication** → **URL Configuration**
3. Add your Netlify URL to **Site URL** (e.g., `https://your-site-name.netlify.app`)
4. Add the same URL to **Redirect URLs**

### Step 6: Run Database Migrations

In your Supabase dashboard:
1. Go to **SQL Editor**
2. Run the migration files in order:
   - `20250913000000_festival_locations.sql`
   - `20250913000001_freeplay_florida_schema.sql` 
   - `20250913000002_update_game_types.sql`

### Step 7: Test Your Deployment

1. Visit your Netlify URL
2. Test the game submission form
3. Test admin login functionality
4. Verify the marketplace works

## 🎯 Your Site Will Be Live At:

- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: Configure in Netlify settings if desired

## 🔄 Future Updates

To update your site:
1. Make changes locally
2. Commit: `git add . && git commit -m "Your update message"`
3. Push: `git push origin main`
4. Netlify will automatically rebuild and deploy!

## 🆘 Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Docs**: https://docs.github.com
