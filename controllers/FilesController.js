// controllers/FilesController.js

import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import { dbClient } from '../utils/db';
import redisClient from '../utils/redis';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    // Validate the token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    // Check if parentId is valid
    if (parentId !== 0) {
      const parent = await dbClient.db.collection('files').findOne({ _id: parentId });
      if (!parent) return res.status(400).json({ error: 'Parent not found' });
      if (parent.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    let localPath = null;

    // Handle file or image types
    if (type !== 'folder') {
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      const filePath = `${FOLDER_PATH}/${uuidv4()}`;
      const fileData = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileData);
      localPath = filePath;
    }

    // Prepare the new file document
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    };

    // Insert the new file document into the database
    const result = await dbClient.db.collection('files').insertOne(newFile);

    // Return the newly created file document
    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });
  }

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
   /**
   * PUT /files/:id/publish
   * Set isPublic to true for the file based on ID
   */
  static async putPublish(req, res) {
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

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId), userId },
        { $set: { isPublic: true } }
      );

      const updatedFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId });

      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error('Error updating file to publish:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * PUT /files/:id/unpublish
   * Set isPublic to false for the file based on ID
   */
  static async putUnpublish(req, res) {
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

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId), userId },
        { $set: { isPublic: false } }
      );

      const updatedFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId });

      return res.status(200).json(updatedFile);
    } catch (error) {
      console.error('Error updating file to unpublish:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
