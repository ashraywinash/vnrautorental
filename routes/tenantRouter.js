const express = require('express');
const tenantController = require('../controllers/tenantController');

const router = express.Router();

// Route to get all tenants
router.get('/', tenantController.getAllTenants);

router.get('/new', tenantController.createTenantForm);
// Route to get a single tenant by ID
router.get('/:id', tenantController.getTenantById);

// Route to create a new tenant
router.post('/new', tenantController.createTenant);



// Route to update a tenant by ID
router.put('/:id', tenantController.updateTenant);

// Route to delete a tenant by ID
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;