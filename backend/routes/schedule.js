const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   GET api/schedule
// @desc    Get current user's availability schedule
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const schedules = await prisma.sessionSchedule.findMany({
      where: { userId: req.user.id },
      orderBy: { dayOfWeek: 'asc' }
    });
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/schedule/:userId
// @desc    Get another user's availability
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    // Check if they are connected
    const user1Id = Math.min(req.user.id, parseInt(req.params.userId));
    const user2Id = Math.max(req.user.id, parseInt(req.params.userId));
    
    const connection = await prisma.swapConnection.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } }
    });
    
    if (!connection || connection.status !== 'ACTIVE') {
      return res.status(403).json({ msg: 'Not authorized. Must be connected to view schedule.' });
    }

    const schedules = await prisma.sessionSchedule.findMany({
      where: { userId: parseInt(req.params.userId) },
      orderBy: { dayOfWeek: 'asc' }
    });
    res.json(schedules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/schedule
// @desc    Add availability slot
// @access  Private
router.post('/', auth, async (req, res) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  try {
    const newSlot = await prisma.sessionSchedule.create({
      data: {
        userId: req.user.id,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime
      }
    });
    res.json(newSlot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/schedule/:id
// @desc    Delete availability slot
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const slot = await prisma.sessionSchedule.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!slot) return res.status(404).json({ msg: 'Slot not found' });
    if (slot.userId !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    await prisma.sessionSchedule.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ msg: 'Slot removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
