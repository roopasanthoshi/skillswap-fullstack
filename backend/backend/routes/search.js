const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   GET api/search
// @desc    Advanced search for users by skills
// @access  Private
router.get('/', auth, async (req, res) => {
  const { query, category, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    let whereClause = {
      id: { not: req.user.id } // Exclude current user
    };

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { bio: { contains: query } },
        { knownSkills: { some: { skill: { name: { contains: query } } } } }
      ];
    }

    if (category) {
      whereClause.knownSkills = {
        some: { skill: { category: category } }
      };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true, name: true, avatarUrl: true, bio: true, status: true,
          knownSkills: { include: { skill: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalResults: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
