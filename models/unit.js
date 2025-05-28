const mongoose = require("mongoose")

const unitSchema = mongoose.Schema({

    unitType : {
        type : String,
        required : true,
        enum : ["RES","COM"]
    },

    size: {
        type: String,
        required: true,
        enum: ["1BHK", "2BHK", "SINGLE_ROOM", "SHOP", "SMALL_SHOP"]
    },

    id : {
        type : String,
        required : true,
        unique : true
    },
    
    payments: [{
        year: {
            type: Number,
            required: true
        },
        monthsPaid: {
            type: Number,
            required: true,
            default: 0,
            max: 12
        }
    }],

    tenantsHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tenants'
        }
    ],
    address: {
        type: String,
        required: true
    },
    electricityUSN: {
        type: String,
        required: true
    },
    monthlyRent: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["OCCUPIED", "VACANT"],
        default : "VACANT"
    },
});

function paymentsYearHandler(next) {
    if (this.payments && this.payments.length > 0) {
        const lastPayment = this.payments[this.payments.length - 1];
        if (lastPayment.monthsPaid >= 12) {
            const newYear = lastPayment.year + 1;
            // Prevent duplicate year entry
            const exists = this.payments.some(p => p.year === newYear);
            if (!exists) {
                this.payments.push({
                    year: newYear,
                    monthsPaid: 0
                });
            }
        }
    }
    next();
}

// Run on save and update
unitSchema.pre('save', paymentsYearHandler);
unitSchema.pre('findOneAndUpdate', function(next) {
    // For update queries, 'this' is the query, so we need to get the update object
    const update = this.getUpdate();
    if (update && update.payments && Array.isArray(update.payments) && update.payments.length > 0) {
        const lastPayment = update.payments[update.payments.length - 1];
        if (lastPayment.monthsPaid >= 12) {
            const newYear = Number(lastPayment.year) + 1;
            const exists = update.payments.some(p => p.year === newYear);
            if (!exists) {
                update.payments.push({
                    year: newYear,
                    monthsPaid: 0
                });
            }
        }
    }
    next();
});


const units = mongoose.model('units',unitSchema)


module.exports = units