// Database migration runner for Feature Analyst V2
// Runs schema setup on RDS PostgreSQL instance

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Migration runner (functional approach)
const runMigrations = async () => {
  console.log('🚀 Starting database migrations...');

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create PostgreSQL client
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // AWS RDS requires SSL
    },
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to database');

    // Read schema file
    const schemaPath = path.join(__dirname, '../../database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    console.log('📝 Running schema migrations...');
    await client.query(schema);
    console.log('✅ Schema migrations completed');

    // Check if we should seed data (only for development)
    const shouldSeed = process.env.SEED_DATA === 'true';
    if (shouldSeed) {
      console.log('🌱 Seeding database with sample data...');
      const seedPath = path.join(__dirname, '../../database-sample-data.sql');
      if (fs.existsSync(seedPath)) {
        const seedData = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedData);
        console.log('✅ Sample data seeded');
      } else {
        console.log('⚠️  Sample data file not found, skipping seed');
      }
    }

    console.log('🎉 Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connection
    await client.end();
    console.log('👋 Database connection closed');
  }
};

// Pure function to validate database connection
const validateConnection = async (connectionString) => {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    const result = await client.query('SELECT version()');
    return {
      success: true,
      version: result.rows[0].version,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await client.end();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations, validateConnection };
