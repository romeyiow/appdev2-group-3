const express = require('express');
const router = express.Router();
const Student = require('../models/studentSchema');

//GET all students
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//GET a student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//GET 10 student for pagination
router.get('/page/:page', async (req, res) => {
    const page = parseInt(req.params.page) || 1;
    const limit = 10; // Number of students per page
    const skip = (page - 1) * limit;

    try {
        const students = await Student.find().skip(skip).limit(limit);
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

//POST a new student
router.post('/', async (req, res) => {
    const student = new Student({
        studentId: req.body.studentId,
        name: req.body.name,
        program: req.body.program,
        yearLevel: req.body.yearLevel
    });
    try {
        const newStudent = await student.save();
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

//PATCH a student by ID
router.patch('/:id', async (req, res) => {
    try {
        const student = await Student.findOne({ studentId: req.params.id });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (req.body.name != null) {
            student.name = req.body.name;
        }
        if (req.body.program != null) {
            student.program = req.body.program;
        }
        if (req.body.yearLevel != null) {
            student.yearLevel = req.body.yearLevel;
        }
        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
);

//DELETE a student by ID
// studentRoutes.js - Alternative DELETE handler (using Model.deleteOne)
router.delete('/:id', async (req, res) => {
    try {
        const deleteResult = await Student.deleteOne({ studentId: req.params.id });

        console.log("Delete result:", deleteResult);

        if (deleteResult.deletedCount === 0) {
            // If nothing was deleted, the student likely didn't exist with that ID
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' }); // Send success message

    } catch (err) {
        console.error("Backend Delete Error:", err);
        res.status(500).json({ message: err.message || 'Internal server error during delete.' });
    }
});

module.exports = router;