import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Handle connection errors
    this.client.on('error', (err) =>
      console.error(`Redis client not connected to the server: ${err}`)
    );

    // Promisify Redis client methods for async/await usage
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Checks if the Redis client is connected.
   * @returns {boolean} True if connected, else false.
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Retrieves the value associated with the given key from Redis.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<string|null>} The value or null if not found.
   */
  async get(key) {
    return this.getAsync(key); // Removed unnecessary 'await'
  }

  /**
   * Sets a key-value pair in Redis with an expiration duration.
   * @param {string} key - The key to set.
   * @param {string|number} value - The value to store.
   * @param {number} duration - Expiration time in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  /**
   * Deletes a key from Redis.
   * @param {string} key - The key to delete.
   * @returns {Promise<void>}
   */
  async del(key) {
    await this.delAsync(key);
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

