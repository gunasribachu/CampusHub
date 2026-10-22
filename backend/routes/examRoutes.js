
const express = require("express");
const {
    createExam,
    getExams,
    updateExam,
    deleteExam
} = require("../controllers/examController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createExam);
router.get("/", authMiddleware, getExams);
router.put("/:id", authMiddleware, updateExam);
router.delete("/:id", authMiddleware, deleteExam);

module.exports = router;
