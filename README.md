# TekGear

**Dealership Productivity Platform** - A MERN stack application focusing on "Certified Dispatching" and "Efficiency Incentives."

![TekGear](https://img.shields.io/badge/MERN-Stack-4cad9a?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🚀 Features

### For Managers
- **Dashboard Overview** - Real-time analytics with charts and KPIs
- **Job Approval Workflow** - Approve/reject technician job requests via email or dashboard
- **Efficiency Leaderboard** - Technicians ranked by efficiency ratio
- **Bottleneck Detector** - Identifies jobs exceeding book time
- **Incentive Rules Manager** - Create and manage bonus rules
- **Jobs Management** - Create, assign, and reassign service orders
- **Technician Settings** - Set per-tech bonus multipliers and weekly goals

### For Technicians
- **Certification-Gated Jobs** - Only see jobs matching your certifications
- **Request-to-Work Flow** - Request jobs for manager approval
- **Beat the Clock Engine** - Real-time timer with bonus calculations
- **Weekly Pulse** - Track earnings progress toward goals
- **Instant Notifications** - Get email alerts when you earn bonuses

## 📋 Prerequisites

- **Node.js** v18 or higher
- **MongoDB** v6 or higher (local or Atlas)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the repository

```bash
cd TekGear
```

### 2. Install all dependencies

```bash
npm run install-all
```

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/tekgear
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5001

# Email (Required for approval workflow)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

CLIENT_URL=http://localhost:5173
```

### 4. Seed the database

```bash
npm run seed
```

This creates:
- 1 Manager account
- 18 Technicians with varying certifications
- 60+ Jobs with different statuses
- 1 Active incentive rule

### 5. Start development servers

```bash
npm run dev
```

- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:5173

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Manager** | manager@tekgear.com | manager123 |
| **Technician** | tech1@tekgear.com | tech123 |

*Technicians: tech1@ through tech18@tekgear.com all use password `tech123`*

## 📁 Project Structure

```
TekGear/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Navbar
│   │   │   ├── manager/    # Dashboard components
│   │   │   └── technician/ # Tech dashboard components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   └── services/       # API service
├── server/                 # Express backend
│   ├── config/             # Database config
│   ├── middleware/         # Auth & RBAC
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Email service
│   └── utils/              # Seed data
└── package.json            # Root scripts
```

## 🎨 Design System

- **Primary Color**: `#4cad9a`
- **Theme**: Dark mode with glassmorphism
- **Font**: Inter (Google Fonts)

## 📊 API Endpoints

### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List jobs (filtered by cert for techs)
- `GET /api/jobs/pending-requests` - Pending approval requests (manager)
- `POST /api/jobs/:id/request` - Tech requests a job
- `POST /api/jobs/:id/approve` - Manager approves request
- `GET /api/jobs/:id/approve/:token` - One-click email approval
- `POST /api/jobs/:id/reject` - Manager rejects request
- `POST /api/jobs/:id/assign` - Manager assigns job to tech
- `POST /api/jobs/:id/reassign` - Manager reassigns job
- `POST /api/jobs/:id/start` - Start a job
- `POST /api/jobs/:id/complete` - Complete job with incentive

### Users
- `PUT /api/users/:id/settings` - Update bonus multiplier & weekly goal

### Analytics (Manager only)
- `GET /api/analytics/leaderboard` - Efficiency rankings
- `GET /api/analytics/bottlenecks` - Problem areas
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/weekly-trends` - Weekly performance trends

## 🔄 Job Workflow

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐
│ Job Created │ ──▶ │ Tech Requests │ ──▶ │ Manager Gets │
│             │     │   (Optional)  │     │    Email     │
└─────────────┘     └───────────────┘     └──────────────┘
                                                 │
       ┌─────────────────────────────────────────┘
       ▼
┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│ One-Click     │ ──▶ │ Tech Starts  │ ──▶ │ Beat Book    │
│ Approve       │     │ Timer        │     │ Time = Bonus │
└───────────────┘     └──────────────┘     └──────────────┘
```

## 🧪 How Incentives Work

1. Manager creates an **Incentive Rule** (e.g., $1 per minute saved)
2. Technician starts a job with a **Book Time** (e.g., 45 mins)
3. If completed in **less than book time**, bonus is calculated:
   
   ```
   Time Saved = Book Time - Actual Time
   Bonus = Time Saved × Rate Per Minute × Bonus Multiplier
   ```

4. Example: 45 min job done in 38 mins = 7 mins saved = **$7 bonus!**

## 📜 License

MIT License

---

Built with ❤️ for Hackathon
