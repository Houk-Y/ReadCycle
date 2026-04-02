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

| Param       | Description                             | Example                             |
| ----------- | --------------------------------------- | ----------------------------------- |
| `search`    | Full-text search on title, author, ISBN | `?search=gatsby`                    |
| `category`  | Filter by category                      | `?category=fiction`                 |
| `condition` | Filter by condition                     | `?condition=good`                   |
| `minPrice`  | Minimum price                           | `?minPrice=5`                       |
| `maxPrice`  | Maximum price                           | `?maxPrice=20`                      |
| `sort`      | Sort field                              | `?sort=-createdAt` or `?sort=price` |
| `page`      | Page number                             | `?page=2`                           |
| `limit`     | Results per page                        | `?limit=12`                         |

### Messages

| Method | Endpoint                          | Auth | Description                                         |
| ------ | --------------------------------- | ---- | --------------------------------------------------- |
| GET    | `/api/messages/conversations`     | JWT  | All conversations with book data                    |
| GET    | `/api/messages/:conversationId`   | JWT  | Messages + conversation detail                      |
| POST   | `/api/messages`                   | JWT  | Send a message (`recipientId`, `content`, `bookId`) |
| DELETE | `/api/messages/conversations/:id` | JWT  | Delete a conversation                               |

> Conversations are scoped per book. Messaging a seller about two different books creates two separate threads, each showing the relevant book in the chat header.

### Wishlist

| Method | Endpoint                      | Auth | Description             |
| ------ | ----------------------------- | ---- | ----------------------- |
| GET    | `/api/wishlist`               | JWT  | Get wishlisted books    |
| POST   | `/api/wishlist`               | JWT  | Add book — `{ bookId }` |
| DELETE | `/api/wishlist/:bookId`       | JWT  | Remove book             |
| GET    | `/api/wishlist/check/:bookId` | JWT  | Check if wishlisted     |

### Transactions

| Method | Endpoint                       | Auth | Description                                                      |
| ------ | ------------------------------ | ---- | ---------------------------------------------------------------- |
| POST   | `/api/transactions/buy`        | JWT  | Buy a book — `{ bookId }`                                        |
| POST   | `/api/transactions/swap`       | JWT  | Request swap — `{ bookId, swapBookId }`                          |
| GET    | `/api/transactions/my`         | JWT  | Own transactions — `?role=buyer` or `?role=seller`               |
| PUT    | `/api/transactions/:id/status` | JWT  | Update status (`accepted`, `completed`, `cancelled`, `rejected`) |

### Admin (Admin JWT required)

| Method | Endpoint                     | Description                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| GET    | `/api/admin/stats`           | Platform KPIs                                |
| GET    | `/api/admin/users`           | All users — supports `?search=` and `?page=` |
| PUT    | `/api/admin/users/:id/block` | Toggle block / unblock                       |
| DELETE | `/api/admin/users/:id`       | Delete user and their listings               |
| GET    | `/api/admin/books`           | All listings                                 |
| DELETE | `/api/admin/books/:id`       | Remove a listing                             |
| GET    | `/api/admin/transactions`    | All transactions                             |

### Users (public)

| Method | Endpoint         | Description                            |
| ------ | ---------------- | -------------------------------------- |
| GET    | `/api/users/:id` | Seller profile + their active listings |

---

## 🗄️ Database Models

### User

```
name, email, password (hashed), role (user | admin),
avatar, bio, location, phone, isBlocked,
totalListings, totalSales, timestamps
```

### Book

```
title, author, isbn, description, price,
condition (new | like-new | good | fair | poor),
category, image, seller (ref: User),
status (available | sold | reserved | swap-only),
allowSwap, isLocked, lockedBy, lockedAt,
views, tags, timestamps
```

### Conversation

```
participants ([ref: User]), book (ref: Book),
lastMessage, lastMessageAt,
unreadCount (Map<userId, count>), timestamps
```

### Message

```
conversation (ref: Conversation), sender (ref: User),
content, isRead, timestamps
```

### Wishlist

```
user (ref: User), book (ref: Book),
notifyOnAvailable, notified, timestamps
```

### Transaction

```
buyer (ref: User), seller (ref: User), book (ref: Book),
type (buy | swap), swapBook (ref: Book), amount,
status (pending | accepted | completed | cancelled | rejected),
notes, bookTitleSnapshot, timestamps
```

---

## 🔒 Security

| Feature          | Implementation                                                         |
| ---------------- | ---------------------------------------------------------------------- |
| Password hashing | bcryptjs, 12 salt rounds                                               |
| Auth tokens      | JWT signed with `JWT_SECRET`, 7-day expiry                             |
| Protected routes | `protect` middleware validates token on every private request          |
| Admin routes     | `adminOnly` middleware checks `role === 'admin'` after `protect`       |
| Blocked users    | `protect` rejects blocked accounts with HTTP 403                       |
| Input validation | express-validator on all POST/PUT routes                               |
| File filtering   | Multer rejects non-image MIME types                                    |
| Concurrency      | MongoDB sessions + atomic `findOneAndUpdate` prevent double-purchasing |

---

## ⚡ Concurrency — How Buying Works

`POST /api/transactions/buy` runs inside a **MongoDB session** to prevent two buyers purchasing the same book simultaneously:

1. `findOneAndUpdate` atomically sets `isLocked: true` — only succeeds if `status === 'available'` AND `isLocked === false`
2. The transaction record is written within the same session
3. The book is marked `sold` and the lock is released
4. On any failure the session aborts, the lock is released, and the buyer receives a clear error message

---

## 🎨 Design System

| Element       | Value                   |
| ------------- | ----------------------- |
| Display font  | Cormorant Garamond      |
| Body font     | DM Sans                 |
| Monospace     | DM Mono                 |
| Primary color | Forest green `#1C2B22`  |
| Accent        | Antique brass `#C9993A` |
| Background    | Warm cream `#FDFAF4`    |

**Responsive breakpoints:**

| Breakpoint | Max Width | Key Changes                              |
| ---------- | --------- | ---------------------------------------- |
| lg         | 1024px    | Container padding reduces                |
| md         | 768px     | Sidebars collapse, form rows stack       |
| sm         | 640px     | 2-column book grid, full-width buttons   |
| xs         | 480px     | Typography scales down, spacing tightens |

---

## 📜 Scripts

### Backend

```bash
npm run dev    # nodemon — auto-restarts on file changes
npm start      # node — for production
npm run seed   # Seed the database with sample data
```

### Frontend

```bash
npm start      # Development server at http://localhost:3000
npm run build  # Optimised production build → /build
npm test       # Run test suite
```

---

## 🐛 Common Issues

**MongoDB connection refused**
Make sure MongoDB is running: `mongod` or start the MongoDB service for your OS.

**Port 5000 already in use**
Change `PORT` in `backend/.env` and update `"proxy"` in `frontend/package.json` to match.

**Images not showing**
The backend serves uploads at `http://localhost:5000/uploads/`. The backend must be running for images to load.

**Invalid token after seeding**
The seed script drops all users. Clear your browser's local storage (or just log out and back in) to get a fresh JWT.

---

## 📄 License

MIT — free to use, modify, and distribute.
