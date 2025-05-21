const express = require('express');
const unitController = require('../controllers/unitController');

const router = express.Router();

// Define routes for unit operations
router.get('/', unitController.getAllUnits);
router.get('/new', unitController.createUnitForm);
router.get('/:id', unitController.getUnitById);
router.post('/new', unitController.createUnit);
router.put('/:id', unitController.updateUnit);
router.delete('/:id', unitController.deleteUnit);

module.exports = router;