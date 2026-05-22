const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const auth = require('../middleware/auth');

// @route   GET api/skills
// @desc    Get all available skills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/skills
// @desc    Create a new global skill (Admin or user if doesn't exist)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, category } = req.body;
  try {
    let skill = await prisma.skill.findUnique({ where: { name } });
    if (skill) {
      return res.json(skill);
    }
    skill = await prisma.skill.create({
      data: { name, category: category || 'General' },
    });
    res.json(skill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/skills/known
// @desc    Add a skill to user's known skills
// @access  Private
router.post('/known', auth, async (req, res) => {
  const { skillId, proficiency } = req.body;
  try {
    const userSkill = await prisma.userSkill.create({
      data: {
        userId: req.user.id,
        skillId: parseInt(skillId),
        proficiency: proficiency || 'INTERMEDIATE'
      },
      include: { skill: true }
    });
    res.json(userSkill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (Might already be added)');
  }
});

// @route   DELETE api/skills/known/:skillId
// @desc    Remove a known skill
// @access  Private
router.delete('/known/:skillId', auth, async (req, res) => {
  try {
    await prisma.userSkill.deleteMany({
      where: {
        userId: req.user.id,
        skillId: parseInt(req.params.skillId)
      }
    });
    res.json({ msg: 'Skill removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/skills/learning
// @desc    Add a skill to user's learning interests
// @access  Private
router.post('/learning', auth, async (req, res) => {
  const { skillId } = req.body;
  try {
    const userLearning = await prisma.userLearning.create({
      data: {
        userId: req.user.id,
        skillId: parseInt(skillId)
      },
      include: { skill: true }
    });
    res.json(userLearning);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error (Might already be added)');
  }
});

// @route   DELETE api/skills/learning/:skillId
// @desc    Remove a learning skill
// @access  Private
router.delete('/learning/:skillId', auth, async (req, res) => {
  try {
    await prisma.userLearning.deleteMany({
      where: {
        userId: req.user.id,
        skillId: parseInt(req.params.skillId)
      }
    });
    res.json({ msg: 'Learning skill removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
