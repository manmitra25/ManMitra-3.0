const MoodEntry = require('../../models/moodEntry.model');
const User = require('../../models/user.model');
const AuditEvent = require('../../models/auditEvent.model');
const { sendNotification } = require('../../services/websocket.service');

/**
 * Submit PHQ-9 assessment
 */
const submitPHQ9 = async (req, res) => {
  try {
    const { responses, language = 'en' } = req.body;
    const userId = req.user.id;

    // Validate responses
    if (!responses || !Array.isArray(responses) || responses.length !== 9) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PHQ-9 responses. Must have 9 responses.'
      });
    }

    // Validate each response
    for (let i = 0; i < responses.length; i++) {
      if (typeof responses[i] !== 'number' || responses[i] < 0 || responses[i] > 3) {
        return res.status(400).json({
          success: false,
          message: `Invalid response for question ${i + 1}. Must be between 0-3.`
        });
      }
    }

    // Calculate total score
    const totalScore = responses.reduce((sum, score) => sum + score, 0);

    // Determine severity level
    let severityLevel, interpretation, recommendations, crisisFlag = false;
    
    if (totalScore <= 4) {
      severityLevel = 'minimal';
      interpretation = 'Minimal depression symptoms';
      recommendations = ['Continue current activities', 'Practice self-care'];
    } else if (totalScore <= 9) {
      severityLevel = 'mild';
      interpretation = 'Mild depression symptoms';
      recommendations = ['Monitor symptoms', 'Consider lifestyle changes', 'Use self-help resources'];
    } else if (totalScore <= 14) {
      severityLevel = 'moderate';
      interpretation = 'Moderate depression symptoms';
      recommendations = ['Consider counseling', 'Use mental health resources', 'Practice stress management'];
    } else if (totalScore <= 19) {
      severityLevel = 'moderately_severe';
      interpretation = 'Moderately severe depression symptoms';
      recommendations = ['Seek professional help', 'Consider counseling', 'Use crisis resources if needed'];
    } else {
      severityLevel = 'severe';
      interpretation = 'Severe depression symptoms';
      recommendations = ['Immediate professional help recommended', 'Consider crisis support', 'Contact counselor'];
      crisisFlag = true;
    }

    // Check for crisis indicators (Q9 > 0)
    if (responses[8] > 0) {
      crisisFlag = true;
      recommendations.push('Crisis support available if needed');
    }

    // Create mood entry
    const moodEntry = new MoodEntry({
      userId: userId,
      testType: 'PHQ-9',
      responses: responses.map((score, index) => ({
        questionId: `phq9_q${index + 1}`,
        score: score
      })),
      totalScore: totalScore,
      assessmentDate: new Date(),
      severityLevel: severityLevel,
      interpretation: interpretation,
      recommendations: recommendations,
      crisisFlag: crisisFlag,
      language: language,
      consentToStore: true, // User consented by submitting
      consentToShareWithCounselor: false // Default to false, can be updated later
    });

    await moodEntry.save();

    // Log assessment completion
    await AuditEvent.create({
      eventType: 'assessment_completed',
      userId: userId,
      metadata: {
        assessmentType: 'PHQ-9',
        totalScore: totalScore,
        severityLevel: severityLevel,
        crisisFlag: crisisFlag
      },
      severity: crisisFlag ? 'high' : 'info'
    });

    // Send crisis notification if flagged
    if (crisisFlag) {
      await sendNotification(userId, {
        type: 'crisis_assessment',
        title: 'Assessment Results - Support Available',
        message: 'Your assessment results indicate you may benefit from additional support. Help is available.',
        priority: 'high'
      });
    }

    res.json({
      success: true,
      message: 'PHQ-9 assessment submitted successfully',
      data: {
        assessmentId: moodEntry._id,
        totalScore: totalScore,
        severityLevel: severityLevel,
        interpretation: interpretation,
        recommendations: recommendations,
        crisisFlag: crisisFlag,
        completedAt: moodEntry.assessmentDate
      }
    });

  } catch (error) {
    console.error('Error submitting PHQ-9:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit PHQ-9 assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Submit GAD-7 assessment
 */
const submitGAD7 = async (req, res) => {
  try {
    const { responses, language = 'en' } = req.body;
    const userId = req.user.id;

    // Validate responses
    if (!responses || !Array.isArray(responses) || responses.length !== 7) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GAD-7 responses. Must have 7 responses.'
      });
    }

    // Validate each response
    for (let i = 0; i < responses.length; i++) {
      if (typeof responses[i] !== 'number' || responses[i] < 0 || responses[i] > 3) {
        return res.status(400).json({
          success: false,
          message: `Invalid response for question ${i + 1}. Must be between 0-3.`
        });
      }
    }

    // Calculate total score
    const totalScore = responses.reduce((sum, score) => sum + score, 0);

    // Determine severity level
    let severityLevel, interpretation, recommendations, crisisFlag = false;
    
    if (totalScore <= 4) {
      severityLevel = 'minimal';
      interpretation = 'Minimal anxiety symptoms';
      recommendations = ['Continue current activities', 'Practice relaxation techniques'];
    } else if (totalScore <= 9) {
      severityLevel = 'mild';
      interpretation = 'Mild anxiety symptoms';
      recommendations = ['Monitor symptoms', 'Practice stress management', 'Use self-help resources'];
    } else if (totalScore <= 14) {
      severityLevel = 'moderate';
      interpretation = 'Moderate anxiety symptoms';
      recommendations = ['Consider counseling', 'Practice anxiety management techniques', 'Use mental health resources'];
    } else {
      severityLevel = 'severe';
      interpretation = 'Severe anxiety symptoms';
      recommendations = ['Professional help recommended', 'Consider counseling', 'Use crisis resources if needed'];
      crisisFlag = true;
    }

    // Create mood entry
    const moodEntry = new MoodEntry({
      userId: userId,
      testType: 'GAD-7',
      responses: responses.map((score, index) => ({
        questionId: `gad7_q${index + 1}`,
        score: score
      })),
      totalScore: totalScore,
      assessmentDate: new Date(),
      severityLevel: severityLevel,
      interpretation: interpretation,
      recommendations: recommendations,
      crisisFlag: crisisFlag,
      language: language,
      consentToStore: true,
      consentToShareWithCounselor: false
    });

    await moodEntry.save();

    // Log assessment completion
    await AuditEvent.create({
      eventType: 'assessment_completed',
      userId: userId,
      metadata: {
        assessmentType: 'GAD-7',
        totalScore: totalScore,
        severityLevel: severityLevel,
        crisisFlag: crisisFlag
      },
      severity: crisisFlag ? 'high' : 'info'
    });

    // Send crisis notification if flagged
    if (crisisFlag) {
      await sendNotification(userId, {
        type: 'crisis_assessment',
        title: 'Assessment Results - Support Available',
        message: 'Your assessment results indicate you may benefit from additional support. Help is available.',
        priority: 'high'
      });
    }

    res.json({
      success: true,
      message: 'GAD-7 assessment submitted successfully',
      data: {
        assessmentId: moodEntry._id,
        totalScore: totalScore,
        severityLevel: severityLevel,
        interpretation: interpretation,
        recommendations: recommendations,
        crisisFlag: crisisFlag,
        completedAt: moodEntry.assessmentDate
      }
    });

  } catch (error) {
    console.error('Error submitting GAD-7:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit GAD-7 assessment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's assessment history
 */
const getAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { testType, page = 1, limit = 10 } = req.query;

    const filter = { userId: userId };
    if (testType) {
      filter.testType = testType.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      MoodEntry.find(filter)
        .select({
          testType: 1,
          totalScore: 1,
          severityLevel: 1,
          interpretation: 1,
          recommendations: 1,
          crisisFlag: 1,
          assessmentDate: 1,
          language: 1
        })
        .sort({ assessmentDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      MoodEntry.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        assessments: assessments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAssessments: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get mood trends and analytics
 */
const getMoodTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get assessments in the specified period
    const assessments = await MoodEntry.find({
      userId: userId,
      assessmentDate: { $gte: startDate }
    }).sort({ assessmentDate: 1 });

    // Calculate trends
    const trends = {
      phq9: {
        scores: assessments.filter(a => a.testType === 'PHQ-9').map(a => ({
          date: a.assessmentDate,
          score: a.totalScore,
          severity: a.severityLevel
        })),
        averageScore: 0,
        trend: 'stable'
      },
      gad7: {
        scores: assessments.filter(a => a.testType === 'GAD-7').map(a => ({
          date: a.assessmentDate,
          score: a.totalScore,
          severity: a.severityLevel
        })),
        averageScore: 0,
        trend: 'stable'
      }
    };

    // Calculate averages
    const phq9Scores = trends.phq9.scores.map(s => s.score);
    const gad7Scores = trends.gad7.scores.map(s => s.score);

    if (phq9Scores.length > 0) {
      trends.phq9.averageScore = phq9Scores.reduce((sum, score) => sum + score, 0) / phq9Scores.length;
      
      // Determine trend
      if (phq9Scores.length >= 2) {
        const firstHalf = phq9Scores.slice(0, Math.floor(phq9Scores.length / 2));
        const secondHalf = phq9Scores.slice(Math.floor(phq9Scores.length / 2));
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 1) trends.phq9.trend = 'worsening';
        else if (secondAvg < firstAvg - 1) trends.phq9.trend = 'improving';
      }
    }

    if (gad7Scores.length > 0) {
      trends.gad7.averageScore = gad7Scores.reduce((sum, score) => sum + score, 0) / gad7Scores.length;
      
      // Determine trend
      if (gad7Scores.length >= 2) {
        const firstHalf = gad7Scores.slice(0, Math.floor(gad7Scores.length / 2));
        const secondHalf = gad7Scores.slice(Math.floor(gad7Scores.length / 2));
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 1) trends.gad7.trend = 'worsening';
        else if (secondAvg < firstAvg - 1) trends.gad7.trend = 'improving';
      }
    }

    // Get severity distribution
    const severityDistribution = {
      minimal: assessments.filter(a => a.severityLevel === 'minimal').length,
      mild: assessments.filter(a => a.severityLevel === 'mild').length,
      moderate: assessments.filter(a => a.severityLevel === 'moderate').length,
      moderately_severe: assessments.filter(a => a.severityLevel === 'moderately_severe').length,
      severe: assessments.filter(a => a.severityLevel === 'severe').length
    };

    res.json({
      success: true,
      data: {
        trends: trends,
        severityDistribution: severityDistribution,
        totalAssessments: assessments.length,
        period: `${days} days`,
        lastAssessment: assessments.length > 0 ? assessments[assessments.length - 1].assessmentDate : null
      }
    });

  } catch (error) {
    console.error('Error fetching mood trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update consent for sharing with counselor
 */
const updateConsent = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { consentToShareWithCounselor } = req.body;
    const userId = req.user.id;

    const assessment = await MoodEntry.findOne({
      _id: assessmentId,
      userId: userId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    assessment.consentToShareWithCounselor = consentToShareWithCounselor;
    await assessment.save();

    // Log consent update
    await AuditEvent.create({
      eventType: 'consent_updated',
      userId: userId,
      metadata: {
        assessmentId: assessmentId,
        assessmentType: assessment.testType,
        consentToShareWithCounselor: consentToShareWithCounselor
      },
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Consent updated successfully',
      data: {
        consentToShareWithCounselor: consentToShareWithCounselor
      }
    });

  } catch (error) {
    console.error('Error updating consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get assessment questions (PHQ-9)
 */
const getPHQ9Questions = async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    const questions = {
      en: [
        "Little interest or pleasure in doing things",
        "Feeling down, depressed, or hopeless",
        "Trouble falling or staying asleep, or sleeping too much",
        "Feeling tired or having little energy",
        "Poor appetite or overeating",
        "Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
        "Trouble concentrating on things, such as reading the newspaper or watching television",
        "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
        "Thoughts that you would be better off dead, or of hurting yourself"
      ],
      hi: [
        "कामों में रुचि या आनंद नहीं आना",
        "उदास, निराश या बेहतर भविष्य की कोई उम्मीद नहीं होना",
        "नींद न आना या बहुत ज्यादा नींद आना",
        "थकान या ऊर्जा की कमी महसूस करना",
        "भूख न लगना या बहुत ज्यादा खाना",
        "खुद के बारे में बुरा महसूस करना या असफलता का एहसास",
        "बातों पर ध्यान केंद्रित करने में परेशानी",
        "धीमी गति से बोलना या हिलना-डुलना, या बहुत बेचैन होना",
        "मरने या खुद को नुकसान पहुंचाने के विचार"
      ],
      ur: [
        "کاموں میں دلچسپی یا خوشی نہیں آنا",
        "اداس، مایوس یا بہتر مستقبل کی کوئی امید نہیں ہونا",
        "نیند نہ آنا یا بہت زیادہ نیند آنا",
        "تھکاوٹ یا توانائی کی کمی محسوس کرنا",
        "بھوک نہ لگنا یا بہت زیادہ کھانا",
        "خود کے بارے میں برا محسوس کرنا یا ناکامی کا احساس",
        "باتوں پر توجہ مرکوز کرنے میں پریشانی",
        "سست رفتار سے بولنا یا ہلنا جلنا، یا بہت بے چین ہونا",
        "مرنے یا خود کو نقصان پہنچانے کے خیالات"
      ]
    };

    const responseOptions = {
      en: [
        { value: 0, label: "Not at all" },
        { value: 1, label: "Several days" },
        { value: 2, label: "More than half the days" },
        { value: 3, label: "Nearly every day" }
      ],
      hi: [
        { value: 0, label: "बिल्कुल नहीं" },
        { value: 1, label: "कुछ दिन" },
        { value: 2, label: "आधे से ज्यादा दिन" },
        { value: 3, label: "लगभग हर दिन" }
      ],
      ur: [
        { value: 0, label: "بالکل نہیں" },
        { value: 1, label: "کچھ دن" },
        { value: 2, label: "آدھے سے زیادہ دن" },
        { value: 3, label: "تقریباً ہر دن" }
      ]
    };

    res.json({
      success: true,
      data: {
        questions: questions[language] || questions.en,
        responseOptions: responseOptions[language] || responseOptions.en,
        language: language
      }
    });

  } catch (error) {
    console.error('Error fetching PHQ-9 questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PHQ-9 questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get assessment questions (GAD-7)
 */
const getGAD7Questions = async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    const questions = {
      en: [
        "Feeling nervous, anxious, or on edge",
        "Not being able to stop or control worrying",
        "Worrying too much about different things",
        "Trouble relaxing",
        "Being so restless that it's hard to sit still",
        "Becoming easily annoyed or irritable",
        "Feeling afraid, as if something awful might happen"
      ],
      hi: [
        "घबराहट, चिंता या बेचैनी महसूस करना",
        "चिंता को रोकने या नियंत्रित करने में असमर्थ होना",
        "अलग-अलग बातों के बारे में बहुत ज्यादा चिंता करना",
        "आराम करने में परेशानी",
        "इतनी बेचैनी कि बैठना मुश्किल होना",
        "आसानी से चिढ़ जाना या गुस्सा आना",
        "डर लगना, जैसे कि कुछ बुरा होने वाला हो"
      ],
      ur: [
        "گھبراہٹ، پریشانی یا بے چینی محسوس کرنا",
        "پریشانی کو روکنے یا کنٹرول کرنے میں ناکام ہونا",
        "مختلف باتوں کے بارے میں بہت زیادہ فکر کرنا",
        "آرام کرنے میں پریشانی",
        "اتنی بے چینی کہ بیٹھنا مشکل ہونا",
        "آسانی سے چڑچڑا ہو جانا یا غصہ آنا",
        "ڈر لگنا، جیسے کچھ برا ہونے والا ہو"
      ]
    };

    const responseOptions = {
      en: [
        { value: 0, label: "Not at all" },
        { value: 1, label: "Several days" },
        { value: 2, label: "More than half the days" },
        { value: 3, label: "Nearly every day" }
      ],
      hi: [
        { value: 0, label: "बिल्कुल नहीं" },
        { value: 1, label: "कुछ दिन" },
        { value: 2, label: "आधे से ज्यादा दिन" },
        { value: 3, label: "लगभग हर दिन" }
      ],
      ur: [
        { value: 0, label: "بالکل نہیں" },
        { value: 1, label: "کچھ دن" },
        { value: 2, label: "آدھے سے زیادہ دن" },
        { value: 3, label: "تقریباً ہر دن" }
      ]
    };

    res.json({
      success: true,
      data: {
        questions: questions[language] || questions.en,
        responseOptions: responseOptions[language] || responseOptions.en,
        language: language
      }
    });

  } catch (error) {
    console.error('Error fetching GAD-7 questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GAD-7 questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitPHQ9,
  submitGAD7,
  getAssessmentHistory,
  getMoodTrends,
  updateConsent,
  getPHQ9Questions,
  getGAD7Questions
};
