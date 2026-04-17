# Backend — API Reference

Express + TypeScript REST API for Vidyarth.

---

## Table of Contents

- [Setup](#setup)
- [Scripts](#scripts)
- [Middleware](#middleware)
- [Services](#services)
- [Database](#database)
- [API Endpoints](#api-endpoints)
  - [Health](#health)
  - [Auth](#auth)
  - [Users](#users)
  - [Books](#books)
  - [Favorites](#favorites)
  - [Reviews](#reviews)
  - [Contributions](#contributions)
  - [Analytics](#analytics)
  - [Translation](#translation)
  - [Admin — Books](#admin--books)
  - [Admin — Users](#admin--users)
  - [Admin — Statistics](#admin--statistics)

---

## Setup

```bash
cd backend
npm install
```

Create a `.env` file (see root [README.md](../README.md#environment-variables)) then run:

```bash
npm run dev        # development with ts-node
```

---

## Scripts

| Script         | Description                                      |
|----------------|--------------------------------------------------|
| `npm run dev`  | Run server in development mode with `ts-node`    |
| `npm run dev:watch` | Same as `dev` but auto-restarts on changes  |
| `npm run build`| Compile TypeScript to `dist/`                    |
| `npm start`    | Run compiled output (`dist/server.js`)           |

---

## Middleware

| File                   | Purpose                                                                                 |
|------------------------|-----------------------------------------------------------------------------------------|
| `auth.ts`              | Validates the `x-auth-token` JWT header. Pass `false` to make authentication optional. |
| `admin.ts`             | Extends `auth` — additionally requires `role === 'admin'`, returns 403 otherwise.      |
| `upload.ts`            | Configures Multer for in-memory file uploads (max 50 MB).                              |
| `activityLogger.ts`    | Logs each incoming request for debugging and audit purposes.                           |

---

## Services

| File                      | Purpose                                                                              |
|---------------------------|--------------------------------------------------------------------------------------|
| `storageService.ts`       | Upload and delete files in Supabase Storage buckets (`book-covers`, `ebooks`).      |
| `loggingService.ts`       | Record user activity events to the `user_activities` table.                         |
| `ebookParserService.ts`   | Extract chapter list from EPUB, MOBI, and AZW3 files after upload.                  |
| `chapterParsingService.ts`| Low-level XML/ZIP parsing utilities used by `ebookParserService`.                   |
| `translationService.ts`   | Splits long text into chunks and translates each via Google Translate.               |
| `tokenBlacklist.ts`       | In-memory set of invalidated JWT tokens; checked on every authenticated request.    |

---

## Database

Tables are defined in `db/schema.sql`. All queries are centralised in `db/queries.ts`.

| Table              | Description                                                  |
|--------------------|--------------------------------------------------------------|
| `users`            | Registered users with role (`user` / `admin`)               |
| `books`            | E-book metadata; status can be `pending`, `approved`, `rejected` |
| `reviews`          | Star ratings (1–5) and comments per book, one per user       |
| `contributions`    | Links a book submission to the logged-in user who submitted it |
| `favorites`        | Many-to-many relationship between users and books            |
| `chapters`         | Chapter metadata extracted from uploaded e-book files        |
| `user_activities`  | Timestamped audit log of every notable user action           |

---

## API Endpoints

All endpoints are prefixed with `/api`.  
Authentication header: `x-auth-token: <JWT>`

### Health

| Method | Path      | Auth | Description              |
|--------|-----------|------|--------------------------|
| GET    | `/health` | —    | Returns server status and current timestamp |

**Response**
```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

---

### Auth

Base path: `/api/auth`

#### `POST /api/auth/register`

Register a new user account.

**Body**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response** `200`
```json
{ "token": "<JWT>", "userId": "<uuid>", "role": "user" }
```

---

#### `POST /api/auth/login`

Log in with email and password.

**Body**
```json
{ "email": "string", "password": "string" }
```

**Response** `200`
```json
{ "token": "<JWT>", "userId": "<uuid>", "role": "user" | "admin" }
```

---

#### `GET /api/auth/user`

Get the profile of the currently authenticated user.

**Auth**: Required

**Response** `200` — user object

---

#### `POST /api/auth/setup-admin`

Promote an existing user account to the `admin` role. Intended for first-time setup only.

**Body**
```json
{
  "email": "string",
  "password": "string",
  "adminToken": "string"   // Required only if ADMIN_SETUP_TOKEN env var is set
}
```

**Response** `200`
```json
{ "msg": "Admin user created successfully", "userId": "<uuid>", "role": "admin" }
```

---

### Users

Base path: `/api/users`

#### `GET /api/users/me`

Get the authenticated user's own profile.

**Auth**: Required

---

#### `GET /api/users/:userId`

Get any user's public profile by ID.

**Auth**: Not required

---

#### `PUT /api/users/profile`

Update the authenticated user's bio, preferred categories, and/or profile picture.

**Auth**: Required  
**Content-Type**: `multipart/form-data`

| Field                 | Type      | Required | Description                          |
|-----------------------|-----------|----------|--------------------------------------|
| `bio`                 | string    | ✅       | Short biography text                 |
| `preferredCategories` | string[]  | ✅       | Array of category names              |
| `profilePicture`      | file      | ❌       | Image file to replace current avatar |

---

#### `POST /api/users/logout`

Blacklist the current JWT token so it can no longer be used.

**Auth**: Required

**Response** `200`
```json
{ "msg": "Logged out successfully" }
```

---

### Books

Base path: `/api/books`

#### `GET /api/books`

List all **approved** books with pagination and optional category filter.

**Auth**: Not required

| Query param | Default | Description                         |
|-------------|---------|-------------------------------------|
| `page`      | `1`     | Page number                         |
| `limit`     | `10`    | Results per page                    |
| `category`  | —       | Filter by a single category name    |

**Response** `200`
```json
{
  "books": [...],
  "currentPage": 1,
  "totalPages": 5,
  "totalBooks": 48
}
```

---

#### `GET /api/books/:bookId`

Get a single book by ID.

- Returns `404` for non-existent or non-approved books unless the requester is the contributor or an admin.

**Auth**: Optional (required to see own pending/rejected submissions)

---

#### `POST /api/books`

Upload a new book. The book enters `pending` status and must be approved by an admin before it is publicly visible.

**Auth**: Required  
**Content-Type**: `multipart/form-data`

| Field        | Type     | Required | Description                              |
|--------------|----------|----------|------------------------------------------|
| `title`      | string   | ✅       |                                          |
| `author`     | string   | ✅       |                                          |
| `description`| string   | ✅       |                                          |
| `categories` | string[] | ✅       | At least one category                    |
| `cover`      | file     | ✅       | Cover image                              |
| `ebook`      | file     | ✅       | EPUB, MOBI, or AZW3                      |

**Response** `200`
```json
{
  "msg": "Book uploaded successfully",
  "book": { ... },
  "chaptersExtracted": 12
}
```

---

#### `DELETE /api/books/:bookId`

Delete a book and its associated storage files.

**Auth**: Required (owner or admin)

---

### Favorites

Base path: `/api/favorites`

All endpoints require authentication.

| Method | Path                    | Description                                  |
|--------|-------------------------|----------------------------------------------|
| GET    | `/api/favorites`        | Get all favorite books for the current user  |
| POST   | `/api/favorites/:bookId`| Add a book to favorites                      |
| DELETE | `/api/favorites/:bookId`| Remove a book from favorites                 |

---

### Reviews

Base path: `/api/reviews`

#### `POST /api/reviews/:bookId`

Submit a review for a book. Each user may review a given book only once.

**Auth**: Required

**Body**
```json
{ "rating": 1-5, "comment": "string" }
```

---

#### `GET /api/reviews/:bookId`

Get all reviews for a book.

**Auth**: Not required

---

### Contributions

Base path: `/api/contributions`

#### `POST /api/contributions`

Submit a book contribution. Works for both authenticated and anonymous users.

**Auth**: Optional  
**Content-Type**: `multipart/form-data`

| Field                | Type     | Required | Description                                                    |
|----------------------|----------|----------|----------------------------------------------------------------|
| `title`              | string   | ✅       |                                                                |
| `author`             | string   | ✅       |                                                                |
| `description`        | string   | ✅       |                                                                |
| `categories`         | string[] | ❌       | At least one category recommended                              |
| `cover`              | file     | ✅       | Cover image                                                    |
| `ebook`              | file     | ✅       | EPUB, MOBI, or AZW3                                            |
| `trackAsContribution`| boolean  | ❌       | `true` to link this submission to the logged-in user's profile |

---

#### `GET /api/contributions/me`

Get all contributions by the authenticated user.

**Auth**: Required

---

#### `GET /api/contributions/user/:userId`

Get all contributions by a specific user.

**Auth**: Not required

---

### Analytics

Base path: `/api/analytics`

All endpoints require authentication.

#### `GET /api/analytics/activities`

Get up to 50 recent activity events for the authenticated user.

**Response** `200`
```json
{ "success": true, "data": [...] }
```

---

#### `GET /api/analytics/dashboard`

Get an analytics dashboard summary (recent activities and total count).

**Response** `200`
```json
{
  "success": true,
  "data": {
    "recentActivities": [...],
    "totalActivities": 12
  }
}
```

---

### Translation

#### `POST /api/translate`

Translate a block of text into the specified language.

**Auth**: Not required

**Body**
```json
{ "text": "string (max 50 000 chars)", "targetLanguage": "es" }
```

**Response** `200`
```json
{
  "translatedText": "...",
  "originalText": "...",
  "targetLanguage": "es"
}
```

---

### Admin — Books

Base path: `/api/admin`

All admin endpoints require `role === 'admin'`. A `403 Forbidden` is returned otherwise.

#### `GET /api/admin/books/pending`

List all books with `status = 'pending'`.

---

#### `PUT /api/admin/books/:id/approve`

Approve a pending book (sets `status = 'approved'`).

**Body** *(optional)*
```json
{ "reason": "Looks great!" }
```

---

#### `PUT /api/admin/books/:id/reject`

Reject a pending book (sets `status = 'rejected'`).

**Body**
```json
{ "reason": "string (required)" }
```

---

#### `PATCH /api/admin/books/:id`

Edit book metadata.

**Body** *(all fields optional)*
```json
{ "title": "...", "description": "...", "categories": [...], "author": "..." }
```

---

#### `DELETE /api/admin/books/:id`

Permanently delete a book and its storage files.

---

### Admin — Users

#### `GET /api/admin/users`

List all users with pagination.

| Query param | Default | Description       |
|-------------|---------|-------------------|
| `page`      | `1`     | Page number       |
| `limit`     | `10`    | Results per page  |

---

#### `GET /api/admin/users/search`

Search users by email or username (minimum 2 characters).

| Query param | Description                    |
|-------------|--------------------------------|
| `q`         | Search term (min 2 characters) |
| `page`      | Page number (default `1`)      |
| `limit`     | Results per page (default `10`)|

---

#### `GET /api/admin/users/:id`

Get full profile details for a specific user.

---

#### `PATCH /api/admin/users/:id/role`

Change a user's role to `user` or `admin`.

**Body**
```json
{ "role": "user" | "admin" }
```

> An admin cannot demote their own account.

---

### Admin — Statistics

#### `GET /api/admin/stats`

Return book counts grouped by status.

**Response** `200`
```json
{
  "stats": {
    "books": {
      "approved": 40,
      "pending": 5,
      "rejected": 3,
      "total": 48
    },
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Activity Log Event Types

The following event types are recorded in the `user_activities` table:

| Event                      | Triggered by                              |
|----------------------------|-------------------------------------------|
| `LOGIN`                    | Successful login                          |
| `VIEW_BOOK`                | Authenticated user views a book           |
| `ADD_BOOK`                 | User uploads a book                       |
| `CONTRIBUTE`               | Tracked contribution submitted            |
| `WRITE_REVIEW`             | User submits a review                     |
| `RATE_BOOK`                | User submits a rating                     |
| `ADD_FAVORITE`             | User adds a book to favorites             |
| `REMOVE_FAVORITE`          | User removes a book from favorites        |
| `GET_FAVORITES`            | User fetches their favorites list         |
| `UPDATE_PROFILE`           | User updates their profile                |
| `FILTER_CATEGORY`          | User filters books by category            |
| `VIEW_REVIEWS`             | Authenticated user views reviews          |
| `ADMIN_VIEW_PENDING_BOOKS` | Admin loads pending books list            |
| `ADMIN_APPROVE_BOOK`       | Admin approves a book                     |
| `ADMIN_REJECT_BOOK`        | Admin rejects a book                      |
| `ADMIN_EDIT_BOOK`          | Admin edits book metadata                 |
| `ADMIN_DELETE_BOOK`        | Admin deletes a book                      |
| `ADMIN_VIEW_ALL_USERS`     | Admin loads user list                     |
| `ADMIN_SEARCH_USERS`       | Admin searches users                      |
| `ADMIN_VIEW_USER_DETAILS`  | Admin views a specific user's details     |
| `ADMIN_CHANGE_USER_ROLE`   | Admin promotes or demotes a user          |
| `ADMIN_VIEW_STATS`         | Admin views dashboard statistics          |
