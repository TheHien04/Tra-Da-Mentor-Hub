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
import { getSlotById, updateSlot } from '../services/slotStore.js';
import { getMentorById } from '../services/mentorStore.js';
import { getMenteeById } from '../services/menteeStore.js';
import { slotToDateTimes } from '../lib/slotDateTime.js';

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
    res.redirect(`${env.frontendUrl}/schedule?calendar=connected`);
  } catch (error) {
    logger.error(`Calendar callback error: ${error.message}`);
    res.redirect(`${env.frontendUrl}/schedule?calendar=error`);
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
/**
 * Sync a booked slot to Google Calendar (creates Meet link, updates slot)
 * POST /api/calendar/sync-slot/:slotId
 */
export const syncSlot = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user?.googleCalendarTokens) {
      return res.status(400).json({
        message: 'Google Calendar not connected. Please connect first.',
        reconnect: true,
      });
    }

    const slot = await getSlotById(req.params.slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.googleCalendarEventId) {
      return res.json({
        alreadySynced: true,
        eventId: slot.googleCalendarEventId,
        meetLink: slot.meetingLink || null,
        htmlLink: null,
      });
    }

    const mentor = await getMentorById(slot.mentorId);
    const menteeId = slot.menteeId || slot.bookedBy;
    const mentee = menteeId ? await getMenteeById(menteeId) : null;

    const { startDateTime, endDateTime, timeZone } = slotToDateTimes(
      slot.date,
      slot.time,
      slot.duration
    );

    const summary = mentee
      ? `Mentoring: ${mentor?.name || 'Mentor'} ↔ ${mentee.name || mentee.email}`
      : `Mentoring slot — ${mentor?.name || 'Mentor'}`;

    const attendees = [mentor?.email, mentee?.email].filter(Boolean).map((email) => ({ email }));

    const result = await createCalendarEvent(user.googleCalendarTokens, {
      summary,
      description: 'Created via Trà Đá Mentor Hub',
      startDateTime,
      endDateTime,
      attendees,
      timeZone,
    });

    const updated = await updateSlot(slot._id, {
      meetingLink: result.meetLink || slot.meetingLink,
      googleCalendarEventId: result.eventId,
    });

    res.json({
      success: true,
      eventId: result.eventId,
      meetLink: result.meetLink,
      htmlLink: result.htmlLink,
      slot: updated,
    });
  } catch (error) {
    logger.error(`Sync slot calendar error: ${error.message}`);
    if (error.message.includes('invalid_grant') || error.message.includes('expired')) {
      return res.status(401).json({
        message: 'Calendar access expired. Please reconnect.',
        reconnect: true,
      });
    }
    res.status(500).json({ message: 'Failed to sync slot to calendar' });
  }
};

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
