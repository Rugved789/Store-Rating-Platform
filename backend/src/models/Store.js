const DirectSQLClient = require('./prismaClientDirect');

/**
 * Store Repository - Data access layer for Store operations
 * Uses direct SQL to bypass Prisma adapter issues
 */
class StoreRepository {
  /**
   * Find store by ID
   * @param {string} id - Store ID
   * @returns {Promise<Object|null>} Store object or null if not found
   */
  static async findById(id) {
    const sql = `
      SELECT s.id, s.name, s.email, s.address, s."ownerId", s."createdAt", s."updatedAt",
             u.id as "owner_id", u.name as "owner_name", u.email as "owner_email"
      FROM "Store" s
      LEFT JOIN "User" u ON s."ownerId" = u.id
      WHERE s.id = $1
    `;
    const result = await DirectSQLClient.query(sql, [id]);
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      owner: row.owner_id ? {
        id: row.owner_id,
        name: row.owner_name,
        email: row.owner_email,
      } : null,
    };
  }

  /**
   * Create new store
   * @param {Object} data - Store data
   * @returns {Promise<Object>} Created store object
   */
  static async create(data) {
    const { name, email, address, ownerId } = data;
    const sql = `
      INSERT INTO "Store" (id, name, email, address, "ownerId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, email, address, "ownerId", "createdAt", "updatedAt"
    `;
    const result = await DirectSQLClient.query(sql, [name, email, address || null, ownerId || null]);
    const store = result.rows[0];
    
    // Get owner info if ownerId exists
    if (store.ownerId) {
      const ownerResult = await DirectSQLClient.query(
        'SELECT id, name, email FROM "User" WHERE id = $1',
        [store.ownerId]
      );
      if (ownerResult.rows[0]) {
        store.owner = ownerResult.rows[0];
      }
    }
    
    return store;
  }

  /**
   * Update store
   * @param {string} id - Store ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated store object
   */
  static async update(id, data) {
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    Object.entries(data).forEach(([key, value]) => {
      updates.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    });

    const sql = `
      UPDATE "Store" SET ${updates.join(', ')}, "updatedAt" = NOW()
      WHERE id = $1
      RETURNING id, name, email, address, "ownerId", "createdAt", "updatedAt"
    `;
    const result = await DirectSQLClient.query(sql, params);
    return result.rows[0];
  }

  /**
   * Delete store
   * @param {string} id - Store ID
   * @returns {Promise<Object>} Deleted store object
   */
  static async delete(id) {
    const sql = 'DELETE FROM "Store" WHERE id = $1 RETURNING id, name, email, address';
    const result = await DirectSQLClient.query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Find all stores with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} { data: stores[], total: number }
   */
  static async findAll(options = {}) {
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
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (name) {
      whereConditions.push(`s.name ILIKE $${paramIndex}`);
      params.push(`%${name}%`);
      paramIndex++;
    }
    if (email) {
      whereConditions.push(`s.email ILIKE $${paramIndex}`);
      params.push(`%${email}%`);
      paramIndex++;
    }
    if (address) {
      whereConditions.push(`s.address ILIKE $${paramIndex}`);
      params.push(`%${address}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Count total
    const countSql = `SELECT COUNT(*) as count FROM "Store" s${whereClause}`;
    const countResult = await DirectSQLClient.query(countSql, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Get data with ratings
    const dataSql = `
      SELECT s.id, s.name, s.email, s.address, s."ownerId", s."createdAt", s."updatedAt",
             u.id as "owner_id", u.name as "owner_name", u.email as "owner_email",
             AVG(r.rating)::numeric(10,2) as "avgRating", COUNT(r.id)::int as "ratingCount"
      FROM "Store" s
      LEFT JOIN "User" u ON s."ownerId" = u.id
      LEFT JOIN "Rating" r ON s.id = r."storeId"
      ${whereClause}
      GROUP BY s.id, u.id
      ORDER BY s.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, skip);
    
    const result = await DirectSQLClient.query(dataSql, params);
    
    const data = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      owner: row.owner_id ? {
        id: row.owner_id,
        name: row.owner_name,
        email: row.owner_email,
      } : null,
      averageRating: row.avgRating ? parseFloat(row.avgRating) : null,
    }));

    return { data, total };
  }

  /**
   * Count stores
   * @returns {Promise<number>} Total store count
   */
  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM "Store"';
    const result = await DirectSQLClient.query(sql, []);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get store with average rating
   * @param {string} storeId - Store ID
   * @returns {Promise<Object>} Store with average rating
   */
  static async getStoreWithAverageRating(storeId) {
    const sql = `
      SELECT s.id, s.name, s.email, s.address, s."ownerId", s."createdAt", s."updatedAt",
             u.id as "owner_id", u.name as "owner_name", u.email as "owner_email",
             AVG(r.rating)::numeric(10,2) as "avgRating"
      FROM "Store" s
      LEFT JOIN "User" u ON s."ownerId" = u.id
      LEFT JOIN "Rating" r ON s.id = r."storeId"
      WHERE s.id = $1
      GROUP BY s.id, u.id
    `;
    const result = await DirectSQLClient.query(sql, [storeId]);
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      address: row.address,
      ownerId: row.ownerId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      owner: row.owner_id ? {
        id: row.owner_id,
        name: row.owner_name,
        email: row.owner_email,
      } : null,
      averageRating: row.avgRating ? parseFloat(row.avgRating) : null,
    };
  }
}

module.exports = StoreRepository;
