const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   POST api/requests
// @desc    Send a skill exchange request
// @access  Private
router.post('/', auth, async (req, res) => {
  const { receiverId, message } = req.body;
  try {
    if (receiverId === req.user.id) {
      return res.status(400).json({ msg: 'Cannot send request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await prisma.matchRequest.findFirst({
      where: {
        OR: [
          { senderId: req.user.id, receiverId },
          { senderId: receiverId, receiverId: req.user.id }
        ],
        status: { in: ['PENDING', 'ACCEPTED'] }
      },
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'Request already exists between users' });
    }

    const newRequest = await prisma.matchRequest.create({
      data: {
        senderId: req.user.id,
        receiverId,
        message
      },
    });

    // Create a notification for the receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'REQUEST',
        content: `You received a new swap request from ${req.user.name || 'a user'}`,
        link: '/requests'
      }
    });

    res.json(newRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/requests/incoming
// @desc    Get all incoming requests
// @access  Private
router.get('/incoming', auth, async (req, res) => {
  try {
    const requests = await prisma.matchRequest.findMany({
      where: { receiverId: req.user.id },
      include: {
        sender: { select: { id: true, name: true, bio: true, avatarUrl: true } },
      },
    });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/requests/outgoing
// @desc    Get all outgoing requests
// @access  Private
router.get('/outgoing', auth, async (req, res) => {
  try {
    const requests = await prisma.matchRequest.findMany({
      where: { senderId: req.user.id },
      include: {
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/requests/:id
// @desc    Update request status (Accept/Reject)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status } = req.body; // 'ACCEPTED' or 'REJECTED'
  try {
    let request = await prisma.matchRequest.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.receiverId !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    request = await prisma.matchRequest.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
      include: { receiver: { select: { name: true } }, sender: { select: { name: true } } }
    });

    // If accepted, establish the SwapConnection
    if (status === 'ACCEPTED') {
      // Ensure user1Id is smaller than user2Id to maintain uniqueness easily, or just insert
      const user1Id = Math.min(request.senderId, request.receiverId);
      const user2Id = Math.max(request.senderId, request.receiverId);
      
      await prisma.swapConnection.upsert({
        where: {
          user1Id_user2Id: { user1Id, user2Id }
        },
        update: { status: 'ACTIVE' },
        create: { user1Id, user2Id, status: 'ACTIVE' }
      });
    }

    // Notify the sender
    await prisma.notification.create({
      data: {
        userId: request.senderId,
        type: 'STATUS_UPDATE',
        content: `Your swap request to ${request.receiver.name} was ${status.toLowerCase()}`,
        link: '/requests'
      }
    });

    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
