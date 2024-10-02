// controllers/UsersController.js

import sha1 from 'sha1';
import { dbClient, ObjectId } from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * POST /users
   * Create a new user with email and password
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate presence of email and password
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exists
      const existingUser = await dbClient.db.collection('users').findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Create the new user object
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Prepare the response object with id and email
      const responseUser = {
        id: result.insertedId,
        email: newUser.email,
      };

      // Return the created user with status 201
      return res.status(201).json(responseUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /users/me
   * Retrieve authenticated user's information
   */
  static async getMe(req, res) {
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
      const objectId = new ObjectId(userId);

      // Find the user in the database
      const user = await dbClient.db.collection('users').findOne(
        { _id: objectId },
        { projection: { email: 1 } }
      );

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return the user's id and email
      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error in getMe:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
