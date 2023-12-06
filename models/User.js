const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    exercises: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise"
        }
    ]
}, {_id: true})

module.exports = mongoose.model("User", userSchema)