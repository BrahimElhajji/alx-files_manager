// utils/db.js

import { MongoClient } from 'mongodb';

/**
 * DBClient class to manage MongoDB connections and operations.
 */
class DBClient {
  /**
   * Creates an instance of DBClient.
   * Initializes the MongoDB client with configuration from environment variables.
   */
  constructor() {
    // Configuration from environment variables or defaults
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    // Connection URI
    const uri = `mongodb://${host}:${port}`;

    // Initialize the MongoClient
    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.databaseName = database;
    this.db = null;

    // Connect to MongoDB
    this.connect();
  }

  /**
   * Connects to MongoDB and sets the database reference.
   */
  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      console.log(`Connected to MongoDB at ${this.client.s.url}, Database: ${this.databaseName}`);
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
    }
  }

  /**
   * Checks if the MongoDB client is connected.
   * @returns {boolean} True if connected, else false.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Retrieves the number of documents in the 'users' collection.
   * @returns {Promise<number>} Number of user documents.
   */
  async nbUsers() {
    if (!this.isAlive()) {
      console.error('MongoDB client is not connected.');
      return 0;
    }

    try {
      const collection = this.db.collection('users');
      const count = await collection.countDocuments();
      console.log(`Number of users: ${count}`);
      return count;
    } catch (err) {
      console.error('Error counting users:', err);
      return 0;
    }
  }

  /**
   * Retrieves the number of documents in the 'files' collection.
   * @returns {Promise<number>} Number of file documents.
   */
  async nbFiles() {
    if (!this.isAlive()) {
      console.error('MongoDB client is not connected.');
      return 0;
    }

    try {
      const collection = this.db.collection('files');
      const count = await collection.countDocuments();
      console.log(`Number of files: ${count}`);
      return count;
    } catch (err) {
      console.error('Error counting files:', err);
      return 0;
    }
  }

  /**
   * Closes the MongoDB connection gracefully.
   */
  async disconnect() {
    try {
      await this.client.close();
      console.log('MongoDB connection closed.');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }
}

// Create and export a single instance of DBClient
const dbClient = new DBClient();
export default dbClient;

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await dbClient.disconnect();
  process.exit(0);
});
