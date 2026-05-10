
//seeder for the purpose of testing my database and simmply start with node seeder.js and then clear it node seede.jss --clear

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Food = require('./models/Food');
const Order = require('./models/Order');

const sampleFoods = [
  {
    name: 'Classic Margherita Pizza',
    description: 'Hand-tossed thin crust with San Marzano tomato sauce, fresh mozzarella, and basil.',
    price: 299,
    category: 'Pizza',
    restaurant: "Mario's Kitchen",
    preparationTime: 25,
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    tags: ['bestseller', 'classic'],
    rating: 4.5,
    numReviews: 120,
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice slow-cooked with tender chicken, whole spices, saffron, and caramelised onions.',
    price: 349,
    category: 'Biryani',
    restaurant: 'Dum Pukht',
    preparationTime: 40,
    isVeg: false,
    isFeatured: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d651?w=800',
    tags: ['spicy', 'bestseller'],
    rating: 4.8,
    numReviews: 340,
  },
  {
    name: 'Veg Burger Deluxe',
    description: 'Crispy black bean patty, lettuce, tomato, cheese, and chipotle mayo in a brioche bun.',
    price: 199,
    category: 'Burgers',
    restaurant: 'Burger Barn',
    preparationTime: 15,
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    tags: ['veg-friendly'],
    rating: 4.2,
    numReviews: 85,
  },
  {
    name: 'Butter Chicken',
    description: 'Tender chicken in a rich, creamy tomato-based sauce with aromatic spices. Best with naan.',
    price: 320,
    category: 'North Indian',
    restaurant: 'Punjabi Tadka',
    preparationTime: 30,
    isVeg: false,
    isFeatured: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
    tags: ['creamy', 'popular'],
    rating: 4.7,
    numReviews: 210,
  },
  {
    name: 'Masala Dosa',
    description: 'Crispy golden dosa filled with spiced potato masala. Served with sambar and coconut chutney.',
    price: 149,
    category: 'South Indian',
    restaurant: 'Udupi Bhavan',
    preparationTime: 20,
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
    tags: ['light', 'breakfast'],
    rating: 4.4,
    numReviews: 165,
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten dark chocolate center. Served with vanilla ice cream.',
    price: 179,
    category: 'Desserts',
    restaurant: 'Sweet Spot',
    preparationTime: 15,
    isVeg: true,
    isFeatured: true,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
    tags: ['indulgent', 'popular'],
    rating: 4.9,
    numReviews: 95,
  },
  {
    name: 'Hakka Noodles',
    description: 'Wok-tossed egg noodles with fresh vegetables, soy sauce, and chilli. A street-food classic.',
    price: 189,
    category: 'Chinese',
    restaurant: 'Dragon Wok',
    preparationTime: 20,
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800',
    tags: ['spicy', 'quick'],
    rating: 4.1,
    numReviews: 70,
  },
  {
    name: 'Mango Lassi',
    description: 'Thick, chilled yoghurt blended with ripe Alphonso mangoes and a pinch of cardamom.',
    price: 99,
    category: 'Beverages',
    restaurant: 'Udupi Bhavan',
    preparationTime: 5,
    isVeg: true,
    isFeatured: false,
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=800',
    tags: ['refreshing', 'summer'],
    rating: 4.6,
    numReviews: 52,
  },
];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(' MongoDB connected');
};

const seedDB = async () => {
  await connectDB();

  if (process.argv[2] === '--clear') {
    await Promise.all([User.deleteMany({}), Food.deleteMany({}), Order.deleteMany({})]);
    console.log('All data cleared');
    process.exit();
  }

 
  const existingAdmin = await User.findOne({ email: 'admin@foodrush.com' });
  if (!existingAdmin) {
    await User.create({
      name: 'FoodRush Admin',
      email: 'admin@foodrush.com',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
    });
    console.log(' Admin user created: admin@foodrush.com / admin123');
  } else {
    console.log(' Admin user already exists');
  }


  const existingUser = await User.findOne({ email: 'user@foodrush.com' });
  if (!existingUser) {
    await User.create({
      name: 'Test User',
      email: 'user@foodrush.com',
      password: 'user123',
      role: 'user',
      phone: '8888888888',
    });
    console.log('👤 Test user created: user@foodrush.com / user123');
  }

  
  await Food.deleteMany({});
  const foods = await Food.insertMany(sampleFoods);
  console.log(` ${foods.length} food items seeded`);

  console.log('\n Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:     admin@foodrush.com / admin123');
  console.log('Test User: user@foodrush.com  / user123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit();
};

seedDB().catch((err) => {
  console.error(' Seeding failed:', err);
  process.exit(1);
});
