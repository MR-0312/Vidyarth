# MongoDB to Supabase PostgreSQL Migration Guide

This document outlines the complete migration of the eBook Platform from MongoDB (Mongoose) to Supabase (PostgreSQL) with Supabase Storage for file handling.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Schema](#database-schema)
5. [Migration Steps](#migration-steps)
6. [API Changes](#api-changes)
7. [File Storage Migration](#file-storage-migration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Supabase?

- **PostgreSQL Power**: Full-featured relational database with advanced query capabilities
- **Integrated Storage**: Built-in file storage solution (no need for external services)
- **Real-time Capabilities**: Support for real-time subscriptions and updates
- **Cost Effective**: Generous free tier and predictable pricing
- **Authentication**: Built-in auth system (can be used in future upgrades)
- **Scalability**: Enterprise-grade infrastructure with automatic backups

### Key Changes

```
MongoDB Collections → PostgreSQL Tables
Mongoose Models → SQL Query Functions
Local File Storage → Supabase Storage (Buckets)
ObjectIds → UUIDs (Primary Keys)
```

---

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **PostgreSQL Knowledge**: Basic understanding of SQL (optional but helpful)
3. **Node.js**: v14 or higher
4. **Environment Variables**: Set up your `.env` file

---

## Environment Setup

### 1. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and create a new project
2. Note your **Project URL** and **Service Role Key** (found in Settings → API)
3. Create your project with a strong password

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
JWT_SECRET=your-jwt-secret-key
PORT=8080
NODE_ENV=development
```

**Important**: 
- Never commit `.env` to version control
- Use the **Service Role Key** (not the Anon key) for server-side operations
- Keep these credentials secure

### 3. Initialize Database

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy the entire contents of `backend/db/schema.sql`
4. Paste and execute in the SQL Editor
5. Wait for the schema to be created

---

## Database Schema

The new PostgreSQL schema includes the following tables:

### Tables Structure

```sql
users
├── id (UUID, PRIMARY KEY)
├── username (VARCHAR)
├── email (VARCHAR, UNIQUE)
├── password (VARCHAR) - hashed
├── profile_picture (VARCHAR) - URL to Supabase Storage
├── bio (TEXT)
├── preferred_categories (TEXT[]) - Array type
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

books
├── id (UUID, PRIMARY KEY)
├── title (VARCHAR)
├── author (VARCHAR)
├── description (TEXT)
├── cover_image (VARCHAR) - URL to Supabase Storage
├── ebook_file (VARCHAR) - URL to Supabase Storage
├── file_format (VARCHAR) - 'pdf' or 'epub'
├── categories (TEXT[]) - Array type
├── average_rating (NUMERIC)
├── total_ratings (INTEGER)
├── contributor_count (INTEGER)
├── user_id (UUID, FK → users)
├── status (VARCHAR) - 'pending', 'approved', 'rejected'
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

reviews
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, FK → users)
├── book_id (UUID, FK → books)
├── rating (INTEGER) - 1-5
├── comment (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

contributions
├── id (UUID, PRIMARY KEY)
├── book_id (UUID, FK → books)
├── user_id (UUID, FK → users) - nullable
├── created_at (TIMESTAMP)

favorites
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, FK → users)
├── book_id (UUID, FK → books)
├── created_at (TIMESTAMP)

user_activities
├── id (UUID, PRIMARY KEY)
├── user_id (UUID, FK → users)
├── activity_type (VARCHAR)
├── metadata (JSONB) - Flexible JSON data
└── created_at (TIMESTAMP)
```

### Key Differences

| Feature | MongoDB | Supabase/PostgreSQL |
|---------|---------|-------------------|
| ID Type | ObjectId | UUID |
| Arrays | Lists in documents | Native array type (TEXT[]) |
| Relationships | Manual (denormalization) | Foreign Keys (referential integrity) |
| Queries | Aggregation pipeline | Standard SQL with JOINs |
| Timestamps | Manual tracking | Auto-timestamps with TRIGGER |
| Free Tier | Limited | Generous (500MB storage) |

---

## Migration Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client library
- Removes `mongoose` dependency

### Step 2: Update Database Connection

The application now uses:
- **`db/supabase.js`** - Supabase client initialization
- **`db/queries.js`** - All database query functions (replaces Mongoose models)

### Step 3: Create Storage Buckets

Storage buckets are automatically created on first server startup:

```bash
npm start
```

You'll see:
```
Storage buckets verified
Supabase connected successfully
```

### Step 4: Verify Schema Creation

In Supabase Dashboard:
1. Go to **Database** → **Public** schema
2. Verify all tables are created
3. Check indexes are created for performance

### Step 5: Start the Application

```bash
npm start
```

Server should run on `http://localhost:8080`

Test with:
```bash
curl http://localhost:8080/health
# Response: {"status":"ok","timestamp":"..."}
```

---

## API Changes

### User Registration (No Changes to Consumer)

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### File Upload Handling

**Before (MongoDB)**: Files stored in `backend/uploads/` directory

**After (Supabase)**:
- Cover images → `book-covers` bucket
- eBooks → `ebooks` bucket  
- Public URLs returned instead of file paths

### Query Differences

**Mongoose (Old)**:
```javascript
const book = await Book.findById(id).populate('user');
```

**Supabase (New)**:
```javascript
const book = await BookQueries.findById(id);
// Related data via foreign keys, no separate population needed
```

---

## File Storage Migration

### Supabase Storage Setup

Two public buckets are automatically created:

1. **book-covers** - Profile pictures and book cover images
   - Max file size: 50MB
   - Allowed types: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
   - Public access for display

2. **ebooks** - eBook files
   - Max file size: 50MB  
   - Allowed types: `.pdf`, `.epub`
   - Public access for downloads

### File Upload Process

1. File is uploaded to multer (in-memory)
2. `uploadFile()` sends to Supabase Storage
3. Public URL is returned
4. URL stored in PostgreSQL database
5. Old file is deleted if updating

### Public URL Format

```
https://your-project-id.supabase.co/storage/v1/object/public/bucket-name/file-name
```

### Access Control

Buckets are public by default. To make private:

1. Go to Supabase Dashboard → Storage
2. Select bucket → Policies
3. Add Row Level Security (RLS) policies
4. Restrict access by user_id if needed

### Migration of Existing Files

If migrating from local storage:

```bash
# 1. Export all files from local storage
# 2. Upload to Supabase Storage via dashboard or SDK
# 3. Update database records with new URLs

UPDATE books SET cover_image = 'https://...' WHERE ...
```

---

## Testing

### Unit Tests

```bash
npm test
```

### Manual Testing

#### 1. Test User Registration

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

#### 2. Test Book Upload

```bash
curl -X POST http://localhost:8080/api/books \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Book" \
  -F "author=Test Author" \
  -F "description=A test book" \
  -F "categories=Technology" \
  -F "cover=@/path/to/cover.jpg" \
  -F "ebook=@/path/to/book.pdf"
```

#### 3. Test Database Queries

```javascript
// In node REPL or test file
const { BookQueries } = require('./db/queries');
const book = await BookQueries.findById('book-id');
console.log(book);
```

#### 4. Test Storage

Visit Supabase Dashboard → Storage:
- Check `book-covers` bucket for covers
- Check `ebooks` bucket for ebook files
- Verify file sizes and URLs

---

## Troubleshooting

### Error: "SUPABASE_URL not found"

**Solution**: Verify `.env` file exists and contains:
```env
SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
```

### Error: "Can't create table - already exists"

**Solution**: Drop existing tables first:
```sql
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then re-run schema.sql

### Error: "relation 'users' does not exist"

**Solution**: 
1. Verify you ran `schema.sql` in the correct database
2. Check that tables are created in `public` schema
3. Re-create tables if necessary

### Files not uploading to Storage

**Check**:
1. Buckets exist in Supabase Dashboard → Storage
2. `.env` has correct `SUPABASE_SERVICE_ROLE_KEY`
3. File size < 50MB limit
4. File type matches allowed extensions

### Performance Issues

**Optimization**:
1. Add composite indexes for common queries:
   ```sql
   CREATE INDEX idx_books_user_status ON books(user_id, status);
   CREATE INDEX idx_reviews_user_book ON reviews(user_id, book_id);
   ```

2. Enable Read Replicas in Supabase for higher traffic
3. Use prepared queries for frequently accessed data

### Query Returning NULL

**Debug**:
```javascript
const book = await supabase
  .from('books')
  .select('*')
  .eq('id', bookId);

console.log('Error:', error);  // Check for query errors
console.log('Data:', data);     // Verify returned data
```

---

##Architecture Changes

### Old Architecture (MongoDB)
```
Client → Express Routes → Mongoose Models → MongoDB
                           ↓
                       Local Storage (uploads/)
```

### New Architecture (Supabase PostgreSQL)
```
Client → Express Routes → Query Functions → PostgreSQL Database
                           ↓
                       Supabase Storage (buckets)
```

### File Flow Comparison

**MongoDB (Old)**:
```
File Upload → Multer → Disk Storage → Path String → Database
```

**Supabase (New)**:
```
File Upload → Multer (Memory) → Supabase Storage → Public URL → Database
```

---

## Performance Notes

### Advantages

✅ **Better Query Performance**: Native SQL with indexes
✅ **ACID Transactions**: Full relational database guarantees
✅ **Built-in Backups**: Automatic daily backups
✅ **Scalability**: Handles millions of records efficiently
✅ **Real-time**: Subscription support for live updates

### Considerations

⚠️ **Connection Pooling**: Limited connections on free tier
⚠️ **Query Complexity**: Some operations may need optimization
⚠️ **Storage Bucket Limits**: 50MB per file limit
⚠️ **Row limit**: Depends on storage plan

---

## Security Notes

1. **Never use anon key on backend** - Always use service role key for server operations
2. **Enable RLS** - Row Level Security for sensitive tables
3. **Sanitize Inputs** - Always validate user inputs before queries
4. **HTTPS Only** - Always use secure connections to Supabase
5. **Rotate Keys** - Periodically rotate your API keys in production

---

## Next Steps

1. ✅ Deploy schema to Supabase
2. ✅ Update `.env` with credentials
3. ✅ Install dependencies: `npm install`
4. ✅ Start server: `npm start`
5. ✅ Test endpoints with sample data
6. ✅ Monitor logs for errors
7. ✅ Migrate existing user data (if applicable)
8. ✅ Update frontend API calls (if needed)

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Node.js Supabase Client**: https://github.com/supabase/supabase-js
- **Project Issues**: Check application logs in browser console and server logs

---

## Changelog

### v1.0 (Current)
- Migrated from MongoDB to PostgreSQL
- Implemented Supabase Storage for files
- All routes updated to new query system
- Schema includes indexes for performance
- Ready for production deployment

---

**Created**: March 2026
**Last Updated**: March 29, 2026
