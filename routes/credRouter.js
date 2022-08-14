const router = require('express').Router()
const credCtrl = require('../controllers/credController')
const auth = require('../middleware/auth')
// register route user 
router.post('/:id', credCtrl.addCred)
router.get('/:id', credCtrl.getCred)
router.delete('/:id', credCtrl.deleteCred)
router.post('/share/:id', credCtrl.share)
router.get('/', credCtrl.findCred)
module.exports = router