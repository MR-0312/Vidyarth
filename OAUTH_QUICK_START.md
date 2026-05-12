# GitHub OAuth - Quick Start Guide

## 5-Minute Setup

### Step 1: Create GitHub OAuth App (2 minutes)

1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **App name**: Vidyarth
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/oauth/github/callback`
4. Click **Register application**
5. Copy **Client ID** and generate **Client Secret**

### Step 2: Configure Backend (1 minute)

Create or update `backend/.env`:

```env
GITHUB_CLIENT_ID=paste_your_client_id_here
GITHUB_CLIENT_SECRET=paste_your_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5173/oauth/github/callback
FRONTEND_URL=http://localhost:5173
```

### Step 3: Install Dependencies (1 minute)

```bash
cd backend
npm install
```

### Step 4: Start Your App (1 minute)

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Step 5: Test It!

1. Open http://localhost:5173/login
2. Click the GitHub button
3. Authorize the app
4. You're logged in! 🎉

## What's Changed?

✅ Backend can now handle GitHub login
✅ Login page has GitHub button that works
✅ Users are auto-created from GitHub data
✅ Token-based authentication works
✅ Activity logging includes OAuth logins

## Production Setup

When deploying:

1. Create new GitHub OAuth app with production URLs
2. Update `.env` variables:
   ```env
   GITHUB_REDIRECT_URI=https://yourdomain.com/oauth/github/callback
   FRONTEND_URL=https://yourdomain.com
   ```
3. Redeploy backend and frontend

## Troubleshooting

**"OAuth not configured" error**
- Add credentials to `.env`
- Restart backend

**"Failed to get GitHub access token"**
- Verify Client ID and Secret are correct
- Check that callback URL matches exactly in GitHub settings

**GitHub redirect not working**
- Check browser console for errors
- Verify `GITHUB_REDIRECT_URI` matches your app URL

## Need More Help?

See `GITHUB_OAUTH_SETUP.md` for detailed setup instructions.

---

That's it! Your app now supports GitHub login. 🚀
