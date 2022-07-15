const router = require('express').Router()
const credCtrl = require('../controllers/credController')
const auth = require('../middleware/auth')
// register route user 
router.post('/add', credCtrl.addCred)
router.get('/get', credCtrl.getCred)

module.exports = router