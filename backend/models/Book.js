/**
 * Book Model
 * Represents a book listing on the marketplace
 */

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    condition: {
      type: String,
      required: [true, 'Book condition is required'],
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'fiction', 'non-fiction', 'science', 'history', 'biography',
        'self-help', 'technology', 'business', 'children', 'academic',
        'art', 'travel', 'cooking', 'health', 'religion', 'other',
      ],
    },
    image: {
      type: String,
      default: null,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'swap-only'],
      default: 'available',
    },
    allowSwap: {
      type: Boolean,
      default: false,
    },
    // Concurrency: lock when a purchase is being processed
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  { timestamps: true }
);

// ─── Indexes for search performance ───────────────────────────────────────────

bookSchema.index({ title: 'text', author: 'text', description: 'text', isbn: 'text' });
bookSchema.index({ category: 1, condition: 1, status: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ seller: 1 });

// ─── Virtual: Formatted price ─────────────────────────────────────────────────

bookSchema.virtual('formattedPrice').get(function () {
  return `$${this.price.toFixed(2)}`;
});

module.exports = mongoose.model('Book', bookSchema);