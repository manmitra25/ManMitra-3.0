const Configuration = require('../../models/configuration.model');
const College = require('../../models/college.model');
const AuditEvent = require('../../models/auditEvent.model');

/**
 * Get app configuration settings
 */
const getAppSettings = async (req, res) => {
  try {
    const { category, isPublic } = req.query;
    
    // Build filter
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (isPublic === 'true') {
      filter.isPublic = true;
    }

    const settings = await Configuration.find(filter)
      .select({
        key: 1,
        value: 1,
        description: 1,
        category: 1,
        isPublic: 1,
        updatedAt: 1
      })
      .sort({ category: 1, key: 1 });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.key,
        value: setting.value,
        description: setting.description,
        isPublic: setting.isPublic,
        updatedAt: setting.updatedAt
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        settings: groupedSettings,
        categories: Object.keys(groupedSettings),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching app settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch app settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update app configuration (admin only)
 */
const updateAppSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const adminId = req.user.id;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        message: 'Settings array is required'
      });
    }

    const updatedSettings = [];
    const errors = [];

    for (const setting of settings) {
      try {
        const { key, value, description, category, isPublic } = setting;

        if (!key || value === undefined) {
          errors.push(`Setting ${key || 'unknown'}: key and value are required`);
          continue;
        }

        // Validate setting key format
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
          errors.push(`Setting ${key}: key must start with letter and contain only letters, numbers, and underscores`);
          continue;
        }

        const updatedSetting = await Configuration.findOneAndUpdate(
          { key: key },
          {
            value: value,
            description: description || '',
            category: category || 'general',
            isPublic: isPublic !== undefined ? isPublic : false,
            updatedBy: adminId,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );

        updatedSettings.push({
          key: updatedSetting.key,
          value: updatedSetting.value,
          description: updatedSetting.description,
          category: updatedSetting.category,
          isPublic: updatedSetting.isPublic
        });

        // Log configuration change
        await AuditEvent.create({
          eventType: 'config_updated',
          userId: adminId,
          metadata: {
            configKey: key,
            oldValue: 'unknown', // Could be enhanced to track previous values
            newValue: value,
            category: category
          },
          severity: 'info'
        });

      } catch (error) {
        errors.push(`Setting ${setting.key}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some settings could not be updated',
        data: {
          updated: updatedSettings,
          errors: errors
        }
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        updatedCount: updatedSettings.length,
        settings: updatedSettings
      }
    });

  } catch (error) {
    console.error('Error updating app settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update app settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get feature flags
 */
const getFeatureFlags = async (req, res) => {
  try {
    const flags = await Configuration.find({ category: 'features' })
      .select({
        key: 1,
        value: 1,
        description: 1,
        isPublic: 1
      });

    const featureFlags = flags.reduce((acc, flag) => {
      acc[flag.key] = {
        enabled: flag.value === true || flag.value === 'true',
        description: flag.description,
        isPublic: flag.isPublic
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        features: featureFlags,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching feature flags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature flags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update feature flags (admin only)
 */
const updateFeatureFlags = async (req, res) => {
  try {
    const { flags } = req.body;
    const adminId = req.user.id;

    if (!flags || typeof flags !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Flags object is required'
      });
    }

    const updatedFlags = [];
    const errors = [];

    for (const [key, flagData] of Object.entries(flags)) {
      try {
        const { enabled, description, isPublic } = flagData;

        if (typeof enabled !== 'boolean') {
          errors.push(`Flag ${key}: enabled must be boolean`);
          continue;
        }

        const updatedFlag = await Configuration.findOneAndUpdate(
          { key: key, category: 'features' },
          {
            value: enabled,
            description: description || '',
            isPublic: isPublic !== undefined ? isPublic : false,
            updatedBy: adminId,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );

        updatedFlags.push({
          key: updatedFlag.key,
          enabled: updatedFlag.value,
          description: updatedFlag.description,
          isPublic: updatedFlag.isPublic
        });

        // Log feature flag change
        await AuditEvent.create({
          eventType: 'feature_flag_updated',
          userId: adminId,
          metadata: {
            flagKey: key,
            enabled: enabled,
            description: description
          },
          severity: 'info'
        });

      } catch (error) {
        errors.push(`Flag ${key}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some feature flags could not be updated',
        data: {
          updated: updatedFlags,
          errors: errors
        }
      });
    }

    res.json({
      success: true,
      message: 'Feature flags updated successfully',
      data: {
        updatedCount: updatedFlags.length,
        flags: updatedFlags
      }
    });

  } catch (error) {
    console.error('Error updating feature flags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature flags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get emergency contact information
 */
const getEmergencyContacts = async (req, res) => {
  try {
    const { region = 'default' } = req.query;

    const emergencyContacts = await Configuration.find({
      category: 'emergency',
      key: { $regex: `^contact_${region}` }
    }).select({
      key: 1,
      value: 1,
      description: 1
    });

    // If no region-specific contacts, get default ones
    if (emergencyContacts.length === 0) {
      const defaultContacts = await Configuration.find({
        category: 'emergency',
        key: { $regex: '^contact_default' }
      }).select({
        key: 1,
        value: 1,
        description: 1
      });
      emergencyContacts.push(...defaultContacts);
    }

    const contacts = emergencyContacts.map(contact => ({
      name: contact.key.replace(/^contact_(default|region)_/, ''),
      number: contact.value,
      description: contact.description
    }));

    res.json({
      success: true,
      data: {
        contacts: contacts,
        region: region,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update emergency contacts (admin only)
 */
const updateEmergencyContacts = async (req, res) => {
  try {
    const { contacts, region = 'default' } = req.body;
    const adminId = req.user.id;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({
        success: false,
        message: 'Contacts array is required'
      });
    }

    const updatedContacts = [];
    const errors = [];

    for (const contact of contacts) {
      try {
        const { name, number, description } = contact;

        if (!name || !number) {
          errors.push(`Contact ${name || 'unknown'}: name and number are required`);
          continue;
        }

        const key = `contact_${region}_${name.toLowerCase().replace(/\s+/g, '_')}`;
        
        const updatedContact = await Configuration.findOneAndUpdate(
          { key: key },
          {
            value: number,
            description: description || '',
            category: 'emergency',
            updatedBy: adminId,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );

        updatedContacts.push({
          name: name,
          number: updatedContact.value,
          description: updatedContact.description
        });

        // Log emergency contact update
        await AuditEvent.create({
          eventType: 'emergency_contact_updated',
          userId: adminId,
          metadata: {
            contactName: name,
            contactNumber: number,
            region: region
          },
          severity: 'info'
        });

      } catch (error) {
        errors.push(`Contact ${contact.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some emergency contacts could not be updated',
        data: {
          updated: updatedContacts,
          errors: errors
        }
      });
    }

    res.json({
      success: true,
      message: 'Emergency contacts updated successfully',
      data: {
        updatedCount: updatedContacts.length,
        contacts: updatedContacts,
        region: region
      }
    });

  } catch (error) {
    console.error('Error updating emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Set maintenance mode (admin only)
 */
const setMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message, estimatedDuration } = req.body;
    const adminId = req.user.id;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'enabled must be boolean'
      });
    }

    const maintenanceSettings = {
      enabled: enabled,
      message: message || 'System is currently under maintenance. Please try again later.',
      estimatedDuration: estimatedDuration || null,
      startedAt: enabled ? new Date() : null,
      updatedBy: adminId
    };

    await Configuration.findOneAndUpdate(
      { key: 'maintenance_mode', category: 'system' },
      {
        value: maintenanceSettings,
        updatedBy: adminId,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Log maintenance mode change
    await AuditEvent.create({
      eventType: 'maintenance_mode_changed',
      userId: adminId,
      metadata: {
        enabled: enabled,
        message: message,
        estimatedDuration: estimatedDuration
      },
      severity: 'high'
    });

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        maintenanceMode: maintenanceSettings
      }
    });

  } catch (error) {
    console.error('Error setting maintenance mode:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set maintenance mode',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get system health and status
 */
const getSystemHealth = async (req, res) => {
  try {
    const healthChecks = {
      database: 'healthy',
      aiService: 'healthy',
      redis: 'healthy',
      maintenanceMode: false,
      lastChecked: new Date().toISOString()
    };

    // Check maintenance mode
    const maintenanceConfig = await Configuration.findOne({
      key: 'maintenance_mode',
      category: 'system'
    });

    if (maintenanceConfig && maintenanceConfig.value?.enabled) {
      healthChecks.maintenanceMode = true;
      healthChecks.maintenanceMessage = maintenanceConfig.value.message;
    }

    // TODO: Add actual health checks for database, AI service, Redis
    // For now, we'll assume they're healthy

    res.json({
      success: true,
      data: {
        status: healthChecks.maintenanceMode ? 'maintenance' : 'healthy',
        checks: healthChecks,
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    });

  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAppSettings,
  updateAppSettings,
  getFeatureFlags,
  updateFeatureFlags,
  getEmergencyContacts,
  updateEmergencyContacts,
  setMaintenanceMode,
  getSystemHealth
};
