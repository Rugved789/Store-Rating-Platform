// Direct stores helper using the global DirectSQLClient pool
const DirectSQLClient = require('./prismaClientDirect');

class StoresHelper {
  /**
   * Get all stores with ratings for a user
   */
  static async getStoresWithRatings(userId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      name,
      address,
    } = options;

    const skip = (page - 1) * limit;
    const filterParams = [];
    let whereConditions = [];
    let paramCount = 1;

    // Build WHERE clause based on filters
    if (search) {
      whereConditions.push(`(s.name ILIKE $${paramCount} OR s.address ILIKE $${paramCount})`);
      filterParams.push(`%${search}%`);
      paramCount++;
    } else {
      if (name) {
        whereConditions.push(`s.name ILIKE $${paramCount}`);
        filterParams.push(`%${name}%`);
        paramCount++;
      }
      if (address) {
        whereConditions.push(`s.address ILIKE $${paramCount}`);
        filterParams.push(`%${address}%`);
        paramCount++;
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Determine sort column
    const validSortColumns = ['createdAt', 'name', 'email', 'address'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    try {
      // Get total count
      const countSql = `SELECT COUNT(*) as total FROM "Store" s ${whereClause}`;
      const countResult = await DirectSQLClient.query(countSql, filterParams);
      const total = parseInt(countResult.rows[0].total);

      // Get stores with ratings
      // Parameters: first userId (for CASE WHEN), then filter params, then limit and offset
      const allParams = [userId, ...filterParams, limit, skip];
      const finalParamCount = paramCount + 1; // userId is first, then filter params

      const storesQuery = `
        SELECT 
          s.id,
          s.name,
          s.email,
          s.address,
          s."ownerId",
          s."createdAt",
          s."updatedAt",
          COALESCE(AVG(r.rating)::numeric(3,2), null) as "averageRating",
          COUNT(r.id) as "totalRatings",
          MAX(CASE WHEN r."userId" = $1 THEN r.rating END) as "userRating"
        FROM "Store" s
        LEFT JOIN "Rating" r ON s.id = r."storeId"
        ${whereClause}
        GROUP BY s.id, s.name, s.email, s.address, s."ownerId", s."createdAt", s."updatedAt"
        ORDER BY s."${sortColumn}" ${orderDirection}
        LIMIT $${finalParamCount} OFFSET $${finalParamCount + 1}
      `;

      const storesResult = await DirectSQLClient.query(storesQuery, allParams);

      const stores = storesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        ownerId: row.ownerId,
        averageRating: row.averageRating ? parseFloat(row.averageRating) : null,
        userRating: row.userRating ? parseInt(row.userRating) : null,
        totalRatings: parseInt(row.totalRatings),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      return { data: stores, total };
    } catch (error) {
      console.error('StoresHelper.getStoresWithRatings error:', error);
      throw error;
    }
  }

  /**
   * Get store by ID with ratings
   */
  static async getStoreById(storeId) {
    const sql = `
      SELECT s.id, s.name, s.email, s.address, s."ownerId", s."createdAt", s."updatedAt"
      FROM "Store" s
      WHERE s.id = $1
    `;
    const result = await DirectSQLClient.query(sql, [storeId]);
    return result.rows[0] || null;
  }

  /**
   * Get all stores (for admin)
   */
  static async getAllStores(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      name,
      email,
      address,
    } = options;

    const skip = (page - 1) * limit;
    let whereClause = '';
    const params = [];
    let paramCount = 1;

    // Build WHERE clause
    const conditions = [];
    if (name) {
      conditions.push(`name ILIKE $${paramCount}`);
      params.push(`%${name}%`);
      paramCount++;
    }
    if (email) {
      conditions.push(`email ILIKE $${paramCount}`);
      params.push(`%${email}%`);
      paramCount++;
    }
    if (address) {
      conditions.push(`address ILIKE $${paramCount}`);
      params.push(`%${address}%`);
      paramCount++;
    }
    if (conditions.length > 0) {
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    try {
      // Get total count
      const countResult = await DirectSQLClient.query(
        `SELECT COUNT(*) as total FROM "Store" ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Get stores
      const validSortColumns = ['createdAt', 'name', 'email', 'address'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
      const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      const storesQuery = `
        SELECT * FROM "Store"
        ${whereClause}
        ORDER BY "${sortColumn}" ${orderDirection}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      const storesParams = [...params, limit, skip];
      const storesResult = await DirectSQLClient.query(storesQuery, storesParams);

      return { data: storesResult.rows, total };
    } catch (error) {
      console.error('StoresHelper.getAllStores error:', error);
      throw error;
    }
  }
}

module.exports = StoresHelper;
