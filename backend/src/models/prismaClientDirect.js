require('dotenv').config();
const { Pool } = require('pg');

// Use environment variable for connection
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
});

/**
 * Direct PostgreSQL Client via pg Pool (no Prisma adapter)
 * Used to bypass Prisma v7 adapter issues
 */
class DirectSQLClient {
  static async query(sql, params) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * User model methods using direct SQL
   */
  static user = {
    findUnique: async ({ where }) => {
      let sql = 'SELECT id, "name", email, address, "passwordHash", role, "createdAt", "updatedAt" FROM "User" WHERE';
      const params = [];

      if (where.id) {
        sql += ' id = $1';
        params.push(where.id);
      } else if (where.email) {
        sql += ' email = $1';
        params.push(where.email);
      }

      const result = await DirectSQLClient.query(sql, params);
      return result.rows[0] || null;
    },

    create: async ({ data }) => {
      const { email, name, address, passwordHash, role } = data;
      const sql = `
        INSERT INTO "User" (id, email, "name", address, "passwordHash", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, "name", email, address, "passwordHash", role, "createdAt", "updatedAt"
      `;
      const result = await DirectSQLClient.query(sql, [email, name, address || null, passwordHash, role]);
      return result.rows[0];
    },

    update: async ({ where, data }) => {
      const { id } = where;
      const updates = [];
      const params = [id];
      let paramIndex = 2;

      Object.entries(data).forEach(([key, value]) => {
        const dbKey = key === 'passwordHash' ? '"passwordHash"' : key;
        updates.push(`${dbKey} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      });

      const sql = `
        UPDATE "User" SET ${updates.join(', ')}, "updatedAt" = NOW()
        WHERE id = $1
        RETURNING id, "name", email, address, "passwordHash", role, "createdAt", "updatedAt"
      `;
      const result = await DirectSQLClient.query(sql, params);
      return result.rows[0];
    },

    delete: async ({ where }) => {
      const { id } = where;
      const sql = `
        DELETE FROM "User"
        WHERE id = $1
        RETURNING id, "name", email, address, "passwordHash", role, "createdAt", "updatedAt"
      `;
      const result = await DirectSQLClient.query(sql, [id]);
      return result.rows[0];
    },

    findMany: async ({ where, skip, take, orderBy, select }) => {
      let sql = 'SELECT ';
      
      // Build SELECT clause
      if (select) {
        const fields = Object.keys(select).map(f => f === 'createdAt' || f === 'updatedAt' ? `"${f}"` : f);
        sql += fields.join(', ');
      } else {
        sql += 'id, "name", email, address, "passwordHash", role, "createdAt", "updatedAt"';
      }

      sql += ' FROM "User" WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Add WHERE conditions
      if (where) {
        if (where.name && where.name.contains) {
          sql += ` AND "name" ILIKE $${paramIndex}`;
          params.push(`%${where.name.contains}%`);
          paramIndex++;
        }
        if (where.email && where.email.contains) {
          sql += ` AND email ILIKE $${paramIndex}`;
          params.push(`%${where.email.contains}%`);
          paramIndex++;
        }
        if (where.role) {
          sql += ` AND role = $${paramIndex}`;
          params.push(where.role);
          paramIndex++;
        }
      }

      // Add ORDER BY
      if (orderBy) {
        const field = Object.keys(orderBy)[0];
        const direction = orderBy[field];
        const dbField = field === 'createdAt' || field === 'updatedAt' ? `"${field}"` : field;
        sql += ` ORDER BY ${dbField} ${direction.toUpperCase()}`;
      }

      // Add LIMIT and OFFSET
      if (take) {
        sql += ` LIMIT $${paramIndex}`;
        params.push(take);
        paramIndex++;
      }
      if (skip) {
        sql += ` OFFSET $${paramIndex}`;
        params.push(skip);
        paramIndex++;
      }

      const result = await DirectSQLClient.query(sql, params);
      return result.rows;
    },

    count: async ({ where }) => {
      let sql = 'SELECT COUNT(*) as count FROM "User" WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (where) {
        if (where.name && where.name.contains) {
          sql += ` AND "name" ILIKE $${paramIndex}`;
          params.push(`%${where.name.contains}%`);
          paramIndex++;
        }
        if (where.email && where.email.contains) {
          sql += ` AND email ILIKE $${paramIndex}`;
          params.push(`%${where.email.contains}%`);
          paramIndex++;
        }
        if (where.role) {
          sql += ` AND role = $${paramIndex}`;
          params.push(where.role);
          paramIndex++;
        }
      }

      const result = await DirectSQLClient.query(sql, params);
      return parseInt(result.rows[0].count, 10);
    }
  };
}

module.exports = DirectSQLClient;
