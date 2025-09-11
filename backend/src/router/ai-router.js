const express = require("express");
const { analyze } = require("../controllers/ai-controller");

const router = express.Router();

// POST /api/ai/analyze
router.post("/analyze", analyze);

module.exports = router;
