import axios from "axios";

const FASTAPI_URL = "http://localhost:8001";

export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const response = await axios.get(`${FASTAPI_URL}/analytics/student/${studentId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching analytics" });
  }
};

export const getStudentPdf = async (req, res) => {
  try {
    const { studentId } = req.params;
    const response = await axios.get(`${FASTAPI_URL}/analytics/pdf/${studentId}`, {
      responseType: "arraybuffer"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${studentId}_report.pdf`);
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error generating PDF" });
  }
};
