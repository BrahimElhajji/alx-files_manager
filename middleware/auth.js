// middleware/auth.js

import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import { dbClient } from '../utils/db';

const authMiddleware = async (req, res, next) => {
  const token = req.headers['x-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const redisKey = `auth_${token}`;

  try {
    // Retrieve the user ID from Redis
    const userId = await redisClient.get(redisKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Convert the string ID to ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the user in the database
    const user = await dbClient.db.collection('users').findOne(
      { _id: ObjectId(userId) },
      { projection: { email: 1 } },
    );

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Attach user information to the request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default authMiddleware;
