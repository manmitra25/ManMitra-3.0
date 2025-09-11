const AuditEvent = require('../../models/auditEvent.model');
const User = require('../../models/user.model');
const ChatSummary = require('../../models/chatSummary.model');
const Booking = require('../../models/booking.model');
const Notification = require('../../models/notification.model');
const { sendNotification, sendNotificationToRole } = require('../../services/websocket.service');

/**
 * Detect crisis indicators in message
 */
const detectCrisis = async (req, res) => {
  try {
    const { message, sessionId, userId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required for crisis detection'
      });
    }

    // Crisis detection logic (this would integrate with FastAPI AI service)
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'don\'t want to live',
      'hurt myself', 'self harm', 'cut myself', 'overdose',
      'jump off', 'hang myself', 'shoot myself', 'poison'
    ];

    const lowerMessage = message.toLowerCase();
    const detectedKeywords = crisisKeywords.filter(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );

    let severity = 'low';
    let detected = false;

    if (detectedKeywords.length > 0) {
      detected = true;
      if (detectedKeywords.some(keyword => 
        ['suicide', 'kill myself', 'end it all', 'don\'t want to live'].includes(keyword)
      )) {
        severity = 'high';
      } else {
        severity = 'medium';
      }
    }

    // Create crisis alert if detected
    if (detected) {
      const crisisAlert = new AuditEvent({
        eventType: 'crisis_detected',
        userId: userId,
        metadata: {
          message: message,
          sessionId: sessionId,
          keywords: detectedKeywords,
          severity: severity,
          timestamp: new Date()
        },
        severity: severity === 'high' ? 'high' : 'medium'
      });

      await crisisAlert.save();

      // Send immediate notifications to admins and counselors
      await sendNotificationToRole('admin', {
        type: 'crisis_alert',
        title: 'Crisis Alert - Immediate Attention Required',
        message: `Crisis detected in chat session. Severity: ${severity.toUpperCase()}`,
        priority: 'critical',
        metadata: {
          sessionId: sessionId,
          userId: userId,
          severity: severity,
          keywords: detectedKeywords
        }
      });

      await sendNotificationToRole('counselor', {
        type: 'crisis_alert',
        title: 'Crisis Alert - Student Needs Support',
        message: `A student may need immediate support. Severity: ${severity.toUpperCase()}`,
        priority: 'high',
        metadata: {
          sessionId: sessionId,
          userId: userId,
          severity: severity
        }
      });

      // Update chat session if exists
      if (sessionId) {
        await ChatSummary.findOneAndUpdate(
          { sessionId: sessionId },
          {
            crisisDetected: true,
            crisisLevel: severity,
            lastCrisisAt: new Date()
          }
        );
      }
    }

    res.json({
      success: true,
      data: {
        crisisDetected: detected,
        severity: severity,
        keywords: detectedKeywords,
        alertId: detected ? crisisAlert._id : null,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error in crisis detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process crisis detection',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get crisis alerts (admin/counselor only)
 */
const getCrisisAlerts = async (req, res) => {
  try {
    const { status = 'active', severity, page = 1, limit = 20 } = req.query;
    const userRole = req.user.role;

    // Build filter
    const filter = { eventType: 'crisis_detected' };
    
    if (status && status !== 'all') {
      filter['metadata.status'] = status;
    }
    
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }

    // For counselors, only show alerts assigned to them or unassigned
    if (userRole === 'counselor') {
      filter.$or = [
        { 'metadata.assignedCounselorId': req.user.id },
        { 'metadata.assignedCounselorId': { $exists: false } }
      ];
    }

    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      AuditEvent.find(filter)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      
      AuditEvent.countDocuments(filter)
    ]);

    // Format alerts for response
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      userId: alert.userId,
      sessionId: alert.metadata.sessionId,
      severity: alert.severity,
      keywords: alert.metadata.keywords || [],
      message: alert.metadata.message,
      status: alert.metadata.status || 'active',
      assignedCounselorId: alert.metadata.assignedCounselorId,
      actionTaken: alert.metadata.actionTaken,
      notes: alert.metadata.notes,
      timestamp: alert.timestamp,
      handledAt: alert.metadata.handledAt
    }));

    res.json({
      success: true,
      data: {
        alerts: formattedAlerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAlerts: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching crisis alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crisis alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handle crisis alert (assign counselor, take action)
 */
const handleCrisisAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { action, notes, assignedCounselorId, followUpRequired, followUpDate } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const alert = await AuditEvent.findById(alertId);
    if (!alert || alert.eventType !== 'crisis_detected') {
      return res.status(404).json({
        success: false,
        message: 'Crisis alert not found'
      });
    }

    // Check permissions
    if (userRole === 'counselor' && alert.metadata.assignedCounselorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to handle this alert'
      });
    }

    // Update alert
    const updateData = {
      'metadata.status': 'handled',
      'metadata.handledAt': new Date(),
      'metadata.actionTaken': action,
      'metadata.notes': notes,
      'metadata.handledBy': userId
    };

    if (assignedCounselorId) {
      updateData['metadata.assignedCounselorId'] = assignedCounselorId;
      
      // Send notification to assigned counselor
      await sendNotification(assignedCounselorId, {
        type: 'crisis_assignment',
        title: 'Crisis Alert Assigned',
        message: 'You have been assigned to handle a crisis alert',
        priority: 'high',
        metadata: {
          alertId: alertId,
          severity: alert.severity
        }
      });
    }

    if (followUpRequired && followUpDate) {
      updateData['metadata.followUpRequired'] = followUpRequired;
      updateData['metadata.followUpDate'] = new Date(followUpDate);
    }

    await AuditEvent.findByIdAndUpdate(alertId, { metadata: updateData.metadata });

    // Log the handling action
    await AuditEvent.create({
      eventType: 'crisis_handled',
      userId: userId,
      metadata: {
        alertId: alertId,
        action: action,
        notes: notes,
        assignedCounselorId: assignedCounselorId,
        followUpRequired: followUpRequired
      },
      severity: 'info'
    });

    res.json({
      success: true,
      message: 'Crisis alert handled successfully',
      data: {
        alertId: alertId,
        status: 'handled',
        handledAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error handling crisis alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle crisis alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Escalate crisis to emergency services
 */
const escalateCrisis = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { escalationType, emergencyContact, notes } = req.body;
    const userId = req.user.id;

    const alert = await AuditEvent.findById(alertId);
    if (!alert || alert.eventType !== 'crisis_detected') {
      return res.status(404).json({
        success: false,
        message: 'Crisis alert not found'
      });
    }

    // Update alert status
    await AuditEvent.findByIdAndUpdate(alertId, {
      'metadata.status': 'escalated',
      'metadata.escalatedAt': new Date(),
      'metadata.escalationType': escalationType,
      'metadata.emergencyContact': emergencyContact,
      'metadata.escalationNotes': notes,
      'metadata.escalatedBy': userId
    });

    // Send notifications
    await sendNotificationToRole('admin', {
      type: 'crisis_escalated',
      title: 'Crisis Escalated to Emergency Services',
      message: `Crisis alert has been escalated. Type: ${escalationType}`,
      priority: 'critical',
      metadata: {
        alertId: alertId,
        escalationType: escalationType,
        emergencyContact: emergencyContact
      }
    });

    // Log escalation
    await AuditEvent.create({
      eventType: 'crisis_escalated',
      userId: userId,
      metadata: {
        alertId: alertId,
        escalationType: escalationType,
        emergencyContact: emergencyContact,
        notes: notes,
        originalSeverity: alert.severity
      },
      severity: 'high'
    });

    res.json({
      success: true,
      message: 'Crisis escalated successfully',
      data: {
        alertId: alertId,
        status: 'escalated',
        escalatedAt: new Date(),
        escalationType: escalationType
      }
    });

  } catch (error) {
    console.error('Error escalating crisis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate crisis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get crisis support resources
 */
const getCrisisResources = async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    const resources = {
      en: {
        helplines: [
          {
            name: 'Tele-MANAS',
            number: '104',
            description: '24/7 Mental Health Helpline',
            available: true,
            region: 'India'
          },
          {
            name: 'KIRAN Mental Health Rehabilitation',
            number: '1800-599-0019',
            description: 'Mental Health Helpline',
            available: true,
            region: 'India'
          },
          {
            name: 'Emergency Services',
            number: '112',
            description: 'Emergency Response',
            available: true,
            region: 'India'
          }
        ],
        techniques: [
          {
            title: 'Grounding Technique',
            description: '5-4-3-2-1 grounding exercise',
            steps: [
              'Name 5 things you can see',
              'Name 4 things you can touch',
              'Name 3 things you can hear',
              'Name 2 things you can smell',
              'Name 1 thing you can taste'
            ]
          },
          {
            title: 'Breathing Exercise',
            description: '4-7-8 breathing technique',
            steps: [
              'Breathe in for 4 counts',
              'Hold breath for 7 counts',
              'Breathe out for 8 counts',
              'Repeat 3-4 times'
            ]
          }
        ],
        emergencyContacts: [
          {
            name: 'Campus Counselor',
            contact: 'Available through booking system',
            available: true
          },
          {
            name: 'Trusted Friend/Family',
            contact: 'Contact someone you trust',
            available: true
          }
        ]
      },
      hi: {
        helplines: [
          {
            name: 'Tele-MANAS',
            number: '104',
            description: '24/7 मानसिक स्वास्थ्य हेल्पलाइन',
            available: true,
            region: 'भारत'
          },
          {
            name: 'KIRAN मानसिक स्वास्थ्य पुनर्वास',
            number: '1800-599-0019',
            description: 'मानसिक स्वास्थ्य हेल्पलाइन',
            available: true,
            region: 'भारत'
          }
        ],
        techniques: [
          {
            title: 'ग्राउंडिंग तकनीक',
            description: '5-4-3-2-1 ग्राउंडिंग व्यायाम',
            steps: [
              '5 चीजें बताएं जो आप देख सकते हैं',
              '4 चीजें बताएं जो आप छू सकते हैं',
              '3 चीजें बताएं जो आप सुन सकते हैं',
              '2 चीजें बताएं जो आप सूंघ सकते हैं',
              '1 चीज बताएं जो आप चख सकते हैं'
            ]
          }
        ]
      },
      ur: {
        helplines: [
          {
            name: 'Tele-MANAS',
            number: '104',
            description: '24/7 ذہنی صحت ہیلپ لائن',
            available: true,
            region: 'بھارت'
          }
        ],
        techniques: [
          {
            title: 'گراؤنڈنگ تکنیک',
            description: '5-4-3-2-1 گراؤنڈنگ مشق',
            steps: [
              '5 چیزیں بتائیں جو آپ دیکھ سکتے ہیں',
              '4 چیزیں بتائیں جو آپ چھو سکتے ہیں',
              '3 چیزیں بتائیں جو آپ سن سکتے ہیں',
              '2 چیزیں بتائیں جو آپ سونگھ سکتے ہیں',
              '1 چیز بتائیں جو آپ چکھ سکتے ہیں'
            ]
          }
        ]
      }
    };

    res.json({
      success: true,
      data: {
        resources: resources[language] || resources.en,
        language: language,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching crisis resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crisis resources',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create crisis alert manually (admin only)
 */
const createCrisisAlert = async (req, res) => {
  try {
    const { userId, sessionId, severity, description, keywords } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!userId || !severity || !description) {
      return res.status(400).json({
        success: false,
        message: 'userId, severity, and description are required'
      });
    }

    // Create crisis alert
    const crisisAlert = new AuditEvent({
      eventType: 'crisis_detected',
      userId: userId,
      metadata: {
        message: description,
        sessionId: sessionId,
        keywords: keywords || [],
        severity: severity,
        timestamp: new Date(),
        createdBy: 'admin',
        adminId: adminId
      },
      severity: severity === 'high' ? 'high' : 'medium'
    });

    await crisisAlert.save();

    // Send notifications
    await sendNotificationToRole('admin', {
      type: 'crisis_alert',
      title: 'Manual Crisis Alert Created',
      message: `Crisis alert manually created by admin. Severity: ${severity.toUpperCase()}`,
      priority: 'high',
      metadata: {
        alertId: crisisAlert._id,
        userId: userId,
        severity: severity
      }
    });

    await sendNotificationToRole('counselor', {
      type: 'crisis_alert',
      title: 'Crisis Alert - Student Needs Support',
      message: `A student may need immediate support. Severity: ${severity.toUpperCase()}`,
      priority: 'high',
      metadata: {
        alertId: crisisAlert._id,
        userId: userId,
        severity: severity
      }
    });

    res.json({
      success: true,
      message: 'Crisis alert created successfully',
      data: {
        alertId: crisisAlert._id,
        severity: severity,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error creating crisis alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create crisis alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  detectCrisis,
  getCrisisAlerts,
  handleCrisisAlert,
  escalateCrisis,
  getCrisisResources,
  createCrisisAlert
};
