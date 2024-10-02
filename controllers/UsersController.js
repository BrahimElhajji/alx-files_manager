import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  // POST /users endpoint
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Validate password
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists
    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Insert the new user into the users collection
    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.db.collection('users').insertOne(newUser);
      return res.status(201).json({
        id: result.insertedId,
        email,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Error creating user' });
    }
  }
}

export default UsersController;
