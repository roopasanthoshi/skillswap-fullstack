const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, bio, avatarUrl, status } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio, avatarUrl, status },
      select: { 
        id: true, name: true, email: true, bio: true, avatarUrl: true, status: true,
        knownSkills: { include: { skill: true } },
        learningSkills: { include: { skill: true } }
      },
    });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/dashboard-stats
// @desc    Get dashboard statistics for the logged-in user
// @access  Private
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const [knownCount, learningCount, pendingRequests, acceptedRequests, user] = await Promise.all([
      prisma.userSkill.count({ where: { userId: req.user.id } }),
      prisma.userLearning.count({ where: { userId: req.user.id } }),
      prisma.matchRequest.count({ 
        where: { receiverId: req.user.id, status: 'PENDING' } 
      }),
      prisma.matchRequest.count({ 
        where: { 
          OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
          status: 'ACCEPTED' 
        } 
      }),
      prisma.user.findUnique({ 
        where: { id: req.user.id }, 
        select: { 
          bio: true, 
          avatarUrl: true,
          knownSkills: { include: { skill: true } },
          learningSkills: { include: { skill: true } }
        } 
      })
    ]);

    let profileCompletion = 20; // Base score for having an account
    if (user && user.bio) profileCompletion += 20;
    if (user && user.avatarUrl) profileCompletion += 20;
    if (knownCount > 0) profileCompletion += 20;
    if (learningCount > 0) profileCompletion += 20;

    res.json({
      knownCount,
      learningCount,
      pendingRequests,
      acceptedRequests,
      profileCompletion,
      knownSkills: user ? user.knownSkills : [],
      learningSkills: user ? user.learningSkills : []
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/bookmarks
// @desc    Toggle bookmark for a user
// @access  Private
router.post('/bookmarks', auth, async (req, res) => {
  const { savedUserId } = req.body;
  try {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_savedUserId: {
          userId: req.user.id,
          savedUserId: parseInt(savedUserId)
        }
      }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ msg: 'Bookmark removed', isBookmarked: false });
    } else {
      await prisma.bookmark.create({
        data: { userId: req.user.id, savedUserId: parseInt(savedUserId) }
      });
      return res.json({ msg: 'User bookmarked', isBookmarked: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/bookmarks
// @desc    Get bookmarked users
// @access  Private
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, bio: true, status: true } }
      }
    });
    res.json(bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/recently-viewed
// @desc    Add to recently viewed
// @access  Private
router.post('/recently-viewed', auth, async (req, res) => {
  const { viewedId } = req.body;
  if (viewedId === req.user.id) return res.json({ msg: 'Cannot view self' });
  
  try {
    await prisma.recentlyViewed.upsert({
      where: {
        viewerId_viewedId: {
          viewerId: req.user.id,
          viewedId: parseInt(viewedId)
        }
      },
      update: { viewedAt: new Date() },
      create: {
        viewerId: req.user.id,
        viewedId: parseInt(viewedId)
      }
    });
    res.json({ msg: 'Added to recently viewed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/recently-viewed
// @desc    Get recently viewed users
// @access  Private
router.get('/recently-viewed', auth, async (req, res) => {
  try {
    const views = await prisma.recentlyViewed.findMany({
      where: { viewerId: req.user.id },
      orderBy: { viewedAt: 'desc' },
      take: 10,
      include: {
        viewed: { select: { id: true, name: true, avatarUrl: true, status: true } }
      }
    });
    res.json(views.map(v => v.viewed));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { 
        id: true, name: true, bio: true, avatarUrl: true, status: true,
        knownSkills: { include: { skill: true } },
        learningSkills: { include: { skill: true } },
        reviewsReceived: { include: { reviewer: { select: { name: true, avatarUrl: true } } } }
      },
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
