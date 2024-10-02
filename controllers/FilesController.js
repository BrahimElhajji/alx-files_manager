// controllers/FilesController.js

import { ObjectId } from 'mongodb';
import { dbClient } from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  // Existing postUpload method...

  /**
   * GET /files/:id
   * Retrieves a file document by ID
   */
  static async getShow(req, res) {
    const token = req.headers['x-token'];

    // Validate the token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Return the file document
      return res.status(200).json(file);
    } catch (error) {
      console.error('Error fetching file by ID:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * GET /files
   * Retrieves all file documents for a specific parentId with pagination
   */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];

    // Validate the token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;
    const skip = page * pageSize;

    try {
      const files = await dbClient.db.collection('files')
        .find({ userId, parentId })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      // Return the list of files (empty list if none found)
      return res.status(200).json(files);
    } catch (error) {
      console.error('Error fetching files with pagination:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
