import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Helper to build query results in Supabase-like format
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    try {
        // Use sql.query() for parameterized queries (newer NeonDB API)
        const result = await sql.query(text, params);
        // NeonDB query() returns { rows: [...] } or array directly depending on version
        if (Array.isArray(result)) {
            return result;
        }
        // Handle object with rows property
        if (result && typeof result === 'object' && 'rows' in result) {
            return (result as any).rows || [];
        }
        // If single row object, wrap in array
        if (result && typeof result === 'object') {
            return [result];
        }
        return [];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Supabase-like query builder for compatibility
export const supabaseAdmin = {
    from: (table: string) => ({
        select: (columns?: string) => {
            const cols = columns || '*';
            return {
                eq: (col: string, val: any) => ({
                    single: async () => {
                        try {
                            const result = await query(`SELECT ${cols} FROM ${table} WHERE ${col} = $1`, [val]);
                            return { data: result[0] || null, error: result[0] ? null : { message: 'Not found' } };
                        } catch (error: any) {
                            return { data: null, error: { message: error.message } };
                        }
                    },
                    limit: async (limit: number) => {
                        try {
                            const result = await query(`SELECT ${cols} FROM ${table} WHERE ${col} = $1 LIMIT $2`, [val, limit]);
                            return { data: result, error: null };
                        } catch (error: any) {
                            return { data: [], error: { message: error.message } };
                        }
                    },
                    order: (orderCol: string, options?: { ascending?: boolean }) => ({
                        limit: async (limit: number) => {
                            try {
                                const order = options?.ascending !== false ? 'ASC' : 'DESC';
                                const result = await query(
                                    `SELECT ${cols} FROM ${table} WHERE ${col} = $1 ORDER BY ${orderCol} ${order} LIMIT $2`,
                                    [val, limit]
                                );
                                return { data: result, error: null };
                            } catch (error: any) {
                                return { data: [], error: { message: error.message } };
                            }
                        }
                    })
                }),
                order: (col: string, options?: { ascending?: boolean }) => ({
                    limit: async (limit: number) => {
                        try {
                            const order = options?.ascending !== false ? 'ASC' : 'DESC';
                            const result = await query(`SELECT ${cols} FROM ${table} ORDER BY ${col} ${order} LIMIT $1`, [limit]);
                            return { data: result, error: null };
                        } catch (error: any) {
                            return { data: [], error: { message: error.message } };
                        }
                    },
                    eq: (col2: string, val2: any) => ({
                        limit: async (limit: number) => {
                            try {
                                const order = options?.ascending !== false ? 'ASC' : 'DESC';
                                const result = await query(
                                    `SELECT ${cols} FROM ${table} WHERE ${col2} = $1 ORDER BY ${col} ${order} LIMIT $2`,
                                    [val2, limit]
                                );
                                return { data: result, error: null };
                            } catch (error: any) {
                                return { data: [], error: { message: error.message } };
                            }
                        }
                    })
                }),
                limit: async (limit: number) => {
                    try {
                        const result = await query(`SELECT ${cols} FROM ${table} LIMIT $1`, [limit]);
                        return { data: result, error: null };
                    } catch (error: any) {
                        return { data: [], error: { message: error.message } };
                    }
                }
            };
        },
        insert: async (data: any) => {
            try {
                const keys = Object.keys(data);
                const values = Object.values(data);
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
                const cols = keys.join(', ');
                const result = await query(
                    `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
                    values
                );
                return { data: result[0], error: null };
            } catch (error: any) {
                return { data: null, error: { message: error.message } };
            }
        },
        update: (data: any) => ({
            eq: async (col: string, val: any) => {
                try {
                    const keys = Object.keys(data);
                    const values = Object.values(data);
                    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
                    const result = await query(
                        `UPDATE ${table} SET ${setClause} WHERE ${col} = $${keys.length + 1} RETURNING *`,
                        [...values, val]
                    );
                    return { data: result[0] || null, error: null };
                } catch (error: any) {
                    return { data: null, error: { message: error.message } };
                }
            }
        }),
        delete: () => ({
            eq: async (col: string, val: any) => {
                try {
                    await query(`DELETE FROM ${table} WHERE ${col} = $1`, [val]);
                    return { error: null };
                } catch (error: any) {
                    return { error: { message: error.message } };
                }
            }
        })
    }),
    rpc: async (fn: string, params: Record<string, any>) => {
        try {
            const paramNames = Object.keys(params);
            const paramValues = Object.values(params);
            const placeholders = paramNames.map((_, i) => `$${i + 1}`).join(', ');
            await query(`SELECT ${fn}(${placeholders})`, paramValues);
            return { data: null, error: null };
        } catch (error: any) {
            return { data: null, error: { message: error.message } };
        }
    }
};

// For compatibility - no auth needed (AI agents only)
export const supabase = supabaseAdmin;
