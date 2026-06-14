const router = require('express').Router();
const User = require('../models/User');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

// GET /api/users?search=name_or_email
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    if (!search || search.trim().length < 2) return res.json([]);

    const regex = new RegExp(search.trim(), 'i');
    const users = await User.find({
      $or: [{ email: regex }, { name: regex }],
      _id: { $ne: req.user._id },
    })
      .select('name email avatar role')
      .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
