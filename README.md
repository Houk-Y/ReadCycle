# 📚 ReadCycle — Second-Hand Book Marketplace

ReadCycle is a full-stack web platform where users can **buy, sell, and swap second-hand books**. It supports three user roles (Guest, Registered User, Admin), real-time-style messaging between buyers and sellers, wishlists, and an atomic concurrency-safe purchase system.

---

## 🏗️ Tech Stack

| Layer              | Technology                                         |
| ------------------ | -------------------------------------------------- |
| **Frontend**       | React 18, React Router v6, Axios, React Hot Toast  |
| **Backend**        | Node.js, Express.js                                |
| **Database**       | MongoDB with Mongoose ODM                          |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs (salt rounds: 12) |
| **File Uploads**   | Multer (local disk, max 5MB)                       |
| **Validation**     | express-validator                                  |
| **Dev Server**     | nodemon                                            |

---

## 📁 Project Structure

```
readcycle/
│
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment variables (create from .env.example)
│   ├── .env.example               # Environment variable template
│   ├── uploads/                   # Auto-created folder for book images
│   │
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Book.js                # Book listing schema
│   │   ├── Message.js             # Conversation + Message schemas
│   │   ├── Wishlist.js            # User-book wishlist entries
│   │   └── Transaction.js         # Buy / swap transaction records
│   │
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile, change password
│   │   ├── bookController.js      # CRUD, search, pagination
│   │   ├── messageController.js   # Conversations, messages, per-book threads
│   │   ├── wishlistController.js  # Add, remove, check wishlist
│   │   ├── transactionController.js  # Atomic buy with session lock, swap requests
│   │   └── adminController.js     # Stats, user management, book moderation
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect, adminOnly, optionalAuth
│   │   ├── uploadMiddleware.js    # Multer — images only, 5MB max
│   │   └── validateMiddleware.js  # Input validation rules
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── wishlistRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── adminRoutes.js
│   │   └── userRoutes.js          # Public seller profiles
│   │
│   └── seed/
│       └── seedData.js            # Sample users, books, and transactions
│
└── frontend/
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── App.js                 # Router, protected routes, admin routes
        ├── index.js
        │
        ├── context/
        │   └── AuthContext.js     # Global auth state
        │
        ├── utils/
        │   └── api.js             # Axios instance + all API service modules
        │
        ├── styles/
        │   └── global.css         # Design system, CSS variables, responsive grid
        │
        ├── components/
        │   ├── common/
        │   │   ├── Navbar.js/.css
        │   │   └── Footer.js/.css
        │   └── books/
        │       └── BookCard.js/.css
        │
        └── pages/
            ├── HomePage.js/.css
            ├── BooksPage.js/.css
            ├── BookDetailPage.js/.css
            ├── AuthPages.js/.css      # Login + Register combined
            ├── BookFormPage.js/.css   # Add + Edit listing combined
            ├── DashboardPage.js/.css
            ├── WishlistPage.js/.css
            ├── MessagesPage.js/.css
            ├── ProfilePage.js/.css
            ├── SellerPage.js/.css
            ├── AdminPage.js/.css
            └── NotFoundPage.js/.css
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js v18 or higher
- MongoDB running locally, or a MongoDB Atlas URI
- npm v9 or higher

---

### Step 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/readcycle
JWT_SECRET=your_very_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
CLIENT_URL=http://localhost:3000
```

Seed sample data, then start the server:

```bash
npm run seed
npm run dev
```

API runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`

---

### Step 2 — Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`.

> `"proxy": "http://localhost:5000"` in `frontend/package.json` forwards all `/api` calls to the backend automatically — no CORS configuration needed in development.

---

## 🔑 Demo Accounts

| Role  | Email                 | Password      |
| ----- | --------------------- | ------------- |
| Admin | `admin@readcycle.com` | `Admin@123`   |
| User  | `alice@example.com`   | `Password123` |
| User  | `bob@example.com`     | `Password123` |
| User  | `carol@example.com`   | `Password123` |

---

## 👥 User Roles & Permissions

### Guest (not logged in)

- Browse and search all available books
- View book detail pages and seller profiles

### Registered User

- List books for sale with image upload
- Edit and delete own listings
- Browse books — **own listings are excluded** from the browse page
- Buy books or request swaps
- Message sellers — each conversation is linked to a specific book
- Save books to wishlist
- Dashboard with listings, purchases, and sale requests
- Edit profile, upload avatar, change password

### Admin

- Access `/admin` dashboard
- View platform stats (users, listings, transactions)
- Block or unblock any user
- Delete any book listing
- View all transactions

---

## 🔌 API Reference

### Authentication

| Method | Endpoint                    | Auth | Description             |
| ------ | --------------------------- | ---- | ----------------------- |
| POST   | `/api/auth/register`        | None | Create a new account    |
| POST   | `/api/auth/login`           | None | Login, receive JWT      |
| GET    | `/api/auth/me`              | JWT  | Get current user        |
| PUT    | `/api/auth/profile`         | JWT  | Update profile + avatar |
| PUT    | `/api/auth/change-password` | JWT  | Change password         |

### Books

| Method | Endpoint                 | Auth     | Description                                              |
| ------ | ------------------------ | -------- | -------------------------------------------------------- |
| GET    | `/api/books`             | Optional | Browse books (own listings excluded for logged-in users) |
| GET    | `/api/books/:id`         | Optional | Single book + wishlist status                            |
| GET    | `/api/books/my-listings` | JWT      | Logged-in user's own listings                            |
| POST   | `/api/books`             | JWT      | Create listing (multipart/form-data)                     |
| PUT    | `/api/books/:id`         | JWT      | Update listing                                           |
| DELETE | `/api/books/:id`         | JWT      | Delete listing                                           |

**Browse query parameters:**

| Param       | Description                             | Example             |
| ----------- | --------------------------------------- | ------------------- |
| `search`    | Full-text search on title, author, ISBN | `?search=gatsby`    |
| `category`  | Filter by category                      | `?category=fiction` |
| `condition` | Filter by condition                     | `?condition=good`   |
| `minPrice`  | Minimum price                           | `?minPrice=5`       |
| `maxPrice`  | Maximum price                           | `?maxPrice=20`      |
