const Tenant = require('../models/tenant.js'); // Assuming you have a Tenant model

// Get all tenants
const getAllTenants = async (req, res) => {
    try {
        const tenants = await Tenant.find({});
        res.render('adminTenant', { tenants });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenants', error: error.message });
    }
};

// Get a single tenant by ID
const getTenantById = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tenant', error });
    }
};

// Create a new tenant
const createTenant = async (req, res) => {
    console.log(req.body);
    try {
        const newTenant = new Tenant(req.body);
        const savedTenant = await newTenant.save();
        res.status(201).json(savedTenant);
    } catch (error) {
        res.status(500).json({ message: 'Error creating tenant', error });
    }
};

const createTenantForm = async (req, res) => {
    try {
        res.render('newTenantForm.ejs');
    } catch (error) {
        res.status(500).json({ message: 'Error creating tenant', error });
    }
};

// Update a tenant by ID
const updateTenant = async (req, res) => {
    try {
        const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedTenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(updatedTenant);
    } catch (error) {
        res.status(500).json({ message: 'Error updating tenant', error });
    }
};

// Delete a tenant by ID
const deleteTenant = async (req, res) => {
    try {
        const deletedTenant = await Tenant.findByIdAndDelete(req.params.id);
        if (!deletedTenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting tenant', error });
    }
};

module.exports = {
    getAllTenants,
    getTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
    createTenantForm,
};