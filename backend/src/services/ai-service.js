const fastapiClient = require("./fastapi-client");

async function analyzeText(text) {
  try {
    const res = await fastapiClient.post("/analyze", { text });
    return res.data;
  } catch (err) {
    console.error("Error calling FastAPI:", err.message);
    throw new Error("FastAPI service unavailable");
  }
}

module.exports = { analyzeText };
