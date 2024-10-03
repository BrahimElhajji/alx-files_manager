// routes/index.js

import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController'; // Import FilesController

const router = Router();

// Existing routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

// New route for file upload
router.post('/files', FilesController.postUpload);

// New routes for getting files
router.get('/files/:id', FilesController.getShow); // GET file by id
router.get('/files', FilesController.getIndex); // GET all files with pagination

export default router;
