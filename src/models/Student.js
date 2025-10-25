const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // The registerNumber field is now optional or can be removed if not needed.
    registerNumber: {
        type: String,
        required: false,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    }]
});

module.exports = mongoose.model('Student', StudentSchema);