/**
 * Seed Script
 * Populates the database with sample data for development/testing
 * Run: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Wishlist = require('../models/Wishlist');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://readcycle_user:H5EbCu4LX.n8gf_@cluster0.kt0a219.mongodb.net/?appName=Cluster0';

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@readcycle.com',
    password: 'Admin@123',
    role: 'admin',
    bio: 'Platform administrator',
    location: 'San Francisco, CA',
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'Password123',
    bio: 'Avid reader and book collector. Love swapping books!',
    location: 'New York, NY',
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'Password123',
    bio: 'Sci-fi enthusiast. Always looking for a good deal.',
    location: 'Austin, TX',
  },
  {
    name: 'Carol White',
    email: 'carol@example.com',
    password: 'Password123',
    bio: 'Literature professor and passionate bibliophile.',
    location: 'Chicago, IL',
  },
];

const sampleBooks = (sellerIds) => [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    description: 'A classic tale of wealth, obsession, and the American Dream in the 1920s. Slightly yellowed pages but very readable.',
    price: 8.99,
    condition: 'good',
    category: 'fiction',
    seller: sellerIds[1],
    allowSwap: true,
    tags: ['classic', 'american', '1920s'],
    status: 'available',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '9780441013593',
    description: 'Epic science fiction masterpiece. This is the 40th anniversary edition with beautiful cover art.',
    price: 12.50,
    condition: 'like-new',
    category: 'fiction',
    seller: sellerIds[1],
    allowSwap: false,
    tags: ['sci-fi', 'epic', 'classic'],
    status: 'available',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '9780062316097',
    description: 'Fascinating look at the history of our species. Some highlighting in the first few chapters.',
    price: 14.00,
    condition: 'good',
    category: 'history',
    seller: sellerIds[2],
    allowSwap: true,
    tags: ['history', 'anthropology', 'bestseller'],
    status: 'available',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    description: 'Essential reading for software developers. Pristine condition, only read twice.',
    price: 22.00,
    condition: 'like-new',
    category: 'technology',
    seller: sellerIds[2],
    allowSwap: false,
    tags: ['programming', 'software', 'best-practices'],
    status: 'available',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061935466',
    description: 'Pulitzer Prize winning novel. A story of racial injustice and childhood innocence. Well-preserved copy.',
    price: 9.50,
    condition: 'good',
    category: 'fiction',
    seller: sellerIds[3],
    allowSwap: true,
    tags: ['classic', 'american', 'award-winning'],
    status: 'available',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    description: 'Life-changing book on building good habits. Has some underlines but nothing distracting.',
    price: 13.00,
    condition: 'fair',
    category: 'self-help',
    seller: sellerIds[3],
    allowSwap: true,
    tags: ['habits', 'productivity', 'bestseller'],
    status: 'available',
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '9780451524935',
    description: 'Dystopian classic. Brand new, bought two copies by mistake.',
    price: 11.00,
    condition: 'new',
    category: 'fiction',
    seller: sellerIds[1],
    allowSwap: false,
    tags: ['dystopia', 'classic', 'political'],
    status: 'available',
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '9780307887894',
    description: 'Essential for entrepreneurs. Light reading marks, all content visible and clear.',
    price: 16.00,
    condition: 'good',
    category: 'business',
    seller: sellerIds[2],
    allowSwap: false,
    tags: ['startup', 'business', 'entrepreneurship'],
    status: 'available',
  },
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    isbn: '9780439708180',
    description: 'First edition American printing. Cover shows some wear but pages are clean.',
    price: 18.00,
    condition: 'good',
    category: 'fiction',
    seller: sellerIds[3],
    allowSwap: true,
    tags: ['fantasy', 'young-adult', 'classic'],
    status: 'available',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'David Thomas & Andrew Hunt',
    isbn: '9780201616224',
    description: '20th Anniversary Edition. Like new condition.',
    price: 25.00,
    condition: 'like-new',
    category: 'technology',
    seller: sellerIds[1],
    allowSwap: false,
    tags: ['programming', 'software', 'career'],
    status: 'available',
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '9780399590504',
    description: 'Powerful memoir. Hardcover edition in great shape.',
    price: 15.00,
    condition: 'like-new',
    category: 'biography',
    seller: sellerIds[2],
    allowSwap: true,
    tags: ['memoir', 'education', 'bestseller'],
    status: 'available',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780062315007',
    description: 'Inspirational fable. Well-loved copy with a few dog-eared pages.',
    price: 7.50,
    condition: 'fair',
    category: 'fiction',
    seller: sellerIds[3],
    allowSwap: true,
    tags: ['inspirational', 'fable', 'classic'],
    status: 'available',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Book.deleteMany({}),
      Transaction.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users (passwords hashed by pre-save hook)
    const users = await User.insertMany(
      await Promise.all(
        sampleUsers.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 12),
        }))
      )
    );
    console.log(`👥 Created ${users.length} users`);

    // Create books
    const sellerIds = users.map((u) => u._id);
    const books = await Book.insertMany(sampleBooks(sellerIds));
    console.log(`📚 Created ${books.length} books`);

    // Create a sample transaction
    await Transaction.create({
      buyer: sellerIds[1],
      seller: sellerIds[2],
      book: books[2]._id,
      type: 'buy',
      amount: books[2].price,
      status: 'completed',
      bookTitleSnapshot: books[2].title,
    });

    // Add some wishlist items
    await Wishlist.insertMany([
      { user: sellerIds[1], book: books[3]._id },
      { user: sellerIds[1], book: books[4]._id },
      { user: sellerIds[2], book: books[0]._id },
    ]);

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────');
    console.log('🔑 Login credentials:');
    console.log('   Admin: admin@readcycle.com / Admin@123');
    console.log('   User:  alice@example.com   / Password123');
    console.log('   User:  bob@example.com     / Password123');
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();