
const Assignment = require("../models/Assignment");
const Exam = require("../models/Exam");

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        // Assignment statistics
        const totalAssignments = await Assignment.countDocuments({ userId });

        const completedAssignments = await Assignment.countDocuments({
            userId,
            status: "Completed"
        });

        const pendingAssignments = await Assignment.countDocuments({
            userId,
            status: "Pending"
        });

        const overdueAssignments = await Assignment.countDocuments({
            userId,
            status: "Pending",
            dueDate: { $lt: today }
        });

        const completionPercentage = totalAssignments === 0
            ? 0
            : Number(((completedAssignments / totalAssignments) * 100).toFixed(2));

        // Exam statistics
        const totalExams = await Exam.countDocuments({ userId });

        const nextExam = await Exam.findOne({
            userId,
            examDate: { $gte: today }
        }).sort({ examDate: 1, examTime: 1 });

        res.status(200).json({
            assignments: {
                total: totalAssignments,
                pending: pendingAssignments,
                completed: completedAssignments,
                overdue: overdueAssignments,
                completionPercentage
            },
            exams: {
                total: totalExams,
                nextExam
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve dashboard statistics",
            error: error.message
        });
    }
};

module.exports = { getDashboardStats };
