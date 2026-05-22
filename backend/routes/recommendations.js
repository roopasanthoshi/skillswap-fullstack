const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   GET api/recommendations/mentors
// @desc    Get users who KNOW what I want to LEARN (Mentors)
// @access  Private
router.get('/mentors', auth, async (req, res) => {
  try {
    // Advanced DBMS Logic: JOIN Users who know the skills the current user is learning
    // We will use Prisma raw query to demonstrate JOINs directly
    const mentors = await prisma.$queryRaw`
      SELECT 
        u.id, u.name, u.bio, u.avatarUrl,
        s.name as matchedSkill,
        us.proficiency
      FROM User u
      INNER JOIN UserSkill us ON u.id = us.userId
      INNER JOIN Skill s ON us.skillId = s.id
      INNER JOIN UserLearning ul ON ul.skillId = s.id
      WHERE ul.userId = ${req.user.id} AND u.id != ${req.user.id}
      GROUP BY u.id, s.id
      ORDER BY us.proficiency DESC
    `;
    
    // Structure the result to group skills by user
    const formattedMentors = mentors.reduce((acc, row) => {
      let user = acc.find(u => u.id === row.id);
      if (!user) {
        user = {
          id: row.id, name: row.name, bio: row.bio, avatarUrl: row.avatarUrl,
          matchedSkills: []
        };
        acc.push(user);
      }
      user.matchedSkills.push({ name: row.matchedSkill, proficiency: row.proficiency });
      return acc;
    }, []);

    res.json(formattedMentors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recommendations/learners
// @desc    Get users who WANT TO LEARN what I KNOW (Learners)
// @access  Private
router.get('/learners', auth, async (req, res) => {
  try {
    const learners = await prisma.$queryRaw`
      SELECT 
        u.id, u.name, u.bio, u.avatarUrl,
        s.name as matchedSkill
      FROM User u
      INNER JOIN UserLearning ul ON u.id = ul.userId
      INNER JOIN Skill s ON ul.skillId = s.id
      INNER JOIN UserSkill us ON us.skillId = s.id
      WHERE us.userId = ${req.user.id} AND u.id != ${req.user.id}
      GROUP BY u.id, s.id
    `;
    
    const formattedLearners = learners.reduce((acc, row) => {
      let user = acc.find(u => u.id === row.id);
      if (!user) {
        user = {
          id: row.id, name: row.name, bio: row.bio, avatarUrl: row.avatarUrl,
          learningSkills: []
        };
        acc.push(user);
      }
      user.learningSkills.push(row.matchedSkill);
      return acc;
    }, []);

    res.json(formattedLearners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/recommendations/explore
// @desc    Advanced query for active users with stats
// @access  Private
router.get('/explore', auth, async (req, res) => {
  try {
    // Demonstrating LEFT JOIN and Aggregate functions
    const users = await prisma.$queryRaw`
      SELECT 
        u.id, u.name, u.bio, u.avatarUrl, u.role, u.status,
        COUNT(DISTINCT us.id) as knownCount,
        COUNT(DISTINCT ul.id) as learningCount
      FROM User u
      LEFT JOIN UserSkill us ON u.id = us.userId
      LEFT JOIN UserLearning ul ON u.id = ul.userId
      WHERE u.id != ${req.user.id}
      GROUP BY u.id
      ORDER BY knownCount DESC
      LIMIT 20
    `;
    
    res.json(users.map(u => ({
        ...u,
        knownCount: Number(u.knownCount),
        learningCount: Number(u.learningCount)
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
