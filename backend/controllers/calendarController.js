// backend/controllers/calendarController.js
import User from '../models/User.js';
import logger from '../config/logger.js';
import {
  getAuthUrl,
  getTokensFromCode,
  createCalendarEvent,
  deleteCalendarEvent,
} from '../utils/googleCalendar.js';
import env from '../config/env.js';

/**
 * Initiate Google Calendar OAuth flow
 * GET /api/calendar/connect
 */
export const connectCalendar = async (req, res) => {
  try {
    const userId = req.user._id;
    const authUrl = getAuthUrl(userId);
    
    res.json({ authUrl });
  } catch (error) {
    logger.error(`Connect calendar error: ${error.message}`);
    res.status(500).json({ message: 'Failed to generate authorization URL' });
  }
};

/**
 * Handle Google OAuth callback
 * GET /api/calendar/callback
 */
export const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = state; // userId passed in state parameter

    if (!code || !userId) {
      return res.status(400).json({ message: 'Missing code or user ID' });
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Save tokens to user
    await User.findByIdAndUpdate(userId, {
      googleCalendarTokens: tokens,
    });

    logger.info(`Google Calendar connected for user ${userId}`);

    // Redirect back to frontend
    res.redirect(`${env.frontendUrl}/dashboard?calendar=connected`);
  } catch (error) {
    logger.error(`Calendar callback error: ${error.message}`);
    res.redirect(`${env.frontendUrl}/dashboard?calendar=error`);
  }
};

/**
 * Create a calendar event with Google Meet link
 * POST /api/calendar/create-event
 */
export const createEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.googleCalendarTokens) {
      return res.status(400).json({ 
        message: 'Google Calendar not connected. Please connect first.' 
      });
    }

    const { summary, description, startDateTime, endDateTime, attendees, timeZone } = req.body;

    const eventData = {
      summary,
      description,
      startDateTime,
      endDateTime,
      attendees: attendees?.map(email => ({ email })) || [],
      timeZone,
    };

    const result = await createCalendarEvent(user.googleCalendarTokens, eventData);

    res.json(result);
  } catch (error) {
    logger.error(`Create calendar event error: ${error.message}`);
    
    // If token expired, user needs to reconnect
    if (error.message.includes('invalid_grant') || error.message.includes('Token has been expired')) {
      return res.status(401).json({ 
        message: 'Calendar access expired. Please reconnect your Google Calendar.',
        reconnect: true
      });
    }
    
    res.status(500).json({ message: 'Failed to create calendar event' });
  }
};

/**
 * Delete a calendar event
 * DELETE /api/calendar/delete-event/:eventId
 */
export const deleteEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;
    const user = await User.findById(userId);

    if (!user || !user.googleCalendarTokens) {
      return res.status(400).json({ 
        message: 'Google Calendar not connected' 
      });
    }

    await deleteCalendarEvent(user.googleCalendarTokens, eventId);

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    logger.error(`Delete calendar event error: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete calendar event' });
  }
};

/**
 * Check if calendar is connected
 * GET /api/calendar/status
 */
export const getStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const isConnected = !!(user && user.googleCalendarTokens);

    res.json({ connected: isConnected });
  } catch (error) {
    logger.error(`Get calendar status error: ${error.message}`);
    res.status(500).json({ message: 'Failed to get calendar status' });
  }
};
