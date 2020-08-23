const express = require('express');
const ROUTER = express.Router();
const USER_CONTROLLER = require('../controllers/user-controller.js')
const AUTH_CONTROLLER = require('../controllers/auth-controller.js')


// USER AUTHENTICATION FUNCTIONS
ROUTER.post('/signup', AUTH_CONTROLLER.signup)


// USER ADMINISTRATION FUNCTIONS
ROUTER.route('/')
   .get(USER_CONTROLLER.getAllUsers)
   .post(USER_CONTROLLER.createUser);

ROUTER.route('/:id')
   .get(USER_CONTROLLER.getUser)
   .patch(USER_CONTROLLER.updateUser)
   .delete(USER_CONTROLLER.deleteUser)


module.exports = ROUTER