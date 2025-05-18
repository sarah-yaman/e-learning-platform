const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    email: { type: String, required:true},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    payment: {type:String, required: true},
    courses:[{type:String}],
    createdAt:{type:Date, default: new Date()}
})


module.exports = mongoose.model("Order", orderSchema)