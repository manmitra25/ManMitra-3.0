const axios = require("axios");

const fastapiClient = axios.create({
  baseURL: process.env.FASTAPI_URL || "http://localhost:8000",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

module.exports = fastapiClient;
