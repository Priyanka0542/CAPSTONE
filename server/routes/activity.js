const router = require('express').Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { checkinSchema } = require('../validators/activityValidators');

router.use(auth);

router.get('/today', activityController.getToday);
router.post('/checkin', validate(checkinSchema), activityController.checkin);
router.get('/streaks', activityController.getStreaks);
router.get('/badges', activityController.getBadges);

module.exports = router;
