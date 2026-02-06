# School Management System - Deployment Guide

## Quick Start for Replit

### 1. Environment Setup

The `.env` file contains all necessary credentials and is already included in the repository. **No additional configuration needed!**

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

```bash
npm run dev
```

The application will be available at the provided Replit URL (usually port 5001).

## Login Credentials

### Default Admin Account

**Email:** `admin@school.com`  
**Password:** `admin123`

> **Note:** If you encounter "Invalid credentials" error, the admin user needs to be created in Supabase.

## Database Information

### Supabase Configuration (Already Configured)

- **Project ID:** cfrqthnhpnvfpweiskpe
- **URL:** https://cfrqthnhpnvfpweiskpe.supabase.co
- **Database:** Fully hosted on Supabase (no local setup required!)

### Database Schema

The database is already set up with:
- ✅ Full schema (`full_schema.sql`)
- ✅ Seed data (`seed.sql`) with sample:
  - 100 Rooms
  - 8 Periods
  - 12 Subjects
  - 8 Teachers
  - 20 Classes
  - 35 Students
  - 3 Bus Routes with stops
  - Class enrollments and bus assignments

### Creating Admin User (If Needed)

If the login doesn't work, create the admin user:

```bash
node create_admin_user.js
```

This will create/verify:
- Email: admin@school.com
- Password: admin123
- Role: Admin

## Troubleshooting

### Invalid Credentials Error

**Cause:** Admin user doesn't exist in Supabase Auth

**Solution:**
1. Run: `node create_admin_user.js`
2. Wait for confirmation message
3. Try logging in again with admin@school.com / admin123

### Database Not Seeded

**Cause:** Fresh Supabase project without seed data

**Solution:**
The Supabase database should already be seeded. If you need to reset or initialize:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/cfrqthnhpnvfpweiskpe
2. Go to SQL Editor
3. Run the contents of `full_schema.sql` (creates tables)
4. Run the contents of `seed.sql` (adds sample data)

### Port Already in Use

**Solution:**
```bash
# Kill existing process and restart
npm run dev
```

## Features Included

- 📚 Student Management
- 👨‍🏫 Teacher Management  
- 📅 Class Scheduling
- ✅ Attendance Tracking (Classroom & Bus)
- 🚌 Bus Route Management
- 📊 Analytics & Reports
- 🔐 Role-Based Access Control

## Technology Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **State:** React Query
- **Forms:** React Hook Form + Zod

## Support

For issues, check:
1. `.env` file exists and contains correct credentials
2. Admin user created via `create_admin_user.js`
3. Network access to Supabase (https://cfrqthnhpnvfpweiskpe.supabase.co)

---

**Last Updated:** February 2026  
**Repository:** https://github.com/walideltayeh/SchoolManagementSystemAntigravity
