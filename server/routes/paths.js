const router = require('express').Router();
const pathController = require('../controllers/pathController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createPathSchema, updatePathSchema } = require('../validators/pathValidators');

router.use(auth);

router.post('/', validate(createPathSchema), pathController.createPath);
router.get('/', pathController.getPaths);
router.get('/compare', pathController.comparePaths);
router.get('/benchmark', pathController.getPeerBenchmark);
router.get('/:id', pathController.getPath);
router.patch('/:id', validate(updatePathSchema), pathController.updatePath);
router.delete('/:id', pathController.deletePath);
router.patch('/:id/milestone/:milestoneId', pathController.completeMilestone);
router.post('/:id/mentor-chat', pathController.mentorChat);

module.exports = router;
