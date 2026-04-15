# Admin UI System - Complete Guide

## Overview
A complete admin interface with role-based access control. Admin users get a dedicated dashboard with different UI and only admin-specific functionalities.

## User Roles

### Regular User
- **Home Page**: Browse all books
- **Library**: View uploaded books and manage favorites
- **Upload**: Contribute books to the platform
- **Read**: Read approved books
- **No Access To**: Admin panel, book approval, user management

### Admin User
- **Dashboard**: View statistics and system overview
- **Pending Books**: Approve/reject submitted books
- **User Management**: Promote/demote users
- **Settings**: Configure admin preferences
- **Exclusive Features**: Cannot access regular user library (admin-focused only)

## How It Works

### Login & Redirect
When a user logs in, the system checks their role:
- **Admin User** → Redirected to `/admin/dashboard`
- **Regular User** → Redirected to `/library`

### Navigation
The navbar changes based on user role:
- **Admin Navbar**: Dashboard, Pending Books, Users, Settings
- **User Navbar**: Library, Search bar, Read

### Route Protection
Admin routes are protected with `<AdminRoute>` component that:
- Checks if user is authenticated
- Verifies user has `role === 'admin'`
- Redirects to home if not admin

## Pages & Features

### 1. Admin Dashboard (`/admin/dashboard`)
**Purpose**: Overview of platform statistics

**Features**:
- Total approved books count
- Pending books waiting for review
- Rejected books count
- Total books on platform
- Real-time statistics updates

**Styling**: Card-based layout with icons and color-coding

### 2. Pending Books (`/admin/pending-books`)
**Purpose**: Review and approve/reject user submissions

**Features**:
- List of all pending books
- Click to view full details
- Preview book information (cover, title, author, description)
- Approve with optional reason
- Reject with required reason
- All actions logged in activity system

**Layout**: 
- Left panel: Books list (scrollable)
- Right panel: Selected book details + action buttons

### 3. User Management (`/admin/users`)
**Purpose**: Manage user roles

**Features**:
- Promote regular user to admin
- Demote admin to regular user
- Cannot demote self (safety feature)
- Edit by user ID
- Information about role capabilities

**Safety**: Requires confirmation for role changes

### 4. Admin Settings (`/admin/settings`)
**Purpose**: Configure admin preferences

**Features**:
- System information display
- Admin notification preferences
- Dashboard settings
- Security information
- Help & documentation links
- Save/Reset options (placeholder for future implementation)

## Authentication & JWT

JWT token now includes user role:
```json
{
  "user": {
    "id": "uuid",
    "role": "admin" | "user"
  }
}
```

### Storage
User data stored in localStorage:
```json
{
  "id": "uuid",
  "username": "admin_user",
  "email": "admin@example.com",
  "role": "admin"
}
```

## Component Structure

### Created Components
1. **AdminRoute.tsx** - Route protection component
2. **AdminLayout.tsx** - Main admin layout wrapper
3. **AdminDashboard.tsx** - Dashboard page
4. **PendingBooks.tsx** - Book review page
5. **UserManagement.tsx** - User role management
6. **AdminSettings.tsx** - Settings page

### Updated Components
1. **AuthContext.tsx** - Added role field and isAdmin state
2. **Navbar.tsx** - Role-based navigation
3. **Login.tsx** - Handles role from API response
4. **App.jsx** - Added admin routes and imports

## Styling

### Admin Styles (`admin.css`)
Dark modern design with:
- **Sidebar**: Gradient purple background, fixed left side
- **Cards**: White cards with shadows and hover effects
- **Colors**: 
  - Primary: #667eea, #764ba2 (sidebar gradient)
  - Approved: Green (#4caf50)
  - Pending: Orange (#ff9800)
  - Rejected: Red (#f44336)
  - Info: Blue (#1976d2)
- **Responsive**: Mobile-first approach

## API Integration

### Endpoints Used
```
GET  /api/admin/stats              → Dashboard statistics
GET  /api/admin/books/pending      → Pending books list
PUT  /api/admin/books/:id/approve  → Approve book
PUT  /api/admin/books/:id/reject   → Reject book
PATCH /api/admin/users/:id/role    → Change user role
POST /api/auth/login               → Login (returns role)
GET  /api/auth/user                → Fetch user profile
```

## Backend Setup Required

### 1. Database
Add role column to users table:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));
```

### 2. User Creation
Create first admin via SQL:
```sql
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$...', 'admin');
```

## Key Features

### ✅ Role-Based UI
- Different layouts for admin and users
- Admin-only navigation
- Conditional rendering based on role

### ✅ Protected Routes
- Cannot access admin pages without admin role
- Automatic redirect on unauthorized access
- Token-based authentication

### ✅ Admin Functionality
- Book approval workflow
- User role management
- Real-time statistics
- Configurable settings

### ✅ User Experience
- Clean, modern interface
- Responsive design
- Large touch targets
- Clear visual hierarchy
- Icon-based navigation

### ✅ Security
- Role validation on every admin request
- Self-demotion prevention
- Token-based auth
- Confirmation dialogs for critical actions

## File Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── AdminLayout.tsx    (NEW)
│   │   ├── AdminRoute.tsx      (NEW)
│   │   ├── Navbar.tsx          (UPDATED)
│   │   └── ...
│   ├── pages/
│   │   ├── AdminDashboard.tsx  (NEW)
│   │   ├── AdminSettings.tsx   (NEW)
│   │   ├── PendingBooks.tsx    (NEW)
│   │   ├── UserManagement.tsx  (NEW)
│   │   ├── Login.tsx           (UPDATED)
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.tsx     (UPDATED)
│   ├── styles/
│   │   ├── admin.css           (NEW)
│   │   └── ...
│   ├── App.jsx                 (UPDATED)
│   └── main.tsx                (UPDATED)
```

## Development Tips

### Adding New Admin Pages
1. Create component in `pages/AdminXxx.tsx`
2. Import `AdminLayout` from components
3. Wrap content in `<AdminLayout>{children}</AdminLayout>`
4. Add route in `App.jsx` with `<AdminRoute>`
5. Add link in `AdminLayout.tsx` sidebar

### Styling Admin Components
- Use CSS classes from `admin.css`
- Follow existing color scheme
- Use flexbox/grid for layouts
- Always include hover states

### API Calls
- Get token: `localStorage.getItem("koodoreader_token")`
- Add to headers: `"x-auth-token": token`
- Handle 403 Forbidden (not admin)
- Handle 401 Unauthorized (not authenticated)

## Testing

### Test Admin Access
1. Create user in database
2. Promote to admin via SQL
3. Login as admin
4. Should redirect to `/admin/dashboard`
5. Regular user links should be hidden

### Test Role Changes
1. Login as admin
2. Use User Management page
3. Change user role
4. User sees updated navbar on next login

### Test Pending Books
1. Upload book as regular user (puts in pending)
2. Login as admin
3. Go to Pending Books
4. Approve/reject book
5. Check creator sees update

## Future Enhancements
- Admin activity logs dashboard
- Book edit functionality (change metadata)
- User search and filtering
- Email notifications for approvals
- Bulk book operations
- User ban/suspend functionality
- Advanced statistics and charts
- Admin privilege levels (super-admin, moderator)
- Book deletion with confirmation
- Detailed audit trail
