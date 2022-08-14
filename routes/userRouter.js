const router = require('express').Router()
const userCtrl = require('../controllers/userController')
const auth = require('../middleware/auth')
// register route user 
router.post('/register', userCtrl.register)

// user activation route
router.post('/activation', userCtrl.activateEmail)

// user login route
router.post('/login', userCtrl.login)

// user refresh token
router.post('/refresh_token', userCtrl.getAccessToken)

// user forgot password activate route
router.post('/forgot', userCtrl.forgotPassword)

// user forgot password reset route
router.post('/reset',auth, userCtrl.resetPassword)

router.get("/info", userCtrl.getUserInfo)

// user all info 
router.get('/all', userCtrl.getUsersAllInfo)

router.get('/logout', userCtrl.logout)

module.exports = router