const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   GET api/bookings
// @desc    Get all bookings for user (both requested and provided)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await prisma.sessionBooking.findMany({
      where: {
        OR: [
          { requesterId: req.user.id },
          { providerId: req.user.id }
        ]
      },
      include: {
        requester: { select: { id: true, name: true, avatarUrl: true } },
        provider: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// @route   POST api/bookings
// @desc    Create a new booking request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { providerId, scheduledAt, duration, notes } = req.body;
  try {
    if (providerId === req.user.id) {
      return res.status(400).json({ msg: 'Cannot book a session with yourself' });
    }

    // Check if connected
    const user1Id = Math.min(req.user.id, parseInt(providerId));
    const user2Id = Math.max(req.user.id, parseInt(providerId));
    const connection = await prisma.swapConnection.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } }
    });
    if (!connection || connection.status !== 'ACTIVE') {
      return res.status(403).json({ msg: 'Must be actively connected to book a session' });
    }

    // Check for overlap
    const newBookingTime = new Date(scheduledAt);
    const endTime = new Date(newBookingTime.getTime() + duration * 60000);
    
    const existing = await prisma.sessionBooking.findFirst({
      where: {
        OR: [
          { requesterId: parseInt(providerId) },
          { providerId: parseInt(providerId) }
        ],
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { lte: endTime },
      }
    });
    
    // Simplistic overlap check - real systems need more complex boundary checks
    if (existing) {
      const existingEnd = new Date(existing.scheduledAt.getTime() + existing.duration * 60000);
      if (newBookingTime < existingEnd) {
        return res.status(400).json({ msg: 'Provider is not available at this time' });
      }
    }

    const booking = await prisma.sessionBooking.create({
      data: {
        requesterId: req.user.id,
        providerId: parseInt(providerId),
        scheduledAt: newBookingTime,
        duration: parseInt(duration),
        notes
      }
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: parseInt(providerId),
        type: 'SYSTEM',
        content: `You have a new session booking request from ${req.user.name || 'a user'}`,
        link: '/schedule'
      }
    });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/bookings/:id
// @desc    Update booking status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { requester: true, provider: true }
    });

    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.providerId !== req.user.id && booking.requesterId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const updated = await prisma.sessionBooking.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });

    // Notify the other party
    const notifyId = booking.requesterId === req.user.id ? booking.providerId : booking.requesterId;
    await prisma.notification.create({
      data: {
        userId: notifyId,
        type: 'STATUS_UPDATE',
        content: `Your session booking was ${status.toLowerCase()}`,
        link: '/schedule'
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
