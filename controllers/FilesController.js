const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const dbClient = require('../utils/db'); // Assuming dbClient is set up for MongoDB
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const { ObjectId } = require('mongodb');

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;
    const user = req.user; // Assuming user is set in req from authentication middleware

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId if provided
    let parentDoc = null;
    if (parentId !== 0) {
      try {
        parentDoc = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentDoc) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentDoc.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid parentId' });
      }
    }

    const fileDocument = {
      userId: ObjectId(user._id),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      // Create folder
      try {
        const result = await dbClient.db.collection('files').insertOne(fileDocument);
        return res.status(201).json({
          id: result.insertedId,
          ...fileDocument,
        });
      } catch (err) {
        return res.status(500).json({ error: 'Cannot create folder' });
      }
    } else {
      // Handle file and image types
      const fileName = uuidv4();
      const localPath = path.join(FOLDER_PATH, fileName);
      const buffer = Buffer.from(data, 'base64');

      // Store the file locally
      try {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
        fs.writeFileSync(localPath, buffer);
      } catch (err) {
        return res.status(500).json({ error: 'Cannot save file' });
      }

      fileDocument.localPath = localPath;

      try {
        const result = await dbClient.db.collection('files').insertOne(fileDocument);
        return res.status(201).json({
          id: result.insertedId,
          ...fileDocument,
        });
      } catch (err) {
        return res.status(500).json({ error: 'Cannot create file' });
      }
    }
  }
}

module.exports = FilesController;
