# TekGear

**Dealership Productivity Platform** - A MERN stack application focusing on "Certified Dispatching" and "Efficiency Incentives."

![TekGear](https://img.shields.io/badge/MERN-Stack-4cad9a?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## 🚀 Features

### For Managers
- **Optimization Dashboard** - Real-time analytics with charts and KPIs
- **Efficiency Leaderboard** - Technicians ranked by efficiency ratio
- **Bottleneck Detector** - Identifies jobs exceeding book time
- **Training Suggester** - AI-powered training recommendations
- **Incentive Rules Manager** - Create and manage bonus rules
- **Jobs Management** - Create and track service orders

### For Technicians
- **Certification-Gated Jobs** - Only see jobs matching your certifications
- **Beat the Clock Engine** - Real-time timer with bonus calculations
- **Weekly Pulse** - Track earnings progress toward goals
- **Instant Notifications** - Get alerts when you earn bonuses

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

This installs dependencies for the root, server, and client.

### 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your settings:

```env
MONGODB_URI=mongodb://localhost:27017/geargain
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000

# Email (Optional - for bonus notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

CLIENT_URL=http://localhost:5173
```

### 4. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas URI in your `.env` file.

### 5. Seed the database

```bash
npm run seed
```

This creates:
- 1 Manager account
- 18 Technicians with varying certifications
- 60+ Jobs with different statuses
- 1 Active incentive rule

### 6. Start the development servers

```bash
npm run dev
```

This starts both:
- **Backend** at http://localhost:5000
- **Frontend** at http://localhost:5173

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
│   │   │   ├── common/     # Shared components
│   │   │   ├── manager/    # Manager-specific components
│   │   │   └── technician/ # Technician-specific components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   └── services/       # API service
│   └── ...
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
- `POST /api/jobs/:id/start` - Start a job
- `POST /api/jobs/:id/complete` - Complete job with incentive

### Analytics (Manager only)
- `GET /api/analytics/leaderboard` - Efficiency rankings
- `GET /api/analytics/bottlenecks` - Problem areas
- `GET /api/analytics/training-suggestions` - Training needs

## 🧪 How Incentives Work

1. Manager creates an **Incentive Rule** (e.g., $10 per 30 mins saved)
2. Technician starts a job with a **Book Time** (e.g., 60 mins)
3. If completed in **less than book time**, bonus is calculated:
   
   ```
   Time Saved = Book Time - Actual Time
   Bonus Units = floor(Time Saved / Threshold)
   Incentive = Bonus Units × Bonus Per Unit
   ```

4. Example: 60 min job done in 40 mins = 20 mins saved = $0 bonus (need 30+ mins)
5. Same job done in 25 mins = 35 mins saved = 1 unit = **$10 bonus!**

## 📜 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for Tekion by a Lead Full-Stack Engineer
