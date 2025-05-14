const mongoose = require("mongoose")

const unitSchema = mongoose.Schema({

    unitType : {
        type : String,
        required : true,
        enum : ["RES","COM"]
    },
    id : {
        type : String,
        required : true,
        unique : true
    },
    monthsPaid : {
        type : Number,
        required : true,
        default : 0
    }

})


const unitModel = mongoose.model('units',unitSchema)

module.exports = {
    unitModel
}