// Direct stores helper using native pg client
const { Client } = require('pg');

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

    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      const skip = (page - 1) * limit;
      let whereClause = '';
      const params = [];
      let paramCount = 1;

      // Build WHERE clause based on filters
      if (search) {
        whereClause = `WHERE s.name ILIKE $${paramCount} OR s.address ILIKE $${paramCount}`;
        params.push(`%${search}%`);
        paramCount++;
      } else {
        const conditions = [];
        if (name) {
          conditions.push(`s.name ILIKE $${paramCount}`);
          params.push(`%${name}%`);
          paramCount++;
        }
        if (address) {
          conditions.push(`s.address ILIKE $${paramCount}`);
          params.push(`%${address}%`);
          paramCount++;
        }
        if (conditions.length > 0) {
          whereClause = `WHERE ${conditions.join(' AND ')}`;
        }
      }

      // Determine sort column
      const validSortColumns = ['createdAt', 'name', 'email', 'address'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
      const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM "Store" s ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Get stores with ratings
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
          MAX(CASE WHEN r."userId" = $${paramCount} THEN r.rating END) as "userRating"
        FROM "Store" s
        LEFT JOIN "Rating" r ON s.id = r."storeId"
        ${whereClause}
        GROUP BY s.id, s.name, s.email, s.address, s."ownerId", s."createdAt", s."updatedAt"
        ORDER BY s."${sortColumn}" ${orderDirection}
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;

      const storesParams = [...params, userId, limit, skip];
      const storesResult = await client.query(storesQuery, storesParams);

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

    } finally {
      await client.end();
    }
  }

  /**
   * Get store by ID with ratings
   */
  static async getStoreById(storeId) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      const result = await client.query(
        `SELECT * FROM "Store" WHERE id = $1`,
        [storeId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];

    } finally {
      await client.end();
    }
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

    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

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

      // Get total count
      const countResult = await client.query(
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
      const storesResult = await client.query(storesQuery, storesParams);

      return { data: storesResult.rows, total };

    } finally {
      await client.end();
    }
  }
}

module.exports = StoresHelper;
