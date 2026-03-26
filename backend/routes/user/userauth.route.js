const express = require('express');
const router = express.Router();
const userauthMiddleware = require('../../middleware/user/userauth.middleware');
const { login } = require('../../controllers/auth.controller');

router.post('/userlogin', userauthMiddleware, login);

module.exports = router;