# 🌿 FoodSaver – Food Waste Management System

A full-stack MERN application that connects food donors with NGOs and receivers to combat food waste.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Framer Motion, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT with bcrypt |
| Real-time | Socket.io |
| Styling | Custom CSS with CSS Variables |

## 📁 Project Structure

```
foodsaver/
├── backend/
│   ├── models/          # MongoDB schemas (User, FoodListing, Request, DonationHistory)
│   ├── routes/          # REST API routes
│   ├── middleware/       # Auth middleware (JWT protect, role authorize)
│   ├── utils/           # generateToken, notifications
│   └── server.js        # Entry point with Socket.io + cron jobs
└── frontend/
    └── src/
        ├── context/     # AuthContext, SocketContext
        ├── pages/       # Home, Browse, FoodDetail, DonateFood, Auth, Dashboard
        ├── components/  # Navbar, FoodCard (with skeleton), Footer
        ├── utils/       # api.js (axios), helpers.js
        └── styles/      # globals.css (design tokens + utilities)
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd foodsaver/backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev       # Development with nodemon
npm start         # Production
```

### Frontend Setup
```bash
cd foodsaver/frontend
npm install

# Optional: create .env for custom API URL
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
echo "REACT_APP_SOCKET_URL=http://localhost:5000" >> .env

npm start         # Starts on http://localhost:3000
npm run build     # Production build
```

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register (donor/receiver) |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Food Listings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/food` | Get all listings (filterable) |
| GET | `/api/food/:id` | Get single listing |
| POST | `/api/food` | Create listing (donor only) |
| PUT | `/api/food/:id` | Update listing |
| DELETE | `/api/food/:id` | Delete listing |
| GET | `/api/food/stats/summary` | Platform statistics |

### Requests
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/requests` | Create request (receiver only) |
| GET | `/api/requests/my` | My requests (receiver) |
| GET | `/api/requests/incoming` | Incoming requests (donor) |
| PUT | `/api/requests/:id/status` | Approve/reject/complete |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Platform statistics |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| GET | `/api/admin/listings` | All listings |
| DELETE | `/api/admin/listings/:id` | Delete any listing |

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Donor** | Create/manage food listings, approve/reject requests |
| **Receiver (NGO)** | Browse food, send requests, track received donations |
| **Admin** | Manage all users and listings, view platform stats |

## ✨ Key Features

- **JWT Authentication** — Secure login with role-based access control
- **Real-time Updates** — Socket.io broadcasts new listings and request notifications
- **Auto-expiry** — Cron job runs hourly to expire stale listings
- **Infinite Scroll** — IntersectionObserver-based lazy loading in Browse page
- **Skeleton Loaders** — Shimmer placeholders while data loads
- **Toast Notifications** — react-hot-toast for user feedback
- **Framer Motion** — Page transitions, scroll-triggered animations, parallax
- **Image Uploads** — Multer handles multi-image food photos
- **Donation Impact Tracking** — Meals provided, CO₂ saved, water saved

## 🎨 Design System

- **Dark theme** with CSS custom properties
- **Fonts**: Syne (display/headings) + DM Sans (body)
- **Accent**: Electric green `#00e676` with teal/orange/purple accents
- **Components**: Cards, badges, form inputs, buttons — all themeable via CSS vars
