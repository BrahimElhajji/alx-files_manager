// controllers/AuthController.js

import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import { dbClient } from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  /**
   * GET /connect
   * Authenticate user and generate a token
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode Base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Find the user with the given email and hashed password
      const user = await dbClient.db.collection('users').findOne({
        email,
        password: hashedPassword,
      });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a UUID token
      const token = uuidv4();

      // Create a Redis key: auth_<token>
      const redisKey = `auth_${token}`;

      // Store the token with user ID in Redis for 24 hours (86400 seconds)
      await redisClient.set(redisKey, user._id.toString(), 86400);

      // Return the token
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /disconnect
   * Invalidate the user's token
   */
  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${token}`;

    try {
      const result = await redisClient.del(redisKey);

      if (!result) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Successfully deleted the token
      return res.status(204).send();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
