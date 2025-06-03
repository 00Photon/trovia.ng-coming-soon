import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function testDb() {
  try {
    const db = await open({
      filename: './newsletter1.db',
      driver: sqlite3.Database,
    });
    console.log('Database opened successfully');

    // Create table if not exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table created or already exists');

    // Insert a test email
    await db.run('INSERT INTO subscribers (email) VALUES (?)', ['test@example.com']);
    console.log('Test email inserted');

    // Query the email
    const result = await db.get('SELECT * FROM subscribers WHERE email = ?', ['test@example.com']);
    console.log('Query result:', result);

    // Close the database
    await db.close();
    console.log('Database closed');
  } catch (error) {
    console.error('Database error:', error);
  }
}

testDb();