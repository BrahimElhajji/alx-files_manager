// utils/redis.js

import redis from 'redis';

class RedisClient {
  constructor() {
    // Create a Redis client
    this.client = redis.createClient();

    // Handle connection errors
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    // Handle successful connection
    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  /**
   * Check if the Redis client is alive.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Get the value associated with a key from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string|null>} The value or null if not found.
   */
  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          console.error(`Error getting key "${key}":`, err);
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * Set a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to store.
   * @param {number} duration - Expiration time in seconds.
   * @returns {Promise<unknown>} The reply from Redis.
   */
  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err, reply) => {
        if (err) {
          console.error(`Error setting key "${key}":`, err);
          return reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * Delete a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<number>} The number of keys removed.
   */
  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          console.error(`Error deleting key "${key}":`, err);
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
}

// Export a single instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
