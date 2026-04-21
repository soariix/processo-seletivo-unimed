import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (SQLite)
const dbPath = path.resolve(__dirname, 'tasks.db');
const db = new (sqlite3.verbose()).Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('Connected to SQLite Database.');
        db.run(`
            CREATE TABLE IF NOT EXISTS Tasks (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Status TEXT NOT NULL DEFAULT 'Pending',
                IsDeleted INTEGER DEFAULT 0
            )
        `);
    }
});

// GET /tasks
app.get('/tasks', (req, res) => {
    const { status } = req.query;
    let query = 'SELECT * FROM Tasks WHERE IsDeleted = 0';
    const params: any[] = [];

    if (status && status !== 'All') {
        query += ' AND Status = ?';
        params.push(status);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST /tasks
app.post('/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    db.run('INSERT INTO Tasks (Title, Status) VALUES (?, ?)', [title, 'Pending'], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, title, status: 'Pending', isDeleted: 0 });
    });
});

// PATCH /tasks/:id
app.patch('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    db.run('UPDATE Tasks SET Status = ? WHERE Id = ? AND IsDeleted = 0', [status, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    // Soft Delete
    db.run('UPDATE Tasks SET IsDeleted = 1 WHERE Id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task logically deleted.' });
    });
});

app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
});
