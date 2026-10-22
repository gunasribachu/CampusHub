
const Assignment = require("../models/Assignment");

const createAssignment = async (req, res) => {
    try {
        const { title, subject, dueDate } = req.body;

        if (!title || !subject || !dueDate) {
            return res.status(400).json({
                message: "Title, subject and due date are required"
            });
        }

        const assignment = await Assignment.create({
            title,
            subject,
            dueDate,
            userId: req.user.userId
        });

        return res.status(201).json({
            message: "Assignment created successfully",
            assignment
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid assignment data"
            });
        }

        console.error("Create assignment error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getAssignments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { search, status, subject, sortBy, order, page, limit } = req.query;

        // Search and filter
        const filter = { userId };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (subject) {
            filter.subject = { $regex: subject, $options: "i" };
        }

        // Sorting
        const allowedSortFields = ["dueDate", "createdAt", "title"];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : "dueDate";
        const sortOrder = order === "desc" ? -1 : 1;
        const sortOptions = { [sortField]: sortOrder };

        // Pagination
        const pageNumber = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
        const skip = (pageNumber - 1) * pageSize;

        const totalAssignments = await require("../models/Assignment").countDocuments(filter);

        const assignments = await require("../models/Assignment")
            .find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        res.status(200).json({
            totalAssignments,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalAssignments / pageSize),
            pageSize,
            assignments
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve assignments",
            error: error.message
        });
    }
};



const updateAssignment = async (req, res) => {
    try {
        const { title, subject, dueDate, status } = req.body;
        const allowedFields = ["title", "subject", "dueDate", "status"];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        const assignment = await Assignment.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.userId
            },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        return res.status(200).json({
            message: "Assignment updated successfully",
            assignment
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid assignment data or ID"
            });
        }

        console.error("Update assignment error:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!assignment) {
            return res.status(404).json({
                message: "Assignment not found"
            });
        }

        return res.status(200).json({
            message: "Assignment deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid assignment ID"
            });
        }

        console.error("Delete assignment error:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createAssignment,
    getAssignments,
    updateAssignment,
    deleteAssignment
};
