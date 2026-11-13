/** Availability-slot HTTP routes. Business rules live in slotsController. */
import express from 'express';
import {
  bookAvailableSlot,
  getSlots,
  patchSlot,
  postSlot,
  removeBooking,
  removeSlot,
} from '../controllers/slotsController.js';

const router = express.Router();

router.get('/', getSlots);
router.post('/', postSlot);
router.patch('/:id/book', bookAvailableSlot);
router.patch('/:id', patchSlot);
router.delete('/:id/booking', removeBooking);
router.delete('/:id', removeSlot);

export default router;
