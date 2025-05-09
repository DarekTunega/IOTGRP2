import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Test user for development
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (email === TEST_USER.email) {
      return res.status(201).json({
        message: 'Registration successful!',
        user: { name, email }
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: 'Registration successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === TEST_USER.email && password === TEST_USER.password) {
      const token = jwt.sign({ id: 'test_user_id' }, process.env.JWT_SECRET || 'super_secret_key', {
        expiresIn: '1h'
      });
      return res.status(200).json({
        message: 'Login successful!',
        token,
        user: {
          id: 'test_user_id',
          name: TEST_USER.name,
          email: TEST_USER.email
        }
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid login credentials!' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'super_secret_key', {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout (dummy endpoint)
export const logout = (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};
