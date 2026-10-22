
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        trim: true
    },
    examDate: {
        type: Date,
        required: true
    },
    examTime: {
        type: String,
        required: true,
        trim: true
    },
    venue: {
        type: String,
        trim: true,
        default: ""
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Exam", examSchema);
