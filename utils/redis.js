// utils/redis.js

import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    // Promisify Redis client methods for async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.pingAsync = promisify(this.client.ping).bind(this.client);
  }

  /**
   * Checks if the Redis client is alive by sending a PING command.
   * @returns {Promise<boolean>} - Returns true if alive, false otherwise.
   */
  async isAlive() {
    try {
      const response = await this.pingAsync();
      return response === 'PONG';
    } catch (error) {
      console.error('Redis isAlive Error:', error);
      return false;
    }
  }

  /**
   * Retrieves the value associated with the given key from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string|null>} - The value or null if not found.
   */
  async get(key) {
    try {
      const value = await this.getAsync(key);
      return value;
    } catch (error) {
      console.error(`Redis GET Error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Sets a key-value pair in Redis with an expiration time.
   * @param {string} key - The key to set.
   * @param {string} value - The value to store.
   * @param {number} duration - Expiration time in seconds.
   * @returns {Promise<boolean>} - True if successful, false otherwise.
   */
  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
      return true;
    } catch (error) {
      console.error(`Redis SET Error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<boolean>} - True if deleted, false otherwise.
   */
  async del(key) {
    try {
      const result = await this.delAsync(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis DEL Error for key "${key}":`, error);
      return false;
    }
  }
}

const redisClient = new RedisClient();

export default redisClient;
