const User = require('../../models/user.model');
const ChatSummary = require('../../models/chatSummary.model');
const Booking = require('../../models/booking.model');
const MoodEntry = require('../../models/moodEntry.model');
const ForumPost = require('../../models/forumPost.model');
const Resource = require('../../models/resource.model');
const AuditEvent = require('../../models/auditEvent.model');
const College = require('../../models/college.model');

/**
 * Get platform overview statistics
 */
const getOverviewStats = async (req, res) => {
  try {
    const { collegeId, startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build college filter
    const collegeFilter = {};
    if (collegeId) {
      collegeFilter.college = collegeId;
    }

    const [
      totalUsers,
      activeUsers,
      newRegistrations,
      chatSessions,
      assessmentsCompleted,
      bookingsMade,
      crisisIncidents,
      forumPosts,
      resourceViews
    ] = await Promise.all([
      User.countDocuments(collegeFilter),
      User.countDocuments({ ...collegeFilter, lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ ...collegeFilter, ...dateFilter }),
      ChatSummary.countDocuments(dateFilter),
      MoodEntry.countDocuments(dateFilter),
      Booking.countDocuments(dateFilter),
      AuditEvent.countDocuments({ eventType: 'crisis_detected', ...dateFilter }),
      ForumPost.countDocuments({ ...dateFilter, status: 'visible' }),
      AuditEvent.countDocuments({ eventType: 'resource_access', ...dateFilter })
    ]);

    // Calculate growth metrics
    const previousPeriodStart = new Date(startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const previousPeriodEnd = new Date(endDate || new Date());
    const previousPeriod = {
      $gte: new Date(previousPeriodStart.getTime() - (previousPeriodEnd.getTime() - previousPeriodStart.getTime())),
      $lt: previousPeriodStart
    };

    const [
      previousUsers,
      previousChatSessions,
      previousBookings
    ] = await Promise.all([
      User.countDocuments({ ...collegeFilter, createdAt: previousPeriod }),
      ChatSummary.countDocuments({ createdAt: previousPeriod }),
      Booking.countDocuments({ createdAt: previousPeriod })
    ]);

    const userGrowth = previousUsers > 0 ? ((newRegistrations - previousUsers) / previousUsers * 100).toFixed(1) : 0;
    const chatGrowth = previousChatSessions > 0 ? ((chatSessions - previousChatSessions) / previousChatSessions * 100).toFixed(1) : 0;
    const bookingGrowth = previousBookings > 0 ? ((bookingsMade - previousBookings) / previousBookings * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newRegistrations,
          userGrowth: `${userGrowth}%`
        },
        engagement: {
          chatSessions,
          assessmentsCompleted,
          bookingsMade,
          forumPosts,
          resourceViews,
          chatGrowth: `${chatGrowth}%`,
          bookingGrowth: `${bookingGrowth}%`
        },
        safety: {
          crisisIncidents,
          crisisRate: chatSessions > 0 ? ((crisisIncidents / chatSessions) * 100).toFixed(2) : 0
        },
        period: {
          startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: endDate || new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get usage trends over time
 */
const getUsageTrends = async (req, res) => {
  try {
    const { days = 30, collegeId } = req.query;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Build college filter
    const collegeFilter = {};
    if (collegeId) {
      collegeFilter.college = collegeId;
    }

    // Get daily trends
    const [
      userTrends,
      chatTrends,
      bookingTrends,
      assessmentTrends,
      crisisTrends
    ] = await Promise.all([
      User.aggregate([
        { $match: { ...collegeFilter, createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      ChatSummary.aggregate([
        { $match: { startedAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      Booking.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      MoodEntry.aggregate([
        { $match: { assessmentDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$assessmentDate" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      AuditEvent.aggregate([
        { $match: { eventType: 'crisis_detected', timestamp: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Fill in missing dates with 0 counts
    const fillMissingDates = (data) => {
      const result = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const existingData = data.find(item => item._id === dateStr);
        result.push({
          date: dateStr,
          count: existingData ? existingData.count : 0
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return result;
    };

    res.json({
      success: true,
      data: {
        userRegistrations: fillMissingDates(userTrends),
        chatSessions: fillMissingDates(chatTrends),
        bookings: fillMissingDates(bookingTrends),
        assessments: fillMissingDates(assessmentTrends),
        crisisIncidents: fillMissingDates(crisisTrends),
        period: {
          days: parseInt(days),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching usage trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch usage trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get mood trends and distribution
 */
const getMoodTrends = async (req, res) => {
  try {
    const { days = 30, collegeId } = req.query;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Build college filter
    const collegeFilter = {};
    if (collegeId) {
      collegeFilter.college = collegeId;
    }

    // Get mood distribution
    const moodDistribution = await MoodEntry.aggregate([
      { $match: { assessmentDate: { $gte: startDate, $lte: endDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: collegeFilter },
      {
        $group: {
          _id: '$severityLevel',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get mood trends over time
    const moodTrends = await MoodEntry.aggregate([
      { $match: { assessmentDate: { $gte: startDate, $lte: endDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: collegeFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$assessmentDate" } },
            severity: '$severityLevel'
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Get top concerns from chat sessions
    const topConcerns = await ChatSummary.aggregate([
      { $match: { startedAt: { $gte: startDate, $lte: endDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: collegeFilter },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
          crisisRate: {
            $avg: { $cond: ['$crisisDetected', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        distribution: moodDistribution,
        trends: moodTrends,
        topConcerns: topConcerns,
        period: {
          days: parseInt(days),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
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
 * Get counselor performance statistics
 */
const getCounselorStats = async (req, res) => {
  try {
    const { collegeId, counselorId } = req.query;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days

    // Build filter
    const filter = { createdAt: { $gte: startDate, $lte: endDate } };
    if (counselorId) {
      filter.counselor = counselorId;
    }

    const [
      totalBookings,
      completedSessions,
      cancelledSessions,
      counselorPerformance
    ] = await Promise.all([
      Booking.countDocuments(filter),
      Booking.countDocuments({ ...filter, status: 'completed' }),
      Booking.countDocuments({ ...filter, status: 'cancelled' }),
      Booking.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'counselor',
            foreignField: '_id',
            as: 'counselorInfo'
          }
        },
        { $unwind: '$counselorInfo' },
        {
          $group: {
            _id: '$counselor',
            counselorName: { $first: '$counselorInfo.name' },
            totalBookings: { $sum: 1 },
            completedSessions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledSessions: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            avgSessionDuration: { $avg: '$duration' }
          }
        },
        {
          $addFields: {
            completionRate: {
              $multiply: [
                { $divide: ['$completedSessions', '$totalBookings'] },
                100
              ]
            },
            cancellationRate: {
              $multiply: [
                { $divide: ['$cancelledSessions', '$totalBookings'] },
                100
              ]
            }
          }
        },
        { $sort: { totalBookings: -1 } }
      ])
    ]);

    const completionRate = totalBookings > 0 ? ((completedSessions / totalBookings) * 100).toFixed(1) : 0;
    const cancellationRate = totalBookings > 0 ? ((cancelledSessions / totalBookings) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalBookings,
          completedSessions,
          cancelledSessions,
          completionRate: `${completionRate}%`,
          cancellationRate: `${cancellationRate}%`
        },
        counselorPerformance: counselorPerformance,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching counselor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counselor statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get crisis statistics
 */
const getCrisisStats = async (req, res) => {
  try {
    const { days = 30, collegeId } = req.query;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

    // Build college filter
    const collegeFilter = {};
    if (collegeId) {
      collegeFilter.college = collegeId;
    }

    const [
      totalCrisisEvents,
      crisisByType,
      crisisBySeverity,
      crisisTrends,
      responseTime
    ] = await Promise.all([
      AuditEvent.countDocuments({
        eventType: 'crisis_detected',
        timestamp: { $gte: startDate, $lte: endDate }
      }),
      
      AuditEvent.aggregate([
        {
          $match: {
            eventType: 'crisis_detected',
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $match: collegeFilter },
        {
          $group: {
            _id: '$metadata.crisis_level',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      AuditEvent.aggregate([
        {
          $match: {
            eventType: 'crisis_detected',
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $match: collegeFilter },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      AuditEvent.aggregate([
        {
          $match: {
            eventType: 'crisis_detected',
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      AuditEvent.aggregate([
        {
          $match: {
            eventType: 'crisis_detected',
            timestamp: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$metadata.response_time' }
          }
        }
      ])
    ]);

    // Get total chat sessions for crisis rate calculation
    const totalChatSessions = await ChatSummary.countDocuments({
      startedAt: { $gte: startDate, $lte: endDate }
    });

    const crisisRate = totalChatSessions > 0 ? ((totalCrisisEvents / totalChatSessions) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalCrisisEvents,
          crisisRate: `${crisisRate}%`,
          avgResponseTime: responseTime[0]?.avgResponseTime || 0
        },
        breakdown: {
          byType: crisisByType,
          bySeverity: crisisBySeverity
        },
        trends: crisisTrends,
        period: {
          days: parseInt(days),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error fetching crisis stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crisis statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Export analytics data
 */
const exportAnalytics = async (req, res) => {
  try {
    const { type, format = 'json', collegeId, startDate, endDate } = req.body;

    if (!type || !['overview', 'usage', 'mood', 'counselor', 'crisis'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export type. Must be one of: overview, usage, mood, counselor, crisis'
      });
    }

    // Set date range
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate ? new Date(startDate) : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);

    let data;
    switch (type) {
      case 'overview':
        data = await getOverviewStats(req, res, true);
        break;
      case 'usage':
        data = await getUsageTrends(req, res, true);
        break;
      case 'mood':
        data = await getMoodTrends(req, res, true);
        break;
      case 'counselor':
        data = await getCounselorStats(req, res, true);
        break;
      case 'crisis':
        data = await getCrisisStats(req, res, true);
        break;
    }

    // Set response headers based on format
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `manmitra_${type}_analytics_${timestamp}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      // Convert data to CSV format (simplified)
      res.send('Data exported as CSV\n');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        data: data,
        metadata: {
          exportedAt: new Date().toISOString(),
          type: type,
          period: {
            startDate: startDateObj.toISOString(),
            endDate: endDateObj.toISOString()
          },
          collegeId: collegeId
        }
      });
    }

  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getOverviewStats,
  getUsageTrends,
  getMoodTrends,
  getCounselorStats,
  getCrisisStats,
  exportAnalytics
};
