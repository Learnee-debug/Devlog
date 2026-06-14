const router = require('express').Router();
const Issue = require('../models/Issue');
const Project = require('../models/Project');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

const populateIssue = (query) =>
  query
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .populate('comments.user', 'name email avatar');

// GET /api/issues?projectId=
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const issues = await populateIssue(
      Issue.find({ project: projectId }).sort({ order: 1, createdAt: 1 })
    );
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, projectId, assignee } = req.body;
    if (!title || !projectId)
      return res.status(400).json({ message: 'title and projectId are required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    // Find max order for the target status column
    const maxOrderDoc = await Issue.findOne({ project: projectId, status: status || 'backlog' })
      .sort({ order: -1 })
      .select('order');
    const order = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

    const issue = await Issue.create({
      title,
      description,
      status,
      priority,
      project: projectId,
      assignee: assignee || null,
      reporter: req.user._id,
      order,
    });

    const populated = await populateIssue(Issue.findById(issue._id));
    req.io.to(projectId).emit('issue:created', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/issues/:id
router.get('/:id', async (req, res) => {
  try {
    const issue = await populateIssue(Issue.findById(req.params.id));
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/issues/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assignee, order } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    if (title !== undefined) issue.title = title;
    if (description !== undefined) issue.description = description;
    if (status !== undefined) issue.status = status;
    if (priority !== undefined) issue.priority = priority;
    if (assignee !== undefined) issue.assignee = assignee || null;
    if (order !== undefined) issue.order = order;

    await issue.save();
    const populated = await populateIssue(Issue.findById(issue._id));
    req.io.to(issue.project.toString()).emit('issue:updated', populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/issues/:id
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete issues' });
    }
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const projectId = issue.project.toString();
    await issue.deleteOne();
    req.io.to(projectId).emit('issue:deleted', { _id: req.params.id });
    res.json({ message: 'Issue deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/issues/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.comments.push({ user: req.user._id, text });
    await issue.save();

    const populated = await populateIssue(Issue.findById(issue._id));
    req.io.to(issue.project.toString()).emit('comment:added', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
