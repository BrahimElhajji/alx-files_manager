import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
//import mime from 'mime-types';
import dbClient from '../utils/db';

const writeFile = promisify(fs.writeFile);
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;
    const user = await FilesController.getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      const result = await dbClient.collection('files').insertOne(fileData);
      return res.status(201).json({
        id: result.insertedId,
        ...fileData,
      });
    }
    const fileName = uuidv4();
    const filePath = path.join(FOLDER_PATH, fileName);
    const decodedData = Buffer.from(data, 'base64');

    await writeFile(filePath, decodedData);

    fileData.localPath = filePath;
    const result = await dbClient.collection('files').insertOne(fileData);
    return res.status(201).json({
      id: result.insertedId,
      ...fileData,
    });
  }

  static async getUserFromToken(req) {
    const token = req.headers['x-token'];
    if (!token) return null;
    const user = await dbClient.collection('users').findOne({ token });
    return user;
  }
}

export default FilesController;
