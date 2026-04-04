// routes/authRoutes.js - Authentication endpoints
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
  searchUsers,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validateMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/users/search', protect, adminOnly, searchUsers);

module.exports = router;
