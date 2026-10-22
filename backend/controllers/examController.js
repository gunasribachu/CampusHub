
const Exam = require("../models/Exam");

// Create an exam
const createExam = async (req, res) => {
    try {
        const { subject, examDate, examTime, venue } = req.body;

        if (!subject || !examDate || !examTime) {
            return res.status(400).json({
                message: "Subject, exam date, and exam time are required"
            });
        }

        const exam = await Exam.create({
            subject,
            examDate,
            examTime,
            venue,
            userId: req.user.userId
        });

        res.status(201).json({
            message: "Exam created successfully",
            exam
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: "Failed to create exam",
            error: error.message
        });
    }
};

// Get all exams for the logged-in user

const getExams = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { search, subject, sortBy, order, page, limit } = req.query;

        // Search and filtering
        const filter = { userId };

        if (search) {
            filter.subject = { $regex: search, $options: "i" };
        }

        if (subject) {
            filter.subject = { $regex: subject, $options: "i" };
        }

        // Sorting
        const allowedSortFields = ["examDate", "createdAt", "subject"];
        const sortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "examDate";

        const sortOrder = order === "desc" ? -1 : 1;
        const sortOptions = { [sortField]: sortOrder };

        // Pagination
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNumber - 1) * pageSize;

        const totalExams = await Exam.countDocuments(filter);

        const exams = await Exam.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            totalExams,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalExams / pageSize),
            pageSize,
            exams
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve exams",
            error: error.message
        });
    }
};


// Update an exam
const updateExam = async (req, res) => {
    try {
        const { subject, examDate, examTime, venue } = req.body;
        const updates = {};

        if (subject !== undefined) updates.subject = subject;
        if (examDate !== undefined) updates.examDate = examDate;
        if (examTime !== undefined) updates.examTime = examTime;
        if (venue !== undefined) updates.venue = venue;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        const exam = await Exam.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        res.status(200).json({
            message: "Exam updated successfully",
            exam
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({
            message: "Failed to update exam",
            error: error.message
        });
    }
};

// Delete an exam
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!exam) {
            return res.status(404).json({
                message: "Exam not found"
            });
        }

        res.status(200).json({
            message: "Exam deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid exam ID" });
        }

        res.status(500).json({
            message: "Failed to delete exam",
            error: error.message
        });
    }
};

module.exports = {
    createExam,
    getExams,
    updateExam,
    deleteExam
};
