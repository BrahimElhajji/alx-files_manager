// controllers/UsersController.js

import sha1 from 'sha1';
import dbClient from '../utils/db';

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
      const existingUser = await dbClient.db
        .collection('users')
        .findOne({ email });

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
}

export default UsersController;
