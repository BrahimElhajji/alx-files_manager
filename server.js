// server.js

import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index';

// Load environment variables from .env file
dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Load routes
app.use('/', routes);

// Define port from environment or default to 5000
const port = process.env.PORT || 5000;

// Start server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
