const dbClient = require('../utils/db');

const authenticate = async (req, res, next) => {
  const token = req.headers['x-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await dbClient.db.collection('users').findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticate };
