// backend/routes/calendar.js
import express from 'express';
import auth from '../middleware/auth.js';
import * as calendarController from '../controllers/calendarController.js';

const router = express.Router();

/**
 * @route   GET /api/calendar/connect
 * @desc    Get Google Calendar OAuth URL
 * @access  Private
 */
router.get('/connect', auth, calendarController.connectCalendar);

/**
 * @route   GET /api/calendar/callback
 * @desc    Handle Google OAuth callback
 * @access  Public (requires code from Google)
 */
router.get('/callback', calendarController.handleCallback);

/**
 * @route   POST /api/calendar/create-event
 * @desc    Create calendar event with Google Meet
 * @access  Private
 */
router.post('/create-event', auth, calendarController.createEvent);

/**
 * @route   DELETE /api/calendar/delete-event/:eventId
 * @desc    Delete calendar event
 * @access  Private
 */
router.delete('/delete-event/:eventId', auth, calendarController.deleteEvent);

/**
 * @route   GET /api/calendar/status
 * @desc    Check if Google Calendar is connected
 * @access  Private
 */
router.get('/status', auth, calendarController.getStatus);

export default router;
