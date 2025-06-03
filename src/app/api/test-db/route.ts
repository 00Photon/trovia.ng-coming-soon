import { NextResponse } from 'next/server';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function GET() {
  try {
    const db = await open({ filename: './newsletter.db', driver: sqlite3.Database });
    await db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)');
    await db.run('INSERT INTO test (id) VALUES (?)', [1]);
    const result = await db.get('SELECT * FROM test');
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ error: 'Database test failed' }, { status: 500 });
  }
}