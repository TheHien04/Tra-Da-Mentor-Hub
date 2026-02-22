// backend/utils/googleCalendar.js
import { google } from 'googleapis';
import logger from '../config/logger.js';
import env from '../config/env.js';

const oauth2Client = new google.auth.OAuth2(
  env.googleClientId,
  env.googleClientSecret,
  `${env.apiUrl}/calendar/callback`
);

/**
 * Get authorization URL for Google OAuth
 */
export const getAuthUrl = (userId) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state: userId.toString(), // Pass userId to retrieve in callback
  });
  return authUrl;
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    logger.error(`Failed to get tokens from code: ${error.message}`);
    throw error;
  }
};

/**
 * Create a Google Calendar event with Google Meet link
 */
export const createCalendarEvent = async (tokens, eventData) => {
  try {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || 'UTC',
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || 'UTC',
      },
      attendees: eventData.attendees || [],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send email invites to all attendees
    });

    logger.info(`Calendar event created: ${response.data.id}`);
    
    return {
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
    };
  } catch (error) {
    logger.error(`Failed to create calendar event: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a Google Calendar event
 */
export const deleteCalendarEvent = async (tokens, eventId) => {
  try {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    });

    logger.info(`Calendar event deleted: ${eventId}`);
  } catch (error) {
    logger.error(`Failed to delete calendar event: ${error.message}`);
    throw error;
  }
};

/**
 * Update a Google Calendar event
 */
export const updateCalendarEvent = async (tokens, eventId, eventData) => {
  try {
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: eventData.timeZone || 'UTC',
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: eventData.timeZone || 'UTC',
      },
      attendees: eventData.attendees || [],
    };

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
      sendUpdates: 'all',
    });

    logger.info(`Calendar event updated: ${response.data.id}`);
    return response.data;
  } catch (error) {
    logger.error(`Failed to update calendar event: ${error.message}`);
    throw error;
  }
};
