const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    description: {
        type: String, 
        required: true
    },
    duration: {
        type: Number,
        required: true
    }, 
    date: Date,
    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }
})

module.exports = mongoose.model("Exercise", exerciseSchema);