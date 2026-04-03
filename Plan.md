Build a production-ready Employee Management web app called "EmployeeConnect".

IMPORTANT:

- This is not a redesign.
- Clone the provided UI screenshots as closely as possible.
- Match layout, spacing, colors, typography, card sizes, table layout, buttons, modals, form structure, and overall visual hierarchy.
- Use the existing repository only as a feature/functionality reference:
  https://github.com/hayle01/EmployeeMangementSystem
- Rebuild the app using React + Supabase + Vercel-friendly architecture.
- I already built a MERN version, but now I want the final version with Supabase backend/auth and Vercel deployment.

STACK REQUIREMENTS:

- React 18 + Vite
- TypeScript
- React Router DOM
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod
- TanStack Query
- Supabase (Auth, Postgres, Storage, RLS)
- Recharts
- Vercel deployment

DO NOT USE:

- Next.js
- Express
- MongoDB
- Mongoose
- JWT custom auth
- Cloudinary

GOAL:
Rebuild the existing employee management system with these modules:

1. Login
2. Overview dashboard
3. Employees list
4. Add employee
5. Edit employee
6. Employee detail
7. Renew employee
8. Delete confirmation dialog
9. Users management
10. Create user modal
11. Settings / change password
12. Public employee verification page

CRITICAL UI REQUIREMENT:
Clone the screenshots very closely.

GLOBAL STYLE:

- Clean admin dashboard
- White/light gray background
- Left vertical sidebar
- Top navbar with search, bell, avatar/profile
- Blue/cyan primary accent
- Dark navy headings
- Rounded cards
- Thin borders
- Minimal shadows
- Spacious layout
- Desktop-first
- Use Inter font
- Keep bilingual/trilingual labels exactly where shown in screenshots

APP BRANDING:

- App name: EmployeeConnect

SIDEBAR:

- Overview
- Employees
- Users
- Settings
- Logout
- Active item highlighted with cyan background
- Logo/brand at top
- Logout near bottom

TOP BAR:

- Search input
- Notification bell
- User avatar
- Name and role display

ARCHITECTURE:
Use a React SPA frontend with Supabase as backend.

Frontend:

- React + Vite
- React Router for routes
- TanStack Query for data fetching and caching
- Supabase JS client for auth and database access
- Protected route wrappers for authenticated areas
- Role-based route guards

Backend/serverless:

- Vercel Functions only where needed
- Use server-side functions for sensitive admin flows such as creating users or deleting users with elevated permissions
- Use Supabase service role key only in server-side Vercel functions
- Use publishable/anon key only in frontend
- No custom Express server

ROUTING:
Use React Router routes such as:

- /login
- /overview
- /employees
- /employees/new
- /employees/:id
- /employees/:id/edit
- /employees/:id/renew
- /users
- /settings
- /employee-public/:slug

AUTH REQUIREMENTS:
Use Supabase Auth.

Because the UI uses username/password but Supabase prefers email/password:

- Create internal auth users with generated emails like username@employeeconnect.local
- Store username and role in a profiles table
- Login form accepts username + password
- Convert username to internal auth email during sign-in

SESSION REQUIREMENTS:

- Secure Supabase session handling
- Persist session in frontend
- Protect dashboard routes
- Redirect unauthenticated users to login
- Support sign out

ROLES:
Support:

- admin
- staff

PERMISSIONS:
Admin:

- full employee CRUD
- renew employee
- delete employee
- manage users
- change own password
- view dashboard

Staff:

- view dashboard
- view employee list/detail
- create/edit/renew employees if allowed by policy
- cannot manage users
- can change own password

At minimum:

- Users page must be admin-only

Enforce role checks in:

- protected routes
- server-side Vercel functions for admin actions
- Supabase RLS policies

DASHBOARD PAGE:
Build an overview page matching the screenshots.

Include cards for:

- Total Employees
- Active QR IDs
- Pending Renewals
- Active Status

Include charts:

- Employee Growth Trend
- Department Breakdown (donut/pie)
- Active vs Expired (bar chart)
- Latest Onboarding list

Dashboard data must come from Supabase.
Employee status must be computed from expiry date.

EMPLOYEES LIST PAGE:
Must match screenshot closely.

Features:

- Title: Employee Management
- Subtitle about managing employee records and ID cards
- Add New Employee button
- Search input
- Department filter
- District filter
- Status filter
- Reset filters button
- Table/grid toggle
- Employee count
- Row actions menu

Columns:

- Employee
- Emp No
- Title
- Department
- Expire Date
- Status
- Actions

Row actions:

- View
- Edit
- Renew
- Delete

Status rules:

- Active if expiry date is today or in future
- Expired if expiry date is in the past

DELETE MODAL:
Create a confirmation dialog matching the screenshot style:

- title
- warning text
- Cancel
- Delete

ADD EMPLOYEE PAGE:
Clone the screenshot closely.

Sections:

1. Personal Information

- profile image upload
- employee number
- full name
- English title
- local title
- department
- mobile number
- email

2. Contact & Location

- address
- district

3. Identity Documentation

- national ID
- issue date
- expiry date

Behavior:

- Save button
- Cancel button
- validation with Zod
- image preview
- image validation
- status computed from expiry date
- generate QR/public verification record after create

EDIT EMPLOYEE PAGE:

- same structure as add form
- prefilled values
- allow update
- optionally replace image
- preserve history snapshot when record changes

EMPLOYEE DETAIL PAGE:
Clone the screenshot closely.

Left panel:

- employee avatar/photo
- name
- title
- status badge
- QR code card
- Download QR Package button

Right side sections:

1. Employment Information

- employee number
- full name
- English title
- local title
- department
- status
- national ID

2. Contact & Location

- mobile
- email
- district
- address

3. ID Validity

- issue date
- expiry date
- expired warning alert

4. Employee History

- show history records with prior snapshots
- include previous status
- include major fields
- include timestamp
- newest first

Top-right actions:

- Renew
- Edit

RENEW EMPLOYEE PAGE:
Build a separate renewal screen matching the screenshot.

Requirements:

- back link
- employee summary section
- renewal details form
- profile image upload
- title fields
- department
- mobile
- email
- national ID
- address
- district
- issue date
- expiry date
- Cancel
- Renew

Renew behavior:

- create history snapshot first
- update current employee
- regenerate QR if needed
- keep same public slug if possible
- recompute status

USERS PAGE:
Clone the users management screenshot.

Features:

- users list
- Create User button
- Create User modal/dialog
- columns:
  - User
  - Role
  - Created At
  - Actions

Create User modal fields:

- username
- password
- role (admin or staff)

Behavior:

- admin-only page
- create Supabase auth user + profiles row
- prevent deleting currently logged-in user
- allow deleting other users
- role badges styled like screenshots

SETTINGS PAGE:
Clone the settings screenshot.

Change Password form:

- current password
- new password
- confirm password
- Update Password button

Behavior:

- validate password length
- validate confirmation match
- secure password update flow with Supabase
- success/error toast

PUBLIC EMPLOYEE VERIFICATION PAGE:
Create a public route:

- /employee-public/:slug

Behavior:

- accessible from QR code
- shows public-safe employee verification details
- graceful not-found state if missing

Public page can show:

- name
- employee number
- title
- department
- district
- status
- issue date
- expiry date

Do not expose private/internal data.

QR CODE REQUIREMENTS:
Every employee must have a QR code that points to the public verification page.
Requirements:

- generate QR on create
- store QR asset
- display QR on employee detail page
- support Download QR Package button
- package can include PNG QR image and optional printable asset

SUPABASE DATABASE DESIGN:

Create table: profiles

- id uuid primary key references auth.users(id)
- username text unique not null
- role text check in ('admin','staff') not null default 'staff'
- created_at timestamptz default now()
- updated_at timestamptz default now()

Create table: employees

- id uuid primary key default gen_random_uuid()
- emp_no text unique not null
- name text not null
- title_en text not null
- title_local text not null
- department text not null
- mobile text not null
- email text null
- national_id text not null
- address text not null
- district text not null
- issue_date date not null
- expire_date date not null
- profile_image_url text null
- profile_image_path text null
- qr_image_url text null
- qr_image_path text null
- public_slug text unique not null
- created_at timestamptz default now()
- updated_at timestamptz default now()

Create table: employee_history

- id uuid primary key default gen_random_uuid()
- employee_id uuid references employees(id) on delete cascade
- action_type text check in ('update','renew') not null
- emp_no text not null
- name text not null
- title_en text not null
- title_local text not null
- department text not null
- mobile text not null
- email text null
- national_id text not null
- address text not null
- district text not null
- issue_date date not null
- expire_date date not null
- profile_image_url text null
- qr_image_url text null
- public_slug text not null
- status_at_that_time text check in ('Active','Expired') not null
- recorded_at timestamptz default now()

STATUS LOGIC:

- Active if expire_date >= current_date
- Expired if expire_date < current_date

STORAGE:
Use Supabase Storage buckets:

- employee-profiles
- employee-qrcodes

Store:

- profile photos
- QR images
- downloadable QR assets if needed

SECURITY:

- Use publishable key only in client
- Use service role key only in server-side Vercel functions
- Never expose secret keys in frontend
- Use environment variables only

VALIDATION:
Use Zod for:
Users:

- username required
- password min 6 chars
- role required

Employees:

- emp_no required and unique
- name required
- title_en required
- title_local required
- department required
- mobile required
- national_id required
- address required
- district required
- issue_date required
- expire_date required
- expire_date cannot be before issue_date
- email optional but must be valid if provided

SEARCH/FILTERS:
Employee search should support:

- name
- English title
- local title
- employee number
- mobile
- national ID

Filters:

- department
- district
- status

EMPLOYEE HISTORY:
Whenever an employee is updated or renewed:

- store snapshot in employee_history
- include all major fields and status at that time
- show on employee detail page newest first

OUTPUT I WANT:
Generate the full codebase with:

- React + Vite app
- Supabase integration
- SQL schema
- RLS policies
- storage notes
- environment example
- deployment instructions for Vercel
- reusable components
- polished UI matching screenshots closely
- no placeholder junk

FOLDER STRUCTURE SUGGESTION:
src/
app/
router/
providers/
layouts/
pages/
auth/
dashboard/
employees/
users/
settings/
public/
components/
layout/
employees/
dashboard/
users/
settings/
ui/
hooks/
lib/
supabase/
auth/
validations/
utils/
qr/
types/
api/
users/
auth/
employees/
public/

ENV EXAMPLE:
Create .env.example with:
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY

IMPORTANT FINAL INSTRUCTIONS:

- keep the UI very close to the screenshots
- preserve the flows and behavior from the existing repository
- use Supabase instead of Mongo/Express
- make it deployable to Vercel without a custom backend server
- do not redesign the app
- do not expose secrets
- prioritize visual accuracy and functional completeness
