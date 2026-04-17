# Frontend — Component & Page Reference

React 19 + Vite + TypeScript SPA for Vidyarth.

---

## Table of Contents

- [Setup](#setup)
- [Scripts](#scripts)
- [Routing](#routing)
- [Pages](#pages)
- [Components](#components)
- [Context](#context)
- [Services & State](#services--state)
- [Styling](#styling)

---

## Setup

```bash
cd frontend
npm install
npm run dev     # starts on http://localhost:5173
```

---

## Scripts

| Script           | Description                                          |
|------------------|------------------------------------------------------|
| `npm run dev`    | Start Vite dev server with hot module replacement    |
| `npm run build`  | Type-check and produce a production build in `dist/` |
| `npm run preview`| Serve the production build locally                   |
| `npm run lint`   | Run ESLint across the project                        |

---

## Routing

Routes are declared in `App.tsx` using React Router v7.

| Path                    | Component            | Auth Required | Admin Only |
|-------------------------|----------------------|:-------------:|:----------:|
| `/`                     | `Home`               | —             | —          |
| `/login`                | `Login`              | —             | —          |
| `/signup`               | `Signup`             | —             | —          |
| `/library`              | `Library`            | ✅            | —          |
| `/read/:bookId`         | `Read`               | ✅            | —          |
| `/admin/dashboard`      | `AdminDashboard`     | ✅            | ✅         |
| `/admin/pending-books`  | `PendingBooks`       | ✅            | ✅         |
| `/admin/users`          | `UserManagement`     | ✅            | ✅         |
| `/admin/settings`       | `AdminSettings`      | ✅            | ✅         |
| `*`                     | `NotFound`           | —             | —          |

Route protection is handled by two wrapper components:
- `ProtectedRoute` — redirects unauthenticated users to `/login`.
- `AdminRoute` — redirects non-admin users to `/`.

---

## Pages

### `Home` (`/`)

Landing page. Displays a hero section and browsable book carousels. Unauthenticated visitors can browse but not read books.

---

### `Login` (`/login`)

Email + password login form. On success the JWT token and user object (including `role`) are stored in `localStorage` under `koodoreader_token` and `koodoreader_user`. Admin users are redirected to `/admin/dashboard`; regular users to `/library`.

---

### `Signup` (`/signup`)

Registration form. Collects username, email, and password. Automatically logs the user in after successful registration.

---

### `Library` (`/library`)

Protected page for authenticated users. Shows:
- The user's uploaded books (including pending ones)
- The user's favorites
- Upload button that opens the `UploadModal`

---

### `Read` (`/read/:bookId`)

Protected page. Loads the e-book file for the given book ID and renders it inline with chapter navigation. Includes an in-page translation panel powered by `POST /api/translate`.

---

### `BookPreview`

Displays full book metadata, cover image, description, average rating, and the review list. Contains a "Read" button for authenticated users.

---

### `NotFound` (`*`)

Generic 404 page shown for any unmatched route.

---

### `AdminDashboard` (`/admin/dashboard`)

Admin-only page. Fetches statistics from `GET /api/admin/stats` and displays card widgets for:
- Total approved books
- Pending books
- Rejected books
- Total books

---

### `PendingBooks` (`/admin/pending-books`)

Admin-only page. Split-panel layout:
- **Left**: Scrollable list of pending submissions
- **Right**: Selected book details with Approve / Reject action buttons

---

### `UserManagement` (`/admin/users`)

Admin-only page. Allows searching users by ID and changing their role between `user` and `admin`. Prevents an admin from demoting their own account.

---

### `AdminSettings` (`/admin/settings`)

Admin-only page. Displays system information (platform name, API URL, version) and placeholder preference controls.

---

## Components

### `Navbar`

Top navigation bar. Renders different links depending on the user's role:
- **Unauthenticated**: Login, Sign Up
- **Regular user**: Library, search bar
- **Admin**: Dashboard, Pending Books, Users, Settings

---

### `Footer`

Site-wide footer rendered on all pages.

---

### `ProtectedRoute`

Wrapper component. Checks `isAuthenticated` from `AuthContext`. Redirects to `/login` if the user is not logged in.

```tsx
<ProtectedRoute>
  <Library />
</ProtectedRoute>
```

---

### `AdminRoute`

Wrapper component. Checks both `isAuthenticated` and `isAdmin` from `AuthContext`. Redirects to `/` if either check fails.

```tsx
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

---

### `AdminLayout`

Layout wrapper used by all admin pages. Renders the fixed sidebar navigation (Dashboard, Pending Books, User Management, Settings) alongside the page content.

---

### `UploadModal`

Modal dialog for uploading a new book contribution. Fields:
- Title, Author, Description
- Categories (multi-select)
- Cover image file picker
- E-book file picker (EPUB / MOBI / AZW3)
- Toggle to track the upload as a personal contribution

---

### `BookCarousel`

Horizontal scrollable carousel of book cards built with Swiper. Used on the Home page to show curated book lists.

---

### `BookShelf`

Grid display of book cards. Used in the Library page.

---

### `Sidebar`

Collapsible sidebar for the reader page (`Read`). Lists book chapters and allows quick navigation.

---

## Context

### `AuthContext` (`src/context/AuthContext.tsx`)

Provides authentication state to the entire app via `AuthProvider`.

| Value             | Type                     | Description                                         |
|-------------------|--------------------------|-----------------------------------------------------|
| `user`            | `User \| null`           | Currently authenticated user object                |
| `isAuthenticated` | `boolean`                | `true` when a valid session exists                 |
| `isAdmin`         | `boolean`                | `true` when `user.role === 'admin'`                |
| `login(user)`     | `(User) => void`         | Store user and token, update state                 |
| `logout()`        | `() => Promise<void>`    | Call `POST /api/users/logout`, clear localStorage  |
| `validateToken()` | `() => Promise<boolean>` | Verify token against `GET /api/auth/user`          |

Token is stored in `localStorage` as `koodoreader_token`.  
User object is stored as `koodoreader_user`.

---

### `ThemeContext` (`src/context/ThemeContext.tsx`)

Provides a light/dark theme toggle across the application.

---

## Services & State

### `src/services/bookService.ts`

Helper functions for book-related API calls (fetch books, upload, delete, etc.).

### `src/store/uiStore.ts`

[Zustand](https://zustand-demo.pmnd.rs/) store for transient UI state (e.g. modal open/close flags).

---

## Styling

| File / Folder          | Description                                  |
|------------------------|----------------------------------------------|
| `src/styles/App.css`   | Global base styles and CSS reset             |
| `src/styles/admin.css` | Styles for all admin pages and components    |
| `tailwind.config.js`   | Tailwind CSS configuration                   |
| `src/index.css`        | Tailwind base directives                     |

### Admin colour palette

| Usage      | Colour                        |
|------------|-------------------------------|
| Sidebar    | Gradient `#667eea → #764ba2`  |
| Approved   | Green `#4caf50`               |
| Pending    | Orange `#ff9800`              |
| Rejected   | Red `#f44336`                 |
| Info / Link| Blue `#1976d2`                |

---

## Adding a New Admin Page

1. Create `src/pages/AdminMyPage.tsx` and import `AdminLayout`.
2. Wrap your content: `<AdminLayout>…</AdminLayout>`.
3. Add a route in `App.tsx` wrapped in `<AdminRoute>`.
4. Add a sidebar link in `AdminLayout.tsx`.

```tsx
// App.tsx
<Route
  path="/admin/my-page"
  element={
    <AdminRoute>
      <AdminMyPage />
    </AdminRoute>
  }
/>
```
