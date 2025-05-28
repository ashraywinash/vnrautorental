const mongoose = require('mongoose');
const unit = require('../models/unit.js'); // Ensure this exports a valid Mongoose model


const getAllUnits = async (req, res) => {
    try {
        const units = await unit.find({});
        
        res.render('adminUnit', { units });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a unit by ID
const getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.status(200).json(unit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new unit
const createUnit = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear().toString();

        const newUnitData = {
            ...req.body,
            payments: [
            {
                year: currentYear,
                monthsPaid: parseInt(req.body.monthsPaid) || 0
            }
            ],
        };

        const newUnit = new unit(newUnitData);
        const savedUnit = await newUnit.save();

        res.redirect('/admin/unit');
    } catch (error) {
        console.error("Error creating unit:", error);
        res.status(500).json({ message: 'Error creating unit', error });
    }
};
const createUnitForm = async (req, res) => {
    try {
        res.render('newUnitForm.ejs');
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a unit
const updateUnit = async (req, res) => {
    try {
        const updatedUnit = await unit.findOneAndUpdate({id:req.body.id}, req.body, {
            runValidators: true,
        });
        if (!updatedUnit) { 
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.status(201).json({ message: 'Unit updated successfully' });
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: error.message });
    }
};

const updateUnitForm = async (req, res) => {
    try {
        const unitToUpdate = await unit.find({id:req.params.id});
        if (!unitToUpdate) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.render('updateUnitForm.ejs', { unit: unitToUpdate[0] });
    } catch (error) {
        console.log("dkjnfjn")
        res.status(400).json({ message: error.message });
    }
};

// Delete a unit
const deleteUnit = async (req, res) => {
    try {
        const deletedUnit = await unit.findOneAndDelete({id : req.params.id});
        if (!deletedUnit) {
            return res.status(404).json({ message: 'Unit not found' });
        }
        res.status(200).json({ message: 'Unit deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUnits,
    getUnitById,
    createUnit,
    updateUnit,
    deleteUnit,
    createUnitForm,
    updateUnitForm
};