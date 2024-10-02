import express from 'express';
import routes from './routes/index';

// Initialize express app
const app = express();

// Load routes
app.use('/', routes);

// Define port from environment or default to 5000
const port = process.env.PORT || 5000;

// Start server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
