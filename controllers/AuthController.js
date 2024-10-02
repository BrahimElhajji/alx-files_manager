mport { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class AuthController {
  /**
   * Handles GET /connect
   * Signs in the user by generating a new authentication token.
   */
  static async getConnect(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Extract Base64 encoded credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [email, password] = credentials.split(':');

      if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Find the user in the database
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a UUID token
      const token = uuidv4();

      // Create the Redis key
      const redisKey = `auth_${token}`;

      // Store the token in Redis with a 24-hour expiration (86400 seconds)
      await redisClient.setAsync(redisKey, user._id.toHexString(), 'EX', 86400);

      // Return the token
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Handles GET /disconnect
   * Signs out the user by deleting the authentication token.
   */
  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const redisKey = `auth_${token}`;

      // Check if the token exists in Redis
      const userId = await redisClient.getAsync(redisKey);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.delAsync(redisKey);

      // Return 204 No Content
      return res.status(204).send();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AuthController;
