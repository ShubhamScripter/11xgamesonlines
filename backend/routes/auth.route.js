const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { login, registerDownline } = require('../controllers/auth.controller');

router.post('/login', login);

router.post(
  '/register-downline',
  authMiddleware(['admin', 'subadmin', 'seniorSuper', 'superAgent', 'agent']),
  registerDownline
);

module.exports = router;



