const express = require("express");
const { createAssignment, getAssignments, updateAssignment, deleteAssignment } = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createAssignment);
router.get("/", authMiddleware, getAssignments);
router.put("/:id", authMiddleware, updateAssignment);
router.delete("/:id", authMiddleware, deleteAssignment);

module.exports = router;