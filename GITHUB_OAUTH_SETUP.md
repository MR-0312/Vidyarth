# GitHub OAuth Setup Guide

This document provides instructions for setting up GitHub OAuth authentication for the Vidyarth eBook platform.

## Prerequisites

- GitHub account
- Backend and frontend running locally or deployed

## Step 1: Create a GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **OAuth Apps** → **New OAuth App**
3. Fill in the application registration form:

   - **Application name**: Vidyarth (or your preferred name)
   - **Homepage URL**: 
     - Development: `http://localhost:5173`
     - Production: Your deployed frontend URL
   
   - **Authorization callback URL**: 
     - Development: `http://localhost:5173/oauth/github/callback`
     - Production: `https://yourdomain.com/oauth/github/callback`

4. Click **Register application**

## Step 2: Get Your Credentials

After registering, you'll see:
- **Client ID** - Copy this value
- **Client Secret** - Click "Generate a new client secret" and copy it (you'll only see it once)

## Step 3: Configure Environment Variables

### Backend (.env)

Add the following variables to your backend `.env` file:

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URI=http://localhost:5173/oauth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

For production, update these values:

```env
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
GITHUB_REDIRECT_URI=https://yourdomain.com/oauth/github/callback
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local or .env)

No additional environment variables are needed on the frontend, but ensure:

```env
VITE_API_URL=http://localhost:5000
# or for production:
# VITE_API_URL=https://your-api-domain.com
```

## Step 4: Install Dependencies

If you haven't already, install axios on the backend:

```bash
cd backend
npm install axios
```

## Step 5: Update Database Schema

The database schema has been updated with new fields for OAuth users:
- `github_id` - GitHub user ID
- `github_username` - GitHub username
- `oauth_provider` - OAuth provider name
- `password` - Made nullable for OAuth users

Run your database migrations or execute the updated schema.

## Step 6: Restart Services

1. **Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Testing GitHub OAuth Locally

1. Open http://localhost:5173/login
2. Click the GitHub icon button
3. You'll be redirected to GitHub's authorization page
4. Authorize the application
5. You'll be redirected back to your app and logged in

## How It Works

### OAuth Flow

1. **User initiates login**: User clicks "GitHub" button on login page
2. **Authorization request**: Frontend requests authorization URL from backend (`/api/oauth/github/authorize`)
3. **GitHub redirect**: User is redirected to GitHub to authorize the app
4. **Callback**: GitHub redirects back with an authorization code
5. **Token exchange**: Frontend calls backend callback (`/api/oauth/github/callback`) with the code
6. **User creation/update**: Backend exchanges code for access token, fetches user profile, and creates/updates user in database
7. **Session creation**: Backend generates JWT token and returns it to frontend
8. **User authenticated**: Frontend stores token and user data, then redirects to dashboard/library

### Key Features

- **Auto user creation**: Users are automatically created on first OAuth login
- **Email linking**: If a user with the same email exists, their account is linked to GitHub
- **Password optional**: OAuth users don't need a password to log in
- **Role preservation**: User roles are preserved when accounts are linked

## Troubleshooting

### "OAuth not configured" error

**Solution**: Verify that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in your `.env` file and the backend has been restarted.

### "Failed to get GitHub access token" error

**Solution**: 
1. Check that the authorization code is being sent correctly
2. Verify your Client ID and Client Secret are correct
3. Ensure the redirect URI matches exactly in GitHub settings

### "Authorization failed" on GitHub

**Solution**:
1. Check the Authorization callback URL in GitHub OAuth App settings
2. Ensure it matches exactly: `http://localhost:5173/oauth/github/callback` (for development)
3. For production, update with your domain

### User not being created

**Solution**:
1. Check backend logs for errors
2. Verify Supabase connection is working
3. Ensure the `users` table has the updated schema with OAuth fields

### Token not being stored

**Solution**:
1. Check browser DevTools → Network tab to verify the callback response contains a token
2. Check browser localStorage for `koodoreader_token`
3. Verify no CORS errors in console

## Security Considerations

1. **Never expose Client Secret**: Keep your `GITHUB_CLIENT_SECRET` in environment variables only, never in frontend code
2. **Validate redirects**: Always validate redirect URIs match your registered callback URL
3. **HTTPS in production**: Always use HTTPS for OAuth in production
4. **Token storage**: Consider upgrading to secure, HttpOnly cookies instead of localStorage for token storage
5. **Scope permissions**: The app currently requests `user:email` scope - adjust as needed

## Additional OAuth Providers

To add more OAuth providers (Google, GitHub, etc.), follow the same pattern:

1. Create a new route file: `backend/routes/[provider].ts`
2. Implement the authorization and callback endpoints
3. Update the frontend to add login buttons and handle callbacks
4. Store provider-specific IDs in the database

## Support

For issues or questions:
1. Check GitHub OAuth documentation: https://docs.github.com/en/developers/apps/building-oauth-apps
2. Review the backend logs: `npm run dev` should show errors
3. Check browser console for frontend errors (F12)
