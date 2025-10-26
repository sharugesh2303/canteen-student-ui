const mongoose = require('mongoose');

const StudentSchema = new new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // --- REMOVED: registerNumber field entirely to simplify the model ---
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