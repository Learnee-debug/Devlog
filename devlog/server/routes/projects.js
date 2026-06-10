const router = require('express').Router();
const Project = require('../models/Project');
const verifyToken = require('../middleware/verifyToken');

// All routes require auth
router.use(verifyToken);

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    await project.populate('members', 'name email avatar');
    await project.populate('createdBy', 'name email avatar');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email avatar role')
      .populate('createdBy', 'name email avatar');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the creator can edit this project' });

    const { name, description } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    await project.save();
    await project.populate('members', 'name email avatar');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/members
router.post('/:id/members', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the creator can add members' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    if (project.members.includes(userId))
      return res.status(409).json({ message: 'User is already a member' });

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email avatar');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
