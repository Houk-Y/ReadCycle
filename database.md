# ReadCycle — Database Design

> PostgreSQL (Neon Cloud) · 7 Tables · 4 ENUM Types · 8 Indexes

---

## Table: `users`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment unique user ID |
| `name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email — must be unique |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash — never stored plain |
| `role` | userrole ENUM | DEFAULT 'user' | 'user' or 'admin' |
| `address` | VARCHAR(300) | NULLABLE | Physical address for book pickup |
| `phone` | VARCHAR(50) | NULLABLE | Phone number or Telegram handle |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account registration timestamp |

---

## Table: `books`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment book listing ID |
| `title` | VARCHAR(255) | NOT NULL | Book title (indexed for search) |
| `author` | VARCHAR(255) | NOT NULL | Author name |
| `price` | DOUBLE PRECISION | NOT NULL | Asking price in USD |
| `condition` | bookcondition ENUM | NOT NULL | New / Like New / Good / Fair / Poor |
| `description` | TEXT | NULLABLE | Seller's description |
| `image_url` | VARCHAR(500) | NULLABLE | Cloudinary CDN URL for cover photo |
| `status` | bookstatus ENUM | DEFAULT 'available' | available / sold / swapped |
| `owner_id` | INT | FK → users(id) CASCADE | Listing owner reference |
| `category_id` | INT | FK → categories(id) | Category reference (nullable) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Listing creation timestamp |

---

## Table: `messages`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment message ID |
| `content` | TEXT | NOT NULL | Message body text |
| `sender_id` | INT | FK → users CASCADE | Message sender (user ID) |
| `receiver_id` | INT | FK → users CASCADE | Message recipient (user ID) |
| `book_id` | INT | FK → books CASCADE | Book this conversation is about |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Message timestamp |

---

## Table: `favorites`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment favorite ID |
| `user_id` | INT | FK → users CASCADE | User who saved the book |
| `book_id` | INT | FK → books CASCADE | Book that was saved |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When the book was favorited |

---

## Table: `categories`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment category ID |
| `name` | VARCHAR(100) | NOT NULL | Category name (e.g. Computer Science) |

---

## Table: `swap_requests`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment swap request ID |
| `requester_id` | INT | FK → users CASCADE | User requesting the swap |
| `owner_id` | INT | FK → users CASCADE | Owner of the book |
| `book_id` | INT | FK → books CASCADE | Book targeted for swap |
| `status` | swapstatus ENUM | DEFAULT 'pending' | pending / accepted / rejected |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Request creation timestamp |

---

## Table: `notifications`

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | SERIAL | PRIMARY KEY | Auto-increment notification ID |
| `user_id` | INT | FK → users CASCADE | Recipient of the notification |
| `message` | TEXT | NOT NULL | Notification text body |
| `is_read` | BOOLEAN | DEFAULT false | Whether the user has read it |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Notification creation timestamp |

---

## Custom ENUM Types

| ENUM Name | Values | Used In |
|---|---|---|
| `userrole` | 'user', 'admin' | users.role |
| `bookcondition` | 'New', 'Like New', 'Good', 'Fair', 'Poor' | books.condition |
| `bookstatus` | 'available', 'sold', 'swapped' | books.status |
| `swapstatus` | 'pending', 'accepted', 'rejected' | swap_requests.status |

---

## Indexes

| Index Name | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_books_owner` | books | owner_id | Fast lookup of books by owner (dashboard) |
| `idx_books_status` | books | status | Efficient filtering of available books |
| `idx_books_category` | books | category_id | Category-based browsing filter |
| `idx_msg_book` | messages | book_id | Retrieve all messages for a book conversation |
| `idx_notif_user` | notifications | user_id | Get all notifications for a user |
| `idx_fav_user` | favorites | user_id | List a user's saved books |
| `idx_swap_owner` | swap_requests | owner_id | Find pending swap requests for a book owner |
| `idx_swap_requester` | swap_requests | requester_id | Find swaps initiated by a user |

---

*ReadCycle · Final Year Project · American University of Phnom Penh · 2026*