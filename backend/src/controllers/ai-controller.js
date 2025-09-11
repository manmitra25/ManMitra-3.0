const aiService = require("../services/ai-service");

async function analyze(req, res) {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const result = await aiService.analyzeText(text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { analyze };
