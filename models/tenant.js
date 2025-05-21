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
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
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
    user_seq: {
        type: Number,
        unique: true,
        required: true,
    }
});

tenantSchema.plugin(require('mongoose-sequence')(mongoose), { 
    id: 'user_seq', 
    inc_field: 'user_seq', 
    start_seq: 0,
    prefix: 'USR',
    pad_size: 5 
});


const Tenant = mongoose.model('tenants', tenantSchema);

module.exports = Tenant;