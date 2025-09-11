const express = require('express');
const router = express.Router();
const { 
  submitPHQ9, 
  submitGAD7, 
  getAssessmentHistory, 
  getMoodTrends,
  updateConsent,
  getPHQ9Questions,
  getGAD7Questions
} = require('../controllers/mood.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Public routes (questions)
router.get('/phq9/questions', getPHQ9Questions);
router.get('/gad7/questions', getGAD7Questions);

// Protected routes (require authentication)
router.use(authenticate);

router.post('/phq9/submit', submitPHQ9);
router.post('/gad7/submit', submitGAD7);
router.get('/history', getAssessmentHistory);
router.get('/trends', getMoodTrends);
router.put('/:assessmentId/consent', updateConsent);

module.exports = router;
