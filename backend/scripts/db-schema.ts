import knex, { Knex } from 'knex';
import config from '../knexfile';
const environment = process.env.NODE_ENV || 'development';

const db: Knex = knex(config[environment]);

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

async function printSchema(): Promise<void> {
  const columns: ColumnInfo[] = await db('information_schema.columns')
    .select('table_name', 'column_name', 'data_type', 'is_nullable', 'column_default')
    .where('table_schema', 'public')
    .orderBy(['table_name', 'ordinal_position']);

  // Group columns by table
  const tables: Record<string, ColumnInfo[]> = {};
  for (const col of columns) {
    if (!tables[col.table_name]) tables[col.table_name] = [];
    tables[col.table_name].push(col);
  }

  for (const [table, cols] of Object.entries(tables)) {
    console.log(`\n${table.toUpperCase()}:`);
    for (const col of cols) {
      let details = `${col.column_name}: ${col.data_type}`;
      if (col.is_nullable === 'NO') details += ' NOT NULL';
      if (col.column_default) details += ` DEFAULT ${col.column_default}`;
      console.log(`  - ${details}`);
    }
  }
  await db.destroy();
}

printSchema().catch(err => {
  console.error('Error fetching schema:', err);
  db.destroy();
});
