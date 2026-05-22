const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   GET api/chat/contacts
// @desc    Get list of users you can chat with (Active SwapConnections)
// @access  Private
router.get('/contacts', auth, async (req, res) => {
  try {
    const connections = await prisma.swapConnection.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { user1Id: req.user.id },
          { user2Id: req.user.id }
        ]
      },
      include: {
        user1: { select: { id: true, name: true, avatarUrl: true, status: true, bio: true } },
        user2: { select: { id: true, name: true, avatarUrl: true, status: true, bio: true } }
      }
    });

    const formattedContacts = connections.map(c => 
      c.user1Id === req.user.id ? c.user2 : c.user1
    );

    res.json(formattedContacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/chat/messages/:userId
// @desc    Get message history with a specific user
// @access  Private
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: parseInt(req.params.userId) },
          { senderId: parseInt(req.params.userId), receiverId: req.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/chat/messages
// @desc    Send a message (REST fallback if socket not used)
// @access  Private
router.post('/messages', auth, async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        content
      }
    });
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
