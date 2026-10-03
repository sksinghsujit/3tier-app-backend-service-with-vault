const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// Connect to PostgreSQL using environment variables passed by Kubernetes/OpenShift
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'appdb',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'SuperSecretPassword123!',
});

// Initialize Database Table
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Healthcheck Endpoint
app.get('/health', (req, res) => res.status(200).send('OK'));

// GET /api/todos - Fetch all todos from Postgres
app.get('/api/todos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM todos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/todos - Insert new todo into Postgres
app.post('/api/todos', async (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).json({ error: 'Task is required' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO todos (task) VALUES ($1) RETURNING *',
      [task]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  initDb();
});