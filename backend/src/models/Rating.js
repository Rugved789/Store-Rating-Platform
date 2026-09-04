const DirectSQLClient = require('./prismaClientDirect');

/**
 * Rating Repository - Data access layer for Rating operations
 * Uses direct SQL to bypass Prisma adapter issues
 */
class RatingRepository {
  /**
   * Find rating by user and store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @returns {Promise<Object|null>} Rating object or null
   */
  static async findByUserAndStore(userId, storeId) {
    const sql = `
      SELECT id, "userId", "storeId", rating, "createdAt", "updatedAt"
      FROM "Rating"
      WHERE "userId" = $1 AND "storeId" = $2
      LIMIT 1
    `;
    const result = await DirectSQLClient.query(sql, [userId, storeId]);
    return result.rows[0] || null;
  }

  /**
   * Create new rating
   * @param {Object} data - Rating data
   * @returns {Promise<Object>} Created rating
   */
  static async create(data) {
    const { userId, storeId, rating } = data;
    const sql = `
      INSERT INTO "Rating" (id, "userId", "storeId", rating, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      RETURNING id, "userId", "storeId", rating, "createdAt", "updatedAt"
    `;
    const result = await DirectSQLClient.query(sql, [userId, storeId, rating]);
    return result.rows[0];
  }

  /**
   * Update rating
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated rating
   */
  static async update(userId, storeId, data) {
    const { rating } = data;
    const sql = `
      UPDATE "Rating"
      SET rating = $1, "updatedAt" = NOW()
      WHERE "userId" = $2 AND "storeId" = $3
      RETURNING id, "userId", "storeId", rating, "createdAt", "updatedAt"
    `;
    const result = await DirectSQLClient.query(sql, [rating, userId, storeId]);
    return result.rows[0];
  }

  /**
   * Upsert rating (create or update)
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @param {number} rating - Rating value (1-5)
   * @returns {Promise<Object>} Created or updated rating
   */
  static async upsert(userId, storeId, rating) {
    const sql = `
      INSERT INTO "Rating" (id, "userId", "storeId", rating, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW())
      ON CONFLICT ("userId", "storeId")
      DO UPDATE SET rating = $3, "updatedAt" = NOW()
      RETURNING id, "userId", "storeId", rating, "createdAt", "updatedAt"
    `;
    const result = await DirectSQLClient.query(sql, [userId, storeId, rating]);
    return result.rows[0];
  }

  /**
   * Get user's rating for a store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @returns {Promise<number|null>} Rating value or null
   */
  static async getUserRatingForStore(userId, storeId) {
    const rating = await this.findByUserAndStore(userId, storeId);
    return rating ? rating.rating : null;
  }

  /**
   * Count ratings by store
   * @param {string} storeId - Store ID
   * @returns {Promise<number>} Total ratings for store
   */
  static async countByStore(storeId) {
    const sql = 'SELECT COUNT(*) as count FROM "Rating" WHERE "storeId" = $1';
    const result = await DirectSQLClient.query(sql, [storeId]);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get average rating for store
   * @param {string} storeId - Store ID
   * @returns {Promise<number|null>} Average rating or null
   */
  static async getAverageRating(storeId) {
    const sql = 'SELECT AVG(rating)::numeric(10,2) as avg_rating FROM "Rating" WHERE "storeId" = $1';
    const result = await DirectSQLClient.query(sql, [storeId]);
    const avgRating = result.rows[0].avg_rating;
    return avgRating ? parseFloat(avgRating) : null;
  }
}

module.exports = RatingRepository;
