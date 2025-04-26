const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    studentId: {
        type: Number,
        required: true
    }, name: {
        type: String,
        required: true
    },
    program: {
        type: String,
        required: true
    },
    yearLevel:{
        type: String,
        required: true
    }
},{ versionKey: false });

module.exports = mongoose.model('Student', studentSchema);