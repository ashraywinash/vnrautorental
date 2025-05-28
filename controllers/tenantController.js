const Tenant = require('../models/tenant.js'); // Assuming you have a Tenant model
const Unit = require('../models/unit.js');

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
    try {
        const newTenant = new Tenant(req.body);
        const savedTenant = await newTenant.save();
        // Update the status of the leased unit to 'LEASED'
        if (req.body.unitsLeased) {
            await Unit.updateMany(
                { _id: { $in: req.body.unitsLeased } },
                { $set: { status: 'OCCUPIED' } }
            );
        }
        res.status(201).json(savedTenant);
    } catch (error) {
        console.log("Error creating tenant:");
        res.status(500).json({ message: 'Error creating tenant', error });
    }
};

const createTenantForm = async (req, res) => {
    
    try {
        const vacantUnits = await Unit.find({ status: 'VACANT' });
        if (!vacantUnits || vacantUnits.length === 0) {
            return res.status(404).json({ message: 'No vacant units available' });
        }
        res.render('newTenantForm.ejs', { vacantUnits });
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
        // Update the status of the previously leased units to 'VACANT'
        if (deletedTenant.unitsLeased && deletedTenant.unitsLeased.length > 0) {
            await Unit.updateMany(
                { _id: { $in: deletedTenant.unitsLeased } },
                { $set: { status: 'VACANT' } }
            );
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