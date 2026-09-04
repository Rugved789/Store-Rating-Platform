// Direct admin helper using native pg client
const { Client } = require('pg');

class AdminHelper {
  /**
   * Get all stores for admin (with filtering/sorting/pagination)
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
        conditions.push(`s.name ILIKE $${paramCount}`);
        params.push(`%${name}%`);
        paramCount++;
      }
      if (email) {
        conditions.push(`s.email ILIKE $${paramCount}`);
        params.push(`%${email}%`);
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

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM "Store" s ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Get stores with owner details
      const validSortColumns = ['createdAt', 'name', 'email', 'address'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
      const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Add LIMIT and OFFSET parameters
      params.push(limit);
      params.push(skip);
      const limitParamNum = paramCount;
      const offsetParamNum = paramCount + 1;

      const storesQuery = `
        SELECT 
          s.id,
          s.name,
          s.email,
          s.address,
          s."ownerId",
          u.name as "ownerName",
          u.email as "ownerEmail",
          s."createdAt",
          s."updatedAt",
          COUNT(r.id) as "totalRatings",
          COALESCE(AVG(r.rating)::numeric(3,2), null) as "averageRating"
        FROM "Store" s
        LEFT JOIN "User" u ON s."ownerId" = u.id
        LEFT JOIN "Rating" r ON s.id = r."storeId"
        ${whereClause}
        GROUP BY s.id, s.name, s.email, s.address, s."ownerId", u.name, u.email, s."createdAt", s."updatedAt"
        ORDER BY s."${sortColumn}" ${orderDirection}
        LIMIT $${limitParamNum} OFFSET $${offsetParamNum}
      `;

      const storesResult = await client.query(storesQuery, params);

      const stores = storesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        ownerId: row.ownerId,
        ownerName: row.ownerName,
        ownerEmail: row.ownerEmail,
        totalRatings: parseInt(row.totalRatings),
        averageRating: row.averageRating ? parseFloat(row.averageRating) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      return { data: stores, total };

    } finally {
      await client.end();
    }
  }

  /**
   * Get all users for admin
   */
  static async getAllUsers(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      name,
      email,
      role,
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
      if (role) {
        conditions.push(`role = $${paramCount}`);
        params.push(role);
        paramCount++;
      }
      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(' AND ')}`;
      }

      // Get total count
      const countResult = await client.query(
        `SELECT COUNT(*) as total FROM "User" ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      // Get users
      const validSortColumns = ['createdAt', 'name', 'email', 'role'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'createdAt';
      const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

      // Add LIMIT and OFFSET parameters
      params.push(limit);
      params.push(skip);
      const limitParamNum = paramCount;
      const offsetParamNum = paramCount + 1;

      const usersQuery = `
        SELECT 
          id,
          name,
          email,
          role,
          "createdAt",
          "updatedAt"
        FROM "User"
        ${whereClause}
        ORDER BY "${sortColumn}" ${orderDirection}
        LIMIT $${limitParamNum} OFFSET $${offsetParamNum}
      `;

      const usersResult = await client.query(usersQuery, params);

      const users = usersResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      return { data: users, total };

    } finally {
      await client.end();
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      // Get counts by role
      const [usersResult, storesResult, ratingsResult, adminResult, ownerResult, userResult] = await Promise.all([
        client.query('SELECT COUNT(*) as total FROM "User"'),
        client.query('SELECT COUNT(*) as total FROM "Store"'),
        client.query('SELECT COUNT(*) as total FROM "Rating"'),
        client.query('SELECT COUNT(*) as total FROM "User" WHERE role = $1', ['ADMIN']),
        client.query('SELECT COUNT(*) as total FROM "User" WHERE role = $1', ['STORE_OWNER']),
        client.query('SELECT COUNT(*) as total FROM "User" WHERE role = $1', ['USER']),
      ]);

      const stats = {
        totalUsers: parseInt(usersResult.rows[0].total),
        totalStores: parseInt(storesResult.rows[0].total),
        totalRatings: parseInt(ratingsResult.rows[0].total),
        adminUsers: parseInt(adminResult.rows[0].total),
        storeOwners: parseInt(ownerResult.rows[0].total),
        regularUsers: parseInt(userResult.rows[0].total),
      };

      return stats;

    } finally {
      await client.end();
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      // Delete user (ratings will cascade delete)
      const result = await client.query(
        'DELETE FROM "User" WHERE id = $1 RETURNING id, name, email',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];

    } finally {
      await client.end();
    }
  }

  /**
   * Delete store
   */
  static async deleteStore(storeId) {
    const client = new Client({
      connectionString: process.env.DATABASE_URL
    });

    try {
      await client.connect();

      // Delete store (ratings will cascade delete)
      const result = await client.query(
        'DELETE FROM "Store" WHERE id = $1 RETURNING id, name, email',
        [storeId]
      );

      if (result.rows.length === 0) {
        throw new Error('Store not found');
      }

      return result.rows[0];

    } finally {
      await client.end();
    }
  }
}

module.exports = AdminHelper;
