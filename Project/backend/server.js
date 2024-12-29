const express = require('express');
const mysql = require('mysql2');  
const bodyParser = require('body-parser');
const app = express();

// Setup middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mudassir__94',
    database: 'expense_manager'
});

// Connect to MySQL
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Check if username exists
app.post('/check-username', (req, res) => {
    const username = req.body.username;
    const query = 'SELECT COUNT(*) AS count FROM users WHERE username = ?';
    
    db.query(query, [username], (err, result) => {
        if (err) throw err;
        
        if (result[0].count > 0) {
            res.json({ available: false });
        } else {
            res.json({ available: true });
        }
    });
});

// Signup user
app.post('/signup', (req, res) => {
    const { name, username, email, profile_pic } = req.body;

    // Insert into users table
    const query = 'INSERT INTO users (name, username, email, profile_pic) VALUES (?, ?, ?, ?)';
    db.query(query, [name, username, email, profile_pic], (err, result) => {
        if (err) throw err;

        // Create a new income and expense record for the user
        const userId = result.insertId;
        db.query('INSERT INTO incomes (user_id, name, amount) VALUES (?, ?, 0)', [userId, 'Salary']);
        db.query('INSERT INTO expenses (user_id, name, amount) VALUES (?, ?, 0)', [userId, 'Rent']);

        res.json({ success: true, userId });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { username } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const user = result[0];
            // Fetch user income and expenses
            const userId = user.id;

            db.query('SELECT * FROM incomes WHERE user_id = ?', [userId], (err, incomeResult) => {
                if (err) throw err;

                db.query('SELECT * FROM expenses WHERE user_id = ?', [userId], (err, expenseResult) => {
                    if (err) throw err;

                    const incomes = incomeResult;
                    const expenses = expenseResult;

                    res.json({
                        success: true,
                        user,
                        incomes,
                        expenses
                    });
                });
            });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    });
});

// Update income or expense
app.post('/update-income', (req, res) => {
    const { userId, name, amount } = req.body;
    const query = 'UPDATE incomes SET name = ?, amount = ? WHERE user_id = ?';
    
    db.query(query, [name, amount, userId], (err, result) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

app.post('/update-expense', (req, res) => {
    const { userId, name, amount } = req.body;
    const query = 'UPDATE expenses SET name = ?, amount = ? WHERE user_id = ?';

    db.query(query, [name, amount, userId], (err, result) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
