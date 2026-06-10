require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Issue = require('./models/Issue');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});
  await Issue.deleteMany({});
  console.log('Cleared existing data');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@devlog.com',
    password: 'password123',
    role: 'admin',
  });

  const dev = await User.create({
    name: 'Dev User',
    email: 'dev@devlog.com',
    password: 'password123',
    role: 'developer',
  });

  console.log('Users created:', admin.email, dev.email);

  const project = await Project.create({
    name: 'DevLog Platform',
    description: 'Main platform development project for tracking bugs and issues.',
    createdBy: admin._id,
    members: [admin._id, dev._id],
  });

  console.log('Project created:', project.name);

  const issueData = [
    {
      title: 'Set up authentication system',
      description: 'Implement JWT-based auth with httpOnly cookies and refresh token support.',
      status: 'done',
      priority: 'critical',
      assignee: admin._id,
    },
    {
      title: 'Design Kanban board UI',
      description: 'Create drag-and-drop Kanban board using @hello-pangea/dnd library.',
      status: 'in-progress',
      priority: 'high',
      assignee: dev._id,
    },
    {
      title: 'Integrate Socket.io for real-time updates',
      description: 'Emit and listen to issue events across project rooms for live sync.',
      status: 'in-progress',
      priority: 'high',
      assignee: admin._id,
    },
    {
      title: 'Add issue priority filtering',
      description: 'Allow users to filter issues by priority (low, medium, high, critical).',
      status: 'backlog',
      priority: 'medium',
      assignee: dev._id,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints with request/response examples.',
      status: 'review',
      priority: 'low',
      assignee: dev._id,
    },
  ];

  for (let i = 0; i < issueData.length; i++) {
    await Issue.create({
      ...issueData[i],
      project: project._id,
      reporter: admin._id,
      order: i,
    });
  }

  console.log('5 sample issues created');
  console.log('\nSeed complete!');
  console.log('Admin login: admin@devlog.com / password123');
  console.log('Dev login:   dev@devlog.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
