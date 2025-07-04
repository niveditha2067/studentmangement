const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/database.sqlite');
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Create students table
db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        grade TEXT,
        marks INTEGER
    )
`);

// Show main form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Add student
app.post('/add', (req, res) => {
    const { name, grade, marks } = req.body;
    db.run("INSERT INTO students (name, grade, marks) VALUES (?, ?, ?)", [name, grade, marks], () => {
        res.redirect('/');
    });
});

// Delete student
app.post('/delete', (req, res) => {
    db.run("DELETE FROM students WHERE id = ?", [req.body.id], () => {
        res.redirect('/');
    });
});

// Show report
app.get('/report', (req, res) => {
    db.all("SELECT * FROM students", (err, rows) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).send("Database error");
        }
        console.log("Fetched rows:", rows);
        res.render("report", { students: rows });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});