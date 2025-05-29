import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';

// Load environment variables
dotenv.config();

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

async function createTestUser() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const userExists = await User.findOne({ email: testUser.email });

    if (userExists) {
      console.log('Test user already exists:', testUser.email);
      console.log('You can login with:');
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
    } else {
      // Create the user
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({
        name: testUser.name,
        email: testUser.email,
        password: hashedPassword
      });

      console.log('Test user created successfully!');
      console.log('You can login with:');
      console.log('Email:', testUser.email);
      console.log('Password:', testUser.password);
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
createTestUser();
