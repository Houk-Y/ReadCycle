/**
 * Transaction Model
 * Records all buy/swap transactions
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    type: {
      type: String,
      enum: ['buy', 'swap'],
      required: true,
    },
    // For swaps: the book offered by the buyer
    swapBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    // Snapshot of book title at time of transaction
    bookTitleSnapshot: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ book: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);