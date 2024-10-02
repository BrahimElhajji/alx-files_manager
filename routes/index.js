// routes/index.js

import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = Router();

// Existing routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// User creation route
router.post('/users', UsersController.postNew);

// New authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);

export default router;
