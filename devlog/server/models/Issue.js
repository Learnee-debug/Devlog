const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const issueSchema = new mongoose.Schema(
  {
    issueId: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['backlog', 'in-progress', 'review', 'done'],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [commentSchema],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate issueId before validation
issueSchema.pre('validate', async function (next) {
  if (this.issueId) return next();
  const count = await mongoose.model('Issue').countDocuments();
  this.issueId = `DL-${String(count + 1).padStart(3, '0')}`;
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
