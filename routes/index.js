import { Router } from 'express';
import AppController from '../controllers/AppController';

// Create a router
const router = Router();

// Define endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

export default router;
