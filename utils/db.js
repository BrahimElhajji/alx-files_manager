// utils/db.js

import { MongoClient, ObjectId } from 'mongodb';

// Environment variables for MongoDB connection
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';

const url = `mongodb://${host}:${port}`;
const dbName = database;

class DBClient {
  constructor() {
    // Create a MongoDB client
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    // Connect to MongoDB
    this.client.connect()
      .then(() => {
        this.db = this.client.db(dbName);
        console.log('Connected to MongoDB');
      })
      .catch((err) => {
        console.error(`Failed to connect to MongoDB: ${err}`);
      });
  }

  // Check if MongoDB is alive (connected)
  isAlive() {
    return this.client && this.client.isConnected();
  }

  // Count the number of documents in the "users" collection
  async nbUsers() {
    if (!this.isAlive()) {
      throw new Error('DB is not connected');
    }
    return this.db.collection('users').countDocuments();
  }

  // Count the number of documents in the "files" collection
  async nbFiles() {
    if (!this.isAlive()) {
      throw new Error('DB is not connected');
    }
    return this.db.collection('files').countDocuments();
  }

  // Expose ObjectId for use in controllers
  ObjectId = ObjectId;
}

const dbClient = new DBClient();

export default dbClient;
