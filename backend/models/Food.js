
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Burgers', 'Pizza', 'Biryani', 'Chinese', 'South Indian',
        'North Indian', 'Desserts', 'Beverages', 'Salads', 'Rolls',
        'Pasta', 'Sandwiches', 'Breakfast', 'Snacks', 'Seafood',
      ],
    },
    image: {
      type: String,
      required: [true, 'Food image is required'],
    },
    imagePublicId: {
      type: String,  
    },
    restaurant: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    preparationTime: {
      type: Number, 
      default: 30,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],

    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [String], 
  },
  {
    timestamps: true,
  }
);

foodSchema.index({ name: 'text', description: 'text', restaurant: 'text' });
foodSchema.index({ category: 1 });
foodSchema.index({ price: 1 });

foodSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;
