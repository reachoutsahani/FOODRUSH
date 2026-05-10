

const Food = require('../models/Food');
const { cloudinary } = require('../config/cloudinary');


const getAllFood = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      isVeg,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

   
    const filter = { isAvailable: true };

    if (search) {
      filter.$text = { $search: search }; 
    }

    if (category) filter.category = category;
    if (isVeg === 'true') filter.isVeg = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit)); 
    const skip = (pageNum - 1) * limitNum;

    const [foods, total] = await Promise.all([
      Food.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Food.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: foods.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      foods,
    });
  } catch (error) {
    next(error);
  }
};


const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('reviews.user', 'name profileImage');

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    res.json({ success: true, food });
  } catch (error) {
    next(error);
  }
};

const createFood = async (req, res, next) => {
  try {
    const { name, description, price, category, restaurant, preparationTime, isVeg, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Food image is required' });
    }

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      category,
      restaurant,
      preparationTime: Number(preparationTime) || 30,
      isVeg: isVeg === 'true',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      image: req.file.path,           
      imagePublicId: req.file.filename, 
    });

    res.status(201).json({ success: true, message: 'Food item created!', food });
  } catch (error) {
    next(error);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    const { name, description, price, category, restaurant, preparationTime, isVeg, isAvailable, isFeatured, tags } = req.body;

   
    if (req.file && food.imagePublicId) {
      await cloudinary.uploader.destroy(food.imagePublicId);
    }

    const updates = {
      name, description,
      price: price ? Number(price) : food.price,
      category, restaurant,
      preparationTime: preparationTime ? Number(preparationTime) : food.preparationTime,
      isVeg: isVeg !== undefined ? isVeg === 'true' : food.isVeg,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : food.isAvailable,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : food.isFeatured,
      tags: tags ? tags.split(',').map(t => t.trim()) : food.tags,
    };

    if (req.file) {
      updates.image = req.file.path;
      updates.imagePublicId = req.file.filename;
    }

    
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const updatedFood = await Food.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Food item updated!', food: updatedFood });
  } catch (error) {
    next(error);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    
    if (food.imagePublicId) {
      await cloudinary.uploader.destroy(food.imagePublicId);
    }

    await food.deleteOne();
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Food.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

const getFeaturedFood = async (req, res, next) => {
  try {
    const foods = await Food.find({ isFeatured: true, isAvailable: true })
      .limit(8)
      .lean();
    res.json({ success: true, foods });
  } catch (error) {
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

   
    const alreadyReviewed = food.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this item' });
    }

    food.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });

    food.updateRating();
    await food.save();

    res.status(201).json({ success: true, message: 'Review added!', food });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFood,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  getCategories,
  getFeaturedFood,
  addReview,
};
