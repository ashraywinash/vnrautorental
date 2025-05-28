const mongoose = require('mongoose');
const { required } = require('nodemon/lib/config');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true,
    },
    unitsLeased: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'units',
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    advancePaid: {
        type: String,
        required: true,
        default: 0,
    },
    aadhar: {
        type: String,
        required: true,
        unique: true,
    },
    pan: {
        type: String,
        required: true,
        unique: true,
    },
    monthlyRent:{
        type: Number,
    },

    paymentSummary: [       
        {
            rzp_payment_id: {
                type: String,
                required: true,
            },
            rzp_order_id: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],

});


tenantSchema.pre('save', async function (next) {
    if (this.isModified('unitsLeased') || this.isNew) {
        // Assuming each unit has a 'monthlyRent' field
        const Unit = mongoose.model('units');
        const units = await Unit.find({ _id: { $in: this.unitsLeased } });
        this.monthlyRent = units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0);
    }
    next();
});

tenantSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.unitsLeased) {
        const Unit = mongoose.model('units');
        const units = await Unit.find({ _id: { $in: update.unitsLeased } });
        update.monthlyRent = units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0);
        this.setUpdate(update);
    }
    next();
});
/**
 * Utility function to update monthlyRent for all existing tenants in the database.
 * Run this script separately (not as part of the schema file) to update existing documents.
 * 
 * Example usage:
 *   node scripts/updateMonthlyRent.js
 * 
 * In MongoDB Compass, you can manually update documents using the aggregation pipeline or update queries.
 * For bulk update, use the following aggregation in Compass's Aggregations tab:
 * 
 * 1. $lookup to join unitsLeased with units collection.
 * 2. $set to calculate the sum of monthlyRent from joined units.
 * 3. $merge or $out to update the tenants collection.
 * 
 * Alternatively, run this update in the MongoDB Shell or Compass's "Update Many" feature:
 * 
  db.tenants.find().forEach(function(tenant) {
    var unitIds = tenant.unitsLeased || [];
    var units = db.units.find({ _id: { $in: unitIds } }).toArray();
    var totalRent = units.reduce(function(sum, unit) {
      return sum + (unit.monthlyRent || 0);
    }, 0);
    db.tenants.updateOne({ _id: tenant._id }, { $set: { monthlyRent: totalRent } });
  });
 * 
 * Make sure to backup your data before running bulk updates.
 */
tenantSchema.virtual('tenantId').get(function () {
  return 'USR' + String(this.user_seq).padStart(5, '0');
});

const Tenant = mongoose.model('tenants', tenantSchema);

module.exports = Tenant;