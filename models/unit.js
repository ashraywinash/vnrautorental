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
    
    payments: {
        type: Map,
        of: {
            monthsPaid: {
                type: Number,
                required: true,
                default: 0,
                max: 12
            }
        },
        default: {}
    },
    
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

function ensurePaymentsEntry(next) {
    const years = Array.from(this.payments.keys()).sort();
    let latestYear = new Date().getFullYear().toString();
    if (years.length > 0) {
        latestYear = years[years.length - 1];
    }
    const latestPayment = this.payments.get(latestYear);
    if (!latestPayment) {
        this.payments.set(latestYear, { monthsPaid: 0 });
    } else if (latestPayment.monthsPaid >= 12) {
        const nextYear = (parseInt(latestYear) + 1).toString();
        if (!this.payments.has(nextYear)) {
            this.payments.set(nextYear, { monthsPaid: 0 });
        }
    }
    next();
}

// For .save()
unitSchema.pre('save', ensurePaymentsEntry);

/**
 * Ensure payments entry logic for update queries.
 * This runs before findOneAndUpdate, updateOne, and update.
 */
unitSchema.pre(['findOneAndUpdate', 'updateOne', 'update'], async function(next) {
    console.log("Mongoose pre-update hook triggered"); // <-- This will log if the hook runs

    // Only run if payments is being updated
    const update = this.getUpdate();

    // Handle $set and direct updates
    let payments = update.payments || (update.$set && update.$set.payments);

    if (payments && typeof payments === 'object') {
        const years = Object.keys(payments).sort();
        let latestYear = new Date().getFullYear().toString();
        if (years.length > 0) {
            latestYear = years[years.length - 1];
        }
        const latestPayment = payments[latestYear];
        if (!latestPayment) {
            payments[latestYear] = { monthsPaid: 0 };
        } else if (latestPayment.monthsPaid >= 12) {
            const nextYear = (parseInt(latestYear) + 1).toString();
            if (!payments[nextYear]) {
                payments[nextYear] = { monthsPaid: 0 };
            }
        }
        // If payments was under $set, update it there
        if (update.$set && update.$set.payments) {
            update.$set.payments = payments;
        } else {
            update.payments = payments;
        }
    }
    next();
});

const units = mongoose.model('units',unitSchema)


module.exports = units