import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = Router();

// Define existing endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Define new endpoint for creating users
router.post('/users', UsersController.postNew);

export default router;
